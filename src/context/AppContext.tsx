/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Submission, PlantationSite, Plant, Personnel, SubmissionStatus, OfflineSyncQueueItem, PlantationType } from '../types';
import { dbService } from '../services/db';
import { environmentalService } from '../services/environmental';
import { validationEngine } from '../services/validation';
import { translations } from './translations';

interface AppContextType {
  submissions: Submission[];
  syncQueue: OfflineSyncQueueItem[];
  activeSubmission: Submission | null;
  currentStep: number;
  online: boolean;
  isSyncing: boolean;
  viewMode: 'dashboard' | 'wizard' | 'validator' | 'details' | 'database';
  selectedSubmissionId: string | null;
  userProfile: {
    id: string;
    name: string;
    office: string;
  };
  language: 'en' | 'bn';
  setLanguage: (lang: 'en' | 'bn') => void;
  t: (key: string) => string;
  startNewSubmission: () => void;
  loadSubmissionToWizard: (submissionId: string) => void;
  updateActiveSite: (updater: (site: PlantationSite) => PlantationSite) => void;
  updateActiveSubmission: (updater: (sub: Submission) => Submission) => void;
  nextStep: () => boolean;
  prevStep: () => void;
  saveActiveAsDraft: () => Promise<void>;
  submitActiveSubmission: () => Promise<void>;
  syncOfflineQueue: () => Promise<void>;
  deleteSubmission: (id: string) => Promise<void>;
  runValidationAction: (submissionId: string, status: 'Approved' | 'Rejected') => Promise<void>;
  setViewMode: (mode: 'dashboard' | 'wizard' | 'validator' | 'details' | 'database') => void;
  setSelectedSubmissionId: (id: string | null) => void;
  triggerMockOnlineToggle: () => void;
  activeSiteIndex: number;
  setActiveSiteIndex: (idx: number) => void;
  addSiteToActiveSubmission: (type?: PlantationType) => void;
  deleteSiteFromActiveSubmission: (idx: number) => void;
  duplicateSiteInActiveSubmission: (idx: number) => void;
  reorderSitesInActiveSubmission: (idx1: number, idx2: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [syncQueue, setSyncQueue] = useState<OfflineSyncQueueItem[]>([]);
  const [activeSubmission, setActiveSubmission] = useState<Submission | null>(null);
  const [activeSiteIndex, setActiveSiteIndex] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [online, setOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'dashboard' | 'wizard' | 'validator' | 'details' | 'database'>('dashboard');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  
  // Set default language to Bengali ('bn') to make the app Bangla by default!
  const [language, setLanguageState] = useState<'en' | 'bn'>(() => {
    const saved = localStorage.getItem('plantation_ledger_lang');
    return (saved === 'en' || saved === 'bn') ? saved : 'bn';
  });

  const setLanguage = (lang: 'en' | 'bn') => {
    setLanguageState(lang);
    localStorage.setItem('plantation_ledger_lang', lang);
  };

  const t = (key: string): string => {
    const dict = translations[language] || translations['bn'];
    return (dict as any)[key] || key;
  };

  // Government Field Officer profile (Mithun Islam, matching metadata email prefix)
  const userProfile = {
    id: 'FSO-2026-3814',
    name: 'Mithun Islam',
    office: 'Savar Upazila Agriculture Extension Office, Dhaka',
  };

  // 1. Initial Data Loading
  useEffect(() => {
    refreshData();

    // Setup network listeners
    const handleOnline = () => {
      setOnline(true);
      // Automatically trigger sync when coming online
      syncOfflineQueue();
    };
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshData = async () => {
    try {
      const subs = await dbService.getAllSubmissions();
      setSubmissions(subs);
      const queue = await dbService.getSyncQueue();
      setSyncQueue(queue);
    } catch (err) {
      console.error('Error reading database records:', err);
    }
  };

  // 2. Autosave triggers whenever activeSubmission changes (throttled/debounced via simple effects)
  useEffect(() => {
    if (activeSubmission && activeSubmission.status === 'Draft') {
      const timer = setTimeout(() => {
        dbService.saveSubmission(activeSubmission).then(() => {
          // Silent background refresh
          dbService.getAllSubmissions().then(setSubmissions);
        });
      }, 1000); // Autosave after 1 second of inactivity
      return () => clearTimeout(timer);
    }
  }, [activeSubmission]);

  // Manual toggle for simulation of online/offline in preview environment
  const triggerMockOnlineToggle = () => {
    setOnline((prev) => {
      const next = !prev;
      if (next) {
        // Trigger sync if toggled to online
        setTimeout(() => syncOfflineQueue(), 100);
      }
      return next;
    });
  };

  // 3. Initiate brand new submission hierarchy
  const startNewSubmission = () => {
    const subId = 'SUB-' + Math.floor(100000 + Math.random() * 900000);
    const siteId = 'SITE-' + Math.floor(100000 + Math.random() * 900000);

    const defaultSite: PlantationSite = {
      site_id: siteId,
      submission_id: subId,
      plantation_type: 'Single Tree',
      latitude: 23.8103, // Dhaka default
      longitude: 90.4125,
      radius: null,
      polygon: null,
      area: null,
      perimeter: null,
      centroid: null,
      address: '',
      division: '',
      district: '',
      upazila: '',
      union: '',
      village: '',
      road: '',
      postcode: '',
      ndvi: 0,
      carbon_estimate: 0,
      geofence_score: 0,
      geofence_details: null,
      plants: [],
      personnel: null,
    };

    const newSub: Submission = {
      submission_id: subId,
      submitted_by_id: userProfile.id,
      submitted_by_name: userProfile.name,
      office: userProfile.office,
      submitted_at: Date.now(),
      status: 'Draft',
      sites: [defaultSite],
    };

    setActiveSubmission(newSub);
    setActiveSiteIndex(0);
    setCurrentStep(1);
    setViewMode('wizard');
  };

  // Load draft to the wizard
  const loadSubmissionToWizard = (submissionId: string) => {
    const found = submissions.find((s) => s.submission_id === submissionId);
    if (found && found.status === 'Draft') {
      setActiveSubmission(found);
      setActiveSiteIndex(0);
      setCurrentStep(1);
      setViewMode('wizard');
    }
  };

  // 4. Update helper closures
  const updateActiveSubmission = (updater: (sub: Submission) => Submission) => {
    setActiveSubmission((prev) => (prev ? updater(prev) : null));
  };

  const updateActiveSite = (updater: (site: PlantationSite) => PlantationSite) => {
    setActiveSubmission((prev) => {
      if (!prev || prev.sites.length === 0) return prev;
      const updatedSites = [...prev.sites];
      const activeIdx = activeSiteIndex < updatedSites.length ? activeSiteIndex : updatedSites.length - 1;
      if (activeIdx >= 0) {
        updatedSites[activeIdx] = updater(updatedSites[activeIdx]);
      }
      return {
        ...prev,
        sites: updatedSites,
      };
    });
  };

  // Multi-Site operations
  const addSiteToActiveSubmission = (type: PlantationType = 'Single Tree') => {
    if (!activeSubmission) return;
    const siteId = 'SITE-' + Math.floor(100000 + Math.random() * 900000);
    const prevSite = activeSubmission.sites[activeSiteIndex] || activeSubmission.sites[0] || {};
    const newSite: PlantationSite = {
      site_id: siteId,
      submission_id: activeSubmission.submission_id,
      plantation_type: type,
      latitude: (prevSite.latitude || 23.8103) + 0.001,
      longitude: (prevSite.longitude || 90.4125) + 0.001,
      radius: null,
      polygon: null,
      area: null,
      perimeter: null,
      centroid: null,
      address: prevSite.address || '',
      division: prevSite.division || '',
      district: prevSite.district || '',
      upazila: prevSite.upazila || '',
      union: prevSite.union || '',
      village: prevSite.village || '',
      road: prevSite.road || '',
      postcode: prevSite.postcode || '',
      ndvi: 0,
      carbon_estimate: 0,
      geofence_score: 0,
      geofence_details: null,
      plants: [],
      personnel: prevSite.personnel ? { ...prevSite.personnel, site_id: siteId } : null,
    };
    setActiveSubmission((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sites: [...prev.sites, newSite],
      };
    });
    setActiveSiteIndex(activeSubmission.sites.length);
  };

  const deleteSiteFromActiveSubmission = (idx: number) => {
    if (!activeSubmission) return;
    if (activeSubmission.sites.length <= 1) {
      alert(language === 'en' ? 'A submission must contain at least one site.' : 'একটি সাবমিশনে কমপক্ষে একটি সাইট থাকতে হবে।');
      return;
    }
    setActiveSubmission((prev) => {
      if (!prev) return prev;
      const updated = prev.sites.filter((_, i) => i !== idx);
      return {
        ...prev,
        sites: updated,
      };
    });
    setActiveSiteIndex((prev) => {
      if (prev >= activeSubmission.sites.length - 1) {
        return Math.max(0, activeSubmission.sites.length - 2);
      }
      return prev;
    });
  };

  const duplicateSiteInActiveSubmission = (idx: number) => {
    if (!activeSubmission) return;
    const sourceSite = activeSubmission.sites[idx];
    if (!sourceSite) return;
    const siteId = 'SITE-' + Math.floor(100000 + Math.random() * 900000);
    const duplicatedSite: PlantationSite = {
      ...sourceSite,
      site_id: siteId,
      plants: sourceSite.plants.map((p) => ({
        ...p,
        plant_id: 'PL-' + Math.floor(100000 + Math.random() * 900000),
        site_id: siteId,
      })),
      personnel: sourceSite.personnel ? { ...sourceSite.personnel, site_id: siteId } : null,
    };
    setActiveSubmission((prev) => {
      if (!prev) return prev;
      const updated = [...prev.sites];
      updated.splice(idx + 1, 0, duplicatedSite);
      return {
        ...prev,
        sites: updated,
      };
    });
    setActiveSiteIndex(idx + 1);
  };

  const reorderSitesInActiveSubmission = (idx1: number, idx2: number) => {
    if (!activeSubmission) return;
    const sites = [...activeSubmission.sites];
    if (idx1 < 0 || idx1 >= sites.length || idx2 < 0 || idx2 >= sites.length) return;
    const [temp] = sites.splice(idx1, 1);
    sites.splice(idx2, 0, temp);
    setActiveSubmission((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sites,
      };
    });
    setActiveSiteIndex(idx2);
  };

  // 5. Navigation & Validation checks before step completion
  const nextStep = (): boolean => {
    if (!activeSubmission) return false;

    const currentSite = activeSubmission.sites[activeSiteIndex] || activeSubmission.sites[activeSubmission.sites.length - 1];

    if (currentStep === 1) {
      // Step 1 validation: Needs GPS coordinates and administrative details
      if (!currentSite.latitude || !currentSite.longitude) {
        alert(t('alert_precise_gps'));
        return false;
      }
      if (!currentSite.division || !currentSite.district || !currentSite.upazila) {
        alert(t('alert_admin_details'));
        return false;
      }
      if (currentSite.plantation_type === 'Orchard / Large Plantation' && (!currentSite.polygon || currentSite.polygon.length < 3)) {
        alert(t('alert_orchard_poly'));
        return false;
      }

      // Automatically calculate environment and geo-fence score on transition from Step 1
      Promise.all([
        environmentalService.calculateNDVI(currentSite.latitude, currentSite.longitude),
        environmentalService.estimateCarbon(currentSite.latitude, currentSite.longitude, 1),
      ]).then(([ndviResult, carbonResult]) => {
        updateActiveSite((site) => {
          const updatedSite = {
            ...site,
            ndvi: ndviResult.value,
            carbon_estimate: carbonResult.tonnesPerHa,
          };
          // Run validation engine
          const scoreResult = validationEngine.validateSite(updatedSite);
          return {
            ...updatedSite,
            geofence_score: scoreResult.score,
            geofence_details: scoreResult,
          };
        });
      });
    }

    if (currentStep === 2) {
      // Step 2 validation: Needs at least 1 plant card, with quantity corresponding to types
      if (currentSite.plants.length === 0) {
        alert(t('alert_add_plant'));
        return false;
      }

      // Check quantities matching types
      const totalPlants = currentSite.plants.reduce((sum, p) => sum + p.quantity, 0);
      if (currentSite.plantation_type === 'Single Tree' && totalPlants !== 1) {
        alert(t('alert_single_tree_qty'));
        return false;
      }
      if (currentSite.plantation_type === 'Small Plantation' && (totalPlants < 2 || totalPlants > 20)) {
        alert(t('alert_small_qty'));
        return false;
      }
      if (currentSite.plantation_type === 'Orchard / Large Plantation' && totalPlants <= 20) {
        alert(t('alert_large_qty'));
        return false;
      }
    }

    if (currentStep === 3) {
      // Step 3 validation: Personnel verification
      if (!currentSite.personnel || !currentSite.personnel.planter_name || !currentSite.personnel.planter_mobile) {
        alert(t('alert_personnel_planter'));
        return false;
      }
      if (!currentSite.personnel.caretaker_name || !currentSite.personnel.caretaker_mobile) {
        alert(t('alert_personnel_caretaker'));
        return false;
      }
    }

    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
      // Ensure that all entered data is saved locally using IndexedDB after each step of the wizard
      dbService.saveSubmission(activeSubmission).then(() => {
        dbService.getAllSubmissions().then(setSubmissions);
      });
      return true;
    }

    return false;
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      // Save progress to draft when moving backwards
      dbService.saveSubmission(activeSubmission).then(() => {
        dbService.getAllSubmissions().then(setSubmissions);
      });
    }
  };

  // 6. Explicitly save draft
  const saveActiveAsDraft = async () => {
    if (activeSubmission) {
      const draftSub: Submission = {
        ...activeSubmission,
        status: 'Draft',
      };
      await dbService.saveSubmission(draftSub);
      await refreshData();
      setActiveSubmission(null);
      setViewMode('dashboard');
    }
  };

  // 7. Submit submission to DB & Sync queue
  const submitActiveSubmission = async () => {
    if (!activeSubmission) return;

    // Run final geo-fence validation score matching actual plants quantity
    const sites = activeSubmission.sites.map((site) => {
      const validation = validationEngine.validateSite(site);
      return {
        ...site,
        geofence_score: validation.score,
        geofence_details: validation,
      };
    });

    const isCurrentlyOnline = online;
    const finalStatus: SubmissionStatus = isCurrentlyOnline ? 'Validation Pending' : 'Sync Pending';

    const submittedSub: Submission = {
      ...activeSubmission,
      status: finalStatus,
      submitted_at: Date.now(),
      sites,
    };

    // Save to IndexedDB
    await dbService.saveSubmission(submittedSub);

    // If offline, add to offline queue
    if (!isCurrentlyOnline) {
      const queueItem: OfflineSyncQueueItem = {
        queue_id: 'Q-' + Math.floor(100000 + Math.random() * 900000),
        submission_id: submittedSub.submission_id,
        timestamp: Date.now(),
        attempts: 0,
      };
      await dbService.addToSyncQueue(queueItem);
    }

    await refreshData();
    setActiveSubmission(null);
    setViewMode('dashboard');
  };

  // 8. Offline synchronization routine
  const syncOfflineQueue = async () => {
    if (isSyncing || !navigator.onLine) return;

    const queue = await dbService.getSyncQueue();
    if (queue.length === 0) return;

    setIsSyncing(true);

    for (const item of queue) {
      try {
        const sub = await dbService.getSubmission(item.submission_id);
        if (sub) {
          // Simulate server network latency for upload
          await new Promise((resolve) => setTimeout(resolve, 1200));

          // Run final cloud verification and set status to "Validation Pending"
          const updatedSites = sub.sites.map((site) => {
            const validation = validationEngine.validateSite(site);
            return {
              ...site,
              geofence_score: validation.score,
              geofence_details: validation,
            };
          });

          const syncedSub: Submission = {
            ...sub,
            status: 'Validation Pending',
            sites: updatedSites,
          };

          await dbService.saveSubmission(syncedSub);
          await dbService.removeFromSyncQueue(item.queue_id);
        }
      } catch (err) {
        console.error(`Sync failed for submission ${item.submission_id}:`, err);
        // Increment attempts
        item.attempts += 1;
        item.last_error = String(err);
        await dbService.addToSyncQueue(item);
      }
    }

    await refreshData();
    setIsSyncing(false);
  };

  // 9. Validation Workflows for SAAO / Validator Admin Dashboard
  const runValidationAction = async (submissionId: string, status: 'Approved' | 'Rejected') => {
    const sub = await dbService.getSubmission(submissionId);
    if (sub) {
      const nextStatus: SubmissionStatus = status;
      const updatedSub: Submission = {
        ...sub,
        status: nextStatus,
        sites: sub.sites.map((site) => ({
          ...site,
          plants: site.plants.map((plant) => ({
            ...plant,
            validation_status: status === 'Approved' ? 'Valid' : 'Invalid',
          })),
        })),
      };

      await dbService.saveSubmission(updatedSub);
      await refreshData();
    }
  };

  // Delete draft or record
  const deleteSubmission = async (id: string) => {
    // If in sync queue, remove there too
    const queue = await dbService.getSyncQueue();
    const queueItem = queue.find((q) => q.submission_id === id);
    if (queueItem) {
      await dbService.removeFromSyncQueue(queueItem.queue_id);
    }
    await dbService.deleteSubmission(id);
    await refreshData();
  };

  return (
    <AppContext.Provider
      value={{
        submissions,
        syncQueue,
        activeSubmission,
        currentStep,
        online,
        isSyncing,
        viewMode,
        selectedSubmissionId,
        userProfile,
        language,
        setLanguage,
        t,
        startNewSubmission,
        loadSubmissionToWizard,
        updateActiveSite,
        updateActiveSubmission,
        nextStep,
        prevStep,
        saveActiveAsDraft,
        submitActiveSubmission,
        syncOfflineQueue,
        deleteSubmission,
        runValidationAction,
        setViewMode,
        setSelectedSubmissionId,
        triggerMockOnlineToggle,
        activeSiteIndex,
        setActiveSiteIndex,
        addSiteToActiveSubmission,
        deleteSiteFromActiveSubmission,
        duplicateSiteInActiveSubmission,
        reorderSitesInActiveSubmission,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
