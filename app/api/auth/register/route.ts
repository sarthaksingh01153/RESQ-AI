import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword, createToken } from '@/lib/auth';

const schema = z.object({ email:z.string().email(), password:z.string().min(8), name:z.string().min(2).max(100), role:z.enum(['CITIZEN','RESCUE_TEAM','INVENTORY_MANAGER']).default('CITIZEN'), phone:z.string().optional() });

export async function POST(req: NextRequest) {
  try {
    const data = schema.parse(await req.json());
    if (await prisma.user.findUnique({where:{email:data.email}})) return NextResponse.json({error:'Email already registered'},{status:409});
    const user = await prisma.user.create({ data:{...data, password:await hashPassword(data.password)}, select:{id:true,email:true,name:true,role:true} });
    const token = await createToken({sub:user.id,email:user.email,name:user.name,role:user.role});
    await prisma.auditLog.create({data:{userId:user.id,action:'REGISTER',resource:'User',resourceId:user.id}});
    const res = NextResponse.json({user,message:'Registration successful'},{status:201});
    res.cookies.set('resq_token',token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',maxAge:604800,path:'/'});
    return res;
  } catch(e) {
    if (e instanceof z.ZodError) return NextResponse.json({error:'Validation error',details:e.errors},{status:400});
    return NextResponse.json({error:'Registration failed'},{status:500});
  }
}

