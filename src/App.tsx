/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import SubmitterDashboard from './components/SubmitterDashboard';
import ValidatorDashboard from './components/ValidatorDashboard';
import SubmissionDetails from './components/SubmissionDetails';
import StepPlantationSite from './components/StepPlantationSite';
import StepPlantRecords from './components/StepPlantRecords';
import StepPersonnel from './components/StepPersonnel';
import StepSubmissionSummary from './components/StepSubmissionSummary';
import DatabaseSchemaExplorer from './components/DatabaseSchemaExplorer';
import { 
  FolderDown, ArrowLeft, ArrowRight, Save, LogOut, CheckCircle, 
  UserCheck, ClipboardList, Settings, Trees, Database 
} from 'lucide-react';

// Highly polished, legendary-quality inline SVG representing the Bangladesh Tree Plantation Seal
function BangladeshBrandLogo() {
  return (
    <svg viewBox="0 0 100 100" className="h-14 w-14 shrink-0 hover:scale-105 transition-transform" aria-label="Government Tree Plantation Seal">
      {/* Outer dark-green seal border */}
      <circle cx="50" cy="50" r="47" fill="#FFFFFF" stroke="#065F46" strokeWidth="3" />
      <circle cx="50" cy="50" r="44" fill="none" stroke="#10B981" strokeWidth="1" />
      
      {/* Background stylized skyline and Martyrs' Memorial silhouette */}
      <path d="M 30 75 L 50 25 L 70 75 Z" fill="#E2E8F0" opacity="0.4" />
      <path d="M 45 75 L 50 30 L 55 75 Z" fill="#CBD5E1" opacity="0.6" />
      
      {/* Waving green hill/soil base */}
      <path d="M 12 70 Q 30 55 50 68 T 88 65 L 88 80 L 12 80 Z" fill="#047857" />
      {/* Secondary waving hill with Bangladesh flag design (red sun) */}
      <path d="M 12 75 Q 35 62 50 72 T 88 70 L 88 84 L 12 84 Z" fill="#065F46" />
      <circle cx="50" cy="78" r="7" fill="#EF4444" />
      
      {/* Soil mound for seedling */}
      <ellipse cx="50" cy="67" rx="14" ry="4" fill="#78350F" />
      
      {/* Rising Tree Seedling with 3 beautiful vibrant green leaves */}
      <path d="M 50 67 V 40" stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" />
      {/* Stem details */}
      <path d="M 50 55 Q 45 48 44 48" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
      <path d="M 50 48 Q 55 42 56 42" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
      
      {/* Leaf 1 (Left) */}
      <path d="M 50 50 C 35 45 32 32 50 38 Z" fill="#10B981" stroke="#047857" strokeWidth="1" />
      {/* Leaf 2 (Right) */}
      <path d="M 50 45 C 65 40 68 28 50 33 Z" fill="#059669" stroke="#047857" strokeWidth="1" />
      {/* Leaf 3 (Top Central) */}
      <path d="M 50 40 C 42 22 58 22 50 40 Z" fill="#34D399" stroke="#047857" strokeWidth="1" />
      
      {/* Top Center: Mini Bangladesh National Map Emblem inside red seal */}
      <circle cx="50" cy="18" r="8" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1" />
      {/* Stylized geometric silhouette of map of Bangladesh inside the red circle */}
      <path d="M 48 15 Q 52 14 51 17 T 53 19 T 50 21 T 47 18 Z" fill="#FBBF24" />
      
      {/* Red Stars on sides */}
      <polygon points="18,50 20,53 17,55 21,55 22,58 23,55 27,55 24,53 26,50 22,52" fill="#EF4444" transform="scale(0.8) translate(10, 8)" />
      <polygon points="82,50 84,53 81,55 85,55 86,58 87,55 91,55 88,53 90,50 86,52" fill="#EF4444" transform="scale(0.8) translate(12, 8)" />
    </svg>
  );
}

function MainLayout() {
  const {
    viewMode,
    currentStep,
    activeSubmission,
    nextStep,
    prevStep,
    saveActiveAsDraft,
    submitActiveSubmission,
    setViewMode,
    language,
    setLanguage,
    t,
  } = useApp();

  // Smart header tab handler. If they are in the middle of a wizard step, we auto-save draft first!
  const handleTabChange = async (targetMode: 'dashboard' | 'validator' | 'database') => {
    if (viewMode === 'wizard' && activeSubmission) {
      const saveConfirmText = language === 'en'
        ? 'You have an active plantation submission draft. Would you like to automatically save it as a local draft before switching views?'
        : 'আপনার একটি সক্রিয় খসড়া আবেদন রয়েছে। আপনি কি ভিউ পরিবর্তন করার পূর্বে এটি খসড়া হিসেবে সংরক্ষণ করতে চান?';
      if (confirm(saveConfirmText)) {
        await saveActiveAsDraft();
      } else {
        return; // cancel switch
      }
    }
    setViewMode(targetMode);
  };

  // Step renderer
  const renderWizardStep = () => {
    switch (currentStep) {
      case 1:
        return <StepPlantationSite />;
      case 2:
        return <StepPlantRecords />;
      case 3:
        return <StepPersonnel />;
      case 4:
        return <StepSubmissionSummary />;
      default:
        return <StepPlantationSite />;
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1:
        return t('step_site');
      case 2:
        return t('step_plants');
      case 3:
        return t('step_personnel');
      case 4:
        return t('step_summary');
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans antialiased">
      {/* 1. MASTER HEADER WITH SEAL AND PORTAL SELECTORS */}
      <header className="h-16 bg-emerald-900 text-white flex items-center justify-between px-6 shadow-md shrink-0 sticky top-0 z-50">
        
        {/* Logo and App Title */}
        <div className="flex items-center gap-3.5">
          <BangladeshBrandLogo />
          <div className="flex flex-col text-left">
            <span className="text-[10px] uppercase tracking-widest text-emerald-300 font-mono font-bold">
              {language === 'en' ? "People's Republic of Bangladesh" : "গণপ্রজাতন্ত্রী বাংলাদেশ সরকার"}
            </span>
            <h1 className="text-sm md:text-lg font-bold tracking-tight text-white leading-none">
              {t('app_title')}
            </h1>
            <span className="text-[9px] md:text-[10px] text-emerald-200/80 font-medium leading-none mt-1">
              {language === 'en' 
                ? "DAE Forestry Recording, Monitoring & Validation Portal" 
                : "ডিএই বনায়ন রেকর্ড, পর্যবেক্ষণ ও যাচাইকরণ পোর্টাল"}
            </span>
          </div>
        </div>

        {/* Header Right Content */}
        <div className="flex items-center gap-3 md:gap-6">
          {/* Persona role switcher */}
          <div className="hidden md:flex items-center bg-emerald-950 p-1 rounded-xl border border-emerald-850">
            <button
              type="button"
              onClick={() => handleTabChange('dashboard')}
              className={`flex items-center gap-2 py-1.5 px-3.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'dashboard' || (viewMode !== 'validator' && viewMode !== 'database')
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-emerald-300 hover:text-white'
              }`}
            >
              <ClipboardList className="h-4 w-4" />
              {t('portal_submitter')}
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('validator')}
              className={`flex items-center gap-2 py-1.5 px-3.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'validator'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-emerald-300 hover:text-white'
              }`}
            >
              <UserCheck className="h-4 w-4" />
              {t('portal_auditor')}
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('database')}
              className={`flex items-center gap-2 py-1.5 px-3.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'database'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-emerald-300 hover:text-white'
              }`}
            >
              <Database className="h-4 w-4" />
              {language === 'en' ? "GIS DB Schema" : "জিআইএস ডাটাবেস"}
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Language switcher */}
            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="bg-emerald-800 hover:bg-emerald-700 border border-emerald-700 text-white font-extrabold text-[11px] py-1.5 px-3 rounded-lg cursor-pointer transition-all flex items-center justify-center min-w-[65px]"
            >
              {t('toggle_language')}
            </button>

            <div className="w-9 h-9 rounded-full bg-emerald-850 border border-emerald-700 flex items-center justify-center text-white font-black text-xs">
              DAE
            </div>
          </div>
        </div>
      </header>

      {/* Persona selector for mobile screen viewports */}
      <div className="md:hidden bg-white border-b border-slate-200 p-2.5 flex justify-center sticky top-16 z-40">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 w-full">
          <button
            type="button"
            onClick={() => handleTabChange('dashboard')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
              viewMode !== 'validator' && viewMode !== 'database'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ClipboardList className="h-3.5 w-3.5" />
            {t('portal_submitter').split(' ')[0]}
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('validator')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
              viewMode === 'validator'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            {t('portal_auditor').split(' ')[0]}
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('database')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
              viewMode === 'database'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            {language === 'en' ? "GIS DB" : "জিআইএস"}
          </button>
        </div>
      </div>

      {/* 2. BODY CONTENT ROUTER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 flex flex-col justify-stretch">
        {viewMode === 'dashboard' && <SubmitterDashboard />}
        
        {viewMode === 'validator' && <ValidatorDashboard />}
        
        {viewMode === 'details' && <SubmissionDetails />}

        {viewMode === 'database' && <DatabaseSchemaExplorer />}

        {/* ACTIVE MULTI-STEP WIZARD */}
        {viewMode === 'wizard' && activeSubmission && (
          <div className="flex flex-col lg:flex-row gap-6 items-stretch flex-1 animate-scaleUp">
            
            {/* SIDEBAR FOR WIZARD STEPS */}
            <aside className="w-full lg:w-72 bg-white border border-slate-200 rounded-xl p-6 flex flex-col shrink-0 justify-between shadow-sm">
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    {language === 'en' ? "Draft ID" : "খসড়া আইডি"}: {activeSubmission.submission_id.slice(0, 12)}...
                  </span>
                  <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">
                    {language === 'en' ? "Submission Wizard" : "জমাদান উইজার্ড"}
                  </h2>
                </div>

                <nav className="space-y-1.5">
                  {[1, 2, 3, 4].map((step) => {
                    const isActive = step === currentStep;
                    const isCompleted = step < currentStep;
                    
                    let stepClass = 'flex items-center gap-3.5 p-3 rounded-lg border text-sm font-semibold transition-all text-left';
                    let bubbleClass = 'w-7.5 h-7.5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-xs transition-colors';
                    
                    if (isActive) {
                      stepClass += ' bg-emerald-50 text-emerald-800 border-emerald-100 font-bold';
                      bubbleClass += ' bg-emerald-600 text-white';
                    } else if (isCompleted) {
                      stepClass += ' text-emerald-900 border-transparent bg-emerald-50/20';
                      bubbleClass += ' bg-emerald-600/30 text-emerald-800 border border-emerald-600/20';
                    } else {
                      stepClass += ' text-slate-400 border-transparent hover:text-slate-600';
                      bubbleClass += ' border border-slate-200 text-slate-400 bg-white';
                    }

                    return (
                      <div key={step} className={stepClass}>
                        <div className={bubbleClass}>{step}</div>
                        <span className="truncate">{getStepTitle(step)}</span>
                      </div>
                    );
                  })}
                </nav>
              </div>

              {/* Progress Quality widget at bottom of sidebar */}
              <div className="mt-6 pt-6 border-t border-slate-200 text-left">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {language === 'en' ? "Draft Progression" : "খসড়া অগ্রগতি"}
                  </span>
                  <span className="text-xs font-extrabold text-emerald-700">{Math.round((currentStep / 4) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-600 h-full transition-all duration-300"
                    style={{ width: `${(currentStep / 4) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-2 leading-snug">
                  {language === 'en' 
                    ? "Our systems monitor and score geographic parameters automatically." 
                    : "আমাদের সিস্টেম স্বয়ংক্রিয়ভাবে ভৌগোলিক প্যারামিটারসমূহ পর্যবেক্ষণ ও স্কোর করে।"}
                </p>
              </div>
            </aside>

            {/* STEP WORKSPACE AREA */}
            <section className="flex-1 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[500px]">
              
              {/* Header of Workspace */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {language === 'en' ? "Active Worksheet" : "সক্রিয় ওয়ার্কশীট"}
                  </span>
                  <h2 className="text-lg font-black text-slate-800 font-serif">
                    {language === 'en' ? `Step ${currentStep}` : `ধাপ ${currentStep}`}: {getStepTitle(currentStep)}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={saveActiveAsDraft}
                  className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 py-1.5 px-3 rounded-lg transition-colors font-semibold cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5 text-slate-400" />
                  {t('btn_save_draft')}
                </button>
              </div>

              {/* Form Content body */}
              <div className="flex-1 p-6 md:p-8">
                {renderWizardStep()}
              </div>

              {/* Footer Controls of Workspace */}
              <footer className="bg-slate-50 border-t border-slate-200/60 px-6 py-4.5 flex items-center justify-between shrink-0 shadow-xs">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 py-2.5 px-4.5 rounded-lg transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t('btn_prev')}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={saveActiveAsDraft}
                    className="px-4 py-2.5 text-emerald-800 bg-white border border-emerald-200 hover:bg-emerald-50 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    {t('btn_save_draft')}
                  </button>
                  
                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex items-center gap-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white py-2.5 px-5.5 rounded-lg shadow-sm transition-colors cursor-pointer"
                    >
                      {t('btn_next')}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={submitActiveSubmission}
                      className="flex items-center gap-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white py-2.5 px-6.5 rounded-lg shadow-md transition-colors cursor-pointer"
                    >
                      <CheckCircle className="h-4.5 w-4.5" />
                      {t('btn_submit')}
                    </button>
                  )}
                </div>
              </footer>
            </section>
          </div>
        )}
      </main>

      {/* 3. CONNOTATION FOOTER SECTION */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-400 shrink-0">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Trees className="h-4.5 w-4.5 text-emerald-600" />
            <span>
              {language === 'en'
                ? "Plantation Submission System © 2026. Department of Agricultural Extension."
                : "বৃক্ষরোপণ জমাদান পদ্ধতি © ২০২৬। কৃষি সম্প্রসারণ অধিদপ্তর (DAE)।"}
            </span>
          </div>
          <div className="flex items-center gap-3 font-semibold text-[10px]">
            <span>Version 1.4.0 (PWA Capable)</span>
            <span>•</span>
            <span className="text-emerald-700">
              {language === 'en' ? "Digital Forestation Registry" : "ডিজিটাল বনায়ন রেজিস্ট্রি"}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };
  props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught runtime application crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="bg-white border border-rose-200 shadow-xl rounded-2xl max-w-lg p-8 flex flex-col items-center">
            <div className="h-16 w-16 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center text-rose-600 mb-6 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <span className="text-xs font-black uppercase tracking-wider text-rose-500 font-mono">System Recovery Console</span>
            <h1 className="text-xl font-bold text-neutral-800 mt-2 font-serif">Something went wrong</h1>
            <p className="text-xs text-neutral-500 mt-3 leading-relaxed max-w-sm">
              The Forestry Record Portal encountered an unexpected runtime error. Your local data remains securely stored in the IndexedDB.
            </p>

            <div className="w-full bg-neutral-50 rounded-xl border border-neutral-150 p-4 mt-6 text-left max-h-40 overflow-y-auto">
              <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest block mb-1">Error Trace</span>
              <pre className="text-[10px] font-mono text-rose-600 leading-normal whitespace-pre-wrap break-all select-all text-left">
                {this.state.error?.stack || this.state.error?.message || "Unknown error"}
              </pre>
            </div>

            <div className="flex gap-3 w-full mt-6">
              <button
                type="button"
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="flex-1 py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Clear Cache
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer"
              >
                Reload Portal
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </AppErrorBoundary>
  );
}
