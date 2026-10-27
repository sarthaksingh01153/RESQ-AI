import { prisma } from '@/lib/prisma';

export async function createNotification(d: { userId:string; title:string; message:string; type?:string; incidentId?:string; link?:string }) {
  return prisma.notification.create({ data:{ userId:d.userId, title:d.title, message:d.message, type:d.type??"SYSTEM", incidentId:d.incidentId, link:d.link } });
}

export async function notifyOfficers(d: { title:string; message:string; type?:string; incidentId?:string; link?:string }) {
  const officers = await prisma.user.findMany({ where:{ role:{in:['OFFICER','ADMIN']}, isActive:true }, select:{id:true} });
  if (!officers.length) return;
  await prisma.notification.createMany({ data: officers.map(o=>({ userId:o.id, title:d.title, message:d.message, type:d.type??"INCIDENT", incidentId:d.incidentId, link:d.link })) });
}

export async function getUserNotifications(userId: string, limit=20) {
  return prisma.notification.findMany({ where:{userId}, orderBy:{createdAt:'desc'}, take:limit });
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({ where:{userId, isRead:false} });
}

export async function markAllRead(userId: string) {
  return prisma.notification.updateMany({ where:{userId, isRead:false}, data:{isRead:true} });
}

// Alias for single-user notification (used by demo and officer updates)
export const notifyUser = createNotification;

export async function notifyRoleGroup(role: string, d: { title:string; message:string; type?:string; incidentId?:string; link?:string }) {
  const users = await prisma.user.findMany({ where:{ role, isActive:true }, select:{id:true} });
  if (!users.length) return;
  await prisma.notification.createMany({ data: users.map(u=>({ userId:u.id, title:d.title, message:d.message, type:d.type??"SYSTEM", incidentId:d.incidentId, link:d.link })) });
}

