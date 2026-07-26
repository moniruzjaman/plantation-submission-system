/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plant, PlantationSite } from '../types';
import { Plus, Trash2, Camera, Image, ArrowRight, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import SiteRegistryPanel from './SiteRegistryPanel';

const PLANT_CATEGORIES = ['Fruit', 'Timber', 'Medicinal', 'Ornamental', 'Spices', 'Others'];

// Diverse selection of high-quality SVG tree sapling presets to simulate genuine camera photo capture
const MOCK_SAPLING_IMAGES = [
  // Fruit Sapling
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23ECFDF5"/><circle cx="50" cy="50" r="40" fill="%23D1FAE5"/><path d="M50 85 V35" stroke="%2378350F" stroke-width="4" stroke-linecap="round"/><path d="M50 45 C35 40, 30 25, 50 30" fill="%2310B981"/><path d="M50 55 C65 50, 70 35, 50 40" fill="%23047857"/><path d="M50 35 C40 20, 60 20, 50 35" fill="%23059669"/><circle cx="62" cy="48" r="4" fill="%23EF4444"/><circle cx="38" cy="42" r="3" fill="%23EF4444"/><text x="50" y="95" font-family="sans-serif" font-size="8" font-weight="bold" fill="%23047857" text-anchor="middle">MOCK CAMERA CAPTURE</text></svg>`,
  // Timber Sapling
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23F0FDF4"/><circle cx="50" cy="50" r="40" fill="%23DCFCE7"/><path d="M50 85 V25" stroke="%235B21B6" stroke-width="3" stroke-linecap="round"/><path d="M50 35 Q30 30 40 45" stroke="%2315803D" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M50 48 Q70 45 60 60" stroke="%23166534" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M50 25 Q35 15 50 10" stroke="%2315803D" stroke-width="3" fill="none" stroke-linecap="round"/><text x="50" y="95" font-family="sans-serif" font-size="8" font-weight="bold" fill="%2315803D" text-anchor="middle">FORESTRY SAPLING</text></svg>`,
  // Medicinal Plant
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23FFFBEB"/><circle cx="50" cy="50" r="40" fill="%23FEF3C7"/><path d="M50 85 V45" stroke="%2378350F" stroke-width="3"/><path d="M50 45 Q35 35, 42 22 Q50 32, 50 45 Z" fill="%2310B981" stroke="%23047857" stroke-width="1"/><path d="M50 55 Q65 48, 58 35 Q50 45, 50 55 Z" fill="%23059669" stroke="%23047857" stroke-width="1"/><text x="50" y="95" font-family="sans-serif" font-size="8" font-weight="bold" fill="%2378350F" text-anchor="middle">MEDICINAL HERB</text></svg>`,
];

export default function StepPlantRecords() {
  const { activeSubmission, updateActiveSubmission, updateActiveSite, activeSiteIndex, setActiveSiteIndex, setViewMode, language, t } = useApp();
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  if (!activeSubmission || activeSubmission.sites.length === 0) return null;

  const currentSite = activeSubmission.sites[activeSiteIndex] || activeSubmission.sites[activeSubmission.sites.length - 1];

  // Helper to initialize an empty plant
  const createEmptyPlant = (): Plant => ({
    plant_id: 'PL-' + Math.floor(100000 + Math.random() * 900000),
    site_id: currentSite.site_id,
    category: 'Fruit',
    species: '',
    variety: '',
    plantation_date: new Date().toISOString().split('T')[0],
    seedling_age: language === 'en' ? '6 Months' : '৬ মাস',
    quantity: 1,
    photos: [],
    validation_status: 'Pending',
  });

  // If plants are empty, initialize with 1 card by default
  if (currentSite.plants.length === 0) {
    updateActiveSite((prev) => ({
      ...prev,
      plants: [createEmptyPlant()],
    }));
  }

  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 4000);
  };

  const triggerInfo = (msg: string) => {
    setInfoMsg(msg);
    setTimeout(() => setInfoMsg(null), 6000);
  };

  const handleUpdatePlant = (index: number, fields: Partial<Plant>) => {
    updateActiveSite((prev) => {
      const updatedPlants = [...prev.plants];
      updatedPlants[index] = { ...updatedPlants[index], ...fields };
      return {
        ...prev,
        plants: updatedPlants,
      };
    });
  };

  const handleRemovePlant = (index: number) => {
    if (currentSite.plants.length <= 1) {
      triggerError(language === 'en' 
        ? 'At least one plant card must exist on a plantation site.' 
        : 'একটি বনায়ন সাইটে অন্তত একটি চারাগাছ কার্ড থাকতে হবে।'
      );
      return;
    }
    updateActiveSite((prev) => {
      const updatedPlants = prev.plants.filter((_, i) => i !== index);
      return {
        ...prev,
        plants: updatedPlants,
      };
    });
  };

  // Add plant entry point
  const handleAddAnotherPlantClick = () => {
    setShowBranchModal(true);
  };

  // Option A: Add to the Same Site
  const handleSameSiteConfirm = () => {
    updateActiveSite((prev) => ({
      ...prev,
      plants: [...prev.plants, createEmptyPlant()],
    }));
    setShowBranchModal(false);
  };

  // Option B: Add to a Different Site
  const handleDifferentSiteConfirm = () => {
    const nextSubId = activeSubmission.submission_id;
    const newSiteId = 'SITE-' + Math.floor(100000 + Math.random() * 900000);

    const newSite: PlantationSite = {
      site_id: newSiteId,
      submission_id: nextSubId,
      plantation_type: 'Single Tree',
      latitude: parseFloat((currentSite.latitude + 0.001).toFixed(7)), // shift coordinates slightly
      longitude: parseFloat((currentSite.longitude + 0.001).toFixed(7)),
      radius: null,
      polygon: null,
      area: null,
      perimeter: null,
      centroid: null,
      address: currentSite.address, // pre-populate with current address
      division: currentSite.division,
      district: currentSite.district,
      upazila: currentSite.upazila,
      union: currentSite.union,
      village: currentSite.village,
      road: currentSite.road || '',
      postcode: currentSite.postcode,
      ndvi: 0,
      carbon_estimate: 0,
      geofence_score: 0,
      geofence_details: null,
      plants: [], // will initialize with empty card in step 2
      personnel: currentSite.personnel ? { ...currentSite.personnel, site_id: newSiteId } : null,
    };

    updateActiveSubmission((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sites: [...prev.sites, newSite],
      };
    });

    // Set the new index as active
    setTimeout(() => {
      setActiveSiteIndex(activeSubmission.sites.length);
    }, 10);

    // Reset wizard back to step 1 for the newly created site!
    setShowBranchModal(false);
    setViewMode('wizard'); // Ensure it redirects back to map coordinates
    triggerInfo(language === 'en'
      ? 'A new Plantation Site has been appended. Please verify the GPS coordinates and boundary parameters on the map.'
      : 'একটি নতুন বনায়ন সাইট যুক্ত করা হয়েছে। অনুগ্রহ করে মানচিত্রে জিপিএস স্থানাঙ্ক এবং সীমানা চেক করুন।'
    );
  };

  // Camera file capture simulator
  const simulatePhotoUpload = (plantIndex: number) => {
    const currentPhotos = currentSite.plants[plantIndex].photos || [];
    if (currentPhotos.length >= 3) {
      triggerError(language === 'en' 
        ? 'Maximum of 3 photographs allowed per plant card.'
        : 'প্রতিটি চারাগাছ কার্ডের জন্য সর্বাধিক ৩টি ছবি আপলোড করা যাবে।'
      );
      return;
    }

    // Select random visual sapling seed SVG
    const randomIndex = Math.floor(Math.random() * MOCK_SAPLING_IMAGES.length);
    const mockDataUri = MOCK_SAPLING_IMAGES[randomIndex];

    handleUpdatePlant(plantIndex, {
      photos: [...currentPhotos, mockDataUri],
    });
  };

  // Standard local device image upload
  const handleLocalImageUpload = (plantIndex: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const currentPhotos = currentSite.plants[plantIndex].photos || [];
    if (currentPhotos.length >= 3) {
      triggerError(language === 'en' 
        ? 'Maximum of 3 photographs allowed per plant card.'
        : 'প্রতিটি চারাগাছ কার্ডের জন্য সর্বাধিক ৩টি ছবি আপলোড করা যাবে।'
      );
      return;
    }

    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const base64Str = reader.result as string;
      handleUpdatePlant(plantIndex, {
        photos: [...currentPhotos, base64Str],
      });
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (plantIndex: number, photoIndex: number) => {
    const currentPhotos = currentSite.plants[plantIndex].photos || [];
    const nextPhotos = currentPhotos.filter((_, i) => i !== photoIndex);
    handleUpdatePlant(plantIndex, {
      photos: nextPhotos,
    });
  };

  // Determine current quantity category for validation advice
  const totalQuantity = currentSite.plants.reduce((sum, p) => sum + p.quantity, 0);

  const getTranslatedCategory = (cat: string) => {
    switch (cat) {
      case 'Fruit': return language === 'en' ? 'Fruit' : 'ফলদ';
      case 'Timber': return language === 'en' ? 'Timber' : 'বনজ';
      case 'Medicinal': return language === 'en' ? 'Medicinal' : 'ঔষধি';
      case 'Ornamental': return language === 'en' ? 'Ornamental' : 'শোভাবর্ধনকারী';
      case 'Spices': return language === 'en' ? 'Spices' : 'মসলা';
      case 'Others': return language === 'en' ? 'Others' : 'অন্যান্য';
      default: return cat;
    }
  };

  const getTranslatedType = (type: string) => {
    if (type === 'Single Tree') return t('type_single');
    if (type === 'Small Plantation') return t('type_small');
    return t('type_orchard');
  };

  return (
    <div className="flex flex-col gap-4">
      <SiteRegistryPanel />
      <div className="flex flex-col gap-6 animate-fadeIn text-left">
      {/* Dynamic Toast notifications in context */}
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-bold text-rose-800 flex items-center gap-2 animate-fadeIn">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {infoMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{infoMsg}</span>
        </div>
      )}

      {/* Smart Helper Header banner */}
      <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="flex flex-col text-xs text-emerald-800 leading-relaxed">
          <span className="font-bold text-emerald-950">
            {language === 'en' ? "Active Site Inventory Check" : "সক্রিয় সাইট তালিকা পর্যালোচনা"}
          </span>
          <span>
            {language === 'en' ? (
              <>
                You have declared <strong>{getTranslatedType(currentSite.plantation_type)}</strong>. Current total plants: <strong>{totalQuantity}</strong>. 
                {currentSite.plantation_type === 'Single Tree' && ' Perfect! (Requires exactly 1 plant)'}
                {currentSite.plantation_type === 'Small Plantation' && ' Perfect! (Requires between 2 and 20 plants)'}
                {currentSite.plantation_type === 'Orchard / Large Plantation' && ' Perfect! (Polygon mandatory. Requires greater than 20 plants)'}
              </>
            ) : (
              <>
                আপনি নির্বাচন করেছেন <strong>{getTranslatedType(currentSite.plantation_type)}</strong>। বর্তমানে চারাগাছের মোট সংখ্যা: <strong>{totalQuantity}টি</strong>। 
                {currentSite.plantation_type === 'Single Tree' && ' সঠিক! (অবশ্যই ১টি গাছ হতে হবে)'}
                {currentSite.plantation_type === 'Small Plantation' && ' সঠিক! (২ থেকে ২০টি গাছের মধ্যে হতে হবে)'}
                {currentSite.plantation_type === 'Orchard / Large Plantation' && ' সঠিক! (অবশ্যই ২০টির বেশি গাছ এবং সীমানা নির্দেশক বহুভুজ হতে হবে)'}
              </>
            )}
          </span>
        </div>
      </div>

      {/* PLANT CARDS LIST */}
      <div className="flex flex-col gap-5">
        {currentSite.plants.map((plant, index) => (
          <div
            key={plant.plant_id}
            className="p-5 border border-neutral-200 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4 relative"
          >
            {/* Header / Delete button */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <span className="text-xs font-bold text-neutral-400 font-mono">
                {language === 'en' ? `PLANT CARD #${index + 1}` : `চারাগাছ কার্ড #${index + 1}`}
              </span>
              {currentSite.plants.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemovePlant(index)}
                  className="flex items-center gap-1 text-red-600 hover:text-red-800 text-xs font-semibold cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  {language === 'en' ? "Remove Card" : "কার্ডটি মুছুন"}
                </button>
              )}
            </div>

            {/* Fields Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1 col-span-2 md:col-span-1">
                <span className="text-xs font-semibold text-neutral-600">{t('category')}</span>
                <select
                  value={plant.category}
                  onChange={(e) => handleUpdatePlant(index, { category: e.target.value })}
                  className="w-full text-xs py-2 px-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                >
                  {PLANT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {getTranslatedCategory(cat)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-neutral-600">{t('species')}</span>
                <input
                  type="text"
                  placeholder={language === 'en' ? "e.g. Mango / Mahogany / Neem" : "যেমন: আম / মেহগনি / নিম"}
                  value={plant.species}
                  onChange={(e) => handleUpdatePlant(index, { species: e.target.value })}
                  className="w-full text-xs py-2 px-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-neutral-600">{t('variety')}</span>
                <input
                  type="text"
                  placeholder={language === 'en' ? "e.g. Amrapali / Local" : "যেমন: আম্রপালি / দেশি"}
                  value={plant.variety}
                  onChange={(e) => handleUpdatePlant(index, { variety: e.target.value })}
                  className="w-full text-xs py-2 px-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-neutral-600">{t('plantation_date')}</span>
                <input
                  type="date"
                  value={plant.plantation_date}
                  onChange={(e) => handleUpdatePlant(index, { plantation_date: e.target.value })}
                  className="w-full text-xs py-2 px-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-neutral-600">{t('seedling_age')}</span>
                <input
                  type="text"
                  placeholder={language === 'en' ? "e.g. 6 Months / 1 Year" : "যেমন: ৬ মাস / ১ বছর"}
                  value={plant.seedling_age}
                  onChange={(e) => handleUpdatePlant(index, { seedling_age: e.target.value })}
                  className="w-full text-xs py-2 px-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-neutral-600">{t('quantity')}</span>
                <input
                  type="number"
                  min="1"
                  value={plant.quantity || ''}
                  onChange={(e) => handleUpdatePlant(index, { quantity: parseInt(e.target.value) || 1 })}
                  className="w-full text-xs py-2 px-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                />
              </div>
            </div>

            {/* Photos Upload Section */}
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-600">
                  {language === 'en' ? "Plant Verification Photos (Max 3)" : "চারাগাছ যাচাইকরণের ছবি (সর্বাধিক ৩টি)"}
                </span>
                <span className="text-[10px] text-neutral-400">
                  {language === 'en' ? 'Photos:' : 'ছবি:'} {plant.photos?.length || 0}/3
                </span>
              </div>

              <div className="flex flex-wrap gap-3 items-center">
                {/* Visual rendering of uploaded base64 / preset photos */}
                {plant.photos &&
                  plant.photos.map((src, photoIdx) => (
                    <div key={photoIdx} className="relative h-20 w-20 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 shadow-sm group">
                      <img src={src} alt="Plant thumbnail" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(index, photoIdx)}
                        className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-600/95 hover:bg-red-700 text-white flex items-center justify-center text-[10px] shadow transition-colors cursor-pointer font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                {(!plant.photos || plant.photos.length < 3) && (
                  <div className="flex gap-2">
                    {/* Simulated Camera click */}
                    <button
                      type="button"
                      onClick={() => simulatePhotoUpload(index)}
                      className="h-20 w-20 rounded-lg border-2 border-dashed border-neutral-300 hover:border-emerald-500 bg-neutral-50 hover:bg-emerald-50/20 flex flex-col items-center justify-center text-neutral-500 hover:text-emerald-700 transition-all text-[10px] font-semibold gap-1.5 cursor-pointer"
                    >
                      <Camera className="h-5 w-5 text-neutral-400 group-hover:text-emerald-600" />
                      {language === 'en' ? 'Simulate Camera' : 'ক্যামেরা সিমুলেশন'}
                    </button>

                    {/* Standard Gallery selection */}
                    <label className="h-20 w-20 rounded-lg border-2 border-dashed border-neutral-300 hover:border-blue-500 bg-neutral-50 hover:bg-blue-50/20 flex flex-col items-center justify-center text-neutral-500 hover:text-blue-700 transition-all text-[10px] font-semibold gap-1.5 cursor-pointer">
                      <Image className="h-5 w-5 text-neutral-400" />
                      {language === 'en' ? 'Choose Photo' : 'ছবি নির্বাচন'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleLocalImageUpload(index, e)}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER BUTTONS: Branching decision trigger */}
      <div className="flex justify-center mt-4">
        <button
          type="button"
          onClick={handleAddAnotherPlantClick}
          className="flex items-center gap-1.5 py-2.5 px-6 border-2 border-emerald-600 text-emerald-800 hover:bg-emerald-50 text-sm font-bold rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          {language === 'en' ? "Add Another Plant Card" : "আরেকটি চারাগাছ কার্ড যুক্ত করুন"}
        </button>
      </div>

      {/* COGNITIVE REUSE / SMART BRANCHING DIALOG MODAL */}
      {showBranchModal && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-100 p-6 flex flex-col gap-4 animate-scaleUp">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-full bg-emerald-50 text-emerald-700 shrink-0">
                <HelpCircle className="h-6 w-6" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-bold text-neutral-900">
                  {language === 'en' ? "Plant Inventory Branching" : "চারাগাছ তালিকার শাখা-বিন্যাস"}
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {language === 'en'
                    ? "Is this new plant located at the same physical plantation site or a different physical location?"
                    : "এই নতুন চারাগাছটি কি একই স্থানে অবস্থিত নাকি ভিন্ন আরেকটি নতুন রোপণ সাইটে অবস্থিত?"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3.5 mt-2">
              <button
                type="button"
                onClick={handleSameSiteConfirm}
                className="flex items-start justify-between p-3.5 rounded-xl border border-neutral-200 hover:border-emerald-500 hover:bg-emerald-50/20 text-left transition-all cursor-pointer"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-neutral-900">
                    {language === 'en' ? "Same Plantation Site" : "একই রোপণ সাইট"}
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    {language === 'en'
                      ? "Reuses current GPS coordinates, boundaries, satellite NDVI, and address details."
                      : "বর্তমান জিপিএস স্থানাঙ্ক, সীমানা, স্যাটেলাইট এনডিভিআই এবং ঠিকানা তথ্য পুনরায় ব্যবহার করবে।"}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-emerald-600 shrink-0 mt-1" />
              </button>

              <button
                type="button"
                onClick={handleDifferentSiteConfirm}
                className="flex items-start justify-between p-3.5 rounded-xl border border-neutral-200 hover:border-blue-500 hover:bg-blue-50/20 text-left transition-all cursor-pointer"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-neutral-900">
                    {language === 'en' ? "Different Plantation Site" : "ভিন্ন নতুন রোপণ সাইট"}
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    {language === 'en'
                      ? "Creates a separate site record. Backtracks to Step 1 to map new coordinates."
                      : "একটি নতুন সম্পূর্ণ আলাদা সাইট রেকর্ড তৈরি করবে এবং মানচিত্র ধাপে ফেরত যাবে।"}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-blue-600 shrink-0 mt-1" />
              </button>
            </div>

            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={() => setShowBranchModal(false)}
                className="py-2 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                {language === 'en' ? 'Cancel' : 'বাতিল'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
