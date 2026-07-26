/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import MapComponent from './MapComponent';
import { 
  ArrowLeft, MapPin, TreePine, ShieldCheck, ShieldAlert, 
  Calendar, Landmark, User, Phone, Leaf, Sparkles, Navigation 
} from 'lucide-react';

export default function SubmissionDetails() {
  const { submissions, selectedSubmissionId, setViewMode, setSelectedSubmissionId, language, t } = useApp();

  const sub = submissions.find((s) => s.submission_id === selectedSubmissionId);

  if (!sub) {
    return (
      <div className="p-6 border border-neutral-200 rounded-xl bg-white text-center text-neutral-500 flex flex-col gap-3 items-center justify-center animate-fadeIn text-left">
        <span>
          {language === 'en' 
            ? "The requested submission dossier does not exist or has been purged." 
            : "অনুরোধকৃত আবেদন নথিটি খুঁজে পাওয়া যায়নি বা এটি মুছে ফেলা হয়েছে।"}
        </span>
        <button
          type="button"
          onClick={() => setViewMode('dashboard')}
          className="text-xs font-bold py-1.5 px-3 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors cursor-pointer"
        >
          {language === 'en' ? "Return to Directory" : "মূল ড্যাশবোর্ডে ফিরে যান"}
        </button>
      </div>
    );
  }

  const handleBack = () => {
    setSelectedSubmissionId(null);
    setViewMode('dashboard');
  };

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
    if (risk === 'Medium Risk') return language === 'en' ? 'Medium Risk' : 'মাঝারি ঝুঁকি';
    return language === 'en' ? 'Low Risk' : 'স্বল্প ঝুঁকি';
  };

  const getTranslatedType = (type: string) => {
    if (type === 'Single Tree') return t('type_single');
    if (type === 'Small Plantation') return t('type_small');
    return t('type_orchard');
  };

  return (
    <div className="flex flex-col gap-6 text-left animate-fadeIn">
      {/* Back button and title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="p-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
          title={language === 'en' ? "Back to Directory" : "তালিকায় ফিরে যান"}
        >
          <ArrowLeft className="h-4.5 w-4.5 text-neutral-600" />
        </button>
        <div className="flex flex-col text-left">
          <span className="text-xs font-bold text-neutral-400 font-mono">
            {language === 'en' ? "SUBMISSION DOSSIER REPORT" : "আবেদন ডসিয়ার প্রতিবেদন"}
          </span>
          <h2 className="text-lg font-bold text-neutral-900">{sub.submission_id}</h2>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Metadata & Personnel details */}
        <div className="flex flex-col gap-6">
          {/* Metadata */}
          <div className="border border-neutral-200 bg-white p-5 rounded-xl shadow-sm flex flex-col gap-4 text-left">
            <span className="text-xs font-bold text-neutral-400 border-b border-neutral-100 pb-1.5 uppercase font-mono">
              {language === 'en' ? "Filing Metadata" : "ফাইলিং মেটাডেটা"}
            </span>
            <div className="flex flex-col gap-3 text-xs text-neutral-600">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-neutral-400 shrink-0" />
                <span>
                  <strong>{language === 'en' ? "Officer:" : "কর্মকর্তা:"}</strong> {sub.submitted_by_name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-neutral-400 shrink-0" />
                <span>
                  <strong>{language === 'en' ? "DAE Office:" : "ডিএই কার্যালয়:"}</strong> {sub.office}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-neutral-400 shrink-0" />
                <span>
                  <strong>{language === 'en' ? "Submitted At:" : "জমার সময়:"}</strong> {formatDate(sub.submitted_at)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-neutral-400 shrink-0" />
                <span>
                  <strong>{language === 'en' ? "Database Status:" : "ডেটাবেজ স্ট্যাটাস:"}</strong>{' '}
                  <span className="font-extrabold uppercase font-mono">
                    {sub.status === 'Approved' ? (language === 'en' ? 'APPROVED' : 'অনুমোদিত') : sub.status === 'Rejected' ? (language === 'en' ? 'REJECTED' : 'প্রত্যাখ্যাত') : (language === 'en' ? 'PENDING' : 'পর্যালোচনায়')}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Personnel profiles */}
          {sub.sites.map((site, siteIdx) => (
            <div key={site.site_id} className="border border-neutral-200 bg-white p-5 rounded-xl shadow-sm flex flex-col gap-4 text-left">
              <span className="text-xs font-bold text-neutral-400 border-b border-neutral-100 pb-1.5 uppercase font-mono">
                {language === 'en' ? `Personnel Contact (Site #${siteIdx + 1})` : `যোগাযোগের তথ্য (সাইট #${siteIdx + 1})`}
              </span>
              <div className="flex flex-col gap-4 text-xs text-left">
                {/* Planter */}
                <div className="flex flex-col gap-1.5 border-b border-neutral-100 pb-2 text-left">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase font-mono">
                    {language === 'en' ? "Planter (Landowner)" : "রোপনকারী (জমির মালিক)"}
                  </span>
                  <div className="flex items-center gap-2 text-neutral-700">
                    <User className="h-3.5 w-3.5 text-neutral-400" />
                    <strong>{language === 'en' ? "Name:" : "নাম:"}</strong> {site.personnel?.planter_name || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2 text-neutral-700">
                    <Phone className="h-3.5 w-3.5 text-neutral-400" />
                    <strong>{language === 'en' ? "Mobile:" : "মোবাইল:"}</strong> {site.personnel?.planter_mobile || 'N/A'}
                  </div>
                </div>

                {/* Caretaker */}
                <div className="flex flex-col gap-1.5 text-left">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase font-mono">
                    {language === 'en' ? "Caretaker" : "তত্ত্বাবধায়ক"}
                  </span>
                  <div className="flex items-center gap-2 text-neutral-700">
                    <User className="h-3.5 w-3.5 text-neutral-400" />
                    <strong>{language === 'en' ? "Name:" : "নাম:"}</strong> {site.personnel?.caretaker_name || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2 text-neutral-700">
                    <Phone className="h-3.5 w-3.5 text-neutral-400" />
                    <strong>{language === 'en' ? "Mobile:" : "মোবাইল:"}</strong> {site.personnel?.caretaker_mobile || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT COLUMN (2x span): Satellite results, Maps, Plants and Checklist */}
        <div className="lg:col-span-2 flex flex-col gap-6 text-left">
          {sub.sites.map((site, idx) => {
            const analysis = site.geofence_details;
            const totalPlants = site.plants.reduce((sum, p) => sum + p.quantity, 0);

            // Audit Score stylings
            let scoreBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
            if (site.geofence_score < 60) scoreBg = 'bg-red-50 text-red-800 border-red-200';
            else if (site.geofence_score < 85) scoreBg = 'bg-amber-50 text-amber-800 border-amber-200';

            return (
              <div key={site.site_id} className="border border-neutral-200 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col text-left">
                <div className="bg-neutral-50 px-5 py-3 border-b border-neutral-200 flex items-center justify-between text-left">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-800">
                    <MapPin className="h-4 w-4 text-neutral-500" />
                    {language === 'en' ? 'SITE' : 'রোপণ সাইট'} #{idx + 1}: {getTranslatedType(site.plantation_type)} ({totalPlants} {language === 'en' ? 'plants' : 'টি গাছ'})
                  </div>
                  <span className="text-[9px] bg-neutral-200 text-neutral-700 font-bold px-2 py-0.5 rounded-full font-mono">
                    ID: {site.site_id}
                  </span>
                </div>

                <div className="p-5 flex flex-col gap-5 text-left">
                  {/* Confidence and Geofencing scoring */}
                  <div className="flex flex-col md:flex-row gap-5 text-left">
                    <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center w-full md:w-44 shrink-0 ${scoreBg}`}>
                      <span className="text-[9px] uppercase font-bold text-neutral-400 font-mono tracking-wider">
                        {language === 'en' ? "Geofencing Index" : "জিওফেন্সিং সূচক"}
                      </span>
                      <span className="text-3xl font-extrabold font-mono mt-1">
                        {site.geofence_score} <span className="text-xs font-semibold opacity-70">/100</span>
                      </span>
                      <span className="text-[9px] bg-white/80 font-bold rounded-full px-2.5 py-0.5 mt-2 uppercase text-neutral-700">
                        {getTranslatedRisk(analysis?.risk_level || 'Low Risk')}
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col gap-2.5 text-xs text-left">
                      <span className="font-bold text-neutral-700 uppercase tracking-wide text-[10px] border-b border-neutral-100 pb-1">
                        {language === 'en' ? "DAE Validation Audits" : "ডিএই যাচাইকরণ অডিট"}
                      </span>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-neutral-600 text-left">
                        <div>
                          {language === 'en' ? "GPS Lock:" : "জিপিএস লক:"} <strong className="text-neutral-800">
                            {analysis?.gps_accuracy_check === 'Pass' 
                              ? (language === 'en' ? 'Highly Accurate' : 'উচ্চ নির্ভুলতা') 
                              : (language === 'en' ? 'Low Lock (Warning)' : 'দুর্বল সিগন্যাল')}
                          </strong>
                        </div>
                        <div>
                          {language === 'en' ? "Boundary:" : "সীমানা:"} <strong className="text-neutral-800">
                            {analysis?.boundary_match === 'Pass' 
                              ? (language === 'en' ? 'Inside Borders' : 'সীমানার ভেতরে') 
                              : (language === 'en' ? 'Mismatch' : 'মিল পাওয়া যায়নি')}
                          </strong>
                        </div>
                        <div>
                          {language === 'en' ? "Duplicates:" : "নকল এন্ট্রি:"} <strong className="text-neutral-800">
                            {analysis?.duplicate_check === 'Pass' 
                              ? (language === 'en' ? 'Clean' : 'কোন নকল নেই') 
                              : (language === 'en' ? 'Overlap suspected' : 'ওভারল্যাপ আশঙ্কা')}
                          </strong>
                        </div>
                        <div>
                          {language === 'en' ? "NDVI Rating:" : "NDVI রেটিং:"} <strong className="text-neutral-800">{site.ndvi.toFixed(2)}</strong>
                        </div>
                        <div className="col-span-2">
                          {language === 'en' ? "Sequestration Potential:" : "কার্বন শোষণ সম্ভাবনা:"} <strong className="text-teal-700">{site.carbon_estimate.toFixed(1)} t/Ha Carbon Biomass</strong>
                        </div>
                      </div>

                      <div className="mt-2 text-[10px] bg-neutral-50 border border-neutral-150 p-2.5 rounded text-neutral-500 italic text-left">
                        <strong>{language === 'en' ? "Assigned Validator:" : "নির্ধারিত পরিদর্শক কর্মকর্তা:"}</strong> {analysis?.assigned_validator?.name} | {analysis?.assigned_validator?.office}
                      </div>
                    </div>
                  </div>

                  {/* Territory coordinates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-neutral-50/50 p-3.5 rounded-lg border border-neutral-100 text-left">
                    <div className="flex flex-col gap-0.5 text-left">
                      <span className="text-[10px] text-neutral-400 font-bold uppercase font-mono">
                        {language === 'en' ? "Coordinate Center" : "কেন্দ্রীয় স্থানাঙ্ক"}
                      </span>
                      <span className="font-mono font-bold text-neutral-700">
                        {site.latitude.toFixed(7)}, {site.longitude.toFixed(7)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5 text-left">
                      <span className="text-[10px] text-neutral-400 font-bold uppercase font-mono">
                        {language === 'en' ? "Administrative Parcel" : "প্রশাসনিক এলাকা"}
                      </span>
                      <span className="font-bold text-neutral-700">
                        {site.road ? `${site.road}, ` : ''}{site.village}, {site.union}, {site.upazila}, {site.district}, {site.division}
                      </span>
                    </div>
                  </div>

                  {/* Satellite inspect map */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <span className="text-xs font-bold text-neutral-700 uppercase tracking-wide">
                      {language === 'en' ? "Interactive Geographic Boundaries" : "ইন্টারেক্টিভ ভৌগোলিক সীমানা"}
                    </span>
                    <div className="h-64 relative rounded-xl border border-neutral-200 overflow-hidden bg-neutral-50 shadow-sm">
                      <MapComponent
                        latitude={site.latitude}
                        longitude={site.longitude}
                        radius={site.radius}
                        polygon={site.polygon}
                        plantationType={site.plantation_type}
                        onChange={() => {}} // Read only
                      />
                    </div>
                  </div>

                  {/* Plant Card list and verification photos */}
                  <div className="flex flex-col gap-2.5 mt-2 text-left">
                    <span className="text-xs font-bold text-neutral-700 uppercase tracking-wide border-b border-neutral-100 pb-1 flex items-center gap-1.5">
                      <TreePine className="h-4.5 w-4.5 text-emerald-600" />
                      {language === 'en' ? "Audited Plants Inventory & Verification Photo Ledger" : "অডিটকৃত চারাগাছ স্টক এবং ছবি সংরক্ষণাগার"}
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                      {site.plants.map((plant) => (
                        <div
                          key={plant.plant_id}
                          className="p-3 border border-neutral-200 rounded-xl flex flex-col gap-2 text-xs text-left bg-white"
                        >
                          <div className="flex items-center justify-between border-b border-neutral-100 pb-1.5">
                            <span className="font-bold text-neutral-800">{plant.species || (language === 'en' ? 'Forestry' : 'বনজ')}</span>
                            <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold text-[8px]">
                              QTY: {plant.quantity}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {language === 'en' ? 'Variety:' : 'জাত:'} {plant.variety || (language === 'en' ? 'Local' : 'দেশী')} | {language === 'en' ? 'Age:' : 'বয়স:'} {plant.seedling_age} | {language === 'en' ? 'Date:' : 'তারিখ:'} {plant.plantation_date}
                          </div>

                          {/* Images preview */}
                          <div className="flex gap-2 mt-1">
                            {plant.photos && plant.photos.map((src, pIdx) => (
                              <div key={pIdx} className="h-14 w-14 rounded border border-neutral-300 overflow-hidden bg-white shadow-sm flex items-center justify-center">
                                <img src={src} alt="Plant Sapling Audit" className="h-full w-full object-cover" />
                              </div>
                            ))}
                            {(!plant.photos || plant.photos.length === 0) && (
                              <div className="text-[10px] text-neutral-400 italic">
                                {language === 'en' ? "No photos uploaded." : "কোন ছবি আপলোড করা হয়নি।"}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
