import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
    const inc = await prisma.incident.findUnique({
      where: { id: params.id },
      include: {
        reportedBy: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
        attachments: true,
        timeline: {
          orderBy: { createdAt: 'asc' },
          where: user && ['OFFICER','ADMIN','INVENTORY_MANAGER'].includes(user.role) ? {} : { isPublic: true },
        },
        aiAnalyses: { orderBy: { createdAt: 'desc' } },
        rescuePlans: { orderBy: { createdAt: 'desc' } },
        reservations: { include: { items: { include: { item: true } } } },
        dispatches: { include: { items: { include: { item: true } } } },
        weatherObs: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    if (!inc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (user?.role === 'CITIZEN' && inc.reportedById !== user.sub)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ incident: inc });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user || !['OFFICER','ADMIN'].includes(user.role))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { status, notes, assignedToId, severity } = await req.json();
    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId;
    if (severity) updateData.severity = severity;
    const inc = await prisma.incident.update({ where: { id: params.id }, data: updateData });
    if (status) {
      await prisma.incidentTimeline.create({
        data: { incidentId: params.id, status, note: notes || `Status updated to ${status}`, createdById: user.sub },
      });
    }
    await prisma.auditLog.create({
      data: { userId: user.sub, action: 'UPDATE_INCIDENT', resource: 'Incident', resourceId: params.id },
    });
    return NextResponse.json({ incident: inc });
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
