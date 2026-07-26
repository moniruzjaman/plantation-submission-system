/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { validationEngine } from '../services/validation';
import { 
  ShieldCheck, ShieldAlert, CheckCircle, AlertTriangle, 
  User, Calendar, Landmark, MapPin, TreePine, 
  Activity, ArrowUpRight, Cloud, Wifi, WifiOff 
} from 'lucide-react';

export default function StepSubmissionSummary() {
  const { activeSubmission, online, userProfile, language, t } = useApp();

  if (!activeSubmission) return null;

  // Let's analyze each site inside this active submission
  const siteResults = activeSubmission.sites.map((site) => {
    const analysis = validationEngine.validateSite(site);
    return {
      site,
      analysis,
    };
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(language === 'en' ? 'en-US' : 'bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTranslatedRisk = (risk: string) => {
    if (risk === 'High Risk') return language === 'en' ? 'High Risk' : 'উচ্চ ঝুঁকি';
    if (risk === 'Medium Risk') return language === 'en' ? 'মাঝারি ঝুঁকি' : 'মাঝারি ঝুঁকি';
    return language === 'en' ? 'Low Risk' : 'স্বল্প ঝুঁকি';
  };

  const getTranslatedType = (type: string) => {
    if (type === 'Single Tree') return t('type_single');
    if (type === 'Small Plantation') return t('type_small');
    return t('type_orchard');
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn text-left">
      {/* 1. OFFICER METADATA BLOCK */}
      <div className="border border-neutral-200 bg-white p-5 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold text-neutral-400 border-b border-neutral-100 pb-1.5 uppercase font-mono">
            {language === 'en' ? "Submission Submitter Dossier" : "আবেদন জমাদানকারী প্রোফাইল"}
          </span>
          <div className="flex flex-col gap-2.5 text-xs text-neutral-600">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-neutral-400 shrink-0" />
              <span>
                <strong>{language === 'en' ? "Officer Name:" : "কর্মকর্তার নাম:"}</strong> {userProfile.name} ({userProfile.id})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Landmark className="h-4 w-4 text-neutral-400 shrink-0" />
              <span>
                <strong>{language === 'en' ? "DAE Office:" : "ডিএই কার্যালয়:"}</strong> {userProfile.office}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold text-neutral-400 border-b border-neutral-100 pb-1.5 uppercase font-mono">
            {language === 'en' ? "Filing Parameters" : "ফাইলিং প্যারামিটারসমূহ"}
          </span>
          <div className="flex flex-col gap-2.5 text-xs text-neutral-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-neutral-400 shrink-0" />
              <span>
                <strong>{language === 'en' ? "Record Date:" : "রেকর্ডের তারিখ:"}</strong> {formatDate(activeSubmission.submitted_at)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {online ? (
                <Wifi className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <WifiOff className="h-4 w-4 text-amber-600 shrink-0" />
              )}
              <span>
                <strong>{language === 'en' ? "Target Status:" : "পরবর্তী অবস্থা:"}</strong>{' '}
                <span className={`font-bold ${online ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {online 
                    ? (language === 'en' ? 'Validation Pending (Auto-Sync)' : 'যাচাই পেন্ডিং (স্বয়ংক্রিয় সিঙ্ক)') 
                    : (language === 'en' ? 'Sync Pending (Offline Cache)' : 'সিঙ্ক পেন্ডিং (অফলাইন ক্যাশে)')}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FOR EACH SITE: GEO-FENCING AUDIT SCORE AND RISKS */}
      {siteResults.map(({ site, analysis }, idx) => {
        // Score colors
        let scoreBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
        let riskColor = 'text-emerald-700 bg-emerald-100';
        if (analysis.risk_level === 'High Risk') {
          scoreBg = 'bg-red-50 text-red-800 border-red-200';
          riskColor = 'text-red-700 bg-red-100';
        } else if (analysis.risk_level === 'Medium Risk') {
          scoreBg = 'bg-amber-50 text-amber-800 border-amber-200';
          riskColor = 'text-amber-700 bg-amber-100';
        }

        // Translating dynamic recommendation
        let translatedRec = analysis.recommendation;
        if (language === 'bn') {
          if (analysis.score >= 85) {
            translatedRec = "দ্রুত অনুমোদন এবং আর্থিক সহায়তার পেমেন্ট ছাড়ের জন্য সুপারিশ করা হলো।";
          } else if (analysis.score >= 60) {
            translatedRec = "ম্যানুয়াল পর্যালোচনা করার সুপারিশ করা হলো। এসএএও পরিদর্শককে স্থানীয় দলিলের সাথে সীমানা মিলিয়ে নেওয়া উচিত।";
          } else {
            translatedRec = "অবিলম্বে পরিদর্শনের জন্য চিহ্নিত করা হলো। সীমানা ওভারল্যাপ বা নকল ডেটার হওয়ার সম্ভাবনা রয়েছে।";
          }
        }

        return (
          <div
            key={site.site_id}
            className="border border-neutral-200 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col"
          >
            {/* Site Header */}
            <div className="bg-neutral-50 px-5 py-3 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-neutral-500" />
                <span className="text-xs font-bold text-neutral-800">
                  {language === 'en' ? 'SITE' : 'রোপণ সাইট'} #{idx + 1}: {getTranslatedType(site.plantation_type)}
                </span>
              </div>
              <span className="text-[10px] bg-neutral-200 text-neutral-700 font-bold px-2 py-0.5 rounded-full font-mono">
                ID: {site.site_id}
              </span>
            </div>

            <div className="p-5 flex flex-col lg:flex-row gap-6">
              {/* Score dossier card */}
              <div className={`flex-1 p-5 rounded-xl border flex flex-col gap-4 text-center ${scoreBg}`}>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 font-mono tracking-wider">
                    {language === 'en' ? "Geofencing Confidence Score" : "জিও-ফেন্সিং নির্ভরযোগ্যতা স্কোর"}
                  </span>
                  <span className="text-4xl font-extrabold font-mono mt-1">
                    {analysis.score} <span className="text-sm font-semibold opacity-70">/ 100</span>
                  </span>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${riskColor}`}>
                    {getTranslatedRisk(analysis.risk_level)}
                  </span>
                </div>

                <div className="text-xs text-neutral-700 leading-relaxed max-w-sm mx-auto">
                  <strong>{language === 'en' ? "Recommendation:" : "সুপারিশ:"}</strong> {translatedRec}
                </div>

                {/* SAAO Automatic assigned validator */}
                <div className="bg-white/80 border border-neutral-100 p-3 rounded-lg flex flex-col text-xs text-left gap-1.5 mt-auto">
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wide">
                    {language === 'en' ? "Designated Regional SAAO" : "আঞ্চলিক মনোনীত এসএএও পরিদর্শক"}
                  </span>
                  <div>
                    <div className="font-bold text-neutral-800">{analysis.assigned_validator.name}</div>
                    <div className="text-[10px] text-neutral-500">
                      {language === 'en' ? "Sub-Assistant Agriculture Officer" : "উপ-সহকারী কৃষি কর্মকর্তা (SAAO)"}
                    </div>
                    <div className="text-[9px] text-neutral-400 italic mt-0.5">
                      {analysis.assigned_validator.office}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-checks breakdown list */}
              <div className="flex-1 flex flex-col gap-4">
                <span className="text-xs font-bold text-neutral-800 border-b border-neutral-100 pb-1.5">
                  {language === 'en' ? "Automated Geo-Spatial Audits" : "স্বয়ংক্রিয় জিও-স্পেশাল অডিট"}
                </span>

                <div className="flex flex-col gap-2.5 text-xs">
                  {/* GPS accuracy check */}
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">{language === 'en' ? "GPS Position Accuracy" : "জিপিএস অবস্থান সঠিকতা"}</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                        analysis.gps_accuracy_check === 'Pass'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {analysis.gps_accuracy_check === 'Pass' 
                        ? (language === 'en' ? 'Pass (High Lock)' : 'উত্তীর্ণ (উচ্চ সিগন্যাল)') 
                        : (language === 'en' ? 'Warning (Low Lock)' : 'সতর্কতা (দুর্বল সিগন্যাল)')}
                    </span>
                  </div>

                  {/* Boundary match */}
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">{language === 'en' ? "Administrative Boundary Match" : "প্রশাসনিক সীমানা পরীক্ষা"}</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                        analysis.boundary_match === 'Pass'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {analysis.boundary_match === 'Pass' 
                        ? (language === 'en' ? 'Valid (Inside Bangladesh)' : 'সঠিক (বাংলাদেশ অভ্যন্তরে)') 
                        : (language === 'en' ? 'Out-of-Bounds' : 'সীমানার বাইরে')}
                    </span>
                  </div>

                  {/* Duplicate checks */}
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">{language === 'en' ? "Overlapping Duplicate Detection" : "ওভারল্যাপ/নকল এন্ট্রি সনাক্তকরণ"}</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                        analysis.duplicate_check === 'Pass'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {analysis.duplicate_check === 'Pass' 
                        ? (language === 'en' ? 'Clear (No Duplicate)' : 'সঠিক (কোন নকল নেই)') 
                        : (language === 'en' ? 'Risk Flag (Overlap)' : 'সতর্কতা (ওভারল্যাপ ঝুঁকি)')}
                    </span>
                  </div>

                  {/* Nearby count */}
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">{language === 'en' ? "Nearby Plantation Count (50m)" : "নিকটবর্তী রোপণ সাইট সংখ্যা (৫০মি.)"}</span>
                    <span className="font-mono bg-neutral-100 text-neutral-800 font-bold px-1.5 py-0.5 rounded text-[10px]">
                      {analysis.nearby_count} {language === 'en' ? 'sites' : 'টি সাইট'}
                    </span>
                  </div>

                  {/* Min distance */}
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">{language === 'en' ? "Closest Neighbor Boundary Dist." : "নিকটতম প্রতিবেশী সাইটের দূরত্ব"}</span>
                    <span className="font-mono bg-neutral-100 text-neutral-800 font-bold px-1.5 py-0.5 rounded text-[10px]">
                      {analysis.min_distance_m} {t('meters')}
                    </span>
                  </div>

                  {/* NDVI */}
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">{language === 'en' ? "NDVI Green-spectrum Integrity" : "NDVI ক্যানোপি সবুজতা যাচাই"}</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                        analysis.ndvi_available
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {analysis.ndvi_available 
                        ? (language === 'en' ? 'Verified' : 'যাচাই সম্পন্ন') 
                        : (language === 'en' ? 'Low Vegetation Signal' : 'দুর্বল সবুজতা সিগন্যাল')}
                    </span>
                  </div>

                  {/* Carbon */}
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">{language === 'en' ? "Biomass Carbon Stock Estimate" : "কার্বন মজুদ প্রাক্কলন"}</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                        analysis.carbon_available
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {analysis.carbon_available 
                        ? (language === 'en' ? 'Verified' : 'যাচাই সম্পন্ন') 
                        : (language === 'en' ? 'Unavailable' : 'অনুপস্থিত')}
                    </span>
                  </div>

                  {/* Administrative Boundary Display */}
                  <div className="mt-3 pt-3 border-t border-neutral-100 flex flex-col gap-1 text-[11px] text-left">
                    <span className="font-bold text-neutral-400 uppercase font-mono tracking-wide text-[9px]">
                      {language === 'en' ? "Captured Geolocation Boundaries" : "সংগৃহীত ভৌগোলিক সীমানা এলাকা"}
                    </span>
                    <div className="text-neutral-700 leading-normal bg-neutral-50 p-2 rounded border border-neutral-150 font-medium">
                      {site.road ? `${site.road}, ` : ''}{site.village}, {site.union}, {site.upazila}, {site.district}, {site.division}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Site Inventory Sub-cards checklist preview */}
            <div className="border-t border-neutral-100 p-5 bg-neutral-50/50 flex flex-col gap-3 text-left">
              <span className="text-xs font-bold text-neutral-800 flex items-center gap-1">
                <TreePine className="h-4 w-4 text-emerald-600" />
                {language === 'en' ? "Declared Site Stock Checklist" : "ঘোষিত চারাগাছ স্টক চেকলিস্ট"} ({site.plants.length} {language === 'en' ? 'varieties' : 'জাতের'})
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {site.plants.map((plant) => (
                  <div
                    key={plant.plant_id}
                    className="p-3 bg-white border border-neutral-200 rounded-lg flex items-center gap-3 shadow-sm animate-scaleUp"
                  >
                    {/* Photo thumbnail */}
                    {plant.photos && plant.photos.length > 0 ? (
                      <img
                        src={plant.photos[0]}
                        alt="Sapling"
                        className="h-10 w-10 rounded-md object-cover border border-neutral-200"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-md bg-neutral-100 flex items-center justify-center text-neutral-400">
                        <TreePine className="h-5 w-5" />
                      </div>
                    )}

                    <div className="flex flex-col text-xs text-left">
                      <span className="font-bold text-neutral-800">{plant.species || (language === 'en' ? 'Unknown Species' : 'অজানা প্রজাতি')}</span>
                      <span className="text-[10px] text-neutral-400">
                        {language === 'en' ? 'Qty:' : 'পরিমাণ:'} <strong>{plant.quantity}</strong> | {language === 'en' ? 'Age:' : 'বয়স:'} {plant.seedling_age} | {language === 'en' ? 'Variety:' : 'জাত:'} {plant.variety}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
