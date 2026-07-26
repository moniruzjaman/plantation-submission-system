/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Submission, SubmissionStatus, PlantationSite } from '../types';
import MapComponent from './MapComponent';
import DashboardAnalytics from './DashboardAnalytics';
import { 
  ShieldCheck, ShieldAlert, CheckCircle, XCircle, Eye, 
  MapPin, User, Calendar, TreePine, Leaf, Sparkles, Navigation 
} from 'lucide-react';

export default function ValidatorDashboard() {
  const { submissions, runValidationAction, language, t } = useApp();
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  
  // Custom interactive confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    status: 'Approved' | 'Rejected';
    message: string;
  } | null>(null);

  // Custom visual toast notification state
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // Filter out submissions pending validation
  const pendingSubmissions = submissions.filter((s) => s.status === 'Validation Pending');
  const approvedSubmissions = submissions.filter((s) => s.status === 'Approved');
  const rejectedSubmissions = submissions.filter((s) => s.status === 'Rejected');

  // Auto select first pending if none selected
  useEffect(() => {
    if (pendingSubmissions.length > 0 && !selectedSubId) {
      setSelectedSubId(pendingSubmissions[0].submission_id);
    }
  }, [pendingSubmissions, selectedSubId]);

  const selectedSub = submissions.find((s) => s.submission_id === selectedSubId);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(language === 'en' ? 'en-US' : 'bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleAction = (status: 'Approved' | 'Rejected') => {
    if (!selectedSubId) return;
    let confirmMsg = '';
    if (status === 'Approved') {
      confirmMsg = language === 'en' 
        ? 'Are you sure you want to approve this plantation submission and sign off on regional forestry subsidies?' 
        : 'আপনি কি নিশ্চিত যে আপনি এই বনায়ন আবেদনটি অনুমোদন করতে চান এবং আঞ্চলিক বনায়ন ভর্তুকি ছাড়ের সিদ্ধান্ত গ্রহণে সম্মত?';
    } else {
      confirmMsg = language === 'en'
        ? 'Are you sure you want to reject this submission? It will be flagged and returned to field agents for re-survey.'
        : 'আপনি কি নিশ্চিত যে আপনি এই আবেদনটি প্রত্যাখ্যান করতে চান? এটি পুনরায় জরিপের জন্য মাঠপর্যায়ের কর্মকর্তার নিকট ফেরত পাঠানো হবে।';
    }
    
    setConfirmModal({
      status,
      message: confirmMsg,
    });
  };

  const executeConfirmedAction = async () => {
    if (!selectedSubId || !confirmModal) return;
    const { status } = confirmModal;
    
    await runValidationAction(selectedSubId, status);
    setConfirmModal(null);
    setSelectedSubId(null);
    
    let successMsg = '';
    if (status === 'Approved') {
      successMsg = language === 'en' 
        ? 'Plantation record was successfully recorded as: APPROVED' 
        : 'বনায়ন রেকর্ডটি সফলভাবে অনুমোদন করা হয়েছে।';
    } else {
      successMsg = language === 'en' 
        ? 'Plantation record was successfully recorded as: REJECTED' 
        : 'বনায়ন রেকর্ডটি প্রত্যাখ্যান বা ফেরত পাঠানো হয়েছে।';
    }

    setToast({
      message: successMsg,
      type: status === 'Approved' ? 'success' : 'error',
    });

    // Automatically hide toast after 4 seconds
    setTimeout(() => {
      setToast(null);
    }, 4000);
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
    <div className="flex flex-col gap-6 animate-fadeIn text-left relative">
      
      {/* Toast Notification Banner */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2.5 animate-slideUp text-left max-w-sm ${
          toast.type === 'success' 
            ? 'bg-emerald-900 border-emerald-800 text-emerald-100' 
            : 'bg-rose-950 border-rose-900 text-rose-100'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0" /> : <XCircle className="h-4.5 w-4.5 text-rose-400 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Confirmation Modal Backdrop */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 shadow-xl p-6 flex flex-col gap-5 animate-scaleUp text-left">
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border inline-block ${
                confirmModal.status === 'Approved' 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                  : 'bg-rose-50 text-rose-800 border-rose-100'
              }`}>
                {language === 'en' ? "Confirm Audit Sign-Off" : "অডিট স্বাক্ষর নিশ্চিতকরণ"}
              </span>
              <h4 className="text-sm font-black text-slate-800 mt-2.5 font-sans leading-snug">
                {confirmModal.status === 'Approved' 
                  ? (language === 'en' ? 'Approve Forestry Subsidy Ledger' : 'বনায়ন অনুদান বা লেজার অনুমোদন করুন') 
                  : (language === 'en' ? 'Flag Submission for Field Re-survey' : 'পুনরায় জরিপের জন্য আবেদনটি ফেরত পাঠান')}
              </h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {confirmModal.message}
              </p>
            </div>

            <div className="flex items-center gap-2.5 justify-end mt-1">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="py-2 px-4 border border-slate-200 bg-white text-slate-600 font-bold rounded-lg text-xs hover:bg-slate-50 cursor-pointer transition-colors"
              >
                {language === 'en' ? 'Cancel' : 'বাতিল'}
              </button>
              <button
                type="button"
                onClick={executeConfirmedAction}
                className={`py-2 px-4 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors ${
                  confirmModal.status === 'Approved' 
                    ? 'bg-emerald-700 hover:bg-emerald-600' 
                    : 'bg-rose-700 hover:bg-rose-600'
                }`}
              >
                {language === 'en' ? 'Confirm Decision' : 'সিদ্ধান্ত নিশ্চিত করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">
            {language === 'en' ? "Awaiting SAAO Audit" : "এসএএও অডিট অপেক্ষমান"}
          </span>
          <div className="text-2xl font-black text-blue-600 font-mono mt-0.5">{pendingSubmissions.length}</div>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">
            {language === 'en' ? "Approved Plantation Logs" : "অনুমোদিত বনায়ন রেকর্ডসমূহ"}
          </span>
          <div className="text-2xl font-black text-emerald-600 font-mono mt-0.5">{approvedSubmissions.length}</div>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">
            {language === 'en' ? "Rejected / Flagged" : "প্রত্যাখ্যাত বা সমস্যাযুক্ত"}
          </span>
          <div className="text-2xl font-black text-rose-600 font-mono mt-0.5">{rejectedSubmissions.length}</div>
        </div>
      </div>

      {/* DASHBOARD ANALYTICS PORTLET */}
      <DashboardAnalytics />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT COLUMN: Queue selector */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-3.5">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
            {language === 'en' ? "Verification Queue" : "যাচাইকরণ অপেক্ষমাণ তালিকা"} ({pendingSubmissions.length})
          </h3>

          {pendingSubmissions.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl bg-white animate-fadeIn">
              <span className="text-xs font-bold text-slate-400">
                {language === 'en' ? "Queue is currently clear." : "অপেক্ষমাণ তালিকাটি বর্তমানে খালি রয়েছে।"}
              </span>
              <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                {language === 'en' 
                  ? "Awaiting field submissions from remote extension teams." 
                  : "মাঠপর্যায়ের কৃষি সম্প্রসারণ দল হতে নতুন আবেদনের জন্য অপেক্ষা করা হচ্ছে।"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[480px]">
              {pendingSubmissions.map((sub) => {
                const site = sub.sites[0];
                const active = sub.submission_id === selectedSubId;
                const totalPlants = sub.sites.reduce(
                  (sum, s) => sum + s.plants.reduce((pSum, p) => pSum + p.quantity, 0),
                  0
                );

                return (
                  <button
                    key={sub.submission_id}
                    type="button"
                    onClick={() => setSelectedSubId(sub.submission_id)}
                    className={`p-3.5 border text-left rounded-xl flex flex-col gap-1.5 transition-all cursor-pointer ${
                      active
                        ? 'border-emerald-600 bg-emerald-50/20 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold font-mono">
                      <span className={active ? 'text-emerald-950 font-black' : 'text-slate-800'}>
                        ID: {sub.submission_id.slice(0, 10)}...
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black ${
                        site.geofence_score >= 85 ? 'bg-emerald-100 text-emerald-800' : site.geofence_score >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        SCORE: {site.geofence_score}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-500 leading-relaxed">
                      <div>
                        <strong>{language === 'en' ? "Loc:" : "ঠিকানা:"}</strong> {site.upazila || 'N/A'}, {site.district || 'N/A'}
                      </div>
                      <div className="mt-0.5 text-[9px] text-slate-400 flex justify-between">
                        <span>{formatDate(sub.submitted_at)}</span>
                        <span className="font-bold">{totalPlants} {language === 'en' ? 'plants' : 'টি চারা'}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Interactive Auditor Dossier */}
        <div className="flex-1">
          {!selectedSub ? (
            <div className="h-[480px] border border-slate-200 rounded-xl bg-white flex items-center justify-center text-slate-400 text-xs">
              {language === 'en' ? "Select a verification record from the queue list to audit." : "যাচাই শুরু করতে অপেক্ষমাণ তালিকা থেকে একটি রেকর্ড নির্বাচন করুন।"}
            </div>
          ) : (
            <div className="border border-slate-200 bg-white rounded-xl shadow-sm p-6 flex flex-col gap-5 animate-scaleUp">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">
                    {language === 'en' ? "AUDITING SUBMISSION" : "আবেদন পর্যালোচনা কার্যক্রম"}
                  </span>
                  <span className="text-base font-black text-slate-800 font-serif">ID: {selectedSub.submission_id}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAction('Approved')}
                    className="flex items-center gap-1.5 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer border border-emerald-800"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    {language === 'en' ? "Approve Record" : "অনুমোদন করুন"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction('Rejected')}
                    className="flex items-center gap-1.5 py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg transition-colors cursor-pointer border border-rose-100"
                  >
                    <ShieldAlert className="h-4 w-4" />
                    {language === 'en' ? "Reject / Return" : "ফেরত পাঠান"}
                  </button>
                </div>
              </div>

              {/* Site Level Meta */}
              {selectedSub.sites.map((site) => {
                const totalSitePlants = site.plants.reduce((sum, p) => sum + p.quantity, 0);
                const score = site.geofence_score;
                const details = site.geofence_details;

                let scoreBg = 'bg-emerald-50/40 text-emerald-800 border-emerald-100';
                if (score < 60) scoreBg = 'bg-rose-50/40 text-rose-800 border-rose-100';
                else if (score < 85) scoreBg = 'bg-amber-50/40 text-amber-800 border-amber-100';

                return (
                  <div key={site.site_id} className="flex flex-col gap-4">
                    {/* Location Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl text-xs border border-slate-150">
                      <div className="flex flex-col gap-0.5 text-left">
                        <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">
                          {language === 'en' ? "Filing Officer" : "তথ্য জমাদানকারী কর্মকর্তা"}
                        </span>
                        <span className="font-semibold text-slate-700">{selectedSub.submitted_by_name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">ID: {selectedSub.submitted_by_id}</span>
                      </div>
                      <div className="flex flex-col gap-0.5 text-left">
                        <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">
                          {language === 'en' ? "Territory Block" : "এলাকা ও ব্লক"}
                        </span>
                        <span className="font-semibold text-slate-700">
                          {site.village}, {site.union}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {site.upazila}, {site.district}, {site.division}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5 text-left">
                        <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">
                          {language === 'en' ? "Land Owner (Planter)" : "জমির মালিক / রোপণকারী"}
                        </span>
                        <span className="font-semibold text-slate-700">
                          {site.personnel?.planter_name || (language === 'en' ? 'Unrecorded' : 'অনুল্লিখিত')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {language === 'en' ? 'Mob:' : 'মোবাইল:'} {site.personnel?.planter_mobile || (language === 'en' ? 'Unrecorded' : 'অনুল্লিখিত')}
                        </span>
                      </div>
                    </div>

                    {/* Geofencing Analysis */}
                    <div className="flex flex-col md:flex-row gap-5">
                      <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center w-full md:w-44 shrink-0 ${scoreBg}`}>
                        <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                          {language === 'en' ? "Confidence Index" : "নির্ভরযোগ্যতা সূচক"}
                        </span>
                        <span className="text-3xl font-black font-mono mt-1 text-slate-800">{score} <span className="text-xs font-semibold opacity-70">/100</span></span>
                        <span className={`text-[9px] font-bold rounded-full px-2 py-0.5 mt-2 uppercase ${
                          score >= 85 ? 'bg-emerald-100 text-emerald-800' : score >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {getTranslatedRisk(details?.risk_level || 'Low Risk')}
                        </span>
                      </div>

                      <div className="flex-1 flex flex-col gap-2.5 text-xs text-left">
                        <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100 pb-1">
                          {language === 'en' ? "Auditor Flag Checklist" : "অডিটর ফ্ল্যাগ চেকলিস্ট"}
                        </span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            {language === 'en' ? "GPS Position:" : "জিপিএস অবস্থান:"} <strong>
                              {details?.gps_accuracy_check === 'Pass' 
                                ? (language === 'en' ? 'Highly Accurate' : 'উচ্চ নির্ভুলতা') 
                                : (language === 'en' ? 'Low Lock (Warning)' : 'দুর্বল সিগন্যাল (সতর্কতা)')}
                            </strong>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            {language === 'en' ? "Boundary Poly:" : "সীমানা বহুভুজ:"} <strong>
                              {details?.boundary_match === 'Pass' 
                                ? (language === 'en' ? 'Inside Borders' : 'সীমানার ভেতরে') 
                                : (language === 'en' ? 'Mismatch' : 'মিল পাওয়া যায়নি')}
                            </strong>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            {language === 'en' ? "Duplicate Shield:" : "নকল এন্ট্রি শিল্ড:"} <strong>
                              {details?.duplicate_check === 'Pass' 
                                ? (language === 'en' ? 'Clean' : 'সঠিক ও নতুন') 
                                : (language === 'en' ? 'Overlap suspected' : 'ওভারল্যাপ সন্দেহজনক')}
                            </strong>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            {language === 'en' ? "NDVI Canopy:" : "NDVI ক্যানোপি:"} <strong>{site.ndvi.toFixed(2)} ({language === 'en' ? 'Healthy' : 'সবুজ ক্যানোপি'})</strong>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600 col-span-2">
                            <span className="h-2 w-2 rounded-full bg-teal-500" />
                            {language === 'en' ? "Carbon Estimates:" : "কার্বন পরিমাপ:"} <strong>{site.carbon_estimate.toFixed(1)} {language === 'en' ? 'Tonnes CO₂ Sequestration' : 'টন CO₂ শোষণ ক্ষমতা'}</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Plant items and Photos */}
                    <div className="flex flex-col gap-2.5 mt-2 text-left">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-1 flex items-center gap-1.5">
                        <TreePine className="h-4 w-4 text-emerald-600" />
                        {language === 'en' ? "Site Saplings Inventory & Photo Ledger" : "সাইট চারাগাছ স্টক ও ছবি সংরক্ষণাগার"} ({site.plants.length} {language === 'en' ? 'records' : 'টি রেকর্ড'})
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {site.plants.map((plant) => (
                          <div
                            key={plant.plant_id}
                            className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2 text-xs text-left"
                          >
                            <div className="flex items-center justify-between border-b border-slate-200/50 pb-1.5">
                              <span className="font-bold text-slate-700">{plant.species || (language === 'en' ? 'Forestry' : 'বনজ')}</span>
                              <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold text-[8px]">
                                QTY: {plant.quantity}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {language === 'en' ? 'Variety:' : 'জাত:'} {plant.variety || (language === 'en' ? 'Local' : 'দেশী')} | {language === 'en' ? 'Age:' : 'বয়স:'} {plant.seedling_age} | {language === 'en' ? 'Date:' : 'তারিখ:'} {plant.plantation_date}
                            </div>

                            {/* Images preview */}
                            <div className="flex gap-2.5 mt-1">
                              {plant.photos && plant.photos.map((src, pIdx) => (
                                <div key={pIdx} className="h-14 w-14 rounded border border-slate-250 overflow-hidden bg-white shadow-xs flex items-center justify-center">
                                  <img src={src} alt="Plant Sapling Audit" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                                </div>
                              ))}
                              {(!plant.photos || plant.photos.length === 0) && (
                                <div className="text-[10px] text-slate-400 italic">
                                  {language === 'en' ? "No verification pictures uploaded." : "কোন ছবি আপলোড করা হয়নি।"}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* OpenStreetMap for audit preview */}
                    <div className="flex flex-col gap-1.5 mt-3 text-left">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {language === 'en' ? "Geospatial Satellite Boundary Inspection" : "ভূ-স্থানিক স্যাটেলাইট সীমানা নিরীক্ষণ"}
                      </span>
                      <div className="h-64 relative rounded-xl border border-slate-200 overflow-hidden bg-slate-100 shadow-xs">
                        <MapComponent
                          latitude={site.latitude}
                          longitude={site.longitude}
                          radius={site.radius}
                          polygon={site.polygon}
                          plantationType={site.plantation_type}
                          onChange={() => {}} // Read-only on audit page
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
