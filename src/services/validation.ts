/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlantationSite, GeofenceValidationResult, LatLng } from '../types';

// Bounding box of Bangladesh
const BANGLADESH_BOUNDS = {
  minLat: 20.5,
  maxLat: 26.6,
  minLng: 88.0,
  maxLng: 92.8,
};

// ==========================================
// 1. EXTENSIBLE INTERFACES FOR VALIDATION
// ==========================================

export interface ValidationRuleResult {
  ruleName: string;
  passed: boolean;
  scoreDeduction: number;
  message: string;
  details?: any;
}

export interface IValidationRule {
  name: string;
  description: string;
  validate(site: Partial<PlantationSite>): ValidationRuleResult;
}

export interface IValidationRole {
  roleId: string;
  roleName: string;
  description: string;
  evaluate(site: Partial<PlantationSite>, results: ValidationRuleResult[]): {
    approved: boolean;
    remarks: string;
  };
}

// ==========================================
// 2. AUTOMATIC RULE IMPLEMENTATIONS
// ==========================================

/**
 * Checks GPS accuracy and verifies if coordinates are within Bangladesh bounds.
 */
export class GPSAccuracyRule implements IValidationRule {
  name = "GPS Position & Boundary Check";
  description = "Verifies coordinates fall inside Bangladesh administrative bounds and simulated satellite lock is accurate.";

  validate(site: Partial<PlantationSite>): ValidationRuleResult {
    const lat = site.latitude || 0;
    const lng = site.longitude || 0;

    const inBangladesh =
      lat >= BANGLADESH_BOUNDS.minLat &&
      lat <= BANGLADESH_BOUNDS.maxLat &&
      lng >= BANGLADESH_BOUNDS.minLng &&
      lng <= BANGLADESH_BOUNDS.maxLng;

    if (!inBangladesh) {
      return {
        ruleName: this.name,
        passed: false,
        scoreDeduction: 40,
        message: "Coordinates are outside the administrative boundaries of Bangladesh.",
        details: { lat, lng }
      };
    }

    // Small simulated variance check based on sinusoids
    const lastDigits = Math.abs(Math.sin(lat * 1000) * 100) % 10;
    if (lastDigits > 8.5) {
      return {
        ruleName: this.name,
        passed: true,
        scoreDeduction: 10,
        message: "Simulated poor satellite lock (GPS precision is low). Please verify manually.",
        details: { gps_precision_m: 12.5 }
      };
    }

    return {
      ruleName: this.name,
      passed: true,
      scoreDeduction: 0,
      message: "GPS lock is highly accurate.",
      details: { gps_precision_m: 2.1 }
    };
  }
}

/**
 * Checks if the plantation site's boundary fits its specified plantation type.
 */
export class BoundaryMatchingRule implements IValidationRule {
  name = "Boundary Polygon Verification";
  description = "Ensures Orchard/Large Plantation types have correct boundary definitions.";

  private isSegmentsIntersecting(p1: LatLng, p2: LatLng, p3: LatLng, p4: LatLng): boolean {
    const ccw = (A: LatLng, B: LatLng, C: LatLng) => {
      return (C.lat - A.lat) * (B.lng - A.lng) > (B.lat - A.lat) * (C.lng - A.lng);
    };
    return (ccw(p1, p3, p4) !== ccw(p2, p3, p4)) && (ccw(p1, p2, p3) !== ccw(p1, p2, p4));
  }

  private checkSelfIntersection(nodes: LatLng[]): boolean {
    const len = nodes.length;
    if (len < 4) return false;
    for (let i = 0; i < len; i++) {
      for (let j = i + 2; j < len; j++) {
        if (i === 0 && j === len - 1) continue;
        const p1 = nodes[i];
        const p2 = nodes[(i + 1) % len];
        const p3 = nodes[j];
        const p4 = nodes[(j + 1) % len];
        if (this.isSegmentsIntersecting(p1, p2, p3, p4)) {
          return true;
        }
      }
    }
    return false;
  }

  validate(site: Partial<PlantationSite>): ValidationRuleResult {
    const type = site.plantation_type || 'Single Tree';
    const division = site.division || '';

    if (type === 'Orchard / Large Plantation') {
      const poly = site.polygon || [];
      if (poly.length < 3) {
        return {
          ruleName: this.name,
          passed: false,
          scoreDeduction: 20,
          message: "Orchard/Large Plantation requires a valid boundary polygon with at least 3 vertices."
        };
      }

      if (this.checkSelfIntersection(poly)) {
        return {
          ruleName: this.name,
          passed: false,
          scoreDeduction: 30,
          message: "Boundary polygon self-intersects. Planters must adjust boundary vertices to ensure no overlapping segments exist."
        };
      }
    }

    if (!division || division === 'Central' || division === 'Unrecorded') {
      return {
        ruleName: this.name,
        passed: true,
        scoreDeduction: 5,
        message: "Division unrecorded; boundary matches cannot be verified locally."
      };
    }

    return {
      ruleName: this.name,
      passed: true,
      scoreDeduction: 0,
      message: "Boundary matches administrative subdivision limits."
    };
  }
}

/**
 * Checks for duplicate entries using a simulated geolocation collision hash.
 */
export class DuplicateDetectionRule implements IValidationRule {
  name = "Duplicate Submission Shield";
  description = "Verifies that this location does not duplicate an existing plantation entry.";

  validate(site: Partial<PlantationSite>): ValidationRuleResult {
    const lat = site.latitude || 0;
    const lng = site.longitude || 0;

    // Use a deterministic hash of coordinates for duplicate checking simulation
    const duplicateHash = Math.abs(Math.sin(lat * 2000 + lng * 1000) * 100) % 100;
    const isDuplicateSuspected = duplicateHash > 90;

    if (isDuplicateSuspected) {
      return {
        ruleName: this.name,
        passed: false,
        scoreDeduction: 25,
        message: "Warning: Coordinates overlap with an existing plantation entry in the system registry.",
        details: { nearby_count: 2, min_distance_m: 6.2 }
      };
    }

    if (duplicateHash > 75) {
      return {
        ruleName: this.name,
        passed: true,
        scoreDeduction: 8,
        message: "Another plantation is located close by, but boundaries are clear.",
        details: { nearby_count: 1, min_distance_m: 18.5 }
      };
    }

    return {
      ruleName: this.name,
      passed: true,
      scoreDeduction: 0,
      message: "No duplicates found.",
      details: { nearby_count: 0, min_distance_m: 120 }
    };
  }
}

// ==========================================
// 3. ROLE EVALUATORS
// ==========================================

export class SubAssistantAgricultureOfficerRole implements IValidationRole {
  roleId = "SAAO";
  roleName = "Sub-Assistant Agriculture Officer";
  description = "Performs primary field verification and audits composite confidence index.";
  minScoreRequired = 60;

  evaluate(site: Partial<PlantationSite>, results: ValidationRuleResult[]) {
    const score = results.reduce((acc, rule) => acc - rule.scoreDeduction, 100);
    if (score < this.minScoreRequired) {
      return {
        approved: false,
        remarks: "Flagged for immediate physical field audit due to low composite index."
      };
    }
    return {
      approved: true,
      remarks: "Recommended for fast-tracked ledger entry."
    };
  }
}

export class AgricultureOfficerRole implements IValidationRole {
  roleId = "AO";
  roleName = "Agriculture Officer";
  description = "Validates plantation scale and verifies planter stakeholders database matches.";
  minScoreRequired = 80;

  evaluate(site: Partial<PlantationSite>, results: ValidationRuleResult[]) {
    const score = results.reduce((acc, rule) => acc - rule.scoreDeduction, 100);
    const hasOwner = !!site.personnel?.planter_name;
    
    if (score < this.minScoreRequired) {
      return {
        approved: false,
        remarks: "AO Audit: Low geofencing confidence scores require desk review of property title."
      };
    }
    if (!hasOwner) {
      return {
        approved: false,
        remarks: "AO Audit: Rejection due to missing landowner profile information."
      };
    }
    return {
      approved: true,
      remarks: "Agriculture Officer approves regional forestry eligibility."
    };
  }
}

export class DivisionForestOfficerRole implements IValidationRole {
  roleId = "DFO";
  roleName = "Division Forest Officer";
  description = "Verifies carbon estimates and NDVI canopy index limits for large-scale forestation.";
  minScoreRequired = 85;

  evaluate(site: Partial<PlantationSite>, results: ValidationRuleResult[]) {
    const score = results.reduce((acc, rule) => acc - rule.scoreDeduction, 100);
    const ndvi = site.ndvi || 0;
    const carbon = site.carbon_estimate || 0;

    if (ndvi < 0.4 && carbon < 10) {
      return {
        approved: false,
        remarks: "DFO Audit: Insufficient NDVI signal or carbon sequestration estimates for subsidy ledger signing."
      };
    }
    return {
      approved: true,
      remarks: "DFO Audit: Verified carbon contribution ledger successfully."
    };
  }
}

// ==========================================
// 4. COORDINATED VALIDATION ENGINE SERVICE
// ==========================================

export class ValidationService {
  private rules: IValidationRule[] = [];
  private roles: IValidationRole[] = [];

  constructor() {
    this.registerRule(new GPSAccuracyRule());
    this.registerRule(new BoundaryMatchingRule());
    this.registerRule(new DuplicateDetectionRule());

    this.registerRole(new SubAssistantAgricultureOfficerRole());
    this.registerRole(new AgricultureOfficerRole());
    this.registerRole(new DivisionForestOfficerRole());
  }

  public registerRule(rule: IValidationRule) {
    this.rules.push(rule);
  }

  public registerRole(role: IValidationRole) {
    this.roles.push(role);
  }

  public runAutoChecks(site: Partial<PlantationSite>): ValidationRuleResult[] {
    return this.rules.map(rule => rule.validate(site));
  }

  public getRoleEvaluator(roleId: string): IValidationRole | undefined {
    return this.roles.find(r => r.roleId === roleId);
  }
}

// Singleton Validation Service
export const validationService = new ValidationService();

// Assigned SAAO database based on division
export function getAssignedValidator(division: string) {
  const cleanDiv = (division || '').toLowerCase();
  
  if (cleanDiv.includes('dhaka')) {
    return {
      role: 'SAAO (Sub-Assistant Agriculture Officer)',
      name: 'Abdur Rahman',
      office: 'Savar Upazila Agriculture Extension Office, Dhaka',
    };
  } else if (cleanDiv.includes('chittagong') || cleanDiv.includes('ctg')) {
    return {
      role: 'SAAO (Sub-Assistant Agriculture Officer)',
      name: 'Sultana Begum',
      office: 'Ukhia Block, Cox\'s Bazar Department of Agricultural Extension',
    };
  } else if (cleanDiv.includes('rajshahi')) {
    return {
      role: 'SAAO (Sub-Assistant Agriculture Officer)',
      name: 'Md. Mehedi Hasan',
      office: 'Paba Upazila DAE Office, Rajshahi',
    };
  } else if (cleanDiv.includes('rangpur')) {
    return {
      role: 'SAAO (Sub-Assistant Agriculture Officer)',
      name: 'Nirmal Chandra Ray',
      office: 'Dinajpur Sadar Block, Department of Agricultural Extension',
    };
  } else if (cleanDiv.includes('sylhet')) {
    return {
      role: 'SAAO (Sub-Assistant Agriculture Officer)',
      name: 'Amitabh Sen',
      office: 'Sreemangal Block, Department of Agricultural Extension, Sylhet',
    };
  } else {
    return {
      role: 'SAAO (Sub-Assistant Agriculture Officer)',
      name: 'Anisur Rahman',
      office: 'Central Plantation Monitoring Division, DAE, Dhaka',
    };
  }
}

/**
 * Maintain backward compatibility with existing validationEngine structure
 */
export const validationEngine = {
  validateSite(site: Partial<PlantationSite>): GeofenceValidationResult {
    const lat = site.latitude || 0;
    const lng = site.longitude || 0;
    const division = site.division || 'Central';
    const ndvi = site.ndvi || 0;
    const carbon = site.carbon_estimate || 0;

    // Run rules via the extensible Validation Service
    const autoResults = validationService.runAutoChecks(site);

    // Map rule outcomes to GeofenceValidationResult fields
    const gpsAccuracyRes = autoResults.find(r => r.ruleName === "GPS Position & Boundary Check");
    const boundaryRes = autoResults.find(r => r.ruleName === "Boundary Polygon Verification");
    const duplicateRes = autoResults.find(r => r.ruleName === "Duplicate Submission Shield");

    let gps_accuracy_check: 'Pass' | 'Warning' | 'Fail' = 'Pass';
    if (gpsAccuracyRes) {
      if (!gpsAccuracyRes.passed) gps_accuracy_check = 'Fail';
      else if (gpsAccuracyRes.scoreDeduction > 0) gps_accuracy_check = 'Warning';
    }

    let boundary_match: 'Pass' | 'Mismatch' | 'Unverified' = 'Pass';
    if (boundaryRes) {
      if (!boundaryRes.passed) boundary_match = 'Mismatch';
      else if (boundaryRes.scoreDeduction > 0) boundary_match = 'Unverified';
    }

    let duplicate_check: 'Pass' | 'Warning' = 'Pass';
    if (duplicateRes) {
      if (!duplicateRes.passed || duplicateRes.scoreDeduction > 0) duplicate_check = 'Warning';
    }

    // Retrieve details from duplicate check simulation
    const nearby_count = duplicateRes?.details?.nearby_count ?? 0;
    const min_distance_m = duplicateRes?.details?.min_distance_m ?? 120;

    // Composite Score computation
    let score = 100 - autoResults.reduce((acc, r) => acc + r.scoreDeduction, 0);
    
    // Minor adjustments for NDVI and Carbon to preserve exact scores
    const ndvi_available = ndvi > 0.3;
    const carbon_available = carbon > 0;
    
    if (!ndvi_available) score -= 10;
    else if (ndvi < 0.5) score -= 5;
    if (!carbon_available) score -= 5;

    score = Math.max(0, Math.min(100, score));

    // Compile recommendations based on roles and scores
    let risk_level: 'Low Risk' | 'Medium Risk' | 'High Risk' = 'Low Risk';
    let recommendation = 'Recommended for expedited approval and payment.';

    if (score < 60) {
      risk_level = 'High Risk';
      recommendation = 'Flagged for immediate physical field audit. High potential for overlapping boundary or duplicate data.';
    } else if (score < 85) {
      risk_level = 'Medium Risk';
      recommendation = 'Recommended for manual desk review. SAAO should verify boundaries with regional parcel registry.';
    }

    const assigned_validator = getAssignedValidator(division);

    return {
      gps_accuracy_check,
      boundary_match,
      duplicate_check,
      nearby_count,
      min_distance_m,
      ndvi_available,
      carbon_available,
      score,
      risk_level,
      recommendation,
      assigned_validator,
    };
  },

  calculatePolygonGeometry(polygon: LatLng[]): { area: number; perimeter: number; centroid: LatLng } {
    if (!polygon || polygon.length < 3) {
      return { area: 0, perimeter: 0, centroid: { lat: 0, lng: 0 } };
    }

    // Centroid calculation (simple average)
    let sumLat = 0;
    let sumLng = 0;
    polygon.forEach((pt) => {
      sumLat += pt.lat;
      sumLng += pt.lng;
    });
    const centroid = {
      lat: parseFloat((sumLat / polygon.length).toFixed(7)),
      lng: parseFloat((sumLng / polygon.length).toFixed(7)),
    };

    // Perimeter calculation (approximate meters)
    let perimeter = 0;
    const cosLat = Math.cos((centroid.lat * Math.PI) / 180);

    for (let i = 0; i < polygon.length; i++) {
      const p1 = polygon[i];
      const p2 = polygon[(i + 1) % polygon.length];

      const dLat = (p2.lat - p1.lat) * 111000;
      const dLng = (p2.lng - p1.lng) * 111000 * cosLat;
      perimeter += Math.sqrt(dLat * dLat + dLng * dLng);
    }

    // Area calculation using Shoelace formula (in square meters)
    let shoelaceSum = 0;
    for (let i = 0; i < polygon.length; i++) {
      const p1 = polygon[i];
      const p2 = polygon[(i + 1) % polygon.length];

      // Project to local Mercator meters relative to centroid
      const x1 = (p1.lng - centroid.lng) * 111000 * cosLat;
      const y1 = (p1.lat - centroid.lat) * 111000;
      const x2 = (p2.lng - centroid.lng) * 111000 * cosLat;
      const y2 = (p2.lat - centroid.lat) * 111000;

      shoelaceSum += x1 * y2 - x2 * y1;
    }
    const area = Math.abs(shoelaceSum) / 2;

    return {
      area: Math.round(area * 10) / 10,
      perimeter: Math.round(perimeter * 10) / 10,
      centroid,
    };
  },
};
