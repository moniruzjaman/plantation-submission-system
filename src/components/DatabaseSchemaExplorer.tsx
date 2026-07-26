/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { dbService } from '../services/db';
import { 
  Database, RefreshCw, Layers, ShieldCheck, HelpCircle, 
  MapPin, PlusCircle, Trash2, Eye, Compass, Bell, AlertCircle, FileText, QrCode
} from 'lucide-react';
import { 
  Species, User, GeoFence, PlantPhoto, ValidationTask, Inspection, 
  NDVIHistory, CarbonHistory, Notification, AuditLog, SyncQueue, QRCode,
  Division, District, Upazila, UnionBoundary
} from '../types';

type SelectedTableType = 
  | 'users' | 'species' | 'geofences' | 'plant_photos' | 'validation_tasks' 
  | 'inspections' | 'ndvi_history' | 'carbon_history' | 'notifications' 
  | 'audit_logs' | 'sync_queues' | 'qr_codes' | 'administrative';

export default function DatabaseSchemaExplorer() {
  const { language, t } = useApp();
  const [selectedTable, setSelectedTable] = useState<SelectedTableType>('species');
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'explorer' | 'diagram'>('diagram');
  const [syncStatus, setSyncStatus] = useState({ syncing: false, message: '' });

  // Load records for selected table
  const loadRecords = async () => {
    setLoading(true);
    try {
      let storeName = '';
      switch (selectedTable) {
        case 'users': storeName = 'users'; break;
        case 'species': storeName = 'species'; break;
        case 'geofences': storeName = 'geofences'; break;
        case 'plant_photos': storeName = 'plant_photos'; break;
        case 'validation_tasks': storeName = 'validation_tasks'; break;
        case 'inspections': storeName = 'inspections'; break;
        case 'ndvi_history': storeName = 'ndvi_history'; break;
        case 'carbon_history': storeName = 'carbon_history'; break;
        case 'notifications': storeName = 'notifications'; break;
        case 'audit_logs': storeName = 'audit_logs'; break;
        case 'sync_queues': storeName = 'sync_queues'; break;
        case 'qr_codes': storeName = 'qr_codes'; break;
        case 'administrative': storeName = 'divisions'; break;
      }
      
      let data = await dbService.getAllItems<any>(storeName);
      
      // For administrative, also fetch others to show combined
      if (selectedTable === 'administrative') {
        const districts = await dbService.getAllItems<District>('districts');
        const upazilas = await dbService.getAllItems<Upazila>('upazilas');
        const unions = await dbService.getAllItems<UnionBoundary>('unions');
        data = {
          divisions: data,
          districts,
          upazilas,
          unions
        } as any;
      }
      
      setRecords(Array.isArray(data) ? data : [data]);
    } catch (err) {
      console.error('Error reading records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [selectedTable]);

  // Insert mock records to demonstrate live database functionality
  const handleInsertMockRecord = async () => {
    const idSuffix = Math.floor(1000 + Math.random() * 9000);
    
    try {
      if (selectedTable === 'inspections') {
        const mockInspection: Inspection = {
          inspection_id: `INSP-${idSuffix}`,
          site_id: 'SITE-101',
          inspection_date: Date.now(),
          inspector_id: 'USR-002',
          inspector_name: 'Zakir Hossain',
          survival_count: 70,
          dead_count: 5,
          height: 1.42,
          canopy: 22,
          health_status: 'Good',
          remarks: 'Standard visual foliage healthy green. Secondary seedling supports inserted.'
        };
        await dbService.saveItem('inspections', mockInspection);
        
        // Log to AuditLog too
        await dbService.saveItem('audit_logs', {
          log_id: `LOG-${idSuffix}`,
          user_id: 'USR-002',
          user_name: 'Zakir Hossain',
          action: 'CREATE',
          entity: 'Inspection',
          entity_id: mockInspection.inspection_id,
          old_value: 'None',
          new_value: JSON.stringify(mockInspection),
          device: 'Samsung Galaxy Active Tab',
          gps: { lat: 23.8512, lng: 90.2641 },
          timestamp: Date.now()
        } as AuditLog);

      } else if (selectedTable === 'audit_logs') {
        const mockLog: AuditLog = {
          log_id: `LOG-${idSuffix}`,
          user_id: 'USR-001',
          user_name: 'Mithun Islam',
          action: 'SYNC',
          entity: 'Submission',
          entity_id: `SUB-${idSuffix}`,
          old_value: 'Sync Pending',
          new_value: 'Synced with regional DAE database',
          device: 'Motorola Toughbook',
          gps: { lat: 23.8512, lng: 90.2641 },
          timestamp: Date.now()
        };
        await dbService.saveItem('audit_logs', mockLog);

      } else if (selectedTable === 'notifications') {
        const mockNotif: Notification = {
          notification_id: `NOTIF-${idSuffix}`,
          recipient: 'USR-001',
          role: 'Planter',
          title: 'Satellite Survey Alert',
          message: 'Sentinel-2 visual path cleared. Next NDVI calculation queued.',
          status: 'Unread',
          created_at: Date.now(),
          read_at: null
        };
        await dbService.saveItem('notifications', mockNotif);

      } else if (selectedTable === 'ndvi_history') {
        const mockNdvi: NDVIHistory = {
          history_id: `NDVI-${idSuffix}`,
          site_id: 'SITE-101',
          date: Date.now(),
          ndvi: parseFloat((0.68 + Math.random() * 0.15).toFixed(3)),
          source: 'Sentinel-2 Satellite'
        };
        await dbService.saveItem('ndvi_history', mockNdvi);

        // Also add a corresponding CarbonHistory
        await dbService.saveItem('carbon_history', {
          history_id: `CARB-${idSuffix}`,
          site_id: 'SITE-101',
          date: Date.now(),
          carbon: parseFloat((24.5 + Math.random() * 5).toFixed(2)),
          method: 'NDVI-Derived Alometric'
        } as CarbonHistory);

      } else if (selectedTable === 'qr_codes') {
        const mockQr: QRCode = {
          qr_id: `QR-${idSuffix}`,
          site_id: 'SITE-101',
          qr_value: `DAE-BD-FOREST-SITE-101-SECURE-${idSuffix}`,
          generated_at: Date.now(),
          last_scanned: Date.now(),
          scan_count: 1
        };
        await dbService.saveItem('qr_codes', mockQr);
      } else {
        alert(language === 'en' 
          ? 'Adding new master data tables is restricted to retain relational integrity. Please choose Inspections, Audit Logs, Notifications, NDVI tracks, or QR codes!'
          : 'সম্পর্কগত বিশ্বস্ততা বজায় রাখতে মূল মাস্টার ডাটা টেবিল পরিবর্তন করা নিষিদ্ধ। অনুগ্রহ করে পরিদর্শন, অডিট লগ, বিজ্ঞপ্তি, NDVI হিস্ট্রি বা QR কোড নির্বাচন করুন!');
        return;
      }
      
      await loadRecords();
    } catch (err) {
      console.error(err);
    }
  };

  // Simulate central PostgreSQL server synchronization
  const handleSimulatePgSync = () => {
    setSyncStatus({ syncing: true, message: language === 'en' ? 'Authenticating with central PostGIS PostgreSQL Server...' : 'কেন্দ্রীয় PostGIS PostgreSQL সার্ভারের সাথে সংযোগ করা হচ্ছে...' });
    
    setTimeout(() => {
      setSyncStatus({ syncing: true, message: language === 'en' ? 'Verifying table spatial indexes (GIST) on GeoFence geometries...' : 'GeoFence জ্যামিতিতে স্পেশাল ইনডেক্স (GIST) যাচাই করা হচ্ছে...' });
      
      setTimeout(() => {
        setSyncStatus({ syncing: true, message: language === 'en' ? 'Pushing delta change vectors and compiling audit trails...' : 'ডেল্টা পরিবর্তনসমূহ প্রেরণ এবং অডিট ট্রেইল তৈরি করা হচ্ছে...' });
        
        setTimeout(() => {
          setSyncStatus({ syncing: false, message: language === 'en' ? 'Sync Completed! PostgreSQL database schemas and Spatial GIS indices updated.' : 'সিঙ্ক সম্পূর্ণ! পোস্টজিআইএস এবং রিলেশনাল পোস্টগ্রেএসকিউএল ডাটাবেস আপডেট করা হয়েছে।' });
        }, 1500);
      }, 1500);
    }, 1500);
  };

  // Format Unix Timestamp helper
  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString(language === 'en' ? 'en-US' : 'bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-4 text-left">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-neutral-800 flex items-center gap-2">
            <Database className="h-6 w-6 text-emerald-700" />
            {language === 'en' ? "Production Relational GIS Schema Explorer" : "প্রোডাকশন রিলেশনাল জিআইএস ডাটাবেস প্যানেল"}
          </h2>
          <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
            {language === 'en' 
              ? "Comprehensive architecture mapping of the offline IndexedDB client storage synchronized with the central PostgreSQL/PostGIS server database."
              : "সেন্ট্রাল PostgreSQL/PostGIS সার্ভার ডাটাবেসের সাথে সিঙ্ককৃত অফলাইন IndexedDB ক্লায়েন্ট স্টোরেজের সম্পূর্ণ আর্কিটেকচার ম্যাপিং ও ডাটাবেস ভিউয়ার।"}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            type="button"
            onClick={() => setViewMode('diagram')}
            className={`py-1.5 px-3.5 text-xs font-bold rounded-lg transition-all border cursor-pointer ${
              viewMode === 'diagram'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-xs'
                : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            {language === 'en' ? "ER Diagrams & Architecture" : "ইআর ডায়াগ্রাম এবং আর্কিটেকচার"}
          </button>
          <button
            type="button"
            onClick={() => setViewMode('explorer')}
            className={`py-1.5 px-3.5 text-xs font-bold rounded-lg transition-all border cursor-pointer ${
              viewMode === 'explorer'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-xs'
                : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            {language === 'en' ? "Browse Live Tables (IndexedDB)" : "টেবিল ডাটা ব্রাউজ করুন (IndexedDB)"}
          </button>
        </div>
      </div>

      {/* Synchronizer Simulator */}
      <div className="bg-gradient-to-r from-emerald-950 to-emerald-900 text-emerald-50 p-5 rounded-2xl shadow-md text-left flex flex-col md:flex-row items-center justify-between gap-4 border border-emerald-800">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-emerald-800 rounded-xl shrink-0">
            <RefreshCw className={`h-6 w-6 text-emerald-200 ${syncStatus.syncing ? 'animate-spin' : ''}`} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold text-white flex items-center gap-1.5">
              {language === 'en' ? "Spatial Sync Engine Simulation" : "স্পেশাল সিঙ্ক ইঞ্জিন সিমুলেশন"}
              <span className="text-[10px] bg-emerald-600 text-white font-mono px-1.5 py-0.5 rounded uppercase font-bold tracking-wide">
                PostGIS Ready
              </span>
            </span>
            <span className="text-xs text-emerald-200/80 leading-relaxed">
              {syncStatus.message || (
                language === 'en' 
                  ? "Binds local IndexedDB delta changes into PostGIS format, optimizing boundaries for spatial overlapping and distance calculations on PostgreSQL."
                  : "স্থানীয় IndexedDB ডেল্টা পরিবর্তনসমূহ PostGIS ফরম্যাটে রূপান্তর করে পোস্টগ্রেএসকিউএল ওভারল্যাপিং সীমানা এবং দূরত্ব বিশ্লেষণের জন্য অপ্টিমাইজ করে।"
              )}
            </span>
          </div>
        </div>

        <button
          type="button"
          disabled={syncStatus.syncing}
          onClick={handleSimulatePgSync}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-black py-2.5 px-5 rounded-xl shadow-md transition-colors cursor-pointer shrink-0"
        >
          {syncStatus.syncing 
            ? (language === 'en' ? "Syncing to Postgres..." : "পোস্টগ্রেএসকিউএল সিঙ্ক হচ্ছে...") 
            : (language === 'en' ? "Trigger Spatial Postgres Sync" : "স্পেশাল পোস্টগ্রেস সিঙ্ক শুরু করুন")}
        </button>
      </div>

      {/* VIEW 1: ARCHITECTURE DIAGRAMS */}
      {viewMode === 'diagram' && (
        <div className="flex flex-col gap-6 text-left animate-fadeIn">
          {/* Architecture Concept */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider font-mono border-b border-neutral-100 pb-2">
                {language === 'en' ? "1. Client Offline Layer (IndexedDB)" : "১. ক্লায়েন্ট অফলাইন লেয়ার (IndexedDB)"}
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {language === 'en'
                  ? "Highly optimized relational schema is emulated client-side via browser IndexedDB. Transactions are queued locally inside SyncQueue and AuditLogs, ensuring 100% offline autonomy and absolute durability when field officers navigate remote off-grid locations."
                  : "ব্রাউজার IndexedDB-এর মাধ্যমে ক্লায়েন্ট-সাইডে রিলেশনাল স্কিমা তৈরি করা হয়েছে। পরিবর্তনগুলি স্থানীয়ভাবে SyncQueue এবং AuditLogs-এ সংরক্ষিত হয়, যা ইন্টারনেট সংযোগহীন এলাকায় অফিসারদের জন্য ১০০% নির্ভরযোগ্যতা নিশ্চিত করে।"}
              </p>
              <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-150 font-mono text-[11px] text-neutral-700 leading-relaxed flex flex-col gap-1.5">
                <span className="text-emerald-800 font-extrabold flex items-center gap-1">💾 Active Stores in Device Store:</span>
                <span>• submissions, sync_queue (Original Transaction Stores)</span>
                <span>• users, offices, species (Master Reference Data)</span>
                <span>• geofences, plant_photos (GIS & Media separation)</span>
                <span>• validation_tasks, inspections (Validation & Auditing)</span>
                <span>• ndvi_history, carbon_history (Environmental Tracking)</span>
                <span>• notifications, audit_logs, qr_codes (Operations & Traceability)</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-neutral-200 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider font-mono border-b border-neutral-100 pb-2">
                {language === 'en' ? "2. Central Enterprise Layer (PostgreSQL + PostGIS)" : "২. কেন্দ্রীয় এন্টারপ্রাইজ লেয়ার (PostgreSQL + PostGIS)"}
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {language === 'en'
                  ? "At central server levels, PostgreSQL serves as the relational foundation. Utilizing PostGIS spatial extension indexes, DAE engineers can perform ultra-fast geofence queries, distance alerts, boundary self-intersection checks, and historic NDVI polygon overlay calculations."
                  : "কেন্দ্রীয় সার্ভার স্তরে, PostgreSQL রিলেশনাল ভিত্তি হিসাবে কাজ করে। PostGIS স্পেশাল এক্সটেনশন ইনডেক্স ব্যবহার করে ডিএই প্রকৌশলীরা অতি-দ্রুত জিওফেন্স কুয়েরি, দূরত্ব গণনা, সীমানা ওভারল্যাপ এবং NDVI পলিসন ওভারলে বিশ্লেষণ করতে পারেন।"}
              </p>
              <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-150 font-mono text-[11px] text-neutral-700 leading-relaxed flex flex-col gap-1.5">
                <span className="text-blue-800 font-extrabold flex items-center gap-1">🗺️ PostGIS Spatial Optimizations:</span>
                <span>• GEOMETRY(Polygon, 4326) on geofence table</span>
                <span>• ST_Centroid(geometry), ST_Area(geometry), ST_Perimeter(geometry)</span>
                <span>• SPATIAL INDEX (GIST) on geometry column for overlap checking</span>
                <span>• ST_DWithin() for real-time proximity and double-allocation audits</span>
                <span>• NDVIHistory & CarbonHistory tracking tables bound directly to Site FK</span>
              </div>
            </div>
          </div>

          {/* Interactive Database Schema Card Grid */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-black text-neutral-800 uppercase tracking-wider font-mono">
              {language === 'en' ? "Relational Schema Table Directory" : "রিলেশনাল স্কিমা টেবিল নির্দেশিকা"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Table 1 */}
              <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs text-xs">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2 mb-2 font-mono">
                  <span className="font-extrabold text-neutral-800 text-sm">ValidationTask</span>
                  <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded">Audit</span>
                </div>
                <div className="flex flex-col gap-1.5 font-mono text-neutral-600 text-[11px]">
                  <div className="flex justify-between"><span className="font-bold text-neutral-800">task_id (PK)</span><span className="text-neutral-400">UUID</span></div>
                  <div className="flex justify-between"><span>submission_id (FK)</span><span className="text-neutral-400">VARCHAR</span></div>
                  <div className="flex justify-between"><span>site_id (FK)</span><span className="text-neutral-400">VARCHAR</span></div>
                  <div className="flex justify-between"><span>validator_id (FK)</span><span className="text-neutral-400">VARCHAR</span></div>
                  <div className="flex justify-between"><span>validator_role</span><span className="text-neutral-400">VARCHAR</span></div>
                  <div className="flex justify-between"><span>assigned_date</span><span className="text-neutral-400">TIMESTAMP</span></div>
                  <div className="flex justify-between"><span>due_date</span><span className="text-neutral-400">TIMESTAMP</span></div>
                  <div className="flex justify-between"><span>status</span><span className="text-neutral-400">ENUM</span></div>
                  <div className="flex justify-between"><span>remarks</span><span className="text-neutral-400">TEXT</span></div>
                  <div className="flex justify-between"><span>approved_at / rejected_at</span><span className="text-neutral-400">TIMESTAMP</span></div>
                </div>
              </div>

              {/* Table 2 */}
              <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs text-xs">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2 mb-2 font-mono">
                  <span className="font-extrabold text-neutral-800 text-sm">Inspection</span>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded">Monitoring</span>
                </div>
                <div className="flex flex-col gap-1.5 font-mono text-neutral-600 text-[11px]">
                  <div className="flex justify-between"><span className="font-bold text-neutral-800">inspection_id (PK)</span><span className="text-neutral-400">UUID</span></div>
                  <div className="flex justify-between"><span>site_id (FK)</span><span className="text-neutral-400">VARCHAR</span></div>
                  <div className="flex justify-between"><span>inspection_date</span><span className="text-neutral-400">TIMESTAMP</span></div>
                  <div className="flex justify-between"><span>inspector_id (FK)</span><span className="text-neutral-400">VARCHAR</span></div>
                  <div className="flex justify-between"><span>survival_count</span><span className="text-neutral-400">INTEGER</span></div>
                  <div className="flex justify-between"><span>dead_count</span><span className="text-neutral-400">INTEGER</span></div>
                  <div className="flex justify-between"><span>height / canopy</span><span className="text-neutral-400">FLOAT</span></div>
                  <div className="flex justify-between"><span>health_status</span><span className="text-neutral-400">ENUM</span></div>
                  <div className="flex justify-between"><span>remarks</span><span className="text-neutral-400">TEXT</span></div>
                </div>
              </div>

              {/* Table 3 */}
              <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs text-xs">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2 mb-2 font-mono">
                  <span className="font-extrabold text-neutral-800 text-sm">PlantPhoto</span>
                  <span className="text-[10px] bg-teal-50 text-teal-700 font-bold px-1.5 py-0.5 rounded">Media separation</span>
                </div>
                <div className="flex flex-col gap-1.5 font-mono text-neutral-600 text-[11px]">
                  <div className="flex justify-between"><span className="font-bold text-neutral-800">photo_id (PK)</span><span className="text-neutral-400">UUID</span></div>
                  <div className="flex justify-between"><span>plant_id (FK)</span><span className="text-neutral-400">VARCHAR</span></div>
                  <div className="flex justify-between"><span>file_url / thumbnail</span><span className="text-neutral-400">TEXT</span></div>
                  <div className="flex justify-between"><span>gps</span><span className="text-neutral-400">GEOMETRY(Point)</span></div>
                  <div className="flex justify-between"><span>taken_at</span><span className="text-neutral-400">TIMESTAMP</span></div>
                  <div className="flex justify-between"><span>device</span><span className="text-neutral-400">VARCHAR</span></div>
                  <div className="flex justify-between"><span>hash (Deduplication)</span><span className="text-neutral-400">VARCHAR</span></div>
                </div>
              </div>

              {/* Table 4 */}
              <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs text-xs">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2 mb-2 font-mono">
                  <span className="font-extrabold text-neutral-800 text-sm">GeoFence</span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded">Spatial GIS</span>
                </div>
                <div className="flex flex-col gap-1.5 font-mono text-neutral-600 text-[11px]">
                  <div className="flex justify-between"><span className="font-bold text-neutral-800">geofence_id (PK)</span><span className="text-neutral-400">UUID</span></div>
                  <div className="flex justify-between"><span>site_id (FK)</span><span className="text-neutral-400">VARCHAR</span></div>
                  <div className="flex justify-between"><span className="text-emerald-700">geometry</span><span className="text-emerald-700">GEOMETRY(Polygon)</span></div>
                  <div className="flex justify-between"><span>centroid</span><span className="text-neutral-400">GEOMETRY(Point)</span></div>
                  <div className="flex justify-between"><span>area / perimeter</span><span className="text-neutral-400">FLOAT</span></div>
                  <div className="flex justify-between"><span>type</span><span className="text-neutral-400">VARCHAR</span></div>
                  <div className="flex justify-between"><span>created_at</span><span className="text-neutral-400">TIMESTAMP</span></div>
                </div>
              </div>

              {/* Table 5 */}
              <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs text-xs">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2 mb-2 font-mono">
                  <span className="font-extrabold text-neutral-800 text-sm">Species</span>
                  <span className="text-[10px] bg-yellow-50 text-yellow-700 font-bold px-1.5 py-0.5 rounded">Master Data</span>
                </div>
                <div className="flex flex-col gap-1.5 font-mono text-neutral-600 text-[11px]">
                  <div className="flex justify-between"><span className="font-bold text-neutral-800">species_id (PK)</span><span className="text-neutral-400">VARCHAR</span></div>
                  <div className="flex justify-between"><span>category</span><span className="text-neutral-400">VARCHAR</span></div>
                  <div className="flex justify-between"><span>scientific_name</span><span className="text-neutral-400">VARCHAR</span></div>
                  <div className="flex justify-between"><span>local_name</span><span className="text-neutral-400">VARCHAR</span></div>
                  <div className="flex justify-between"><span>carbon_factor (Ha/yr)</span><span className="text-neutral-400">FLOAT</span></div>
                  <div className="flex justify-between"><span>life_span</span><span className="text-neutral-400">INTEGER</span></div>
                  <div className="flex justify-between"><span>recommended_spacing</span><span className="text-neutral-400">VARCHAR</span></div>
                </div>
              </div>

              {/* Table 6 */}
              <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs text-xs">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2 mb-2 font-mono">
                  <span className="font-extrabold text-neutral-800 text-sm">NDVIHistory</span>
                  <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-1.5 py-0.5 rounded">Environmental</span>
                </div>
                <div className="flex flex-col gap-1.5 font-mono text-neutral-600 text-[11px]">
                  <div className="flex justify-between"><span className="font-bold text-neutral-800">history_id (PK)</span><span className="text-neutral-400">UUID</span></div>
                  <div className="flex justify-between"><span>site_id (FK)</span><span className="text-neutral-400">VARCHAR</span></div>
                  <div className="flex justify-between"><span>date</span><span className="text-neutral-400">TIMESTAMP</span></div>
                  <div className="flex justify-between"><span>ndvi</span><span className="text-neutral-400">FLOAT</span></div>
                  <div className="flex justify-between"><span>source (Satellite/Drone)</span><span className="text-neutral-400">VARCHAR</span></div>
                </div>
              </div>

              {/* Table 7 */}
              <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs text-xs">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2 mb-2 font-mono">
                  <span className="font-extrabold text-neutral-800 text-sm">AuditLog</span>
                  <span className="text-[10px] bg-red-50 text-red-700 font-bold px-1.5 py-0.5 rounded">Immutable Audit</span>
                </div>
                <div className="flex flex-col gap-1.5 font-mono text-neutral-600 text-[11px]">
                  <div className="flex justify-between"><span className="font-bold text-neutral-800">log_id (PK)</span><span className="text-neutral-400">UUID</span></div>
                  <div className="flex justify-between"><span>user_id / user_name</span><span className="text-neutral-400">VARCHAR</span></div>
                  <div className="flex justify-between"><span>action (CRUD/Sync)</span><span className="text-neutral-400">VARCHAR</span></div>
                  <div className="flex justify-between"><span>entity / entity_id</span><span className="text-neutral-400">VARCHAR</span></div>
                  <div className="flex justify-between"><span>old_value / new_value</span><span className="text-neutral-400">TEXT</span></div>
                  <div className="flex justify-between"><span>device / gps</span><span className="text-neutral-400">VARCHAR / POINT</span></div>
                  <div className="flex justify-between"><span>timestamp</span><span className="text-neutral-400">TIMESTAMP</span></div>
                </div>
              </div>

              {/* Table 8 */}
              <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs text-xs">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2 mb-2 font-mono">
                  <span className="font-extrabold text-neutral-800 text-sm">QRCode</span>
                  <span className="text-[10px] bg-orange-50 text-orange-700 font-bold px-1.5 py-0.5 rounded">Tag Tracking</span>
                </div>
                <div className="flex flex-col gap-1.5 font-mono text-neutral-600 text-[11px]">
                  <div className="flex justify-between"><span className="font-bold text-neutral-800">qr_id (PK)</span><span className="text-neutral-400">UUID</span></div>
                  <div className="flex justify-between"><span>site_id (FK)</span><span className="text-neutral-400">VARCHAR</span></div>
                  <div className="flex justify-between"><span>qr_value</span><span className="text-neutral-400">VARCHAR</span></div>
                  <div className="flex justify-between"><span>generated_at</span><span className="text-neutral-400">TIMESTAMP</span></div>
                  <div className="flex justify-between"><span>last_scanned</span><span className="text-neutral-400">TIMESTAMP</span></div>
                  <div className="flex justify-between"><span>scan_count</span><span className="text-neutral-400">INTEGER</span></div>
                </div>
              </div>

              {/* Table 9 */}
              <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs text-xs">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2 mb-2 font-mono">
                  <span className="font-extrabold text-neutral-800 text-sm">Administrative</span>
                  <span className="text-[10px] bg-slate-50 text-slate-700 font-bold px-1.5 py-0.5 rounded">FK Geography</span>
                </div>
                <div className="flex flex-col gap-1.5 font-mono text-neutral-600 text-[11px]">
                  <div className="flex justify-between"><span className="font-bold text-neutral-800">division_id / district_id</span><span className="text-neutral-400">VARCHAR</span></div>
                  <div className="flex justify-between"><span className="font-bold text-neutral-800">upazila_id / union_id</span><span className="text-neutral-400">VARCHAR</span></div>
                  <div className="flex justify-between"><span>name_en / name_bn</span><span className="text-neutral-400">VARCHAR</span></div>
                  <div className="text-[10px] text-neutral-400 leading-normal pt-1 border-t border-neutral-50 mt-1">
                    Defines strict geo-lookups as primary and foreign keys, completely eliminating spelling errors and textual inconsistencies in site registry.
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: INTERACTIVE TABLE BROWSER */}
      {viewMode === 'explorer' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-left animate-fadeIn items-stretch">
          
          {/* Table Select Sidebar */}
          <div className="flex flex-col bg-white border border-neutral-200 rounded-2xl p-4 gap-1">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono mb-2.5 px-2">
              {language === 'en' ? "Database Tables" : "ডাটাবেস টেবিল তালিকা"}
            </span>
            
            {[
              { id: 'species', name: 'Species Master (কাঠ/ফল প্রজাতি)', icon: Compass },
              { id: 'users', name: 'User & Roles (ব্যবহারকারী ও পদবি)', icon: ShieldCheck },
              { id: 'validation_tasks', name: 'ValidationTask (যাচাইকরণ কার্য)', icon: FileText },
              { id: 'inspections', name: 'Inspection (পরিদর্শন ও উত্তরজীবিতা)', icon: Eye },
              { id: 'plant_photos', name: 'PlantPhoto (উদ্ভিদের আলোকচিত্র)', icon: Layers },
              { id: 'geofences', name: 'GeoFence (ভৌগোলিক সীমানা)', icon: MapPin },
              { id: 'ndvi_history', name: 'NDVI & Carbon History (এনডিভিআই)', icon: HelpCircle },
              { id: 'notifications', name: 'Notification (বিজ্ঞপ্তি ও নোটিশ)', icon: Bell },
              { id: 'audit_logs', name: 'AuditLog (অপরিবর্তনীয় অডিট ট্রেইল)', icon: FileText },
              { id: 'qr_codes', name: 'QRCode tracking (কিউআর কোড ট্র্যাকিং)', icon: QrCode },
              { id: 'administrative', name: 'Administrative FK (প্রশাসনিক সীমানা)', icon: MapPin },
            ].map((tbl) => {
              const Icon = tbl.icon;
              return (
                <button
                  key={tbl.id}
                  type="button"
                  onClick={() => setSelectedTable(tbl.id as SelectedTableType)}
                  className={`flex items-center gap-2.5 py-2.5 px-3 rounded-lg text-xs font-bold transition-all text-left cursor-pointer ${
                    selectedTable === tbl.id
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0 text-neutral-400" />
                  <span className="truncate">{tbl.name}</span>
                </button>
              );
            })}
          </div>

          {/* Records Display Pane */}
          <div className="lg:col-span-3 bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col gap-4">
            
            {/* Table Heading Action controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-base font-black text-neutral-800 uppercase font-mono">
                  Table: <span className="text-emerald-700">{selectedTable}</span>
                </h3>
                <span className="text-[11px] text-neutral-500">
                  {language === 'en' 
                    ? `Showing ${records.length} pre-seeded or captured offline database records.`
                    : `ডাটাবেসে সংরক্ষিত বা সংগৃহীত ${records.length} টি রেকর্ড প্রদর্শিত হচ্ছে।`}
                </span>
              </div>

              {/* Add Mock Record controller */}
              {['inspections', 'audit_logs', 'notifications', 'ndvi_history', 'qr_codes'].includes(selectedTable) && (
                <button
                  type="button"
                  onClick={handleInsertMockRecord}
                  className="flex items-center gap-1.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 py-1.5 px-3.5 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <PlusCircle className="h-4 w-4" />
                  {language === 'en' ? "Simulate Record Entry" : "নতুন ডেমো এন্ট্রি যোগ করুন"}
                </button>
              )}
            </div>

            {/* Live Interactive Records Grid/List */}
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-2.5">
                <RefreshCw className="h-8 w-8 text-neutral-300 animate-spin" />
                <span className="text-xs text-neutral-400">{language === 'en' ? "Querying database..." : "ডাটাবেস লোড হচ্ছে..."}</span>
              </div>
            ) : records.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-neutral-100 rounded-xl">
                <AlertCircle className="h-10 w-10 text-neutral-300 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-neutral-600">{language === 'en' ? "No records found" : "কোন তথ্য পাওয়া যায়নি"}</h4>
                <p className="text-[10px] text-neutral-400 max-w-xs mx-auto mt-1">
                  {language === 'en' 
                    ? "Click the button above to insert a simulated offline record into this table!" 
                    : "উপরের বাটনে ক্লিক করে এই টেবিলে একটি ডেমো অফলাইন রেকর্ড তৈরি করুন!"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {selectedTable === 'species' && (
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 text-neutral-500 border-b border-neutral-150 font-mono text-[10px] uppercase">
                        <th className="p-2.5">ID</th>
                        <th className="p-2.5">Local Name (বাংলা)</th>
                        <th className="p-2.5">Scientific Name</th>
                        <th className="p-2.5">Category</th>
                        <th className="p-2.5">Carbon Factor</th>
                        <th className="p-2.5">Life Span</th>
                        <th className="p-2.5">Spacing</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {records.map((r: Species) => (
                        <tr key={r.species_id} className="hover:bg-neutral-50">
                          <td className="p-2.5 font-mono text-[11px] font-bold text-neutral-500">{r.species_id}</td>
                          <td className="p-2.5 font-bold text-neutral-800">{r.local_name}</td>
                          <td className="p-2.5 italic text-neutral-600">{r.scientific_name}</td>
                          <td className="p-2.5"><span className="bg-neutral-100 px-2 py-0.5 rounded-full text-[10px] text-neutral-600 font-medium">{r.category}</span></td>
                          <td className="p-2.5 font-bold text-emerald-700 font-mono">{r.carbon_factor} tC/Ha/yr</td>
                          <td className="p-2.5 font-mono">{r.life_span} yrs</td>
                          <td className="p-2.5 text-neutral-500 font-mono">{r.recommended_spacing}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {selectedTable === 'users' && (
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 text-neutral-500 border-b border-neutral-150 font-mono text-[10px] uppercase">
                        <th className="p-2.5">ID</th>
                        <th className="p-2.5">Name</th>
                        <th className="p-2.5">Designation</th>
                        <th className="p-2.5">Role</th>
                        <th className="p-2.5">Jurisdiction</th>
                        <th className="p-2.5">Office</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {records.map((r: User) => (
                        <tr key={r.user_id} className="hover:bg-neutral-50">
                          <td className="p-2.5 font-mono text-[11px] font-bold text-neutral-500">{r.user_id}</td>
                          <td className="p-2.5 font-black text-neutral-800">{r.name}</td>
                          <td className="p-2.5 text-neutral-600">{r.designation}</td>
                          <td className="p-2.5">
                            <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-blue-100">
                              {r.role}
                            </span>
                          </td>
                          <td className="p-2.5 font-medium text-neutral-700">{r.upazila}, {r.district} (Block: {r.block})</td>
                          <td className="p-2.5 text-neutral-500">{r.office}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {selectedTable === 'validation_tasks' && (
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 text-neutral-500 border-b border-neutral-150 font-mono text-[10px] uppercase">
                        <th className="p-2.5">Task ID</th>
                        <th className="p-2.5">Sub / Site ID</th>
                        <th className="p-2.5">Assigned Auditor</th>
                        <th className="p-2.5">Dates</th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {records.map((r: ValidationTask) => (
                        <tr key={r.task_id} className="hover:bg-neutral-50">
                          <td className="p-2.5 font-mono font-bold text-neutral-700">{r.task_id}</td>
                          <td className="p-2.5 font-mono text-[10px] text-neutral-500">
                            <div>{r.submission_id}</div>
                            <div className="text-neutral-400 font-bold">{r.site_id}</div>
                          </td>
                          <td className="p-2.5">
                            <div className="font-bold text-neutral-800">{r.validator_name}</div>
                            <div className="text-[10px] text-neutral-400 font-mono">{r.validator_role}</div>
                          </td>
                          <td className="p-2.5 text-[10px] text-neutral-500">
                            <div>Assigned: {formatDate(r.assigned_date).split(',')[0]}</div>
                            <div>Due: {formatDate(r.due_date).split(',')[0]}</div>
                          </td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              r.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700 animate-pulse'
                            }`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="p-2.5 text-neutral-600 max-w-xs truncate" title={r.remarks}>{r.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {selectedTable === 'inspections' && (
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 text-neutral-500 border-b border-neutral-150 font-mono text-[10px] uppercase">
                        <th className="p-2.5">Inspection ID</th>
                        <th className="p-2.5">Site ID</th>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Survival vs Dead</th>
                        <th className="p-2.5">Avg Height / Canopy</th>
                        <th className="p-2.5">Health Status</th>
                        <th className="p-2.5">Inspector</th>
                        <th className="p-2.5">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {records.map((r: Inspection) => (
                        <tr key={r.inspection_id} className="hover:bg-neutral-50 animate-scaleUp">
                          <td className="p-2.5 font-mono font-bold text-neutral-700">{r.inspection_id}</td>
                          <td className="p-2.5 font-mono text-neutral-500">{r.site_id}</td>
                          <td className="p-2.5 text-[10px] text-neutral-500">{formatDate(r.inspection_date)}</td>
                          <td className="p-2.5 font-bold">
                            <span className="text-emerald-700">{r.survival_count} Live</span>
                            <span className="text-neutral-300 mx-1">/</span>
                            <span className="text-red-600">{r.dead_count} Dead</span>
                          </td>
                          <td className="p-2.5 font-mono">{r.height}m / {r.canopy}%</td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.health_status === 'Excellent' || r.health_status === 'Good'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}>
                              {r.health_status}
                            </span>
                          </td>
                          <td className="p-2.5 text-neutral-700 font-medium">{r.inspector_name}</td>
                          <td className="p-2.5 text-neutral-500 max-w-xs truncate" title={r.remarks}>{r.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {selectedTable === 'audit_logs' && (
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 text-neutral-500 border-b border-neutral-150 font-mono text-[10px] uppercase">
                        <th className="p-2.5">Log ID</th>
                        <th className="p-2.5">Timestamp</th>
                        <th className="p-2.5">Operator</th>
                        <th className="p-2.5">Action</th>
                        <th className="p-2.5">Entity / ID</th>
                        <th className="p-2.5">Payload Description</th>
                        <th className="p-2.5">Device / Geolocation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {records.map((r: AuditLog) => (
                        <tr key={r.log_id} className="hover:bg-neutral-50 animate-scaleUp">
                          <td className="p-2.5 font-mono font-bold text-neutral-500 text-[11px]">{r.log_id}</td>
                          <td className="p-2.5 text-[10px] text-neutral-400 font-mono">{formatDate(r.timestamp)}</td>
                          <td className="p-2.5 font-bold text-neutral-800">{r.user_name}</td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-extrabold uppercase ${
                              r.action === 'CREATE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                              r.action === 'SYNC' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                              'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}>
                              {r.action}
                            </span>
                          </td>
                          <td className="p-2.5 font-mono text-[10px]">
                            <span className="text-neutral-500">{r.entity}</span>
                            <div className="font-bold text-neutral-700">{r.entity_id}</div>
                          </td>
                          <td className="p-2.5 text-neutral-600 font-mono text-[10px] max-w-xs truncate" title={r.new_value}>
                            {r.new_value}
                          </td>
                          <td className="p-2.5 text-[10px] text-neutral-500 leading-normal">
                            <div>{r.device}</div>
                            {r.gps && <div className="font-mono text-neutral-400 font-bold">{r.gps.lat.toFixed(4)}, {r.gps.lng.toFixed(4)}</div>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {selectedTable === 'notifications' && (
                  <div className="flex flex-col gap-3">
                    {records.map((r: Notification) => (
                      <div key={r.notification_id} className="p-4 bg-neutral-50 rounded-xl border border-neutral-150 flex items-start gap-3 text-left animate-fadeIn">
                        <div className="p-2 bg-emerald-100 rounded-lg text-emerald-800 shrink-0">
                          <Bell className="h-4 w-4" />
                        </div>
                        <div className="flex-1 flex flex-col gap-0.5">
                          <div className="flex justify-between items-center">
                            <span className="font-black text-xs text-neutral-800">{r.title}</span>
                            <span className="text-[9px] text-neutral-400 font-mono">{formatDate(r.created_at)}</span>
                          </div>
                          <span className="text-xs text-neutral-600 leading-normal mt-1">{r.message}</span>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] font-mono bg-neutral-200 text-neutral-600 px-2 py-0.5 rounded">
                              To: {r.recipient} ({r.role})
                            </span>
                            <span className="text-[10px] font-mono text-neutral-400 font-bold">
                              ID: {r.notification_id}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedTable === 'ndvi_history' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-150">
                      <h4 className="font-bold text-xs text-neutral-700 uppercase font-mono tracking-wide border-b border-neutral-100 pb-2 mb-3">
                        NDVI Temporal Change History
                      </h4>
                      <div className="flex flex-col gap-2">
                        {records.map((r: NDVIHistory) => (
                          <div key={r.history_id} className="flex items-center justify-between text-xs py-1.5 border-b border-neutral-100 font-mono">
                            <span className="text-neutral-400 font-bold">{formatDate(r.date).split(',')[0]}</span>
                            <span className="text-neutral-500">{r.source}</span>
                            <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                              NDVI: {r.ndvi}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-150">
                      <h4 className="font-bold text-xs text-neutral-700 uppercase font-mono tracking-wide border-b border-neutral-100 pb-2 mb-3">
                        Calculated Biomass Carbon Accumulation History
                      </h4>
                      <div className="flex flex-col gap-2">
                        {records.map((r: any, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-neutral-100 font-mono">
                            <span className="text-neutral-400 font-bold">{formatDate(r.date || Date.now()).split(',')[0]}</span>
                            <span className="text-neutral-500">Method: Regression</span>
                            <span className="font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                              Carbon: {r.ndvi ? (r.ndvi * 35).toFixed(1) : '24.5'} tC/Ha
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedTable === 'qr_codes' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {records.map((r: QRCode) => (
                      <div key={r.qr_id} className="p-4 bg-neutral-50 border border-neutral-150 rounded-xl flex items-center gap-3.5 animate-scaleUp text-left">
                        <div className="bg-white p-2 rounded-lg border border-neutral-200">
                          <QrCode className="h-10 w-10 text-neutral-800" />
                        </div>
                        <div className="flex flex-col gap-1 font-mono text-[11px] text-neutral-600">
                          <div className="text-neutral-800 font-black text-xs">ID: {r.qr_id}</div>
                          <div className="text-[10px] text-neutral-400 truncate max-w-[150px]">Val: {r.qr_value}</div>
                          <div className="text-[10px]">Scans: <span className="text-emerald-700 font-bold">{r.scan_count} times</span></div>
                          {r.last_scanned && <div className="text-[9px] text-neutral-400">Last: {formatDate(r.last_scanned).split(',')[0]}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedTable === 'geofences' && (
                  <div className="py-8 text-center bg-neutral-50 rounded-xl border border-neutral-150/50">
                    <Compass className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                    <span className="text-xs font-bold text-neutral-700">Dynamic GeoFences Loaded</span>
                    <p className="text-[11px] text-neutral-400 max-w-sm mx-auto mt-1 leading-relaxed">
                      All Orchard/Large Plantation polygons trace vector nodes directly inside the GeoFence table, isolated from master site info to support boundary history tracking.
                    </p>
                  </div>
                )}

                {selectedTable === 'administrative' && records[0] && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-150">
                      <h4 className="font-bold border-b border-neutral-200 pb-1 mb-2 text-neutral-700">Divisions ({records[0].divisions?.length || 0})</h4>
                      <div className="flex flex-col gap-1 text-[11px]">
                        {records[0].divisions?.map((d: any) => (
                          <div key={d.division_id} className="flex justify-between">
                            <span className="font-bold text-neutral-500">{d.division_id}</span>
                            <span>{d.name_en} / {d.name_bn}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-150">
                      <h4 className="font-bold border-b border-neutral-200 pb-1 mb-2 text-neutral-700">Upazilas ({records[0].upazilas?.length || 0})</h4>
                      <div className="flex flex-col gap-1 text-[11px] max-h-40 overflow-y-auto">
                        {records[0].upazilas?.map((u: any) => (
                          <div key={u.upazila_id} className="flex justify-between">
                            <span className="font-bold text-neutral-500">{u.upazila_id}</span>
                            <span>{u.name_en} / {u.name_bn}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
