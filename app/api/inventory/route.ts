import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { adjustInventoryQuantity } from '@/lib/services/inventory.service';
import { z } from 'zod';

const createSchema = z.object({ name:z.string().min(2).max(200), category:z.enum(['VEHICLE','MEDICAL','FOOD_WATER','WATER_RESCUE','FIREFIGHTING','RESCUE_EQUIPMENT','PROTECTIVE_GEAR','COMMUNICATION','POWER_LIGHTING','OTHER']), unit:z.string().default('units'), locationId:z.string().optional(), condition:z.enum(['EXCELLENT','GOOD','FAIR','POOR','DAMAGED']).default('GOOD'), availableQty:z.number().int().min(0), minThreshold:z.number().int().min(0).default(5), expiryDate:z.string().optional(), capacity:z.number().int().optional(), operationalStatus:z.string().optional(), notes:z.string().optional() });

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({error:'Unauthorized'},{status:401});
    const {searchParams} = new URL(req.url);
    const where: Record<string,unknown> = {};
    if (searchParams.get('category')) where.category = searchParams.get('category');
    if (searchParams.get('locationId')) where.locationId = searchParams.get('locationId');
    if (searchParams.get('status')) where.status = searchParams.get('status');
    if (searchParams.get('search')) where.name = {contains:searchParams.get('search')};
    const items = await prisma.inventoryItem.findMany({where,include:{location:true},orderBy:{name:'asc'}});
    const locations = await prisma.inventoryLocation.findMany({where:{isActive:true}});
    return NextResponse.json({items:items.map(i=>({...i,isLowStock:i.availableQty<=i.minThreshold})),locations});
  } catch { return NextResponse.json({error:'Failed'},{status:500}); }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user||!['INVENTORY_MANAGER','ADMIN','OFFICER'].includes(user.role)) return NextResponse.json({error:'Forbidden'},{status:403});
    const body = createSchema.parse(await req.json());
    const item = await prisma.inventoryItem.create({ data:{...body,expiryDate:body.expiryDate?new Date(body.expiryDate):undefined}, include:{location:true} });
    await prisma.inventoryMovement.create({data:{itemId:item.id,type:'STOCK_IN',quantity:item.availableQty,reason:'Initial stock',performedById:user.sub}});
    await prisma.auditLog.create({data:{userId:user.sub,action:'CREATE_INVENTORY_ITEM',resource:'InventoryItem',resourceId:item.id}});
    return NextResponse.json({item:({...item,isLowStock:item.availableQty<=item.minThreshold})},{status:201});
  } catch(e) {
    if (e instanceof z.ZodError) return NextResponse.json({error:'Validation error',details:e.errors},{status:400});
    return NextResponse.json({error:'Failed'},{status:500});
  }
}

