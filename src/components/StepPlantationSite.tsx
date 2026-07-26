/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { PlantationType, LatLng, PlantationSite } from '../types';
import MapComponent from './MapComponent';
import { environmentalService } from '../services/environmental';
import { validationEngine } from '../services/validation';
import { Locate, Navigation, Leaf, Sparkles } from 'lucide-react';
import SiteRegistryPanel from './SiteRegistryPanel';

export default function StepPlantationSite() {
  const { activeSubmission, updateActiveSite, activeSiteIndex, language, t } = useApp();

  if (!activeSubmission || activeSubmission.sites.length === 0) return null;

  // Working on the current active site index
  const site = activeSubmission.sites[activeSiteIndex] || activeSubmission.sites[activeSubmission.sites.length - 1];

  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isTrackingGPS, setIsTrackingGPS] = useState(false);
  
  const watchIdRef = useRef<number | null>(null);

  // Real-time GPS coordinate listener
  useEffect(() => {
    if (isTrackingGPS) {
      if (!navigator.geolocation) {
        alert(language === 'en' ? 'Geolocation is not supported by your browser.' : 'আপনার ব্রাউজারে জিপিএস সুবিধা সমর্থিত নয়।');
        setIsTrackingGPS(false);
        return;
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateActiveSite((prev) => ({
            ...prev,
            latitude: parseFloat(latitude.toFixed(7)),
            longitude: parseFloat(longitude.toFixed(7)),
          }));
        },
        (error) => {
          console.error('Real-time GPS tracking error:', error);
          // Only alert once and toggle off to not disturb user
          setIsTrackingGPS(false);
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
      );
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isTrackingGPS, language, updateActiveSite]);

  // Trigger manual GPS detection
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert(language === 'en' ? 'Geolocation is not supported by your browser.' : 'আপনার ব্রাউজারে জিপিএস সুবিধা সমর্থিত নয়।');
      return;
    }

    setIsLoadingGPS(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const preciseLat = parseFloat(latitude.toFixed(7));
        const preciseLng = parseFloat(longitude.toFixed(7));
        
        // Update site coords first
        updateActiveSite((prev) => ({
          ...prev,
          latitude: preciseLat,
          longitude: preciseLng,
        }));

        // Trigger reverse geocode
        await triggerReverseGeocode(preciseLat, preciseLng);
        setIsLoadingGPS(false);
      },
      (error) => {
        console.error('GPS localization error:', error);
        alert(language === 'en' 
          ? 'Could not retrieve your precise location. Please input coordinates manually or try again.'
          : 'আপনার সঠিক জিপিএস অবস্থান নির্ণয় করা সম্ভব হয়নি। অনুগ্রহ করে ম্যানুয়ালি স্থানাঙ্ক প্রদান করুন।'
        );
        setIsLoadingGPS(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Perform reverse geocoding lookup
  const triggerReverseGeocode = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const geoResult = await environmentalService.reverseGeocode(lat, lng);
      updateActiveSite((prev) => ({
        ...prev,
        address: geoResult.address,
        division: geoResult.division,
        district: geoResult.district,
        upazila: geoResult.upazila,
        union: geoResult.union,
        village: geoResult.village,
        postcode: geoResult.postcode,
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Handle map modification callback
  const handleMapChange = (data: {
    latitude: number;
    longitude: number;
    radius: number | null;
    polygon: LatLng[] | null;
  }) => {
    updateActiveSite((prev) => {
      const updatedSite = {
        ...prev,
        latitude: data.latitude,
        longitude: data.longitude,
        radius: data.radius,
        polygon: data.polygon,
      };

      // Calculate geometry details if Orchard
      if (prev.plantation_type === 'Orchard / Large Plantation' && data.polygon && data.polygon.length >= 3) {
        const geom = validationEngine.calculatePolygonGeometry(data.polygon);
        updatedSite.area = geom.area;
        updatedSite.perimeter = geom.perimeter;
        updatedSite.centroid = geom.centroid;
      } else {
        updatedSite.area = null;
        updatedSite.perimeter = null;
        updatedSite.centroid = null;
      }

      return updatedSite;
    });
  };

  // When type changes, enforce rules
  const handleTypeChange = (type: PlantationType) => {
    updateActiveSite((prev) => {
      const next: Partial<PlantationSite> = {
        ...prev,
        plantation_type: type,
      };

      if (type === 'Single Tree') {
        next.radius = null;
        next.polygon = null;
        next.area = null;
        next.perimeter = null;
        next.centroid = null;
      } else if (type === 'Small Plantation') {
        next.radius = 15; // default 15m radius
        next.polygon = null;
        next.area = null;
        next.perimeter = null;
        next.centroid = null;
      } else if (type === 'Orchard / Large Plantation') {
        next.radius = null;
        // Seed default small triangular polygon centered around current point
        const lat = prev.latitude;
        const lng = prev.longitude;
        next.polygon = [
          { lat: parseFloat((lat + 0.0003).toFixed(7)), lng: parseFloat((lng - 0.0003).toFixed(7)) },
          { lat: parseFloat((lat + 0.0003).toFixed(7)), lng: parseFloat((lng + 0.0003).toFixed(7)) },
          { lat: parseFloat((lat - 0.0003).toFixed(7)), lng: parseFloat(lng.toFixed(7)) },
        ];
        const geom = validationEngine.calculatePolygonGeometry(next.polygon);
        next.area = geom.area;
        next.perimeter = geom.perimeter;
        next.centroid = geom.centroid;
      }

      return next as PlantationSite;
    });
  };

  const getTranslatedType = (type: PlantationType) => {
    if (type === 'Single Tree') return t('type_single');
    if (type === 'Small Plantation') return t('type_small');
    return t('type_orchard');
  };

  return (
    <div className="flex flex-col w-full gap-4">
      <SiteRegistryPanel />
      <div className="flex flex-col lg:flex-row gap-6 animate-fadeIn">
      {/* LEFT FORM: Settings and Geo-data */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Plantation Type */}
        <div className="flex flex-col gap-2 text-left">
          <label className="text-sm font-semibold text-neutral-700">{t('site_type')}</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {(['Single Tree', 'Small Plantation', 'Orchard / Large Plantation'] as PlantationType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleTypeChange(type)}
                className={`py-3 px-2 text-xs font-bold rounded-lg border-2 text-center transition-all ${
                  site.plantation_type === type
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-600 bg-white'
                }`}
              >
                {getTranslatedType(type)}
              </button>
            ))}
          </div>
        </div>

        {/* GPS Coordinates */}
        <div className="flex flex-col gap-3 text-left">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-neutral-700">{t('gps_accuracy')}</label>
            <button
              type="button"
              onClick={handleLocateMe}
              disabled={isLoadingGPS || isTrackingGPS}
              className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 font-bold py-1.5 px-3 rounded-full transition-colors cursor-pointer border border-emerald-100"
            >
              <Locate className={`h-3.5 w-3.5 ${isLoadingGPS ? 'animate-spin' : ''}`} />
              {isLoadingGPS ? (language === 'en' ? 'Locating...' : 'চিহ্নিত করা হচ্ছে...') : t('locate_me')}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium text-neutral-500">{t('latitude')}</span>
              <input
                type="number"
                step="0.0000001"
                value={site.latitude || ''}
                disabled={isTrackingGPS}
                onChange={(e) =>
                  updateActiveSite((prev) => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))
                }
                onBlur={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) {
                    updateActiveSite((prev) => ({ ...prev, latitude: parseFloat(val.toFixed(7)) }));
                  }
                }}
                className="w-full text-sm py-2 px-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white disabled:bg-neutral-50 disabled:text-neutral-400"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium text-neutral-500">{t('longitude')}</span>
              <input
                type="number"
                step="0.0000001"
                value={site.longitude || ''}
                disabled={isTrackingGPS}
                onChange={(e) =>
                  updateActiveSite((prev) => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))
                }
                onBlur={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) {
                    updateActiveSite((prev) => ({ ...prev, longitude: parseFloat(val.toFixed(7)) }));
                  }
                }}
                className="w-full text-sm py-2 px-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white disabled:bg-neutral-50 disabled:text-neutral-400"
              />
            </div>
          </div>

          {/* Real-time GPS Tracking Switch */}
          <div className="flex items-center gap-3 bg-emerald-50/40 p-3 rounded-xl border border-emerald-100/60 mt-1">
            <input
              type="checkbox"
              id="realtimeGpsToggle"
              checked={isTrackingGPS}
              onChange={(e) => setIsTrackingGPS(e.target.checked)}
              className="w-4 h-4 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500 cursor-pointer"
            />
            <div className="flex flex-col text-left">
              <label htmlFor="realtimeGpsToggle" className="text-xs font-black text-emerald-900 cursor-pointer flex items-center gap-1.5">
                {t('realtime_gps')}
                {isTrackingGPS && <span className="h-2 w-2 rounded-full bg-emerald-600 animate-ping" />}
              </label>
              <span className="text-[10px] text-neutral-500">
                {t('realtime_gps_desc')}
              </span>
            </div>
          </div>

          {/* Slider for radius (Small Plantation) */}
          {site.plantation_type === 'Small Plantation' && site.radius !== null && (
            <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-600">
                  {language === 'en' ? "Geo-fencing Radius" : "জিও-ফেন্সিং ব্যাসার্ধ"}
                </span>
                <span className="font-mono bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                  {site.radius} {t('meters')}
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={site.radius}
                onChange={(e) =>
                  updateActiveSite((prev) => ({ ...prev, radius: parseInt(e.target.value) || 5 }))
                }
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <span className="text-[10px] text-neutral-400">
                {language === 'en' 
                  ? "Represents estimated tree crown spread buffer for 2 to 20 plants."
                  : "২ থেকে ২০টি চারাগাছের আনুমানিক ক্যানোপি ছড়ানোর বাফার সীমানা নির্দেশ করে।"}
              </span>
            </div>
          )}

          {/* Polygon specs readout */}
          {site.plantation_type === 'Orchard / Large Plantation' && site.area !== null && (
            <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-lg grid grid-cols-2 gap-3 text-xs">
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-500 font-medium">{t('area')}</span>
                <span className="font-bold text-blue-900 font-mono">
                  {site.area < 10000 
                    ? `${site.area} ${t('sq_m')}` 
                    : `${(site.area / 10000).toFixed(2)} ${language === 'en' ? 'Hectares' : 'হেক্টর'}`}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-500 font-medium">{t('perimeter')}</span>
                <span className="font-bold text-blue-900 font-mono">
                  {site.perimeter} {t('meters')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Administrative Boundary Fields */}
        <div className="flex flex-col gap-4 text-left">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-1">
            <span className="text-sm font-semibold text-neutral-700">{t('admin_title')}</span>
            <button
              type="button"
              onClick={() => triggerReverseGeocode(site.latitude, site.longitude)}
              disabled={isGeocoding || !site.latitude || !site.longitude}
              className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 disabled:opacity-50 hover:underline cursor-pointer"
            >
              <Navigation className="h-3 w-3" />
              {isGeocoding ? (language === 'en' ? 'Syncing...' : 'ঠিকানা খোঁজা হচ্ছে...') : (language === 'en' ? 'Geocode Address' : 'স্থানাঙ্ক থেকে ঠিকানা')}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-neutral-600">{t('division')}</span>
              <input
                type="text"
                placeholder={language === 'en' ? "e.g. Dhaka Division" : "যেমন: ঢাকা বিভাগ"}
                value={site.division}
                onChange={(e) => updateActiveSite((prev) => ({ ...prev, division: e.target.value }))}
                className="w-full text-xs py-2 px-3 border border-neutral-300 rounded-lg focus:outline-none bg-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-neutral-600">{t('district')}</span>
              <input
                type="text"
                placeholder={language === 'en' ? "e.g. Savar" : "যেমন: সাভার"}
                value={site.district}
                onChange={(e) => updateActiveSite((prev) => ({ ...prev, district: e.target.value }))}
                className="w-full text-xs py-2 px-3 border border-neutral-300 rounded-lg focus:outline-none bg-white"
              />
            </div>
            <div className="grid col-span-2 grid-cols-4 gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-neutral-600">
                  {language === 'en' ? "Upazila/Municipality" : "উপজেলা/পৌরসভা"}
                </span>
                <input
                  type="text"
                  placeholder={language === 'en' ? "e.g. Savar" : "যেমন: সাভার"}
                  value={site.upazila}
                  onChange={(e) => updateActiveSite((prev) => ({ ...prev, upazila: e.target.value }))}
                  className="w-full text-xs py-1.5 px-2 border border-neutral-300 rounded-lg focus:outline-none bg-white"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-neutral-600">
                  {language === 'en' ? "Union/Municipal Ward" : "ইউনিয়ন/পৌর ওয়ার্ড"}
                </span>
                <input
                  type="text"
                  placeholder={language === 'en' ? "e.g. Ashulia" : "যেমন: আশুলিয়া"}
                  value={site.union}
                  onChange={(e) => updateActiveSite((prev) => ({ ...prev, union: e.target.value }))}
                  className="w-full text-xs py-1.5 px-2 border border-neutral-300 rounded-lg focus:outline-none bg-white"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-neutral-600">
                  {language === 'en' ? "Village" : "গ্রাম"}
                </span>
                <input
                  type="text"
                  placeholder={language === 'en' ? "e.g. Khagan" : "যেমন: খাগান"}
                  value={site.village}
                  onChange={(e) => updateActiveSite((prev) => ({ ...prev, village: e.target.value }))}
                  className="w-full text-xs py-1.5 px-2 border border-neutral-300 rounded-lg focus:outline-none bg-white"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-neutral-600">
                  {language === 'en' ? "Road/Mouza" : "রাস্তা/মৌজা"}
                </span>
                <input
                  type="text"
                  placeholder={language === 'en' ? "e.g. Campus Rd" : "যেমন: ক্যাম্পাস রোড"}
                  value={site.road || ''}
                  onChange={(e) => updateActiveSite((prev) => ({ ...prev, road: e.target.value }))}
                  className="w-full text-xs py-1.5 px-2 border border-neutral-300 rounded-lg focus:outline-none bg-white"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-neutral-600">{t('postcode')}</span>
              <input
                type="text"
                placeholder="1341"
                value={site.postcode}
                onChange={(e) => updateActiveSite((prev) => ({ ...prev, postcode: e.target.value }))}
                className="w-full text-xs py-2 px-3 border border-neutral-300 rounded-lg focus:outline-none bg-white"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-neutral-600">
              {language === 'en' ? "Full Address" : "পূর্ণ ঠিকানা"}
            </span>
            <textarea
              placeholder={language === 'en' ? "Full mailing address or spatial parcel description" : "পূর্ণ ডাক ঠিকানা অথবা জমির বিবরণ"}
              rows={2}
              value={site.address}
              onChange={(e) => updateActiveSite((prev) => ({ ...prev, address: e.target.value }))}
              className="w-full text-xs py-2 px-3 border border-neutral-300 rounded-lg focus:outline-none bg-white resize-none"
            />
          </div>
        </div>

        {/* Environmental Readout Placeholders */}
        <div className="flex flex-col gap-2 text-left">
          <span className="text-sm font-semibold text-neutral-700">
            {language === 'en' ? "AI Environmental Assessor (Read-only)" : "এআই পরিবেশগত মূল্যায়নকারী (শুধুমাত্র দেখার জন্য)"}
          </span>
          <div className="grid grid-cols-2 gap-3 bg-neutral-50 border border-neutral-200/80 p-3 rounded-xl shadow-inner">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                <Leaf className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-500 font-medium">NDVI Index</span>
                <span className="font-mono text-sm font-bold text-neutral-800">
                  {site.ndvi > 0 ? site.ndvi.toFixed(2) : '--'}
                </span>
                <span className="text-[9px] text-neutral-400 font-medium">Sentinel-2 canopy chlorophyll</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 border-l border-neutral-200 pl-3">
              <div className="p-1.5 rounded-lg bg-teal-100 text-teal-800">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-500 font-medium">Carbon Est.</span>
                <span className="font-mono text-sm font-bold text-teal-700">
                  {site.carbon_estimate > 0 ? `${site.carbon_estimate.toFixed(1)} t/Ha` : '--'}
                </span>
                <span className="text-[9px] text-neutral-400 font-medium">IPCC Tier-1 biomass</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: OpenStreetMap Container */}
      <div className="flex-1 min-h-[350px] lg:min-h-[500px] flex flex-col text-left">
        <label className="text-sm font-semibold text-neutral-700 mb-2">
          {language === 'en' ? "Interactive OpenStreetMap" : "ইন্টারেক্টিভ ওপেন-স্ট্রিট-ম্যাপ"}
        </label>
        <div className="flex-1 relative min-h-[350px]">
          <MapComponent
            latitude={site.latitude}
            longitude={site.longitude}
            radius={site.radius}
            polygon={site.polygon}
            plantationType={site.plantation_type}
            onChange={handleMapChange}
            language={language}
          />
        </div>
        <span className="text-[10px] text-neutral-500 mt-1.5 text-center leading-relaxed block">
          {language === 'en'
            ? `Drag the seedling pin to calibrate site center. ${site.plantation_type === 'Orchard / Large Plantation' ? 'Click on the map grid to trace the perimeter ring vertices.' : ''}`
            : `চারাগাছ চিহ্নিত পিনটি টেনে নিয়ে সাইটের কেন্দ্র নির্বাচন করুন। ${site.plantation_type === 'Orchard / Large Plantation' ? 'মানচিত্রে ক্লিক করে বাগান সীমানার কোণগুলো আঁকুন।' : ''}`}
        </span>
      </div>
    </div>
    </div>
  );
}
