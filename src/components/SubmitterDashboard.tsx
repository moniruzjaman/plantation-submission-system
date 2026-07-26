/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { Submission, SubmissionStatus } from '../types';
import DashboardAnalytics from './DashboardAnalytics';
import { 
  Plus, Play, Trash2, Eye, Wifi, WifiOff, RefreshCw, 
  Layers, FolderOpen, Clock, CheckCircle, Activity 
} from 'lucide-react';

export default function SubmitterDashboard() {
  const {
    submissions,
    syncQueue,
    online,
    isSyncing,
    startNewSubmission,
    loadSubmissionToWizard,
    deleteSubmission,
    syncOfflineQueue,
    setViewMode,
    setSelectedSubmissionId,
    triggerMockOnlineToggle,
    language,
    t,
  } = useApp();

  // Statistics calculation
  const drafts = submissions.filter((s) => s.status === 'Draft');
  const syncPending = submissions.filter((s) => s.status === 'Sync Pending');
  const pendingValidation = submissions.filter((s) => s.status === 'Validation Pending');
  const approved = submissions.filter((s) => s.status === 'Approved');

  // Format timestamp helper
  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleDateString(language === 'en' ? 'en-US' : 'bn-BD', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Status styling map
  const getStatusStyle = (status: SubmissionStatus) => {
    switch (status) {
      case 'Draft':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'Sync Pending':
        return 'bg-amber-50 text-amber-900 border-amber-300 animate-pulse';
      case 'Validation Pending':
        return 'bg-blue-50 text-blue-800 border-blue-300';
      case 'Approved':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'Rejected':
        return 'bg-rose-50 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getTranslatedStatus = (status: SubmissionStatus) => {
    switch (status) {
      case 'Draft':
        return language === 'en' ? 'Draft' : 'খসড়া';
      case 'Sync Pending':
        return language === 'en' ? 'Sync Pending' : 'সিঙ্ক পেন্ডিং';
      case 'Validation Pending':
        return language === 'en' ? 'Validation Pending' : 'যাচাই পেন্ডিং';
      case 'Approved':
        return language === 'en' ? 'Approved' : 'অনুমোদিত';
      case 'Rejected':
        return language === 'en' ? 'Rejected' : 'প্রত্যাখ্যাত';
      default:
        return status;
    }
  };

  const handleViewDetails = (id: string) => {
    setSelectedSubmissionId(id);
    setViewMode('details');
  };

  const handleDelete = (id: string) => {
    const confirmDelete = language === 'en'
      ? 'Are you sure you want to delete this plantation record?'
      : 'আপনি কি নিশ্চিত যে এই রোপণ রেকর্ডটি মুছে ফেলতে চান?';
    if (confirm(confirmDelete)) {
      deleteSubmission(id);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* 1. CONNECTION STATUS & SYNC COMMAND BANNER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-emerald-950 text-white p-5 rounded-xl shadow-sm border border-emerald-900">
        <div className="flex items-center gap-3.5 text-left">
          <div className={`p-2.5 rounded-lg shrink-0 ${online ? 'bg-emerald-700' : 'bg-amber-700'}`}>
            {online ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold flex items-center gap-1.5 text-emerald-100">
              {t('network_mode')}: {online ? t('online_status') : t('offline_status')}
            </span>
            <span className="text-[10px] text-emerald-300/80 leading-snug">
              {online 
                ? (language === 'en' 
                    ? 'All finalized submissions are dispatched to regional DAE servers instantly.' 
                    : 'সব চূড়ান্তকৃত আবেদন তাৎক্ষণিকভাবে আঞ্চলিক ডিএই সার্ভারে স্থানান্তরিত হচ্ছে।')
                : (language === 'en'
                    ? 'Submissions are safely sealed in Local IndexedDB. Ready to sync on network restoration.'
                    : 'আবেদনসমূহ স্থানীয় IndexedDB-তে সুরক্ষিত রয়েছে। ইন্টারনেট সংযোগ পুনরায় স্থাপিত হলে সিঙ্ক হবে।')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          {/* Mock Network Toggle */}
          <button
            type="button"
            onClick={triggerMockOnlineToggle}
            className="text-[11px] font-bold py-1.5 px-3 bg-emerald-900 hover:bg-emerald-850 border border-emerald-800 text-emerald-200 rounded-lg transition-all cursor-pointer"
          >
            {t('toggle_signal')}
          </button>

          {/* Sync Queue Action button */}
          {syncQueue.length > 0 && (
            <button
              type="button"
              disabled={isSyncing || !online}
              onClick={syncOfflineQueue}
              className="flex items-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-1.5 px-4 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? (language === 'en' ? 'Syncing...' : 'সিঙ্ক হচ্ছে...') : `${t('btn_push_sync')} (${syncQueue.length})`}
            </button>
          )}
        </div>
      </div>

      {/* 2. STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Drafts count */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col text-left">
          <div className="flex items-center gap-2 text-slate-400">
            <FolderOpen className="h-4 w-4 text-slate-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {language === 'en' ? 'Local Drafts' : 'আঞ্চলিক খসড়া'}
            </span>
          </div>
          <span className="text-2xl font-black font-mono text-slate-800 mt-1">{drafts.length}</span>
        </div>

        {/* Sync Pending */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col text-left">
          <div className="flex items-center gap-2 text-amber-600">
            <Clock className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {language === 'en' ? 'Sync Pending' : 'অপেক্ষমান সিঙ্ক'}
            </span>
          </div>
          <span className="text-2xl font-black font-mono text-amber-600 mt-1">{syncPending.length}</span>
        </div>

        {/* Validation Pending */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col text-left">
          <div className="flex items-center gap-2 text-blue-600">
            <Activity className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {language === 'en' ? 'Validation Queue' : 'যাচাইকরণ সারি'}
            </span>
          </div>
          <span className="text-2xl font-black font-mono text-blue-600 mt-1">{pendingValidation.length}</span>
        </div>

        {/* Approved and Verified */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col text-left">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {language === 'en' ? 'Approved Logs' : 'অনুমোদিত বনায়ন'}
            </span>
          </div>
          <span className="text-2xl font-black font-mono text-emerald-600 mt-1">
            {approved.length} <span className="text-xs text-slate-400 font-medium">/{submissions.length}</span>
          </span>
        </div>
      </div>

      {/* 3. PROMINENT CALL TO ACTION */}
      <button
        type="button"
        onClick={startNewSubmission}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold rounded-lg shadow-xs cursor-pointer transition-all border border-emerald-800 text-sm"
      >
        <Plus className="h-4.5 w-4.5 stroke-[2.5]" />
        {t('btn_new_submission')}
      </button>

      {/* DASHBOARD ANALYTICS PORTLET */}
      <DashboardAnalytics />

      {/* 4. RECENT SUBMISSIONS / DRAFTS DIRECTORY */}
      <div className="flex flex-col gap-3.5">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2 text-left">
          <Layers className="h-4 w-4 text-slate-400" />
          {t('draft_title')}
        </h3>

        {submissions.length === 0 ? (
          <div className="p-10 border border-dashed border-slate-200 rounded-xl text-center flex flex-col items-center justify-center gap-2 bg-white">
            <span className="text-sm text-slate-600 font-bold">{t('no_records')}</span>
            <span className="text-xs text-slate-400 max-w-sm">
              {language === 'en'
                ? "Press the green button above to capture your first government-recorded plantation site."
                : "আপনার প্রথম সরকারি রেকর্ডভুক্ত বৃক্ষরোপণ সাইট যুক্ত করতে উপরের সবুজ বোতামটি চাপুন।"}
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {submissions.map((sub) => {
              const siteCount = sub.sites.length;
              const plantCount = sub.sites.reduce(
                (sum, s) => sum + s.plants.reduce((pSum, p) => pSum + p.quantity, 0),
                0
              );

              return (
                <div
                  key={sub.submission_id}
                  className="p-4.5 border border-slate-200 bg-white rounded-xl shadow-xs hover:shadow-sm transition-all flex flex-col gap-3 text-left relative animate-scaleUp"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-500">
                      ID: {sub.submission_id.slice(0, 14)}...
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusStyle(
                        sub.status
                      )}`}
                    >
                      {getTranslatedStatus(sub.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 border-b border-slate-100 pb-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-medium">{t('recorded_date')}</span>
                      <span className="font-semibold text-slate-700">{formatTime(sub.submitted_at)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-medium">{t('inventory_specs')}</span>
                      <span className="font-semibold text-slate-700">
                        {siteCount} {language === 'en' ? (siteCount === 1 ? 'Site' : 'Sites') : 'সাইট'} | {plantCount} {language === 'en' ? (plantCount === 1 ? 'Plant' : 'Plants') : 'চারা গাছ'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    {sub.status === 'Draft' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => loadSubmissionToWizard(sub.submission_id)}
                          className="flex-1 py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer border border-emerald-100"
                        >
                          <Play className="h-3 w-3" />
                          {t('btn_resume_draft')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(sub.submission_id)}
                          className="py-1.5 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors flex items-center justify-center cursor-pointer border border-rose-100"
                          title="Delete Draft"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleViewDetails(sub.submission_id)}
                          className="flex-1 py-1.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer border border-neutral-200"
                        >
                          <Eye className="h-3 w-3" />
                          {t('btn_view_dossier')}
                        </button>
                        {sub.status === 'Sync Pending' && online && (
                          <button
                            type="button"
                            disabled={isSyncing}
                            onClick={syncOfflineQueue}
                            className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            {language === 'en' ? 'Push Sync' : 'সিঙ্ক করুন'}
                          </button>
                        )}
                        {(sub.status === 'Validation Pending' || sub.status === 'Approved' || sub.status === 'Rejected') && (
                          <button
                            type="button"
                            onClick={() => handleDelete(sub.submission_id)}
                            className="py-1.5 px-2.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-400 hover:text-red-600 rounded-lg transition-colors flex items-center justify-center cursor-pointer border border-neutral-200"
                            title="Purge Record"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
