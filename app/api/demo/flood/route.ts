/**
 * RESQ AI — Agentic Flood Demo Endpoint
 *
 * Creates a reproducible, end-to-end flood scenario using REAL app services and DB records.
 * All steps are labelled. Emergency services are NEVER contacted.
 *
 * Steps:
 *  1. Citizen reports flooding
 *  2. Citizen gets immediate safety guidance (static library)
 *  3. AI analyzes the report (Gemini or mock)
 *  4. Officer sees incident in dashboard
 *  5. AI queries inventory DB
 *  6. AI generates resource proposal
 *  7. Officer approves simulated dispatch [SIMULATED — no real dispatch]
 *  8. Citizen receives status update notification
 *  9. Second report: route blocked
 * 10. AI reassesses
 * 11. Updated recommendation visible to officer
 * 12. Incident marked resolved [SIMULATED]
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateTrackingId } from '@/lib/utils';
import { getSafetyGuidance } from '@/lib/safety-guidance';
import { runIncidentAnalysisAgent } from '@/lib/agents/incident-analysis.agent';
import { runResourcePlanningAgent } from '@/lib/agents/resource-planning.agent';
import { runRoutingAwarenessAgent } from '@/lib/agents/routing-awareness.agent';
import { runResponseCoordinationAgent } from '@/lib/agents/response-coordination.agent';
import { notifyUser } from '@/lib/services/notification.service';

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || !['OFFICER', 'ADMIN'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden — Officer or Admin required' }, { status: 403 });
  }

  const steps: Array<{ step: number; label: string; status: 'real' | 'simulated'; detail: string }> = [];
  const log = (step: number, label: string, status: 'real' | 'simulated', detail: string) => {
    steps.push({ step, label, status, detail });
  };

  try {
    // ── STEP 1: Citizen reports flooding ────────────────────────────────────
    const citizen = await prisma.user.findFirst({ where: { role: 'CITIZEN' } });
    const incident = await prisma.incident.create({
      data: {
        trackingId: generateTrackingId('FLOOD'),
        type: 'FLOOD',
        severity: 'CRITICAL',
        status: 'REPORTED',
        title: '[DEMO] Major flooding — NH-48 near Gurgaon underpass',
        description: 'Flash flood at the Kherki Daula underpass on NH-48. Water level approximately 4 feet. 30–40 vehicles submerged. 60+ people stranded on rooftops. Road completely blocked. Power lines down.',
        latitude: 28.4089,
        longitude: 77.0426,
        address: 'NH-48, Kherki Daula, Gurugram, Haryana',
        reporterName: 'Demo Citizen',
        reporterPhone: '+91 9876540001',
        reportedById: citizen?.id ?? null,
        notes: 'DEMO INCIDENT — Created by Agentic Flood Demo',
      },
    });
    await prisma.incidentTimeline.create({
      data: { incidentId: incident.id, status: 'REPORTED', note: '[DEMO] Emergency reported by citizen', isPublic: true },
    });
    log(1, 'Citizen reports flooding', 'real', `Incident created: ${incident.trackingId} (ID: ${incident.id})`);

    // ── STEP 2: Immediate safety guidance ───────────────────────────────────
    const guidance = getSafetyGuidance('FLOOD');
    log(2, 'Citizen receives safety guidance', 'real',
      `Static library returned ${guidance.immediateSteps.length} immediate steps. Source: ${guidance.officialSource}`);

    // ── STEP 3: AI analyzes the report ──────────────────────────────────────
    await runIncidentAnalysisAgent(incident.id);
    const aiAnalysis = await prisma.aIAnalysis.findFirst({
      where: { incidentId: incident.id, agentName: 'Incident Analysis Agent' },
      orderBy: { createdAt: 'desc' },
    });
    log(3, 'AI analyzes the report', aiAnalysis?.isMock ? 'simulated' : 'real',
      aiAnalysis
        ? `${aiAnalysis.isMock ? '[DEMO MODE — set GEMINI_API_KEY for real AI] ' : ''}Severity: ${aiAnalysis.severity}, Summary: ${(aiAnalysis.summary || '').slice(0, 120)}...`
        : 'Analysis agent ran but produced no output');

    // ── STEP 4: Officer sees incident ───────────────────────────────────────
    const incidentForOfficer = await prisma.incident.findUnique({
      where: { id: incident.id },
      select: { id: true, trackingId: true, status: true, severity: true, type: true },
    });
    log(4, 'Officer sees incident in dashboard', 'real',
      `Incident ${incidentForOfficer?.trackingId} visible in /dashboard/incidents with status ${incidentForOfficer?.status}`);

    // ── STEP 5: AI queries inventory DB ─────────────────────────────────────
    const inventorySnapshot = await prisma.inventoryItem.findMany({
      where: { status: 'AVAILABLE', availableQty: { gt: 0 } },
      select: { id: true, name: true, category: true, availableQty: true, unit: true },
      orderBy: { availableQty: 'desc' },
      take: 20,
    });
    log(5, 'AI queries inventory database', 'real',
      `Found ${inventorySnapshot.length} available items. Categories: ${[...new Set(inventorySnapshot.map(i => i.category))].join(', ')}`);

    // ── STEP 6: AI generates resource proposal ───────────────────────────────
    const planId = await runResourcePlanningAgent(incident.id);
    await runRoutingAwarenessAgent(incident.id);
    if (planId) await runResponseCoordinationAgent(incident.id);
    const rescuePlan = await prisma.rescuePlan.findFirst({
      where: { incidentId: incident.id },
      orderBy: { createdAt: 'desc' },
    });
    log(6, 'AI generates resource proposal', rescuePlan?.isMock ? 'simulated' : 'real',
      rescuePlan
        ? `Plan ${planId} created. ${rescuePlan.isMock ? '[DEMO] ' : ''}Summary: ${(rescuePlan.summary || '').slice(0, 120)}...`
        : 'Resource planning agent ran but no plan created');

    // ── STEP 7: Officer approves simulated dispatch ─────────────────────────
    // Find or pick water rescue items for flood response
    const waterRescue = await prisma.inventoryItem.findFirst({
      where: { category: 'WATER_RESCUE', availableQty: { gt: 0 } },
    });
    const medItem = await prisma.inventoryItem.findFirst({
      where: { category: 'MEDICAL', availableQty: { gt: 0 } },
    });

    let reservation = null;
    let dispatch = null;

    if (waterRescue || medItem) {
      const items = [];
      if (waterRescue && waterRescue.availableQty > 0) items.push({ itemId: waterRescue.id, quantity: Math.min(2, waterRescue.availableQty), reason: 'Flood water rescue' });
      if (medItem && medItem.availableQty > 0) items.push({ itemId: medItem.id, quantity: Math.min(3, medItem.availableQty), reason: 'Medical support for stranded persons' });

      if (items.length > 0) {
        reservation = await prisma.$transaction(async (tx) => {
          const res = await tx.resourceReservation.create({
            data: {
              incidentId: incident.id,
              status: 'APPROVED',
              notes: '[DEMO] Officer approved via flood demo',
              approvedById: user.sub,
              approvedAt: new Date(),
              items: { create: items.map(i => ({ itemId: i.itemId, quantity: i.quantity, reason: i.reason })) },
            },
          });
          for (const item of items) {
            await tx.inventoryItem.update({
              where: { id: item.itemId },
              data: { availableQty: { decrement: item.quantity }, reservedQty: { increment: item.quantity } },
            });
          }
          return res;
        });

        // Confirm dispatch (simulated — no physical movement)
        dispatch = await prisma.$transaction(async (tx) => {
          const resItems = await tx.reservationItem.findMany({ where: { reservationId: reservation!.id } });
          for (const ri of resItems) {
            await tx.inventoryItem.update({
              where: { id: ri.itemId },
              data: { reservedQty: { decrement: ri.quantity }, dispatchedQty: { increment: ri.quantity } },
            });
          }
          await tx.resourceReservation.update({ where: { id: reservation!.id }, data: { status: 'DISPATCHED' } });
          return tx.dispatch.create({
            data: {
              reservationId: reservation!.id,
              incidentId: incident.id,
              status: 'IN_TRANSIT',
              dispatchedAt: new Date(),
              notes: '[SIMULATED DISPATCH — no real resources moved]',
              items: { create: resItems.map(ri => ({ itemId: ri.itemId, quantity: ri.quantity })) },
            },
          });
        });

        await prisma.incident.update({ where: { id: incident.id }, data: { status: 'DISPATCHED' } });
        await prisma.incidentTimeline.create({
          data: { incidentId: incident.id, status: 'DISPATCHED', note: '[DEMO] Rescue resources dispatched to site', createdById: user.sub, isPublic: true },
        });
        await prisma.auditLog.create({
          data: { userId: user.sub, action: 'DEMO_DISPATCH_CONFIRMED', resource: 'Dispatch', resourceId: dispatch.id, details: 'Agentic flood demo — simulated dispatch' },
        });
      }
    }

    log(7, 'Officer approves simulated dispatch', 'simulated',
      dispatch
        ? `[SIMULATED] Dispatch ${dispatch.id} created. Reservation ${reservation?.id} approved. No real resources moved.`
        : '[SIMULATED] No suitable inventory items found for dispatch demo');

    // ── STEP 8: Citizen receives status update ──────────────────────────────
    let notified = false;
    if (citizen) {
      await notifyUser({
        userId: citizen.id,
        title: 'Update on your incident report',
        message: `[DEMO] Rescue team has been dispatched to ${incident.address}. Stay in a safe location and follow official guidance.`,
        type: 'DISPATCH',
        incidentId: incident.id,
        link: `/track/${incident.trackingId}`,
      });
      notified = true;
    }
    log(8, 'Citizen receives status update', notified ? 'real' : 'simulated',
      notified
        ? `Notification sent to citizen user (${citizen?.email}). Visible in /api/notifications.`
        : '[SIMULATED] No citizen user in DB — notification not sent');

    // ── STEP 9: Second report — route blocked ────────────────────────────────
    const blockingReport = await prisma.incident.create({
      data: {
        trackingId: generateTrackingId('ROAD_ACCIDENT'),
        type: 'ROAD_ACCIDENT',
        severity: 'HIGH',
        status: 'REPORTED',
        title: '[DEMO] Route blocked — landslide on alternate NH-48 bypass',
        description: 'Landslide blocking alternate bypass route to the flood site. Rescue convoy must find a different route. Primary and secondary routes both compromised.',
        latitude: 28.4200,
        longitude: 77.0350,
        address: 'NH-48 Bypass, Gurugram',
        reporterName: 'Demo Traffic Control',
        notes: 'DEMO — Second report for route reassessment scenario',
      },
    });
    await prisma.incidentTimeline.create({
      data: { incidentId: blockingReport.id, status: 'REPORTED', note: '[DEMO] Route blockage reported', isPublic: true },
    });
    log(9, 'Second report: route blocked', 'real', `New incident ${blockingReport.trackingId} created. Route blockage recorded.`);

    // ── STEP 10: AI reassesses ───────────────────────────────────────────────
    // Re-run routing awareness on original incident to update route info
    await runRoutingAwarenessAgent(incident.id);
    const updatedPlan = await prisma.rescuePlan.findFirst({
      where: { incidentId: incident.id },
      orderBy: { createdAt: 'desc' },
    });
    // Add a timeline note about reassessment
    await prisma.incidentTimeline.create({
      data: { incidentId: incident.id, status: 'IN_PROGRESS', note: '[DEMO] AI reassessed route — alternate routing required due to secondary blockage', createdById: user.sub, isPublic: true },
    });
    await prisma.incident.update({ where: { id: incident.id }, data: { status: 'IN_PROGRESS' } });
    log(10, 'AI reassesses situation', 'real',
      `Routing agent re-ran. Plan ${updatedPlan?.id} updated with new route info. Timeline updated.`);

    // ── STEP 11: Updated recommendation visible to officer ───────────────────
    const finalPlan = await prisma.rescuePlan.findFirst({
      where: { incidentId: incident.id },
      orderBy: { updatedAt: 'desc' },
    });
    log(11, 'Officer reviews updated recommendation', 'real',
      `Updated rescue plan visible at /dashboard/incidents/${incident.id}. EstimatedTime: ${finalPlan?.estimatedTime ?? 'N/A'} min`);

    // ── STEP 12: Incident resolved ──────────────────────────────────────────
    await prisma.incident.update({ where: { id: incident.id }, data: { status: 'RESOLVED' } });
    await prisma.incidentTimeline.create({
      data: { incidentId: incident.id, status: 'RESOLVED', note: '[DEMO] Incident resolved — all persons safely evacuated (simulated)', createdById: user.sub, isPublic: true },
    });
    // Return dispatched items
    if (dispatch) {
      const dispatchItems = await prisma.dispatchItem.findMany({ where: { dispatchId: dispatch.id } });
      await prisma.$transaction(async (tx) => {
        for (const di of dispatchItems) {
          await tx.inventoryItem.update({
            where: { id: di.itemId },
            data: { dispatchedQty: { decrement: di.quantity }, availableQty: { increment: di.quantity } },
          });
          await tx.dispatchItem.update({ where: { id: di.id }, data: { returnedQty: di.quantity } });
        }
        await tx.dispatch.update({ where: { id: dispatch.id }, data: { status: 'RETURNED', returnedAt: new Date() } });
      });
    }
    await prisma.auditLog.create({
      data: { userId: user.sub, action: 'DEMO_FLOOD_COMPLETED', resource: 'Incident', resourceId: incident.id, details: 'Agentic flood demo completed successfully' },
    });
    log(12, 'Incident resolved (simulated)', 'simulated',
      `[SIMULATED] Incident ${incident.trackingId} marked RESOLVED. Dispatched items returned to inventory.`);

    return NextResponse.json({
      success: true,
      message: 'Agentic flood demo completed successfully',
      demoDisclaimer: 'This demo used REAL application services and database records. All dispatches are clearly labelled as SIMULATED. No real emergency services were contacted.',
      incidentId: incident.id,
      trackingId: incident.trackingId,
      dashboardLink: `/dashboard/incidents/${incident.id}`,
      trackLink: `/track/${incident.trackingId}`,
      steps,
      summary: {
        realSteps: steps.filter(s => s.status === 'real').length,
        simulatedSteps: steps.filter(s => s.status === 'simulated').length,
        totalSteps: steps.length,
      },
    });
  } catch (e) {
    console.error('[FloodDemo]', e);
    return NextResponse.json({
      error: 'Demo failed',
      detail: e instanceof Error ? e.message : String(e),
      steps,
    }, { status: 500 });
  }
}

