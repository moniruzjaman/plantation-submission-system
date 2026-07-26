/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SubmissionStatus =
  | 'Draft'
  | 'Ready'
  | 'Sync Pending'
  | 'Submitted'
  | 'Validation Pending'
  | 'Approved'
  | 'Rejected';

export type PlantationType = 'Single Tree' | 'Small Plantation' | 'Orchard / Large Plantation';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Submission {
  submission_id: string;
  submitted_by_id: string;
  submitted_by_name: string;
  office: string;
  submitted_at: number; // timestamp
  status: SubmissionStatus;
  sites: PlantationSite[];
}

export interface PlantationSite {
  site_id: string;
  submission_id: string;
  plantation_type: PlantationType;
  latitude: number;
  longitude: number;
  radius: number | null; // meters, for Small Plantation
  polygon: LatLng[] | null; // coordinate array for Orchard / Large Plantation
  area: number | null; // in square meters (calculated)
  perimeter: number | null; // in meters (calculated)
  centroid: LatLng | null; // calculated center
  address: string;
  division: string;
  district: string;
  upazila: string;
  union: string;
  village: string;
  road: string;
  postcode: string;
  ndvi: number; // e.g. 0.65
  carbon_estimate: number; // e.g. 15.4 (Tonnes/Ha)
  geofence_score: number; // Score out of 100
  geofence_details: GeofenceValidationResult | null;
  plants: Plant[];
  personnel: Personnel | null;
}

export interface Plant {
  plant_id: string;
  site_id: string;
  category: string; // Fruit, Timber, Medicinal, Ornamental, etc.
  species: string; // Plant name
  variety: string;
  plantation_date: string;
  seedling_age: string; // e.g. "6 months", "1 year"
  quantity: number;
  photos: string[]; // Base64 image strings
  validation_status: 'Pending' | 'Valid' | 'Suspicious' | 'Invalid';
}

export interface Personnel {
  site_id: string;
  planter_name: string;
  planter_mobile: string;
  caretaker_name: string;
  caretaker_mobile: string;
  is_caretaker_same_as_planter: boolean;
}

export interface GeofenceValidationResult {
  gps_accuracy_check: 'Pass' | 'Warning' | 'Fail';
  boundary_match: 'Pass' | 'Mismatch' | 'Unverified';
  duplicate_check: 'Pass' | 'Warning'; // Warning: Duplicate suspected
  nearby_count: number;
  min_distance_m: number;
  ndvi_available: boolean;
  carbon_available: boolean;
  score: number; // 0 - 100
  risk_level: 'Low Risk' | 'Medium Risk' | 'High Risk';
  recommendation: string;
  assigned_validator: {
    role: string;
    name: string;
    office: string;
  };
}

export interface OfflineSyncQueueItem {
  queue_id: string;
  submission_id: string;
  timestamp: number;
  attempts: number;
  last_error?: string;
}

// ==========================================
// 12 NEW PRODUCTION DATABASE SCHEMAS & TABLES
// ==========================================

export interface User {
  user_id: string;
  name: string;
  office: string;
  designation: string;
  role: 'Planter' | 'Validator' | 'Admin' | 'Government Officer';
  district: string;
  upazila: string;
  block: string;
}

export interface Office {
  office_id: string;
  name: string;
  region: string;
  contact_number: string;
}

export interface Species {
  species_id: string;
  category: string; // e.g., Fruit, Timber, Medicinal
  scientific_name: string;
  local_name: string;
  carbon_factor: number; // Tonnes of Carbon sequestered per Ha per year
  life_span: number; // years
  recommended_spacing: string; // e.g., "3m x 3m"
}

export interface GeoFence {
  geofence_id: string;
  site_id: string;
  geometry: LatLng[]; // GeoJSON-like coords
  centroid: LatLng;
  area: number; // Sq. meters
  perimeter: number; // meters
  type: 'Polygon' | 'Circle' | 'Point';
  created_at: number;
}

export interface PlantPhoto {
  photo_id: string;
  plant_id: string;
  file_url: string; // Base64 or ObjectURL in local/offline context
  thumbnail: string;
  gps: LatLng;
  taken_at: number;
  device: string;
  hash: string; // MD5/SHA hash for deduplication
}

export interface ValidationTask {
  task_id: string;
  submission_id: string;
  site_id: string;
  validator_id: string;
  validator_name: string;
  validator_role: string;
  assigned_date: number;
  due_date: number;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  remarks: string;
  approved_at: number | null;
  rejected_at: number | null;
}

export interface Inspection {
  inspection_id: string;
  site_id: string;
  inspection_date: number;
  inspector_id: string;
  inspector_name: string;
  survival_count: number;
  dead_count: number;
  height: number; // average height in meters
  canopy: number; // canopy cover percentage
  health_status: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  remarks: string;
}

export interface NDVIHistory {
  history_id: string;
  site_id: string;
  date: number;
  ndvi: number;
  source: string; // Sentinel-2, Landsat-8, Drone
}

export interface CarbonHistory {
  history_id: string;
  site_id: string;
  date: number;
  carbon: number; // estimated tonnes of CO2 equivalent
  method: string; // NDVI-Derived, Biomass Equation, Species Alometric
}

export interface Notification {
  notification_id: string;
  recipient: string; // user_id or email
  role: string;
  title: string;
  message: string;
  status: 'Unread' | 'Read';
  created_at: number;
  read_at: number | null;
}

export interface AuditLog {
  log_id: string;
  user_id: string;
  user_name: string;
  action: string; // CREATE, UPDATE, DELETE, SYNC, APPROVE, REJECT
  entity: string; // Submission, Site, Plant, Inspection, etc.
  entity_id: string;
  old_value: string; // JSON string representation or description
  new_value: string; // JSON string representation or description
  device: string;
  gps: LatLng | null;
  timestamp: number;
}

export interface SyncQueue {
  queue_id: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  entity: string; // Submission, Site, Inspection, etc.
  entity_id: string;
  payload: string; // stringified JSON
  status: 'Pending' | 'Synced' | 'Failed';
  retry_count: number;
  last_attempt: number | null;
}

export interface QRCode {
  qr_id: string;
  site_id: string;
  qr_value: string; // encrypted or structured site token string
  generated_at: number;
  last_scanned: number | null;
  scan_count: number;
}

// Relational Administrative Boundary masters
export interface Division {
  division_id: string;
  name_en: string;
  name_bn: string;
}

export interface District {
  district_id: string;
  division_id: string;
  name_en: string;
  name_bn: string;
}

export interface Upazila {
  upazila_id: string;
  district_id: string;
  name_en: string;
  name_bn: string;
}

export interface UnionBoundary {
  union_id: string;
  upazila_id: string;
  name_en: string;
  name_bn: string;
}

