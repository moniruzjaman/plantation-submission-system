/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LatLng } from '../types';

export interface ReverseGeocodeResult {
  address: string;
  division: string;
  district: string;
  upazila: string;
  union: string;
  village: string;
  road: string;
  postcode: string;
}

/**
 * Deterministic helper to get a pseudo-random number based on latitude and longitude.
 * This ensures that the same coordinates always return the same NDVI/Carbon estimate.
 */
function getDeterministicValue(lat: number, lng: number, seed: number = 0): number {
  const x = Math.sin(lat * 12.9898 + lng * 78.233 + seed) * 43758.5453123;
  return x - Math.floor(x);
}

/**
 * Environmental Information Service
 */
export const environmentalService = {
  /**
   * Estimates NDVI (Normalized Difference Vegetation Index) for a given coordinate.
   * In a real system, this would call a satellite processing API (e.g., Google Earth Engine, Sentinel Hub).
   */
  calculateNDVI(lat: number, lng: number): Promise<{ value: number; rating: string; color: string }> {
    return new Promise((resolve) => {
      // Return a deterministic NDVI between 0.35 (medium) and 0.85 (very dense/healthy vegetation)
      const rawVal = getDeterministicValue(lat, lng, 101);
      const value = Math.round((0.35 + rawVal * 0.5) * 100) / 100;

      let rating = 'Medium Vegetation';
      let color = '#EAB308'; // Yellow-500

      if (value > 0.72) {
        rating = 'Dense Healthy Canopy (Optimal)';
        color = '#15803D'; // Green-700
      } else if (value > 0.55) {
        rating = 'Moderate to Good Vegetation';
        color = '#22C55E'; // Green-500
      } else if (value < 0.45) {
        rating = 'Sparse/Stressed Vegetation';
        color = '#F97316'; // Orange-500
      }

      // Simulate a network delay of 300ms to show loading state
      setTimeout(() => {
        resolve({ value, rating, color });
      }, 300);
    });
  },

  /**
   * Estimates carbon stock (Tonnes per Hectare) based on location and vegetation characteristics.
   * Placeholder for future satellite/AI model integrations.
   */
  estimateCarbon(lat: number, lng: number, quantity: number = 1): Promise<{ tonnesPerHa: number; totalEstimatedCO2: number }> {
    return new Promise((resolve) => {
      // Deterministic carbon stock density: 12 to 145 tonnes per hectare
      const rawVal = getDeterministicValue(lat, lng, 202);
      const tonnesPerHa = Math.round((12 + rawVal * 133) * 10) / 10;

      // Calculate estimated CO2 sequestration (approx 3.67x carbon, scaled down by plantation size)
      const scaleMultiplier = Math.min(1.0, quantity / 100);
      const totalEstimatedCO2 = Math.round(tonnesPerHa * 3.67 * scaleMultiplier * 10) / 10;

      setTimeout(() => {
        resolve({
          tonnesPerHa,
          totalEstimatedCO2,
        });
      }, 250);
    });
  },

  /**
   * Reverse geocodes coordinates into Bangladesh's administrative structure using OSM Nominatim API.
   * Gracefully falls back to localized mock data if offline or if the API fails/throttles.
   */
  async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult> {
    try {
      // Perform a real API fetch to Nominatim (OpenStreetMap reverse geocoding)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=en`,
        {
          headers: {
            'User-Agent': 'PlantationSubmissionSystem/1.0',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Nominatim API error');
      }

      const data = await response.json();
      const addr = data.address || {};

      // Parse OpenStreetMap address hierarchy to Bangladesh's administrative equivalents
      const division = addr.state || addr.region || addr.province || 'Dhaka Division';
      const district = addr.state_district || addr.county || addr.district || addr.city || 'Dhaka District';
      const upazila = addr.subdistrict || addr.municipality || addr.city_district || addr.suburb || addr.town || addr.city || 'Savar Upazila';
      const union = addr.neighbourhood || addr.suburb || addr.village || addr.city_district || addr.hamlet || 'Ashulia Union';
      const village = addr.village || addr.hamlet || addr.residential || addr.suburb || addr.neighbourhood || 'Chandra Village';
      const road = addr.road || addr.pedestrian || addr.highway || addr.path || addr.suburb || 'Chandra Main Road';
      const postcode = addr.postcode || '1340';
      const display_name = data.display_name || 'Dhaka, Bangladesh';

      return {
        address: display_name,
        division,
        district,
        upazila,
        union,
        village,
        road,
        postcode,
      };
    } catch (error) {
      console.warn('Geocoding API failed or offline. Using local fallback dictionary.', error);
      return this.fallbackGeocode(lat, lng);
    }
  },

  /**
   * Fallback mock address generator that returns deterministic Bangladesh administrative data
   * based on coordinates. Enables 100% offline functionality.
   */
  fallbackGeocode(lat: number, lng: number): ReverseGeocodeResult {
    // Generate deterministic index
    const index = Math.floor(getDeterministicValue(lat, lng, 303) * 5);

    const fallbackDB = [
      {
        division: 'Dhaka Division',
        district: 'Dhaka District',
        upazila: 'Savar Upazila',
        union: 'Ashulia Union',
        village: 'Khagan Village',
        road: 'Daffodil Campus Road',
        postcode: '1341',
      },
      {
        division: 'Chittagong Division',
        district: 'Cox\'s Bazar District',
        upazila: 'Ukhia Upazila',
        union: 'Palongkhali Union',
        village: 'Kutupalong Village',
        road: 'Cox\'s Bazar Teknaf Highway',
        postcode: '4750',
      },
      {
        division: 'Rajshahi Division',
        district: 'Rajshahi District',
        upazila: 'Paba Upazila',
        union: 'Harian Union',
        village: 'Kajla Village',
        road: 'Rajshahi University Bypass Road',
        postcode: '6204',
      },
      {
        division: 'Rangpur Division',
        district: 'Dinajpur District',
        upazila: 'Dinajpur Sadar Upazila',
        union: 'Chehelgazi Union',
        village: 'Auliapur Village',
        road: 'Suihari Ward Road 4',
        postcode: '5200',
      },
      {
        division: 'Sylhet Division',
        district: 'Sylhet District',
        upazila: 'Sreemangal Upazila',
        union: 'Kalighat Union',
        village: 'Finlay Estate Village',
        road: 'Tea Garden Loop Road 2',
        postcode: '3210',
      },
    ];

    const item = fallbackDB[index] || fallbackDB[0];
    const fullAddress = `${item.road}, ${item.village}, ${item.union}, ${item.upazila}, ${item.district}, ${item.division}, Bangladesh (Postal: ${item.postcode})`;

    return {
      address: fullAddress,
      ...item,
    };
  },
};
