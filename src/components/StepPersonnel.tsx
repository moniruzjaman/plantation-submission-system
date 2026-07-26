/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Personnel } from '../types';
import { User, Phone, CheckSquare, Square, AlertCircle } from 'lucide-react';
import SiteRegistryPanel from './SiteRegistryPanel';

export default function StepPersonnel() {
  const { activeSubmission, updateActiveSite, activeSiteIndex, language, t } = useApp();

  if (!activeSubmission || activeSubmission.sites.length === 0) return null;

  const currentSite = activeSubmission.sites[activeSiteIndex] || activeSubmission.sites[activeSubmission.sites.length - 1];

  // Initialize personnel state if null
  useEffect(() => {
    if (!currentSite.personnel) {
      updateActiveSite((prev) => ({
        ...prev,
        personnel: {
          site_id: currentSite.site_id,
          planter_name: '',
          planter_mobile: '',
          caretaker_name: '',
          caretaker_mobile: '',
          is_caretaker_same_as_planter: false,
        },
      }));
    }
  }, [currentSite.personnel, currentSite.site_id, updateActiveSite]);

  const personnel = currentSite.personnel || {
    site_id: currentSite.site_id,
    planter_name: '',
    planter_mobile: '',
    caretaker_name: '',
    caretaker_mobile: '',
    is_caretaker_same_as_planter: false,
  };

  const handleUpdatePersonnel = (fields: Partial<Personnel>) => {
    updateActiveSite((prev) => {
      const currentPersonnel = prev.personnel || {
        site_id: prev.site_id,
        planter_name: '',
        planter_mobile: '',
        caretaker_name: '',
        caretaker_mobile: '',
        is_caretaker_same_as_planter: false,
      };

      const nextPersonnel = {
        ...currentPersonnel,
        ...fields,
      };

      // Auto copy rule if selected
      if (nextPersonnel.is_caretaker_same_as_planter) {
        nextPersonnel.caretaker_name = nextPersonnel.planter_name;
        nextPersonnel.caretaker_mobile = nextPersonnel.planter_mobile;
      }

      return {
        ...prev,
        personnel: nextPersonnel,
      };
    });
  };

  // Helper when planter name/mobile changes and Same is true
  const handlePlanterFieldChange = (key: 'planter_name' | 'planter_mobile', val: string) => {
    const updates: Partial<Personnel> = { [key]: val };
    if (personnel.is_caretaker_same_as_planter) {
      if (key === 'planter_name') updates.caretaker_name = val;
      if (key === 'planter_mobile') updates.caretaker_mobile = val;
    }
    handleUpdatePersonnel(updates);
  };

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto">
      <SiteRegistryPanel />
      <div className="flex flex-col gap-6 animate-fadeIn text-left">
      {/* Informative banner */}
      <div className="flex items-start gap-3 bg-blue-50/50 border border-blue-100 p-4 rounded-xl text-xs text-blue-800 leading-relaxed">
        <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="flex flex-col">
          <span className="font-bold text-blue-950">
            {language === 'en' ? "Personnel Verification Mandate" : "কর্মী যাচাইকরণ নির্দেশিকা"}
          </span>
          <span>
            {language === 'en'
              ? "Please record active contact details for both the land planter and the long-term caretaker. SAAO inspectors will use these numbers to schedule validation audits."
              : "অনুগ্রহ করে জমির মালিক/রোপনকারী এবং দীর্ঘমেয়াদী তত্ত্বাবধায়ক উভয়ের সক্রিয় যোগাযোগের তথ্য প্রদান করুন। এসএএও (SAAO) পরিদর্শকগণ এই নম্বরে যোগাযোগ করে সশরীরে যাচাইকরণের সময় নির্ধারণ করবেন।"}
          </span>
        </div>
      </div>

      {/* PLANTER CONTAINER */}
      <div className="flex flex-col gap-4 border border-neutral-200 bg-white p-5 rounded-xl shadow-sm">
        <span className="text-sm font-bold text-neutral-800 border-b border-neutral-100 pb-2">
          {language === 'en' ? "Planter Information" : "রোপনকারীর তথ্য"}
        </span>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-600">{t('planter_name')}</label>
          <div className="relative">
            <input
              type="text"
              placeholder={language === 'en' ? "Full legal name" : "জাতীয় পরিচয়পত্র অনুযায়ী পূর্ণ নাম"}
              value={personnel.planter_name}
              onChange={(e) => handlePlanterFieldChange('planter_name', e.target.value)}
              className="w-full text-sm py-2.5 pl-10 pr-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
            />
            <User className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-600">
            {t('planter_mobile')} {language === 'en' ? '(Bangladesh +880)' : '(বাংলাদেশ +৮৮০)'}
          </label>
          <div className="relative">
            <input
              type="tel"
              placeholder={language === 'en' ? "e.g. 01712345678" : "যেমন: ০১৭১২৩৪৫৬৭৮"}
              value={personnel.planter_mobile}
              onChange={(e) => handlePlanterFieldChange('planter_mobile', e.target.value)}
              className="w-full text-sm py-2.5 pl-10 pr-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
            />
            <Phone className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
          </div>
        </div>
      </div>

      {/* CARETAKER CONTAINER */}
      <div className="flex flex-col gap-4 border border-neutral-200 bg-white p-5 rounded-xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-2">
          <span className="text-sm font-bold text-neutral-800">
            {language === 'en' ? "Caretaker Information" : "তত্ত্বাবধায়কের তথ্য"}
          </span>
          
          {/* Same as Planter Toggle */}
          <button
            type="button"
            onClick={() =>
              handleUpdatePersonnel({
                is_caretaker_same_as_planter: !personnel.is_caretaker_same_as_planter,
              })
            }
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors cursor-pointer self-start sm:self-auto"
          >
            {personnel.is_caretaker_same_as_planter ? (
              <CheckSquare className="h-4.5 w-4.5 text-emerald-600" />
            ) : (
              <Square className="h-4.5 w-4.5 text-neutral-300" />
            )}
            {language === 'en' ? "Same as Planter" : "রোপনকারী ও তত্ত্বাবধায়ক একই ব্যক্তি"}
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-600">
            {language === 'en' ? "Caretaker Name" : "তত্ত্বাবধায়কের নাম"}
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder={language === 'en' ? "Full legal name" : "আইনি পূর্ণ নাম"}
              value={personnel.caretaker_name}
              disabled={personnel.is_caretaker_same_as_planter}
              onChange={(e) => handleUpdatePersonnel({ caretaker_name: e.target.value })}
              className="w-full text-sm py-2.5 pl-10 pr-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-neutral-100 disabled:text-neutral-500 bg-white"
            />
            <User className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-600">
            {language === 'en' ? "Mobile Number (Bangladesh +880)" : "মোবাইল নম্বর (বাংলাদেশ +৮৮০)"}
          </label>
          <div className="relative">
            <input
              type="tel"
              placeholder={language === 'en' ? "e.g. 01712345678" : "যেমন: ০১৭১২৩৪৫৬৭৮"}
              value={personnel.caretaker_mobile}
              disabled={personnel.is_caretaker_same_as_planter}
              onChange={(e) => handleUpdatePersonnel({ caretaker_mobile: e.target.value })}
              className="w-full text-sm py-2.5 pl-10 pr-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-neutral-100 disabled:text-neutral-500 bg-white"
            />
            <Phone className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
