import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const {email,password} = z.object({email:z.string().email(),password:z.string()}).parse(await req.json());
    const user = await prisma.user.findUnique({where:{email}});
    if (!user||!user.isActive||!await verifyPassword(password,user.password)) return NextResponse.json({error:'Invalid credentials'},{status:401});
    const token = await createToken({sub:user.id,email:user.email,name:user.name,role:user.role});
    await prisma.auditLog.create({data:{userId:user.id,action:'LOGIN',resource:'User',resourceId:user.id}});
    const res = NextResponse.json({user:{id:user.id,email:user.email,name:user.name,role:user.role,phone:user.phone}});
    res.cookies.set('resq_token',token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',maxAge:604800,path:'/'});
    return res;
  } catch(e) {
    if (e instanceof z.ZodError) return NextResponse.json({error:'Validation error'},{status:400});
    return NextResponse.json({error:'Login failed'},{status:500});
  }
}

