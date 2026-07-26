/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Submission, PlantationSite } from '../types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { 
  TrendingUp, BarChart3, PieChart as PieIcon, Trees, 
  Leaf, ShieldCheck, Compass, Eye, Sparkles 
} from 'lucide-react';

// Predefined mock data to pad thin live data or for demonstration
const SAMPLE_REGIONAL_DATA: Submission[] = [
  {
    submission_id: 'SUB-881204',
    submitted_by_id: 'FSO-2026-3814',
    submitted_by_name: 'Mithun Islam',
    office: 'Savar Upazila Agriculture Extension Office, Dhaka',
    submitted_at: Date.now() - 6 * 24 * 60 * 60 * 1000,
    status: 'Approved',
    sites: [
      {
        site_id: 'SITE-101',
        submission_id: 'SUB-881204',
        plantation_type: 'Orchard / Large Plantation',
        latitude: 23.8512,
        longitude: 90.2641,
        radius: null,
        polygon: null,
        area: 12000,
        perimeter: 480,
        centroid: null,
        address: 'Savar, Dhaka',
        division: 'Dhaka Division',
        district: 'Dhaka',
        upazila: 'Savar',
        union: 'Ashulia',
        village: 'Khagan',
        road: 'Daffodil Campus Road',
        postcode: '1341',
        ndvi: 0.78,
        carbon_estimate: 24.5,
        geofence_score: 95,
        geofence_details: null,
        plants: [
          { plant_id: 'P-1', site_id: 'SITE-101', category: 'Fruit', species: 'Mango (আম)', variety: 'Amrapali', plantation_date: '2026-06-12', seedling_age: '6 months', quantity: 45, photos: [], validation_status: 'Valid' },
          { plant_id: 'P-2', site_id: 'SITE-101', category: 'Timber', species: 'Mahogany (মেহগনি)', variety: 'Local', plantation_date: '2026-06-12', seedling_age: '1 year', quantity: 30, photos: [], validation_status: 'Valid' }
        ],
        personnel: null,
      }
    ]
  },
  {
    submission_id: 'SUB-492102',
    submitted_by_id: 'FSO-2026-7215',
    submitted_by_name: 'Anisur Rahman',
    office: 'Hathazari Upazila Office, Chittagong',
    submitted_at: Date.now() - 5 * 24 * 60 * 60 * 1000,
    status: 'Approved',
    sites: [
      {
        site_id: 'SITE-102',
        submission_id: 'SUB-492102',
        plantation_type: 'Small Plantation',
        latitude: 22.5012,
        longitude: 91.8015,
        radius: 40,
        polygon: null,
        area: 5026,
        perimeter: 251,
        centroid: null,
        address: 'Hathazari, Chittagong',
        division: 'Chittagong Division',
        district: 'Chittagong',
        upazila: 'Hathazari',
        union: 'Ghalia',
        village: 'Fatehabad',
        road: 'Fatehabad Station Road',
        postcode: '4330',
        ndvi: 0.65,
        carbon_estimate: 15.2,
        geofence_score: 88,
        geofence_details: null,
        plants: [
          { plant_id: 'P-3', site_id: 'SITE-102', category: 'Medicinal', species: 'Neem (নিম)', variety: 'Indian Neem', plantation_date: '2026-07-01', seedling_age: '3 months', quantity: 18, photos: [], validation_status: 'Valid' }
        ],
        personnel: null,
      }
    ]
  },
  {
    submission_id: 'SUB-301294',
    submitted_by_id: 'FSO-2026-1102',
    submitted_by_name: 'Sultana Razia',
    office: 'Paba Upazila Office, Rajshahi',
    submitted_at: Date.now() - 4 * 24 * 60 * 60 * 1000,
    status: 'Validation Pending',
    sites: [
      {
        site_id: 'SITE-103',
        submission_id: 'SUB-301294',
        plantation_type: 'Orchard / Large Plantation',
        latitude: 24.4102,
        longitude: 88.5812,
        radius: null,
        polygon: null,
        area: 15400,
        perimeter: 510,
        centroid: null,
        address: 'Paba, Rajshahi',
        division: 'Rajshahi Division',
        district: 'Rajshahi',
        upazila: 'Paba',
        union: 'Harian',
        village: 'Damkur',
        road: 'Damkur Bazar Road',
        postcode: '6204',
        ndvi: 0.82,
        carbon_estimate: 31.2,
        geofence_score: 92,
        geofence_details: null,
        plants: [
          { plant_id: 'P-4', site_id: 'SITE-103', category: 'Fruit', species: 'Jackfruit (কাঁঠাল)', variety: 'Local Gold', plantation_date: '2026-07-05', seedling_age: '9 months', quantity: 60, photos: [], validation_status: 'Pending' }
        ],
        personnel: null,
      }
    ]
  },
  {
    submission_id: 'SUB-772183',
    submitted_by_id: 'FSO-2026-3814',
    submitted_by_name: 'Mithun Islam',
    office: 'Savar Upazila Agriculture Extension Office, Dhaka',
    submitted_at: Date.now() - 3 * 24 * 60 * 60 * 1000,
    status: 'Rejected',
    sites: [
      {
        site_id: 'SITE-104',
        submission_id: 'SUB-772183',
        plantation_type: 'Single Tree',
        latitude: 23.8214,
        longitude: 90.2815,
        radius: null,
        polygon: null,
        area: 10,
        perimeter: 12,
        centroid: null,
        address: 'Savar, Dhaka',
        division: 'Dhaka Division',
        district: 'Dhaka',
        upazila: 'Savar',
        union: 'Tetuljhora',
        village: 'Boliarpur',
        road: 'Boliarpur-Madda Road',
        postcode: '1340',
        ndvi: 0.35,
        carbon_estimate: 2.1,
        geofence_score: 45,
        geofence_details: null,
        plants: [
          { plant_id: 'P-5', site_id: 'SITE-104', category: 'Timber', species: 'Eucalyptus (ইউক্যালিপটাস)', variety: 'Hybrid', plantation_date: '2026-07-10', seedling_age: '1 year', quantity: 1, photos: [], validation_status: 'Invalid' }
        ],
        personnel: null,
      }
    ]
  },
  {
    submission_id: 'SUB-552194',
    submitted_by_id: 'FSO-2026-9901',
    submitted_by_name: 'Mamunur Rashid',
    office: 'Dumuria Upazila Office, Khulna',
    submitted_at: Date.now() - 2 * 24 * 60 * 60 * 1000,
    status: 'Approved',
    sites: [
      {
        site_id: 'SITE-105',
        submission_id: 'SUB-552194',
        plantation_type: 'Orchard / Large Plantation',
        latitude: 22.8015,
        longitude: 89.4214,
        radius: null,
        polygon: null,
        area: 21000,
        perimeter: 680,
        centroid: null,
        address: 'Dumuria, Khulna',
        division: 'Khulna Division',
        district: 'Khulna',
        upazila: 'Dumuria',
        union: 'Shovana',
        village: 'Rangpur',
        road: 'Rangpur Shovana Road',
        postcode: '9250',
        ndvi: 0.81,
        carbon_estimate: 42.0,
        geofence_score: 94,
        geofence_details: null,
        plants: [
          { plant_id: 'P-6', site_id: 'SITE-105', category: 'Fruit', species: 'Guava (পেয়ারা)', variety: 'Kazi Peyara', plantation_date: '2026-06-25', seedling_age: '6 months', quantity: 120, photos: [], validation_status: 'Valid' }
        ],
        personnel: null,
      }
    ]
  },
  {
    submission_id: 'SUB-209412',
    submitted_by_id: 'FSO-2026-4412',
    submitted_by_name: 'Fahmida Akhter',
    office: 'Sreemangal Upazila Office, Sylhet',
    submitted_at: Date.now() - 1 * 24 * 60 * 60 * 1000,
    status: 'Validation Pending',
    sites: [
      {
        site_id: 'SITE-106',
        submission_id: 'SUB-209412',
        plantation_type: 'Small Plantation',
        latitude: 24.3052,
        longitude: 91.7214,
        radius: 35,
        polygon: null,
        area: 3848,
        perimeter: 220,
        centroid: null,
        address: 'Sreemangal, Sylhet',
        division: 'Sylhet Division',
        district: 'Moulvibazar',
        upazila: 'Sreemangal',
        union: 'Kalighat',
        village: 'Sreemangal Tea Estate',
        road: 'Tea Garden Loop Road',
        postcode: '3210',
        ndvi: 0.74,
        carbon_estimate: 18.9,
        geofence_score: 89,
        geofence_details: null,
        plants: [
          { plant_id: 'P-7', site_id: 'SITE-106', category: 'Medicinal', species: 'Amla (আমলকী)', variety: 'Local', plantation_date: '2026-07-15', seedling_age: '8 months', quantity: 15, photos: [], validation_status: 'Pending' }
        ],
        personnel: null,
      }
    ]
  }
];

export default function DashboardAnalytics() {
  const { submissions: liveSubmissions, language } = useApp();
  const [dataMode, setDataMode] = useState<'all' | 'live'>('all');

  // Determine active data list based on selected mode.
  // If live data has 0-1 submissions, default to 'all' to ensure beautiful graphs.
  const submissionsToUse = useMemo(() => {
    if (dataMode === 'live' && liveSubmissions.length > 0) {
      return liveSubmissions;
    }
    // 'all' combines both live and sample data, ensuring uniqueness on submission_id
    const combined = [...liveSubmissions];
    SAMPLE_REGIONAL_DATA.forEach((sample) => {
      if (!combined.some((s) => s.submission_id === sample.submission_id)) {
        combined.push(sample);
      }
    });
    return combined.sort((a, b) => a.submitted_at - b.submitted_at);
  }, [liveSubmissions, dataMode]);

  // Calculations for summary stats cards
  const summaryStats = useMemo(() => {
    let totalPlants = 0;
    let totalCarbon = 0;
    let sumScore = 0;
    let scoredSitesCount = 0;

    submissionsToUse.forEach((sub) => {
      sub.sites.forEach((site) => {
        const sitePlants = site.plants.reduce((sum, p) => sum + p.quantity, 0);
        totalPlants += sitePlants;
        totalCarbon += site.carbon_estimate;
        if (site.geofence_score > 0) {
          sumScore += site.geofence_score;
          scoredSitesCount++;
        }
      });
    });

    const averageScore = scoredSitesCount > 0 ? Math.round(sumScore / scoredSitesCount) : 0;

    return {
      totalSubmissions: submissionsToUse.length,
      totalPlants,
      totalCarbon: parseFloat(totalCarbon.toFixed(1)),
      averageScore,
    };
  }, [submissionsToUse]);

  // Chart 1: Daily Submission Trends over recent days
  const trendsChartData = useMemo(() => {
    const dailyMap: { [dateStr: string]: { date: string; submissions: number; plants: number } } = {};

    submissionsToUse.forEach((sub) => {
      const date = new Date(sub.submitted_at);
      const dateStr = date.toLocaleDateString(language === 'en' ? 'en-US' : 'bn-BD', {
        month: 'short',
        day: 'numeric',
      });

      const plantCount = sub.sites.reduce(
        (acc, site) => acc + site.plants.reduce((sum, p) => sum + p.quantity, 0),
        0
      );

      if (dailyMap[dateStr]) {
        dailyMap[dateStr].submissions += 1;
        dailyMap[dateStr].plants += plantCount;
      } else {
        dailyMap[dateStr] = {
          date: dateStr,
          submissions: 1,
          plants: plantCount,
        };
      }
    });

    // Sort or convert to array (since sub.submitted_at is already sorted, it retains nice progression)
    return Object.values(dailyMap);
  }, [submissionsToUse, language]);

  // Chart 2: Approval Statuses distribution (Pie Chart)
  const statusPieData = useMemo(() => {
    const statusCounts: { [key: string]: number } = {
      Approved: 0,
      'Validation Pending': 0,
      'Sync Pending': 0,
      Draft: 0,
      Rejected: 0,
    };

    submissionsToUse.forEach((sub) => {
      if (statusCounts[sub.status] !== undefined) {
        statusCounts[sub.status]++;
      } else {
        statusCounts[sub.status] = 1;
      }
    });

    return Object.entries(statusCounts)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => {
        let localizedName = status;
        if (language === 'bn') {
          if (status === 'Approved') localizedName = 'অনুমোদিত';
          else if (status === 'Validation Pending') localizedName = 'যাচাই পেন্ডিং';
          else if (status === 'Sync Pending') localizedName = 'সিঙ্ক পেন্ডিং';
          else if (status === 'Draft') localizedName = 'খসড়া';
          else if (status === 'Rejected') localizedName = 'প্রত্যাখ্যাত';
        }
        return {
          name: localizedName,
          statusKey: status,
          value: count,
        };
      });
  }, [submissionsToUse, language]);

  // Colors mapping for statuses
  const STATUS_COLORS: { [key: string]: string } = {
    Approved: '#10b981',           // Emerald
    'Validation Pending': '#3b82f6', // Blue
    'Sync Pending': '#f59e0b',       // Amber
    Draft: '#64748b',                // Slate
    Rejected: '#f43f5e',             // Rose
  };

  // Chart 3: Plantation distribution by region (Bar Chart)
  // Grouping by Division/District
  const regionalBarData = useMemo(() => {
    const regionMap: { [region: string]: { region: string; plants: number; submissions: number } } = {};

    submissionsToUse.forEach((sub) => {
      sub.sites.forEach((site) => {
        // Fallback standard division names if left blank
        let rawDivision = site.division ? site.division.trim() : '';
        if (!rawDivision) {
          rawDivision = language === 'en' ? 'Dhaka Division' : 'ঢাকা বিভাগ';
        }

        // Standardize Division name for rendering
        let regionName = rawDivision;
        if (language === 'bn' && rawDivision.toLowerCase().includes('dhaka')) regionName = 'ঢাকা বিভাগ';
        else if (language === 'bn' && rawDivision.toLowerCase().includes('chittagong')) regionName = 'চট্টগ্রাম বিভাগ';
        else if (language === 'bn' && rawDivision.toLowerCase().includes('rajshahi')) regionName = 'রাজশাহী বিভাগ';
        else if (language === 'bn' && rawDivision.toLowerCase().includes('khulna')) regionName = 'খুলনা বিভাগ';
        else if (language === 'bn' && rawDivision.toLowerCase().includes('sylhet')) regionName = 'সিলেট বিভাগ';

        const plantCount = site.plants.reduce((sum, p) => sum + p.quantity, 0);

        if (regionMap[regionName]) {
          regionMap[regionName].plants += plantCount;
          regionMap[regionName].submissions += 1;
        } else {
          regionMap[regionName] = {
            region: regionName,
            plants: plantCount,
            submissions: 1,
          };
        }
      });
    });

    return Object.values(regionMap).sort((a, b) => b.plants - a.plants);
  }, [submissionsToUse, language]);

  return (
    <div className="flex flex-col gap-6 text-left animate-fadeIn">
      {/* SECTION HEADER WITH LIVE / DEMO TOGGLER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3 mt-2">
        <div className="flex items-center gap-2">
          <Trees className="h-5 w-5 text-emerald-700" />
          <div className="flex flex-col text-left">
            <h3 className="text-sm font-black text-neutral-800 uppercase tracking-wider font-mono">
              {language === 'en' ? "Registry Analytics Monitor" : "রেজিস্ট্রি অ্যানালিটিক্স মনিটর"}
            </h3>
            <span className="text-[10px] text-neutral-400">
              {language === 'en' 
                ? "Real-time verification indices, canopy scores & forestry status reporting" 
                : "রিয়েল-টাইম ভেরিফিকেশন ইনডেক্স, ক্যানোপি স্কোর এবং বনায়ন স্ট্যাটাস রিপোর্টিং"}
            </span>
          </div>
        </div>

        {/* Data Source Toggler */}
        <div className="flex items-center bg-neutral-100 p-1 rounded-xl border border-neutral-200">
          <button
            type="button"
            onClick={() => setDataMode('all')}
            className={`py-1 px-3 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              dataMode === 'all'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Sparkles className="h-3 w-3 text-emerald-600" />
            {language === 'en' ? "Full Pilot Ledger" : "সম্পূর্ণ পাইলট লেজার"}
          </button>
          <button
            type="button"
            onClick={() => setDataMode('live')}
            disabled={liveSubmissions.length === 0}
            className={`py-1 px-3 text-[11px] font-bold rounded-lg transition-all cursor-pointer disabled:opacity-40 ${
              dataMode === 'live'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
            title={liveSubmissions.length === 0 ? (language === 'en' ? "Create a record first" : "প্রথমে একটি রেকর্ড তৈরি করুন") : ""}
          >
            {language === 'en' ? `My Live Submissions (${liveSubmissions.length})` : `আমার লাইভ সাবমিশন (${liveSubmissions.length})`}
          </button>
        </div>
      </div>

      {/* OVERVIEW KEY PERFORMANCE METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Submissions */}
        <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-xs flex flex-col text-left transition-all hover:border-emerald-200">
          <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 font-mono">
            {language === 'en' ? "Filing Dossiers" : "জমাকৃত আবেদন ফাইল"}
          </span>
          <span className="text-2xl font-black font-mono text-neutral-800 mt-1">
            {summaryStats.totalSubmissions}
          </span>
          <span className="text-[10px] text-neutral-400 mt-0.5 leading-snug">
            {language === 'en' ? "Unique regional ledger indexes" : "অনন্য আঞ্চলিক লেজার সূচক"}
          </span>
        </div>

        {/* Metric 2: Total Plants */}
        <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-xs flex flex-col text-left transition-all hover:border-emerald-200">
          <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 font-mono">
            {language === 'en' ? "Saplings Enrolled" : "মোট তালিকাভুক্ত চারা গাছ"}
          </span>
          <span className="text-2xl font-black font-mono text-emerald-700 mt-1 flex items-center gap-1">
            <Leaf className="h-5 w-5 text-emerald-600 shrink-0 inline" />
            {summaryStats.totalPlants}
          </span>
          <span className="text-[10px] text-neutral-400 mt-0.5 leading-snug">
            {language === 'en' ? "Verified vegetative units" : "যাচাইকৃত রোপিত চারা গাছ"}
          </span>
        </div>

        {/* Metric 3: Carbon Potential */}
        <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-xs flex flex-col text-left transition-all hover:border-emerald-200">
          <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 font-mono">
            {language === 'en' ? "Carbon Potential" : "কার্বন শোষণ ক্ষমতা"}
          </span>
          <span className="text-2xl font-black font-mono text-teal-700 mt-1">
            {summaryStats.totalCarbon} <span className="text-xs font-semibold font-sans">t/Ha</span>
          </span>
          <span className="text-[10px] text-neutral-400 mt-0.5 leading-snug">
            {language === 'en' ? "Biomass carbon offset pool" : "বায়োমাস কার্বন অফসেট পুল"}
          </span>
        </div>

        {/* Metric 4: Geofence Confidence */}
        <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-xs flex flex-col text-left transition-all hover:border-emerald-200">
          <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 font-mono">
            {language === 'en' ? "Confidence Index" : "কনফিডেন্স ইনডেক্স"}
          </span>
          <span className="text-2xl font-black font-mono text-blue-700 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 inline" />
            {summaryStats.averageScore}%
          </span>
          <span className="text-[10px] text-neutral-400 mt-0.5 leading-snug">
            {language === 'en' ? "Avg. satellite match index" : "গড় স্যাটেলাইট মিল সূচক"}
          </span>
        </div>
      </div>

      {/* CHARTS GRAPHICAL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Submission Trend (8/12 span) */}
        <div className="lg:col-span-8 p-5 bg-white border border-neutral-200 rounded-xl shadow-sm flex flex-col gap-4 text-left">
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-bold text-neutral-700 uppercase tracking-wide">
              {language === 'en' ? "Enrollment Timeline & Vegetation Metrics" : "তালিকাভুক্তির সময়রেখা এবং চারাগাছ বৃদ্ধির রেকর্ড"}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trendsChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPlants" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '8px', 
                    borderColor: '#e2e8f0', 
                    fontSize: '11px', 
                    textAlign: 'left' 
                  }} 
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="circle" 
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px' }}
                />
                <Area 
                  type="monotone" 
                  name={language === 'en' ? "Submission Filings" : "জমাকৃত আবেদন"} 
                  dataKey="submissions" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorSubmissions)" 
                />
                <Area 
                  type="monotone" 
                  name={language === 'en' ? "Total Saplings" : "মোট চারার সংখ্যা"} 
                  dataKey="plants" 
                  stroke="#0d9488" 
                  strokeWidth={1.5}
                  fillOpacity={1} 
                  fill="url(#colorPlants)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Status Pie Distribution (4/12 span) */}
        <div className="lg:col-span-4 p-5 bg-white border border-neutral-200 rounded-xl shadow-sm flex flex-col gap-4 text-left">
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-2">
            <PieIcon className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-bold text-neutral-700 uppercase tracking-wide">
              {language === 'en' ? "Verification Audit Status" : "ভেরিফিকেশন অডিট স্ট্যাটাস"}
            </span>
          </div>

          <div className="h-64 w-full flex flex-col items-center justify-center relative">
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={STATUS_COLORS[entry.statusKey] || '#94a3b8'} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '8px', 
                    borderColor: '#e2e8f0', 
                    fontSize: '11px' 
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Total count center label */}
            <div className="absolute top-[41%] left-[50%] -translate-x-[50%] -translate-y-[50%] flex flex-col items-center justify-center text-center">
              <span className="text-[9px] text-neutral-400 font-bold uppercase font-mono leading-none">
                {language === 'en' ? "TOTAL" : "মোট"}
              </span>
              <span className="text-xl font-extrabold text-neutral-800 font-mono mt-0.5">
                {summaryStats.totalSubmissions}
              </span>
            </div>

            {/* Micro legends in grid below chart */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 w-full text-[10px] text-neutral-500 mt-1">
              {statusPieData.map((entry) => (
                <div key={entry.statusKey} className="flex items-center gap-1.5 justify-start">
                  <span 
                    className="h-2.5 w-2.5 rounded-full shrink-0" 
                    style={{ backgroundColor: STATUS_COLORS[entry.statusKey] }} 
                  />
                  <span className="truncate">{entry.name}: <strong className="font-mono text-neutral-800">{entry.value}</strong></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 3: Regional Distribution (12/12 full width span) */}
        <div className="lg:col-span-12 p-5 bg-white border border-neutral-200 rounded-xl shadow-sm flex flex-col gap-4 text-left">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-bold text-neutral-700 uppercase tracking-wide">
                {language === 'en' ? "Plantation Density & Species Enrolled by Administrative Division" : "প্রশাসনিক বিভাগভিত্তিক বনায়ন ঘনত্ব ও রেকর্ডভুক্ত প্রজাতির বিবরণ"}
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono italic">
              {language === 'en' ? "Units: Number of Saplings" : "একক: চারার সংখ্যা"}
            </span>
          </div>

          <div className="h-64 w-full">
            {regionalBarData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-neutral-400 text-xs italic">
                {language === 'en' ? "No regional mapping available." : "কোন আঞ্চলিক ম্যাপিং পাওয়া যায়নি।"}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={regionalBarData}
                  layout="vertical"
                  margin={{ top: 10, right: 10, left: 30, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis 
                    type="number" 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    dataKey="region" 
                    type="category" 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    width={80}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderRadius: '8px', 
                      borderColor: '#e2e8f0', 
                      fontSize: '11px', 
                      textAlign: 'left' 
                    }} 
                  />
                  <Bar 
                    dataKey="plants" 
                    name={language === 'en' ? "Planted Saplings" : "রোপিত চারাগাছ"} 
                    fill="#10b981" 
                    radius={[0, 4, 4, 0]}
                    barSize={18}
                  >
                    {regionalBarData.map((entry, index) => (
                      <Cell 
                        key={`bar-cell-${index}`} 
                        fill={index === 0 ? '#047857' : index === 1 ? '#059669' : '#10b981'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
