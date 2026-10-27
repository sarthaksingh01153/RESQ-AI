// Shared TypeScript types for RESQ AI

export type UserRole = 'CITIZEN' | 'OFFICER' | 'RESCUE_TEAM' | 'INVENTORY_MANAGER' | 'ADMIN';
export type IncidentType = 'FLOOD' | 'FIRE' | 'ROAD_ACCIDENT' | 'MEDICAL' | 'EARTHQUAKE' | 'BUILDING_COLLAPSE' | 'MISSING_PERSON' | 'OTHER';
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'REPORTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'RESOURCES_ASSIGNED' | 'DISPATCHED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'FALSE_ALARM';
export type ItemCategory = 'VEHICLE' | 'MEDICAL' | 'FOOD_WATER' | 'WATER_RESCUE' | 'FIREFIGHTING' | 'RESCUE_EQUIPMENT' | 'PROTECTIVE_GEAR' | 'COMMUNICATION' | 'POWER_LIGHTING' | 'OTHER';
export type ItemCondition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED';
export type ItemStatus = 'AVAILABLE' | 'RESERVED' | 'DISPATCHED' | 'MAINTENANCE' | 'RETIRED';
export type MovementType = 'STOCK_IN' | 'RESERVED' | 'DISPATCHED' | 'RETURNED' | 'DAMAGED' | 'EXPIRED' | 'ADJUSTED';
export type ReservationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RELEASED' | 'DISPATCHED';
export type DispatchStatus = 'PENDING' | 'IN_TRANSIT' | 'ON_SITE' | 'RETURNING' | 'RETURNED' | 'CANCELLED';
export type NotificationType = 'INCIDENT' | 'INVENTORY' | 'DISPATCH' | 'SYSTEM' | 'ALERT';
export type AgentStatus = 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Incident {
  id: string;
  trackingId: string;
  type: IncidentType;
  severity: Severity;
  status: IncidentStatus;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address?: string | null;
  reporterName: string;
  reporterPhone?: string | null;
  reporterEmail?: string | null;
  reportedById?: string | null;
  assignedToId?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  reportedBy?: Partial<User> | null;
  assignedTo?: Partial<User> | null;
  attachments?: IncidentAttachment[];
  timeline?: IncidentTimeline[];
  aiAnalyses?: AIAnalysis[];
  rescuePlans?: RescuePlan[];
}

export interface IncidentAttachment {
  id: string;
  incidentId: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface IncidentTimeline {
  id: string;
  incidentId: string;
  status: IncidentStatus;
  note?: string | null;
  isPublic: boolean;
  createdById?: string | null;
  createdAt: string;
  createdBy?: Partial<User> | null;
}

export interface AIAnalysis {
  id: string;
  incidentId: string;
  agentName: string;
  classification?: string | null;
  severity?: string | null;
  summary?: string | null;
  keyFacts?: string[] | null;
  missingInfo?: string[] | null;
  duplicateFlag: boolean;
  priorityReason?: string | null;
  modelUsed?: string | null;
  isMock: boolean;
  createdAt: string;
}

export interface RescuePlan {
  id: string;
  incidentId: string;
  status: string;
  summary?: string | null;
  resourcesRequired?: RecommendedResource[] | null;
  estimatedTime?: number | null;
  routeInfo?: RouteInfo | null;
  weatherInfo?: WeatherInfo | null;
  notes?: string | null;
  approvedById?: string | null;
  approvedAt?: string | null;
  isMock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecommendedResource {
  itemId?: string;
  item: string;
  name?: string;
  quantity: number;
  reason: string;
  available?: number;
  shortfall?: number;
}

export interface RouteInfo {
  distance?: number;
  duration?: number;
  summary?: string;
  warnings?: string[];
  alternatives?: number;
}

export interface WeatherInfo {
  temperature?: number;
  conditions?: string;
  windSpeed?: number;
  precipitation?: number;
  alerts?: string[];
  source?: string;
  observedAt?: string;
}

export interface InventoryLocation {
  id: string;
  name: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isActive: boolean;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: ItemCategory;
  unit: string;
  locationId?: string | null;
  condition: ItemCondition;
  status: ItemStatus;
  availableQty: number;
  reservedQty: number;
  dispatchedQty: number;
  minThreshold: number;
  expiryDate?: string | null;
  lastInspectionDate?: string | null;
  capacity?: number | null;
  operationalStatus?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  location?: InventoryLocation | null;
  isLowStock?: boolean;
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  type: MovementType;
  quantity: number;
  reason?: string | null;
  incidentId?: string | null;
  performedById?: string | null;
  createdAt: string;
  item?: Partial<InventoryItem>;
  performedBy?: Partial<User> | null;
}

export interface ResourceReservation {
  id: string;
  incidentId: string;
  status: ReservationStatus;
  notes?: string | null;
  approvedById?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  items?: ReservationItem[];
  incident?: Partial<Incident>;
}

export interface ReservationItem {
  id: string;
  reservationId: string;
  itemId: string;
  quantity: number;
  reason?: string | null;
  item?: Partial<InventoryItem>;
}

export interface Dispatch {
  id: string;
  reservationId?: string | null;
  incidentId: string;
  status: DispatchStatus;
  notes?: string | null;
  dispatchedAt?: string | null;
  returnedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  items?: DispatchItem[];
}

export interface DispatchItem {
  id: string;
  dispatchId: string;
  itemId: string;
  quantity: number;
  returnedQty: number;
  notes?: string | null;
  item?: Partial<InventoryItem>;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  incidentId?: string | null;
  link?: string | null;
  createdAt: string;
}

export interface AgentActivity {
  id: string;
  incidentId?: string | null;
  agentName: string;
  action: string;
  status: AgentStatus;
  toolsUsed?: string[] | null;
  result?: Record<string, unknown> | null;
  errorMsg?: string | null;
  duration?: number | null;
  createdAt: string;
}

export interface WeatherData {
  temperature: number;
  conditions: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  precipitation: number;
  visibility: number;
  alerts: string[];
  source: string;
  observedAt: string;
  isDemo?: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AnalyticsOverview {
  totalIncidents: number;
  activeIncidents: number;
  criticalIncidents: number;
  resolvedIncidents: number;
  pendingReview: number;
  teamsDeployed: number;
  resourcesAvailable: number;
  incidentsByType: { type: string; count: number }[];
  incidentsBySeverity: { severity: string; count: number }[];
  incidentsByStatus: { status: string; count: number }[];
  recentActivity: Incident[];
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

