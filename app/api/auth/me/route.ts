import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({error:'Unauthorized'},{status:401});
  const dbUser = await prisma.user.findUnique({where:{id:user.sub},select:{id:true,email:true,name:true,role:true,phone:true}});
  if (!dbUser) return NextResponse.json({error:'Not found'},{status:404});
  return NextResponse.json({user:dbUser});
}

