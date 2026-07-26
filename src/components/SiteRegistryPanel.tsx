import React from 'react';
import { useApp } from '../context/AppContext';
import { Leaf, Plus, Trash2, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import { PlantationType } from '../types';

export default function SiteRegistryPanel() {
  const {
    activeSubmission,
    activeSiteIndex,
    setActiveSiteIndex,
    addSiteToActiveSubmission,
    deleteSiteFromActiveSubmission,
    duplicateSiteInActiveSubmission,
    reorderSitesInActiveSubmission,
    language,
    t,
  } = useApp();

  if (!activeSubmission || activeSubmission.sites.length === 0) return null;

  const handleAddSite = () => {
    addSiteToActiveSubmission('Single Tree');
  };

  return (
    <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3 mb-6 animate-fadeIn">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5 text-left">
          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
            <Leaf className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 font-mono">
              {language === 'en' ? "Submission Site Registry" : "জমাকৃত সাইট রেজিস্ট্রি"}
            </h4>
            <p className="text-[10px] text-slate-500 font-medium">
              {language === 'en'
                ? `Active Site: ${activeSiteIndex + 1} of ${activeSubmission.sites.length} total enrolled parcels`
                : `সক্রিয় সাইট: মোট ${activeSubmission.sites.length} টির মধ্যে ${activeSiteIndex + 1} নং সাইট`}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            id="btn-add-site-registry"
            onClick={handleAddSite}
            className="py-1.5 px-3 text-[10px] font-extrabold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus className="h-3 w-3" />
            {language === 'en' ? "Add Another Site" : "আরেকটি সাইট যোগ করুন"}
          </button>
          <button
            type="button"
            id="btn-duplicate-site-registry"
            onClick={() => duplicateSiteInActiveSubmission(activeSiteIndex)}
            className="py-1.5 px-3 text-[10px] font-extrabold text-blue-800 bg-blue-100/80 hover:bg-blue-250 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Copy className="h-3 w-3" />
            {language === 'en' ? "Duplicate Current" : "অনুলিপি করুন"}
          </button>
          <button
            type="button"
            id="btn-delete-site-registry"
            onClick={() => deleteSiteFromActiveSubmission(activeSiteIndex)}
            disabled={activeSubmission.sites.length <= 1}
            className="py-1.5 px-3 text-[10px] font-extrabold text-rose-800 bg-rose-100/80 hover:bg-rose-200 disabled:opacity-40 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="h-3 w-3" />
            {language === 'en' ? "Delete Current" : "মুছে ফেলুন"}
          </button>
        </div>
      </div>

      {/* Horizontal Nav Tabs */}
      <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 max-h-24">
        {activeSubmission.sites.map((s, idx) => {
          const isSelected = idx === activeSiteIndex;
          const totalPlants = s.plants.reduce((sum, p) => sum + p.quantity, 0);

          let siteLabel = t('type_single');
          if (s.plantation_type === 'Small Plantation') siteLabel = t('type_small');
          if (s.plantation_type === 'Orchard / Large Plantation') siteLabel = t('type_orchard');

          return (
            <div
              key={s.site_id}
              id={`site-tab-${idx}`}
              onClick={() => setActiveSiteIndex(idx)}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-lg border text-xs font-bold transition-all cursor-pointer select-none ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-800 border-slate-200'
              }`}
            >
              <span className="font-mono text-[10px] opacity-75">#{idx + 1}</span>
              <span className="truncate max-w-[120px]">{siteLabel}</span>
              <span className={`text-[9px] font-mono font-black py-0.5 px-1.5 rounded-full ${
                isSelected ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-100 text-slate-500'
              }`}>
                {totalPlants} {language === 'en' ? 'plants' : 'টি গাছ'}
              </span>

              {/* Reordering mini controls */}
              {activeSubmission.sites.length > 1 && (
                <div className="flex items-center gap-0.5 ml-1 shrink-0 border-l border-slate-200 pl-1.5">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      reorderSitesInActiveSubmission(idx, idx - 1);
                    }}
                    className={`p-0.5 rounded-md transition-colors ${
                      isSelected
                        ? 'hover:bg-emerald-700 text-emerald-200 hover:text-white'
                        : 'hover:bg-slate-200 text-slate-400 hover:text-slate-700'
                    } disabled:opacity-25`}
                    title={language === 'en' ? "Move Left" : "বামে নিন"}
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === activeSubmission.sites.length - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      reorderSitesInActiveSubmission(idx, idx + 1);
                    }}
                    className={`p-0.5 rounded-md transition-colors ${
                      isSelected
                        ? 'hover:bg-emerald-700 text-emerald-200 hover:text-white'
                        : 'hover:bg-slate-200 text-slate-400 hover:text-slate-700'
                    } disabled:opacity-25`}
                    title={language === 'en' ? "Move Right" : "ডানে নিন"}
                  >
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
