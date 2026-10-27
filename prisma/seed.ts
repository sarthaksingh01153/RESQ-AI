import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

function tid() {
  return 'RESQ-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase()
}

async function main() {
  console.log('🌱 Seeding RESQ AI database...')

  const password = await bcrypt.hash('demo1234', 12)

  const admin = await prisma.user.upsert({ where: { email: 'admin@resqai.demo' }, update: {}, create: { email: 'admin@resqai.demo', name: 'Admin User', password, role: 'ADMIN', phone: '+91-9000000001' } })
  const officer = await prisma.user.upsert({ where: { email: 'officer@resqai.demo' }, update: {}, create: { email: 'officer@resqai.demo', name: 'Raj Kumar', password, role: 'OFFICER', phone: '+91-9000000002' } })
  const inventoryMgr = await prisma.user.upsert({ where: { email: 'inventory@resqai.demo' }, update: {}, create: { email: 'inventory@resqai.demo', name: 'Priya Sharma', password, role: 'INVENTORY_MANAGER', phone: '+91-9000000003' } })
  const rescueTeam = await prisma.user.upsert({ where: { email: 'team@resqai.demo' }, update: {}, create: { email: 'team@resqai.demo', name: 'Alpha Rescue Team', password, role: 'RESCUE_TEAM', phone: '+91-9000000004' } })
  const citizen = await prisma.user.upsert({ where: { email: 'citizen@resqai.demo' }, update: {}, create: { email: 'citizen@resqai.demo', name: 'Amit Singh', password, role: 'CITIZEN', phone: '+91-9876543210' } })
  console.log('✅ Users seeded')

  const delhiLoc = await prisma.inventoryLocation.create({ data: { name: 'Delhi HQ', address: 'Connaught Place, New Delhi', latitude: 28.6327, longitude: 77.2198 } })
  const mumbaiLoc = await prisma.inventoryLocation.create({ data: { name: 'Mumbai Emergency Base', address: 'Nariman Point, Mumbai', latitude: 18.9220, longitude: 72.8347 } })
  const chennaiLoc = await prisma.inventoryLocation.create({ data: { name: 'Chennai Rescue Station', address: 'Anna Salai, Chennai', latitude: 13.0604, longitude: 80.2496 } })
  console.log('✅ Locations seeded')

  await prisma.rescueTeam.createMany({ data: [
    { name: 'Delhi Alpha Squad', specialization: 'FLOOD', status: 'AVAILABLE', locationId: delhiLoc.id, capacity: 12, contact: '+91-11-23410001' },
    { name: 'Mumbai Fire & Rescue', specialization: 'FIRE', status: 'AVAILABLE', locationId: mumbaiLoc.id, capacity: 20, contact: '+91-22-22821856' },
    { name: 'Chennai Medical Unit', specialization: 'MEDICAL', status: 'DEPLOYED', locationId: chennaiLoc.id, capacity: 8, contact: '+91-44-25367001' },
  ]})
  console.log('✅ Rescue Teams seeded')

  // Inventory — use API-valid categories
  const items = [
    { name: 'Advanced Life Support Ambulance', category: 'VEHICLE', availableQty: 4, reservedQty: 1, dispatchedQty: 0, minThreshold: 2, unit: 'vehicles', condition: 'EXCELLENT', locationId: delhiLoc.id },
    { name: 'Basic Life Support Ambulance', category: 'VEHICLE', availableQty: 6, reservedQty: 0, dispatchedQty: 2, minThreshold: 3, unit: 'vehicles', condition: 'GOOD', locationId: mumbaiLoc.id },
    { name: 'Mobile ICU Van', category: 'VEHICLE', availableQty: 1, reservedQty: 0, dispatchedQty: 1, minThreshold: 1, unit: 'vehicles', condition: 'EXCELLENT', locationId: chennaiLoc.id },
    { name: 'Fire Tender Truck', category: 'FIREFIGHTING', availableQty: 5, reservedQty: 0, dispatchedQty: 1, minThreshold: 2, unit: 'vehicles', condition: 'GOOD', locationId: mumbaiLoc.id },
    { name: 'Heavy Rescue Crane', category: 'VEHICLE', availableQty: 2, reservedQty: 0, dispatchedQty: 1, minThreshold: 1, unit: 'vehicles', condition: 'GOOD', locationId: delhiLoc.id },
    { name: 'Flood Rescue Boat', category: 'WATER_RESCUE', availableQty: 8, reservedQty: 2, dispatchedQty: 0, minThreshold: 4, unit: 'boats', condition: 'GOOD', locationId: chennaiLoc.id },
    { name: 'Rubber Dinghy', category: 'WATER_RESCUE', availableQty: 15, reservedQty: 0, dispatchedQty: 5, minThreshold: 8, unit: 'boats', condition: 'FAIR', locationId: delhiLoc.id },
    { name: 'Emergency Medical Kit', category: 'MEDICAL', availableQty: 80, reservedQty: 10, dispatchedQty: 10, minThreshold: 20, unit: 'kits', condition: 'EXCELLENT', locationId: delhiLoc.id },
    { name: 'Trauma Stretcher', category: 'MEDICAL', availableQty: 35, reservedQty: 0, dispatchedQty: 5, minThreshold: 10, unit: 'units', condition: 'GOOD', locationId: mumbaiLoc.id },
    { name: 'Oxygen Cylinder (10L)', category: 'MEDICAL', availableQty: 45, reservedQty: 5, dispatchedQty: 10, minThreshold: 15, unit: 'cylinders', condition: 'GOOD', locationId: chennaiLoc.id },
    { name: 'Defibrillator (AED)', category: 'MEDICAL', availableQty: 3, reservedQty: 0, dispatchedQty: 2, minThreshold: 5, unit: 'units', condition: 'EXCELLENT', locationId: delhiLoc.id },
    { name: 'Hydraulic Rescue Tool (Jaws of Life)', category: 'RESCUE_EQUIPMENT', availableQty: 7, reservedQty: 0, dispatchedQty: 1, minThreshold: 2, unit: 'sets', condition: 'EXCELLENT', locationId: mumbaiLoc.id },
    { name: 'Thermal Imaging Camera', category: 'RESCUE_EQUIPMENT', availableQty: 9, reservedQty: 0, dispatchedQty: 1, minThreshold: 3, unit: 'units', condition: 'EXCELLENT', locationId: delhiLoc.id },
    { name: 'Search & Rescue Drone', category: 'RESCUE_EQUIPMENT', availableQty: 5, reservedQty: 0, dispatchedQty: 1, minThreshold: 2, unit: 'drones', condition: 'GOOD', locationId: delhiLoc.id },
    { name: 'Life Jacket (Adult)', category: 'WATER_RESCUE', availableQty: 4, reservedQty: 0, dispatchedQty: 6, minThreshold: 50, unit: 'units', condition: 'GOOD', locationId: chennaiLoc.id },
    { name: 'Walkie-Talkie Set', category: 'COMMUNICATION', availableQty: 65, reservedQty: 5, dispatchedQty: 10, minThreshold: 20, unit: 'units', condition: 'GOOD', locationId: delhiLoc.id },
    { name: 'Satellite Phone', category: 'COMMUNICATION', availableQty: 10, reservedQty: 0, dispatchedQty: 2, minThreshold: 4, unit: 'units', condition: 'EXCELLENT', locationId: mumbaiLoc.id },
    { name: 'Emergency Tent (10-person)', category: 'PROTECTIVE_GEAR', availableQty: 25, reservedQty: 0, dispatchedQty: 5, minThreshold: 8, unit: 'tents', condition: 'GOOD', locationId: delhiLoc.id },
    { name: 'Thermal Blanket', category: 'PROTECTIVE_GEAR', availableQty: 420, reservedQty: 0, dispatchedQty: 80, minThreshold: 100, unit: 'units', condition: 'GOOD', locationId: mumbaiLoc.id },
    { name: 'Emergency Food Pack (3-day)', category: 'FOOD_WATER', availableQty: 800, reservedQty: 100, dispatchedQty: 100, minThreshold: 200, unit: 'packs', condition: 'EXCELLENT', locationId: delhiLoc.id },
    { name: 'Water Purification Tablet', category: 'FOOD_WATER', availableQty: 4000, reservedQty: 0, dispatchedQty: 1000, minThreshold: 1000, unit: 'tablets', condition: 'EXCELLENT', locationId: chennaiLoc.id },
    { name: 'Potable Water Tank (1000L)', category: 'FOOD_WATER', availableQty: 2, reservedQty: 1, dispatchedQty: 2, minThreshold: 3, unit: 'tanks', condition: 'GOOD', locationId: mumbaiLoc.id },
    { name: 'Fire Extinguisher (CO2 25kg)', category: 'FIREFIGHTING', availableQty: 50, reservedQty: 0, dispatchedQty: 10, minThreshold: 15, unit: 'units', condition: 'GOOD', locationId: mumbaiLoc.id },
    { name: 'Generator (10kVA)', category: 'POWER_LIGHTING', availableQty: 8, reservedQty: 0, dispatchedQty: 2, minThreshold: 3, unit: 'units', condition: 'GOOD', locationId: delhiLoc.id },
  ]
  for (const item of items) { await prisma.inventoryItem.create({ data: item }) }
  console.log('✅ Inventory seeded')

  // Incidents
  const inc1 = await prisma.incident.create({ data: {
    trackingId: tid(), title: 'Severe Flooding in East Delhi',
    description: 'Flash floods after heavy rainfall. ~200 families stranded on rooftops. Water level rising. Roads blocked.',
    type: 'FLOOD', severity: 'CRITICAL', status: 'DISPATCHED',
    latitude: 28.6562, longitude: 77.3410, address: 'Shahdara, East Delhi',
    reporterName: 'Amit Singh', reporterPhone: '+91-9876543210', reporterEmail: 'citizen@resqai.demo',
    reportedById: citizen.id, assignedToId: officer.id,
  }})

  const inc2 = await prisma.incident.create({ data: {
    trackingId: tid(), title: 'High-Rise Building Fire — Bandra West',
    description: 'Fire on floors 8–12 of residential tower. Residents trapped. Multiple units needed.',
    type: 'FIRE', severity: 'CRITICAL', status: 'IN_PROGRESS',
    latitude: 19.0760, longitude: 72.8777, address: 'Bandra West, Mumbai',
    reporterName: 'Suresh Mehta', reporterPhone: '+91-9876543211',
    reportedById: citizen.id, assignedToId: officer.id,
  }})

  const inc3 = await prisma.incident.create({ data: {
    trackingId: tid(), title: 'Road Accident on NH-44',
    description: 'Multi-vehicle pile-up including a bus. Multiple injuries. Road blocked.',
    type: 'ROAD_ACCIDENT', severity: 'HIGH', status: 'VERIFIED',
    latitude: 28.4089, longitude: 77.3178, address: 'NH-44 near Faridabad',
    reporterName: 'Witness', reporterPhone: '+91-9876543212',
    reportedById: citizen.id, assignedToId: officer.id,
  }})

  const inc4 = await prisma.incident.create({ data: {
    trackingId: tid(), title: 'Cardiac Emergency — T. Nagar',
    description: 'Elderly man collapsed. Unresponsive. Possible cardiac arrest.',
    type: 'MEDICAL', severity: 'HIGH', status: 'REPORTED',
    latitude: 13.0827, longitude: 80.2707, address: 'T. Nagar, Chennai',
    reporterName: 'Passerby', reporterPhone: '+91-9876543213',
    reportedById: citizen.id,
  }})

  const inc5 = await prisma.incident.create({ data: {
    trackingId: tid(), title: 'Missing Child — Noida Sector 18',
    description: '8-year-old child missing from market area. Last seen in red t-shirt.',
    type: 'MISSING_PERSON', severity: 'HIGH', status: 'ANALYZING',
    latitude: 28.5706, longitude: 77.3272, address: 'Sector 18, Noida',
    reporterName: 'Parent', reporterPhone: '+91-9876543214',
    reportedById: citizen.id, assignedToId: officer.id,
  }})

  const inc6 = await prisma.incident.create({ data: {
    trackingId: tid(), title: 'Gas Leak Near School — Koramangala',
    description: 'Strong gas smell near school. Children evacuated. Fire brigade alerted.',
    type: 'OTHER', severity: 'MEDIUM', status: 'RESOLVED',
    latitude: 12.9716, longitude: 77.5946, address: 'Koramangala, Bengaluru',
    reporterName: 'Security Guard', reporterPhone: '+91-9876543215',
    reportedById: citizen.id, assignedToId: officer.id,
  }})
  console.log('✅ Incidents seeded')

  await prisma.incidentTimeline.createMany({ data: [
    { incidentId: inc1.id, status: 'REPORTED', note: 'Citizen submitted flood report', isPublic: true, createdAt: new Date(Date.now() - 3600000 * 4) },
    { incidentId: inc1.id, status: 'ANALYZING', note: 'AI analysis initiated', isPublic: true, createdAt: new Date(Date.now() - 3600000 * 3.5) },
    { incidentId: inc1.id, status: 'VERIFIED', note: 'Priority 95/100 — Critical intervention required', isPublic: true, createdAt: new Date(Date.now() - 3600000 * 3) },
    { incidentId: inc1.id, status: 'DISPATCHED', note: 'Delhi Alpha Squad + 6 rescue boats deployed. ETA 45 mins.', isPublic: true, createdAt: new Date(Date.now() - 3600000 * 2) },
    { incidentId: inc2.id, status: 'REPORTED', note: 'Fire reported by security guard', isPublic: true, createdAt: new Date(Date.now() - 3600000 * 2) },
    { incidentId: inc2.id, status: 'IN_PROGRESS', note: 'Mumbai Fire & Rescue on site', isPublic: true, createdAt: new Date(Date.now() - 3600000) },
    { incidentId: inc6.id, status: 'REPORTED', note: 'Gas leak reported', isPublic: true, createdAt: new Date(Date.now() - 86400000) },
    { incidentId: inc6.id, status: 'RESOLVED', note: 'Leak sealed. No casualties.', isPublic: true, createdAt: new Date(Date.now() - 72000000) },
  ]})

  await prisma.aIAnalysis.create({ data: {
    incidentId: inc1.id, agentName: 'Incident Analysis Agent',
    classification: 'FLOOD', severity: 'CRITICAL',
    summary: '[DEMO MODE] Critical flood affecting ~200 families. Immediate boat rescue required. Rapidly deteriorating.',
    keyFacts: JSON.stringify(['200+ families stranded on rooftops','Multiple roads blocked','Water rising','4+ hrs without help','Children and elderly at risk']),
    missingInfo: JSON.stringify(['Exact water depth','Count of elderly/disabled','Structural integrity of buildings']),
    priorityReason: 'High population impact, life-threatening conditions, rising water, extended time without rescue.',
    isMock: true,
  }})

  await prisma.aIAnalysis.create({ data: {
    incidentId: inc5.id, agentName: 'Incident Analysis Agent',
    classification: 'MISSING_PERSON', severity: 'HIGH',
    summary: '[DEMO MODE] Missing child — time-sensitive. Coordinate with local police and CCTV.',
    keyFacts: JSON.stringify(['Child is 8 years old','Last seen in market','Red t-shirt','Missing 2+ hours']),
    missingInfo: JSON.stringify(['Recent photo','Known routes or friends','School contact']),
    priorityReason: 'Missing child — golden hour protocol applies.',
    isMock: true,
  }})

  await prisma.rescuePlan.create({ data: {
    incidentId: inc1.id, status: 'APPROVED',
    summary: '[DEMO MODE] Deploy 6 rescue boats from Delhi HQ. Establish evacuation camp at elevated ground. Coordinate with NDRF.',
    resourcesRequired: JSON.stringify(['6x Flood Rescue Boat','200x Life Jacket','50x Emergency Food Pack','20x Emergency Tent']),
    estimatedTime: 180,
    routeInfo: 'NH-9 to Shahdara. Access via Yamuna Pushta Road. Avoid Vikas Marg (flooded).',
    weatherInfo: 'Moderate rain. Wind 25km/h. Rain continues 6hrs.',
    approvedById: officer.id, approvedAt: new Date(),
    isMock: true,
  }})

  await prisma.agentActivity.createMany({ data: [
    { incidentId: inc1.id, agentName: 'Incident Analysis Agent', action: 'analyze_incident', status: 'COMPLETED', toolsUsed: JSON.stringify(['weather_check','severity_assessment','population_impact']), result: 'Priority: CRITICAL (95/100).', duration: 2340, createdAt: new Date(Date.now() - 3600000 * 3) },
    { incidentId: inc1.id, agentName: 'Resource Planning Agent', action: 'plan_resources', status: 'COMPLETED', toolsUsed: JSON.stringify(['inventory_check','team_availability','resource_allocation']), result: '6 rescue boats and supplies identified.', duration: 1870, createdAt: new Date(Date.now() - 3600000 * 2.5) },
    { incidentId: inc1.id, agentName: 'Routing & Awareness Agent', action: 'calculate_route', status: 'COMPLETED', toolsUsed: JSON.stringify(['route_planning','weather_check','road_status_check']), result: 'Optimal route via NH-9. ETA 45 min.', duration: 1120, createdAt: new Date(Date.now() - 3600000 * 2) },
    { incidentId: inc1.id, agentName: 'Response Coordination Agent', action: 'coordinate_dispatch', status: 'COMPLETED', toolsUsed: JSON.stringify(['team_dispatch','resource_reservation']), result: 'Dispatch confirmed. Delhi Alpha Squad deployed.', duration: 890, createdAt: new Date(Date.now() - 3600000 * 1.5) },
    { incidentId: inc5.id, agentName: 'Incident Analysis Agent', action: 'analyze_incident', status: 'COMPLETED', toolsUsed: JSON.stringify(['incident_classification','urgency_assessment']), result: 'HIGH priority. Missing child — golden hour active.', duration: 1650, createdAt: new Date(Date.now() - 1800000) },
  ]})

  await prisma.notification.createMany({ data: [
    { userId: officer.id, type: 'NEW_INCIDENT', title: 'New Critical Incident', message: 'Severe flooding in East Delhi — 200+ families affected.', isRead: false, incidentId: inc1.id },
    { userId: officer.id, type: 'NEW_INCIDENT', title: 'Building Fire in Mumbai', message: 'High-rise fire in Bandra West. Residents trapped.', isRead: false, incidentId: inc2.id },
    { userId: officer.id, type: 'RESOURCE_ALERT', title: '⚠ Low Stock Alert', message: 'Life Jackets critically low (4 available, min 50).', isRead: false },
    { userId: officer.id, type: 'RESOURCE_ALERT', title: '⚠ Low Stock Alert', message: 'Defibrillators below threshold (3 available, min 5).', isRead: false },
    { userId: officer.id, type: 'STATUS_UPDATE', title: 'Incident Resolved', message: 'Gas leak in Koramangala resolved.', isRead: true, incidentId: inc6.id },
    { userId: admin.id, type: 'SYSTEM', title: 'System Ready', message: 'RESQ AI operational. All services connected.', isRead: false },
    { userId: citizen.id, type: 'STATUS_UPDATE', title: 'Report Being Addressed', message: 'Teams dispatched to the flooding location you reported.', isRead: false, incidentId: inc1.id },
  ]})
  console.log('✅ Notifications seeded')

  console.log('\n🎉 Database seeded successfully!')
  console.log('\nDemo Credentials (password: demo1234):')
  console.log('  admin@resqai.demo      — Admin')
  console.log('  officer@resqai.demo    — Emergency Officer')
  console.log('  inventory@resqai.demo  — Inventory Manager')
  console.log('  team@resqai.demo       — Rescue Team')
  console.log('  citizen@resqai.demo    — Citizen')
}

main()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())

