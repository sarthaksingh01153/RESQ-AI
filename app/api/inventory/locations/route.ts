import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  const locs = await prisma.inventoryLocation.findMany({where:{isActive:true},orderBy:{name:'asc'}});
  return NextResponse.json({locations:locs});
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user||!['INVENTORY_MANAGER','ADMIN'].includes(user.role)) return NextResponse.json({error:'Forbidden'},{status:403});
  const {name,address,latitude,longitude} = await req.json();
  if (!name) return NextResponse.json({error:'Name required'},{status:400});
  const loc = await prisma.inventoryLocation.create({data:{name,address,latitude,longitude}});
  return NextResponse.json({location:loc},{status:201});
}

