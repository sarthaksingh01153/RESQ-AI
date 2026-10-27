import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { adjustInventoryQuantity } from '@/lib/services/inventory.service';
import { z } from 'zod';

export async function GET(req: NextRequest, {params}:{params:{id:string}}) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({error:'Unauthorized'},{status:401});
  const item = await prisma.inventoryItem.findUnique({where:{id:params.id},include:{location:true,movements:{orderBy:{createdAt:'desc'},take:20,include:{performedBy:{select:{name:true}}}}}});
  if (!item) return NextResponse.json({error:'Not found'},{status:404});
  return NextResponse.json({item:{...item,isLowStock:item.availableQty<=item.minThreshold}});
}

export async function PATCH(req: NextRequest, {params}:{params:{id:string}}) {
  try {
    const user = await getAuthUser(req);
    if (!user||!['INVENTORY_MANAGER','ADMIN','OFFICER'].includes(user.role)) return NextResponse.json({error:'Forbidden'},{status:403});
    const body = await req.json();
    const {adjustQty,...updateData} = body;
    if (adjustQty) await adjustInventoryQuantity(params.id,adjustQty.type,adjustQty.quantity,adjustQty.reason,user.sub);
    const filtered = Object.fromEntries(Object.entries(updateData).filter(([,v])=>v!==undefined));
    const item = await prisma.inventoryItem.update({where:{id:params.id},data:filtered,include:{location:true}});
    await prisma.auditLog.create({data:{userId:user.sub,action:'UPDATE_INVENTORY_ITEM',resource:'InventoryItem',resourceId:params.id}});
    return NextResponse.json({item:{...item,isLowStock:item.availableQty<=item.minThreshold}});
  } catch(e) {
    return NextResponse.json({error:e instanceof Error?e.message:'Failed'},{status:400});
  }
}

