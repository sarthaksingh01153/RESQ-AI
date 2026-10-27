// Safety Guidance Library — reviewed, static content per emergency type.
// This is NOT AI-generated. It is a curated, reviewed library.
// AI may add context on top, but these base guidelines are fixed.

export interface SafetyGuidance {
  type: string;
  label: string;
  icon: string;
  immediateSteps: string[];          // What to do RIGHT NOW
  doNotDo: string[];                 // Critical prohibitions
  callNumbers: string[];             // India emergency numbers
  safetyTips: string[];              // General tips
  officialSource: string;            // Source attribution
}

export const SAFETY_LIBRARY: Record<string, SafetyGuidance> = {
  FLOOD: {
    type: 'FLOOD',
    label: 'Flood',
    icon: '🌊',
    immediateSteps: [
      'Move immediately to higher ground — do not wait for an official evacuation order.',
      'Turn off electricity at the main switch before water enters the building.',
      'Do not walk through moving water — 15 cm of fast-moving water can knock you down.',
      'If driving, abandon your vehicle immediately and move to higher ground.',
      'Take emergency supplies: water, food, torch, first aid kit, important documents.',
      'Keep listening to official radio / emergency broadcasts for updates.',
    ],
    doNotDo: [
      'Do NOT drive through flooded roads — just 30 cm of water can carry a car.',
      'Do NOT touch electrical equipment in wet areas.',
      'Do NOT drink flood water — it is highly contaminated.',
      'Do NOT re-enter flooded buildings until authorities declare them safe.',
      'Do NOT use open flames (candles, lighters) near flooded areas due to gas leak risk.',
    ],
    callNumbers: ['112 (National Emergency)', '1078 (NDRF Helpline)', '1800-180-1551 (IMD Flood Alert)'],
    safetyTips: [
      'Wear rubber boots and gloves when moving through flood water.',
      'Beware of snakes and insects displaced by floodwater.',
      'Document damage with photos for insurance after the flood recedes.',
    ],
    officialSource: 'NDMA India — Flood Guidelines',
  },

  FIRE: {
    type: 'FIRE',
    label: 'Fire',
    icon: '🔥',
    immediateSteps: [
      'Activate the nearest fire alarm immediately.',
      'Call 101 (Fire Brigade) without delay.',
      'Evacuate the building — use stairs, never lifts.',
      'Crawl low under smoke — cleaner air is near the floor.',
      'Close doors as you leave to slow fire spread — do not lock them.',
      'Meet at the designated assembly point and account for everyone.',
    ],
    doNotDo: [
      'Do NOT use lifts during a fire evacuation.',
      'Do NOT re-enter a burning building for any reason.',
      'Do NOT open doors that feel hot — fire may be on the other side.',
      'Do NOT use water on electrical or grease fires.',
      'Do NOT stop to collect belongings — exit immediately.',
    ],
    callNumbers: ['101 (Fire Brigade)', '112 (National Emergency)', '108 (Ambulance)'],
    safetyTips: [
      'If trapped, signal from a window with a cloth or torch.',
      'Seal door gaps with clothing to reduce smoke entry.',
      'If on fire: Stop, Drop, Roll — do not run.',
    ],
    officialSource: 'NDMA India — Fire Safety Guidelines',
  },

  ROAD_ACCIDENT: {
    type: 'ROAD_ACCIDENT',
    label: 'Road Accident',
    icon: '🚗',
    immediateSteps: [
      'Call 112 (Emergency) or 108 (Ambulance) immediately.',
      'Turn on hazard lights and place warning triangles if available.',
      'Check for dangers (fuel leak, traffic) before approaching victims.',
      'Do NOT move injured persons unless there is immediate danger of fire or explosion.',
      'Apply pressure to wounds with a clean cloth to control bleeding.',
      'Keep the injured person calm, warm, and still until help arrives.',
    ],
    doNotDo: [
      'Do NOT remove a helmet from an injured motorcyclist unless absolutely necessary.',
      'Do NOT give food or water to a seriously injured person.',
      'Do NOT leave an injured person alone if it can be avoided.',
      'Do NOT block the scene unless essential — keep one lane clear for emergency vehicles.',
      'Do NOT move a person with a suspected spine or neck injury.',
    ],
    callNumbers: ['112 (National Emergency)', '108 (Ambulance)', '1073 (Road Accident Helpline)'],
    safetyTips: [
      'Note the vehicle registration numbers of vehicles involved.',
      'Photograph the scene from a safe distance for documentation.',
      'Do not interfere with evidence unless necessary to save a life.',
    ],
    officialSource: 'Ministry of Road Transport & Highways — First Responder Guidelines',
  },

  MEDICAL: {
    type: 'MEDICAL',
    label: 'Medical Emergency',
    icon: '🚑',
    immediateSteps: [
      'Call 108 (Ambulance) immediately — stay on the line.',
      'If the person is unconscious and not breathing, start CPR if trained.',
      'For choking: perform the Heimlich manoeuvre.',
      'For suspected heart attack: keep the person still, loosen clothing, give aspirin if available and not allergic.',
      'For stroke (FAST): Face drooping, Arm weakness, Speech difficulty — Time to call 108.',
      'Control bleeding by applying firm, direct pressure with a clean cloth.',
    ],
    doNotDo: [
      'Do NOT give food or water to an unconscious person.',
      'Do NOT leave the person alone.',
      'Do NOT administer medication unless you are sure of the condition.',
      'Do NOT move a person with suspected spinal injury.',
      'Do NOT panic — calm, clear communication with emergency services saves lives.',
    ],
    callNumbers: ['108 (Ambulance)', '112 (National Emergency)', '1800-180-1104 (Mental Health Helpline)'],
    safetyTips: [
      'Note the time symptoms started — this is critical information for doctors.',
      'Keep the person comfortable and monitor breathing.',
      'Collect any medications the person is taking to show the paramedics.',
    ],
    officialSource: 'Ministry of Health & Family Welfare — Emergency Response Guidelines',
  },

  EARTHQUAKE: {
    type: 'EARTHQUAKE',
    label: 'Earthquake',
    icon: '🌍',
    immediateSteps: [
      'DROP to hands and knees immediately.',
      'Take COVER under a sturdy desk or table, or cover your head and neck with your arms.',
      'HOLD ON until shaking stops — stay in position.',
      'If outdoors, move away from buildings, trees, streetlights, and overhead wires.',
      'After shaking stops, check for injuries and hazards before moving.',
      'Evacuate the building using stairs — be alert for aftershocks.',
    ],
    doNotDo: [
      'Do NOT run outside during shaking — most injuries occur from falling debris at doorways.',
      'Do NOT use lifts after an earthquake.',
      'Do NOT use open flames — gas leaks are common after earthquakes.',
      'Do NOT re-enter damaged buildings.',
      'Do NOT use the phone unless it is a life-threatening emergency.',
    ],
    callNumbers: ['112 (National Emergency)', '1078 (NDRF)', '011-26701700 (NDMA Control Room)'],
    safetyTips: [
      'Check for gas leaks — if you smell gas, open windows and leave immediately.',
      'Wear shoes to protect feet from broken glass and debris.',
      'Be prepared for aftershocks — they can be strong.',
    ],
    officialSource: 'NDMA India — Earthquake Safety Guidelines',
  },

  BUILDING_COLLAPSE: {
    type: 'BUILDING_COLLAPSE',
    label: 'Building Collapse',
    icon: '🏚️',
    immediateSteps: [
      'If trapped: cover your mouth with clothing, tap on a pipe or wall to help rescuers locate you.',
      'Call 112 immediately if you can.',
      'If outside: move far away from the collapse zone — secondary collapses are common.',
      'If helping survivors: do not enter unless trained — wait for rescue teams.',
      'Shout to locate survivors, but avoid unnecessary movement of debris.',
      'Alert emergency services to the exact location and estimated number of people inside.',
    ],
    doNotDo: [
      'Do NOT use matches or lighters — gas leaks are likely.',
      'Do NOT re-enter any part of the damaged structure.',
      'Do NOT try to rescue people by moving large debris without professional equipment.',
      'Do NOT use lifts in a partially collapsed building.',
      'Do NOT block access roads — keep them clear for emergency vehicles.',
    ],
    callNumbers: ['112 (National Emergency)', '101 (Fire & Rescue)', '1078 (NDRF)'],
    safetyTips: [
      'Mark collapsed areas to alert others.',
      'Note any sounds from beneath debris and report to rescue teams.',
      'Keep bystanders at a safe distance — establish a perimeter.',
    ],
    officialSource: 'NDMA India — Urban Search & Rescue Guidelines',
  },

  MISSING_PERSON: {
    type: 'MISSING_PERSON',
    label: 'Missing Person',
    icon: '👤',
    immediateSteps: [
      'File a police report immediately — do not wait 24 hours.',
      'Call 112 or the nearest police station.',
      'Note the last known location, time, and what the person was wearing.',
      'Share a recent clear photograph with police.',
      'Contact local hospitals, shelters, and community centres.',
      'Alert neighbours and community members to help with search.',
    ],
    doNotDo: [
      'Do NOT delay reporting to police.',
      'Do NOT conduct a search alone in dangerous areas.',
      'Do NOT disturb the missing person\'s belongings unnecessarily — police may need them.',
      'Do NOT post unverified information on social media that could cause panic.',
    ],
    callNumbers: ['112 (National Emergency)', '1094 (Missing Persons Helpline)', '1098 (Child Helpline)'],
    safetyTips: [
      'For missing children: contact Bachpan Bachao Andolan (1800-102-7222).',
      'Keep phone charged and available for contact from authorities.',
      'Preserve CCTV footage from nearby cameras before it is overwritten.',
    ],
    officialSource: 'Ministry of Home Affairs — Missing Persons Reporting Guidelines',
  },

  OTHER: {
    type: 'OTHER',
    label: 'Emergency',
    icon: '⚠️',
    immediateSteps: [
      'Call 112 (National Emergency) immediately.',
      'Ensure your own safety first before helping others.',
      'Move to a safe location away from the hazard.',
      'Follow instructions from emergency services.',
      'Stay on the line with emergency services until help arrives.',
    ],
    doNotDo: [
      'Do NOT put yourself in danger.',
      'Do NOT interfere with emergency operations.',
      'Do NOT spread unverified information.',
    ],
    callNumbers: ['112 (National Emergency)', '108 (Ambulance)', '101 (Fire)', '100 (Police)'],
    safetyTips: [
      'Keep all emergency numbers saved in your phone.',
      'Share your location clearly when calling for help.',
    ],
    officialSource: 'NDMA India — General Emergency Guidelines',
  },
};

export function getSafetyGuidance(type: string): SafetyGuidance {
  return SAFETY_LIBRARY[type] || SAFETY_LIBRARY['OTHER'];
}

