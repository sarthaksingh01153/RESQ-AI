import { prisma } from '@/lib/prisma';

export async function getLowStockItems() {
  const items = await prisma.inventoryItem.findMany({ include:{ location:true } });
  return items.filter(i=>i.availableQty<=i.minThreshold);
}

export async function createResourceReservation(incidentId:string, items:Array<{itemId:string;quantity:number;reason?:string}>, userId:string) {
  return prisma.$transaction(async tx => {
    for (const r of items) {
      const item = await tx.inventoryItem.findUnique({where:{id:r.itemId}});
      if (!item) throw new Error(`Item ${r.itemId} not found`);
      if (item.availableQty<r.quantity) throw new Error(`Insufficient stock for ${item.name}: need ${r.quantity}, have ${item.availableQty}`);
    }
    const reservation = await tx.resourceReservation.create({ data:{ incidentId, status:'PENDING', items:{ create:items.map(i=>({itemId:i.itemId,quantity:i.quantity,reason:i.reason})) } }, include:{items:{include:{item:true}}} });
    for (const r of items) {
      await tx.inventoryItem.update({ where:{id:r.itemId}, data:{ availableQty:{decrement:r.quantity}, reservedQty:{increment:r.quantity} } });
      await tx.inventoryMovement.create({ data:{ itemId:r.itemId, type:'RESERVED', quantity:r.quantity, reason:`Reserved for incident - reservation ${reservation.id}`, incidentId, performedById:userId } });
    }
    return reservation;
  });
}

export async function approveReservation(reservationId:string, userId:string) {
  return prisma.resourceReservation.update({ where:{id:reservationId}, data:{ status:'APPROVED', approvedById:userId, approvedAt:new Date() }, include:{items:{include:{item:true}}} });
}

export async function releaseReservation(reservationId:string, userId:string) {
  return prisma.$transaction(async tx => {
    const res = await tx.resourceReservation.findUnique({ where:{id:reservationId}, include:{items:true} });
    if (!res) throw new Error('Reservation not found');
    for (const ri of res.items) {
      await tx.inventoryItem.update({ where:{id:ri.itemId}, data:{ availableQty:{increment:ri.quantity}, reservedQty:{decrement:ri.quantity} } });
      await tx.inventoryMovement.create({ data:{ itemId:ri.itemId, type:'RETURNED', quantity:ri.quantity, reason:`Released from reservation ${reservationId}`, performedById:userId } });
    }
    return tx.resourceReservation.update({ where:{id:reservationId}, data:{status:'RELEASED'} });
  });
}

export async function confirmDispatch(reservationId:string, incidentId:string, userId:string) {
  return prisma.$transaction(async tx => {
    const res = await tx.resourceReservation.findUnique({ where:{id:reservationId}, include:{items:true} });
    if (!res) throw new Error('Reservation not found');
    for (const ri of res.items) {
      await tx.inventoryItem.update({ where:{id:ri.itemId}, data:{ reservedQty:{decrement:ri.quantity}, dispatchedQty:{increment:ri.quantity} } });
      await tx.inventoryMovement.create({ data:{ itemId:ri.itemId, type:'DISPATCHED', quantity:ri.quantity, reason:`Dispatched for incident ${incidentId}`, incidentId, performedById:userId } });
    }
    await tx.resourceReservation.update({ where:{id:reservationId}, data:{status:'DISPATCHED'} });
    return tx.dispatch.create({ data:{ reservationId, incidentId, status:'IN_TRANSIT', dispatchedAt:new Date(), items:{ create:res.items.map(ri=>({itemId:ri.itemId,quantity:ri.quantity})) } }, include:{items:{include:{item:true}}} });
  });
}

export async function recordReturn(dispatchId:string, returnedItems:Array<{itemId:string;returnedQty:number;notes?:string}>, userId:string) {
  return prisma.$transaction(async tx => {
    const dispatch = await tx.dispatch.findUnique({ where:{id:dispatchId}, include:{items:true} });
    if (!dispatch) throw new Error('Dispatch not found');
    for (const ret of returnedItems) {
      const di = dispatch.items.find(i=>i.itemId===ret.itemId);
      if (!di) continue;
      const qty = Math.min(ret.returnedQty, di.quantity-di.returnedQty);
      if (qty<=0) continue;
      await tx.inventoryItem.update({ where:{id:ret.itemId}, data:{ dispatchedQty:{decrement:qty}, availableQty:{increment:qty} } });
      await tx.dispatchItem.update({ where:{id:di.id}, data:{ returnedQty:{increment:qty}, notes:ret.notes } });
      await tx.inventoryMovement.create({ data:{ itemId:ret.itemId, type:'RETURNED', quantity:qty, reason:`Return from dispatch ${dispatchId}`, performedById:userId } });
    }
    const updated = await tx.dispatch.findUnique({ where:{id:dispatchId}, include:{items:true} });
    const allReturned = updated?.items.every(i=>i.returnedQty>=i.quantity);
    return tx.dispatch.update({ where:{id:dispatchId}, data:{ status:allReturned?'RETURNED':'RETURNING', returnedAt:allReturned?new Date():undefined } });
  });
}

export async function adjustInventoryQuantity(itemId:string, type:string, quantity:number, reason:string, userId:string) {
  return prisma.$transaction(async tx => {
    const item = await tx.inventoryItem.findUnique({where:{id:itemId}});
    if (!item) throw new Error('Item not found');
    let data: Record<string,unknown> = {};
    if (type==='STOCK_IN') data = { availableQty:{increment:quantity} };
    else if (type==='DAMAGED'||type==='EXPIRED') {
      if (item.availableQty<quantity) throw new Error('Cannot exceed available quantity');
      data = { availableQty:{decrement:quantity} };
    } else if (type==='ADJUSTED') { data = { availableQty:Math.max(0,quantity) }; }
    else throw new Error(`Unknown type: ${type}`);
    await tx.inventoryItem.update({where:{id:itemId},data});
    return tx.inventoryMovement.create({ data:{ itemId, type, quantity, reason, performedById:userId } });
  });
}

