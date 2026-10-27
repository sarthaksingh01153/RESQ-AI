import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getUserNotifications, markAllRead, getUnreadCount } from '@/lib/services/notification.service';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({error:'Unauthorized'},{status:401});
  const [notifications,unreadCount] = await Promise.all([getUserNotifications(user.sub),getUnreadCount(user.sub)]);
  return NextResponse.json({notifications,unreadCount});
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({error:'Unauthorized'},{status:401});
  const body = await req.json();
  if (body.markAllRead) { await markAllRead(user.sub); return NextResponse.json({message:'All read'}); }
  if (body.id) { await prisma.notification.updateMany({where:{id:body.id,userId:user.sub},data:{isRead:true}}); return NextResponse.json({message:'Read'}); }
  return NextResponse.json({error:'Invalid request'},{status:400});
}

