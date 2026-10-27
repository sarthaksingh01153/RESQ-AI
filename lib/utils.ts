import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateTrackingId(type: string): string {
  const prefix = {
    FLOOD: 'FL',
    FIRE: 'FR',
    ROAD_ACCIDENT: 'RA',
    MEDICAL: 'ME',
    EARTHQUAKE: 'EQ',
    BUILDING_COLLAPSE: 'BC',
    MISSING_PERSON: 'MP',
    OTHER: 'OT',
  }[type] || 'IN';

  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `${prefix}-${year}-${random}`;
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), 'dd MMM yyyy, HH:mm');
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'dd MMM yyyy');
}

export function timeAgo(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function severityColor(severity: string): string {
  switch (severity) {
    case 'CRITICAL': return 'text-red-400 bg-red-400/10 border-red-400/20';
    case 'HIGH': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
    case 'MEDIUM': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    case 'LOW': return 'text-green-400 bg-green-400/10 border-green-400/20';
    default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  }
}

export function statusColor(status: string): string {
  switch (status) {
    case 'REPORTED': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    case 'UNDER_REVIEW': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    case 'VERIFIED': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
    case 'RESOURCES_ASSIGNED': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
    case 'DISPATCHED': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    case 'IN_PROGRESS': return 'text-red-400 bg-red-400/10 border-red-400/20';
    case 'RESOLVED': return 'text-green-400 bg-green-400/10 border-green-400/20';
    case 'CLOSED': return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    case 'FALSE_ALARM': return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  }
}

export function incidentTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    FLOOD: '🌊',
    FIRE: '🔥',
    ROAD_ACCIDENT: '🚗',
    MEDICAL: '🚑',
    EARTHQUAKE: '🌍',
    BUILDING_COLLAPSE: '🏚️',
    MISSING_PERSON: '👤',
    OTHER: '⚠️',
  };
  return icons[type] || '⚠️';
}

export function incidentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    FLOOD: 'Flood',
    FIRE: 'Fire',
    ROAD_ACCIDENT: 'Road Accident',
    MEDICAL: 'Medical Emergency',
    EARTHQUAKE: 'Earthquake',
    BUILDING_COLLAPSE: 'Building Collapse',
    MISSING_PERSON: 'Missing Person',
    OTHER: 'Other',
  };
  return labels[type] || type;
}

export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    REPORTED: 'Reported',
    UNDER_REVIEW: 'Under Review',
    VERIFIED: 'Verified',
    RESOURCES_ASSIGNED: 'Resources Assigned',
    DISPATCHED: 'Dispatched',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
    FALSE_ALARM: 'False Alarm',
  };
  return labels[status] || status;
}

export function categoryLabel(cat: string): string {
  const labels: Record<string, string> = {
    VEHICLE: 'Vehicles',
    MEDICAL: 'Medical Supplies',
    FOOD_WATER: 'Food & Water',
    WATER_RESCUE: 'Water Rescue',
    FIREFIGHTING: 'Firefighting',
    RESCUE_EQUIPMENT: 'Rescue Equipment',
    PROTECTIVE_GEAR: 'Protective Gear',
    COMMUNICATION: 'Communication',
    POWER_LIGHTING: 'Power & Lighting',
    OTHER: 'Other',
  };
  return labels[cat] || cat;
}

export function safeJsonParse<T>(str: string | null | undefined, fallback: T): T {
  if (!str) return fallback;
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '…';
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export const ROLES = {
  CITIZEN: 'CITIZEN',
  OFFICER: 'OFFICER',
  RESCUE_TEAM: 'RESCUE_TEAM',
  INVENTORY_MANAGER: 'INVENTORY_MANAGER',
  ADMIN: 'ADMIN',
} as const;

export const INCIDENT_TYPES = [
  { value: 'FLOOD', label: 'Flood', icon: '🌊', description: 'Flash flood, river overflow, water logging' },
  { value: 'FIRE', label: 'Fire', icon: '🔥', description: 'Building fire, forest fire, industrial fire' },
  { value: 'ROAD_ACCIDENT', label: 'Road Accident', icon: '🚗', description: 'Vehicle collision, highway accident' },
  { value: 'MEDICAL', label: 'Medical Emergency', icon: '🚑', description: 'Cardiac arrest, stroke, mass casualty' },
  { value: 'EARTHQUAKE', label: 'Earthquake', icon: '🌍', description: 'Seismic activity, tremors, aftershocks' },
  { value: 'BUILDING_COLLAPSE', label: 'Building Collapse', icon: '🏚️', description: 'Structural failure, landslide' },
  { value: 'MISSING_PERSON', label: 'Missing Person', icon: '👤', description: 'Missing adult or child' },
  { value: 'OTHER', label: 'Other Emergency', icon: '⚠️', description: 'Other emergency not listed above' },
];

export const SEVERITY_LEVELS = [
  { value: 'LOW', label: 'Low', color: 'green', description: 'Minor incident, no immediate threat to life' },
  { value: 'MEDIUM', label: 'Medium', color: 'yellow', description: 'Moderate impact, requires prompt response' },
  { value: 'HIGH', label: 'High', color: 'orange', description: 'Serious incident, multiple persons at risk' },
  { value: 'CRITICAL', label: 'Critical', color: 'red', description: 'Life-threatening, immediate response required' },
];

export const ITEM_CATEGORIES = [
  { value: 'VEHICLE', label: 'Vehicles', icon: '🚑' },
  { value: 'MEDICAL', label: 'Medical Supplies', icon: '💊' },
  { value: 'FOOD_WATER', label: 'Food & Water', icon: '🥤' },
  { value: 'WATER_RESCUE', label: 'Water Rescue', icon: '⛵' },
  { value: 'FIREFIGHTING', label: 'Firefighting', icon: '🧯' },
  { value: 'RESCUE_EQUIPMENT', label: 'Rescue Equipment', icon: '🪝' },
  { value: 'PROTECTIVE_GEAR', label: 'Protective Gear', icon: '🦺' },
  { value: 'COMMUNICATION', label: 'Communication', icon: '📻' },
  { value: 'POWER_LIGHTING', label: 'Power & Lighting', icon: '🔦' },
  { value: 'OTHER', label: 'Other', icon: '📦' },
];

