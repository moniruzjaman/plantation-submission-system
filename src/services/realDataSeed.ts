import { Submission, PlantationSite, Plant, Personnel } from '../types';

// Let's define the primary core real-world rows from the spreadsheet App_Entry:
const CORE_REAL_ROWS = [
  {
    id: 'mrd3fmrjqe6os1',
    date: '2026-07-08T21:56:05',
    division: 'রংপুর',
    district: 'কুড়িগ্রাম',
    upazila: 'কুড়িগ্রাম সদর',
    union: 'মোগলবাসা',
    village: 'বেলগাছা',
    address: 'মোগলবাসা ইউনিয়ন, কুড়িগ্রাম সদর উপজেলা, কুড়িগ্রাম জেলা, রংপুর বিভাগ, বাংলাদেশ',
    lat: 25.755591,
    lng: 89.657639,
    species: 'Guava Thai-7 (পেয়ারা থাই-৭)',
    category: 'Fruit (ফলদ)',
    quantity: 85,
    farmer: 'মোঃ রেজওয়ান সরকার',
    farmer_mobile: '01750674891',
    saao: 'ভবেশ চন্দ্র মোদক',
    saao_mobile: '01724511968',
    ndvi: 0.38,
    status: 'Approved'
  },
  {
    id: 'mrd3fmrjqe6os2',
    date: '2026-07-08T22:15:30',
    division: 'রংপুর',
    district: 'কুড়িগ্রাম',
    upazila: 'কুড়িগ্রাম সদর',
    union: 'মোগলবাসা',
    village: 'বেলগাছা',
    address: 'মোগলবাসা রোড, কুড়িগ্রাম সদর, বাংলাদেশ',
    lat: 25.826721,
    lng: 89.603292,
    species: 'Malta Bari-1 (মাল্টা বারী-১)',
    category: 'Fruit (ফলদ)',
    quantity: 60,
    farmer: 'মোঃ নজরুল ইসলাম',
    farmer_mobile: '01748485819',
    saao: 'ভবেশ চন্দ্র মোদক',
    saao_mobile: '01724511968',
    ndvi: 0.45,
    status: 'Approved'
  },
  {
    id: 'mrd3fmrjqe6os3',
    date: '2026-07-08T22:56:05',
    division: 'রংপুর',
    district: 'কুড়িগ্রাম',
    upazila: 'কুড়িগ্রাম সদর',
    union: 'হলোখানা',
    village: 'হলোখানা',
    address: 'হলোখানা ইউনিয়ন, কুড়িগ্রাম সদর উপজেলা, কুড়িগ্রাম জেলা, বাংলাদেশ',
    lat: 25.830043,
    lng: 89.624500,
    species: 'Lemon Seedless (লেবু সিডলেস)',
    category: 'Fruit (ফলদ)',
    quantity: 220,
    farmer: 'মোঃ আমিনুর ইসলাম',
    farmer_mobile: '01723360770',
    saao: 'এস এম তরিকুল ইসলাম',
    saao_mobile: '01716026306',
    ndvi: 0.52,
    status: 'Approved'
  },
  {
    id: 'mrd3fmrjqe6os4',
    date: '2026-07-08T23:28:27',
    division: 'রংপুর',
    district: 'কুড়িগ্রাম',
    upazila: 'কুড়িগ্রাম সদর',
    union: 'মোগলবাসা',
    village: 'বেলগাছা',
    address: 'বেলগাছা ইউনিয়ন রোড, কুড়িগ্রাম, বাংলাদেশ',
    lat: 25.793920,
    lng: 89.620170,
    species: 'Banana Mango (ব্যানানা ম্যাঙ্গো)',
    category: 'Fruit (ফলদ)',
    quantity: 33,
    farmer: 'মোঃ রেজওয়ান সরকার',
    farmer_mobile: '01750674891',
    saao: 'ভবেশ চন্দ্র মোদক',
    saao_mobile: '01724511968',
    ndvi: 0.35,
    status: 'Approved'
  },
  {
    id: 'mrd3fmrjqe6os37',
    date: '2026-07-09T08:12:15',
    division: 'রংপুর',
    district: 'কুড়িগ্রাম',
    upazila: 'কুড়িগ্রাম সদর',
    union: 'মোগলবাসা',
    village: 'বেলগাছা',
    address: 'বেলগাছা বাজার সংলগ্ন, কুড়িগ্রাম',
    lat: 25.803363,
    lng: 89.638701,
    species: 'Mango (আম)',
    category: 'Fruit (ফলদ)',
    quantity: 1,
    farmer: 'আব্দুল হাকিম',
    farmer_mobile: '01700300040',
    saao: 'মনু মিয়া',
    saao_mobile: '01748485819',
    ndvi: 0.28,
    status: 'Approved'
  },
  {
    id: 'mrd4sus7',
    date: '2026-07-09T09:45:00',
    division: 'রংপুর',
    district: 'কুড়িগ্রাম',
    upazila: 'কুড়িগ্রাম সদর',
    union: 'মোগলবাসা',
    village: 'বেলগাছা',
    address: 'বেলগাছা উচ্চ বিদ্যালয় সংলগ্ন, কুড়িগ্রাম',
    lat: 25.802903,
    lng: 89.637888,
    species: 'Mango (আম)',
    category: 'Fruit (ফলদ)',
    quantity: 5,
    farmer: 'মনু মিয়া',
    farmer_mobile: '01748485819',
    saao: 'নজরুল ইসলাম',
    saao_mobile: '01765856589',
    ndvi: 0.31,
    status: 'Approved'
  },
  {
    id: 'mrhdggz6o29rh6',
    date: '2026-07-14T20:49:14',
    division: 'রংপুর',
    district: 'কুড়িগ্রাম',
    upazila: 'চর রাজিবপুর',
    union: 'রাজিবপুর',
    village: 'চর রাজিবপুর',
    address: 'চর রাজিবপুর, রাজিবপুর ইউনিয়ন, কুড়িগ্রাম',
    lat: 25.448200,
    lng: 89.820000,
    species: 'Coconut (নারকেল) & Mahogany (মেহগনি)',
    category: 'Fruit & Timber',
    quantity: 5,
    farmer: 'মোঃ মাহবুর রহমান',
    farmer_mobile: '01929827721',
    saao: 'মোঃ শাখাওয়াত হোসেন',
    saao_mobile: '01743668680',
    ndvi: 0.27,
    status: 'Approved'
  },
  {
    id: 'mrd3f_jackfruit',
    date: '2026-07-10T11:20:00',
    division: 'রংপুর',
    district: 'কুড়িগ্রাম',
    upazila: 'কুড়িগ্রাম সদর',
    union: 'মোগলবাসা',
    village: 'বেলগাছা',
    address: 'বেলগাছা উত্তর পাড়া, কুড়িগ্রাম',
    lat: 25.808500,
    lng: 89.641200,
    species: 'Jackfruit (কাঁঠাল)',
    category: 'Fruit (ফলদ)',
    quantity: 2,
    farmer: 'মোঃ আশরাফুল আলম',
    farmer_mobile: '01712345678',
    saao: 'ভবেশ চন্দ্র মোদক',
    saao_mobile: '01724511968',
    ndvi: 0.34,
    status: 'Approved'
  },
  {
    id: 'mrd3f_neem',
    date: '2026-07-11T14:35:00',
    division: 'রংপুর',
    district: 'কুড়িগ্রাম',
    upazila: 'কুড়িগ্রাম সদর',
    union: 'বেলগাছা',
    village: 'বেলগাছা',
    address: 'বেলগাছা রেল ক্রসিং সড়ক, কুড়িগ্রাম',
    lat: 25.798100,
    lng: 89.631500,
    species: 'Neem (নিম)',
    category: 'Medicinal (ভেষজ)',
    quantity: 12,
    farmer: 'মোছাঃ ফাতেমা বেগম',
    farmer_mobile: '01734567890',
    saao: 'ভবেশ চন্দ্র মোদক',
    saao_mobile: '01724511968',
    ndvi: 0.41,
    status: 'Approved'
  }
];

// Species list for rich simulated expansion
const EXPANDED_SPECIES_LIST = [
  { name: 'Mango (আম)', category: 'Fruit', age: '6 months', variety: 'Incentive / BARI-4' },
  { name: 'Guava (পেয়ারা)', category: 'Fruit', age: '6 months', variety: 'Thai-7' },
  { name: 'Malta (মাল্টা)', category: 'Fruit', age: '8 months', variety: 'BARI Malta-1' },
  { name: 'Lemon (লেবু)', category: 'Fruit', age: '5 months', variety: 'Seedless' },
  { name: 'Jackfruit (কাঁঠাল)', category: 'Fruit', age: '1 year', variety: 'Local' },
  { name: 'Mahogany (মেহগনি)', category: 'Timber', age: '1 year', variety: 'Local' },
  { name: 'Neem (নিম)', category: 'Medicinal', age: '7 months', variety: 'Deshi' },
  { name: 'Coconut (নারকেল)', category: 'Fruit', age: '1.5 years', variety: 'Kerala Dwarf' }
];

const BANGALORE_NAMES = [
  'মোঃ আমিনুর রহমান', 'আব্দুল খালেক', 'মোছাঃ মরিয়ম বেগম', 'মোঃ জহুরুল হক', 'সুভাষ চন্দ্র রায়',
  'মোঃ রফিকুল ইসলাম', 'মোঃ শফিকুল আলম', 'শ্রী সুনীল কুমার', 'মোঃ মোস্তাফিজুর রহমান', 'আবু বকর সিদ্দিক'
];

const OFFICE_NAMES = [
  'Savar Upazila Agriculture Extension Office, Dhaka',
  'Kurigram Sadar Upazila Agriculture Office, Rangpur',
  'Char Rajibpur Agriculture Extension Division, Kurigram'
];

/**
 * Programmatically generates 320 submissions that blend real spreadsheet rows
 * with high-fidelity realistic rows clustered around the core coordinates.
 */
export function generate300RealData(): Submission[] {
  const submissions: Submission[] = [];

  // 1. Add core real-world records from Spreadsheet
  CORE_REAL_ROWS.forEach((row, index) => {
    let plantationType: 'Single Tree' | 'Small Plantation' | 'Orchard / Large Plantation' = 'Single Tree';
    let radius: number | null = null;
    let polygon: { lat: number; lng: number }[] | null = null;
    let area = 1;
    let perimeter = 4;

    if (row.quantity >= 20) {
      plantationType = 'Orchard / Large Plantation';
      // Create a bounding box polygon for Orchard
      polygon = [
        { lat: row.lat + 0.0004, lng: row.lng - 0.0004 },
        { lat: row.lat + 0.0004, lng: row.lng + 0.0004 },
        { lat: row.lat - 0.0004, lng: row.lng + 0.0004 },
        { lat: row.lat - 0.0004, lng: row.lng - 0.0004 }
      ];
      area = row.quantity * 15; // e.g. 15 sq meters per tree
      perimeter = Math.round(4 * Math.sqrt(area));
    } else if (row.quantity >= 3) {
      plantationType = 'Small Plantation';
      radius = 12;
      area = Math.round(Math.PI * radius * radius);
      perimeter = Math.round(2 * Math.PI * radius);
    }

    const subId = `SUB-REAL-${row.id}`;
    const siteId = `SITE-REAL-${row.id}`;

    submissions.push({
      submission_id: subId,
      submitted_by_id: 'USR-001',
      submitted_by_name: 'Mithun Islam',
      office: OFFICE_NAMES[1],
      submitted_at: new Date(row.date).getTime(),
      status: row.status as any,
      sites: [
        {
          site_id: siteId,
          submission_id: subId,
          plantation_type: plantationType,
          latitude: row.lat,
          longitude: row.lng,
          radius,
          polygon,
          area,
          perimeter,
          centroid: { lat: row.lat, lng: row.lng },
          address: row.address,
          division: 'রংপুর বিভাগ',
          district: row.district,
          upazila: row.upazila,
          union: row.union,
          village: row.village,
          road: 'R562',
          postcode: '5600',
          ndvi: row.ndvi,
          carbon_estimate: parseFloat((row.quantity * 0.45).toFixed(2)),
          geofence_score: 95 + (index % 5),
          geofence_details: null,
          plants: [
            {
              plant_id: `PL-REAL-${row.id}-1`,
              site_id: siteId,
              category: row.category,
              species: row.species,
              variety: 'Incentive',
              plantation_date: row.date.slice(0, 10),
              seedling_age: '6 months',
              quantity: row.quantity,
              photos: [],
              validation_status: 'Valid'
            }
          ],
          personnel: {
            site_id: siteId,
            planter_name: row.farmer,
            planter_mobile: row.farmer_mobile,
            caretaker_name: row.farmer,
            caretaker_mobile: row.farmer_mobile,
            is_caretaker_same_as_planter: true
          }
        }
      ]
    });
  });

  // 2. Generate remaining 311 records as high-fidelity coordinate clusters
  const totalToGenerate = 320;
  let runningIdCount = 1;

  while (submissions.length < totalToGenerate) {
    // Select one of the core coordinate centers
    const baseCenter = CORE_REAL_ROWS[runningIdCount % CORE_REAL_ROWS.length];
    
    // Add small randomized offset to scatter them realistically around Northern Bangladesh
    const latOffset = (Math.random() - 0.5) * 0.09; // scatter within ~10km
    const lngOffset = (Math.random() - 0.5) * 0.09;
    const itemLat = baseCenter.lat + latOffset;
    const itemLng = baseCenter.lng + lngOffset;

    // Pick dynamic quantities to fulfill: single plant, 5 plant, or orchard
    const rVal = Math.random();
    let quantity = 1;
    let plantationType: 'Single Tree' | 'Small Plantation' | 'Orchard / Large Plantation' = 'Single Tree';
    let radius: number | null = null;
    let polygon: { lat: number; lng: number }[] | null = null;

    if (rVal < 0.45) {
      // Single Tree
      quantity = Math.random() < 0.7 ? 1 : 2;
      plantationType = 'Single Tree';
    } else if (rVal < 0.85) {
      // Small Plantation
      quantity = 5;
      plantationType = 'Small Plantation';
      radius = 10 + Math.floor(Math.random() * 5);
    } else {
      // Orchard / Large Plantation
      quantity = [20, 33, 60, 85, 120, 220, 350][Math.floor(Math.random() * 7)];
      plantationType = 'Orchard / Large Plantation';
      polygon = [
        { lat: itemLat + 0.0003, lng: itemLng - 0.0003 },
        { lat: itemLat + 0.0003, lng: itemLng + 0.0003 },
        { lat: itemLat - 0.0003, lng: itemLng + 0.0003 },
        { lat: itemLat - 0.0003, lng: itemLng - 0.0003 }
      ];
    }

    const speciesTemplate = EXPANDED_SPECIES_LIST[Math.floor(Math.random() * EXPANDED_SPECIES_LIST.length)];
    const farmerName = BANGALORE_NAMES[Math.floor(Math.random() * BANGALORE_NAMES.length)];
    const phoneSuffix = Math.floor(1000000 + Math.random() * 9000000);
    const farmerMobile = `017${phoneSuffix}`;

    const subId = `SUB-GEN-${runningIdCount}`;
    const siteId = `SITE-GEN-${runningIdCount}`;

    const area = plantationType === 'Orchard / Large Plantation' ? quantity * 15 : (radius ? Math.round(Math.PI * radius * radius) : 1);
    const perimeter = plantationType === 'Orchard / Large Plantation' ? Math.round(4 * Math.sqrt(area)) : (radius ? Math.round(2 * Math.PI * radius) : 4);

    submissions.push({
      submission_id: subId,
      submitted_by_id: 'USR-001',
      submitted_by_name: 'Mithun Islam',
      office: OFFICE_NAMES[1],
      submitted_at: Date.now() - (runningIdCount * 4 * 3600 * 1000), // scattered over last month
      status: 'Approved',
      sites: [
        {
          site_id: siteId,
          submission_id: subId,
          plantation_type: plantationType,
          latitude: itemLat,
          longitude: itemLng,
          radius,
          polygon,
          area,
          perimeter,
          centroid: { lat: itemLat, lng: itemLng },
          address: `${baseCenter.village}, ${baseCenter.union} ইউনিয়ন, ${baseCenter.upazila} উপজেলা, ${baseCenter.district} জেলা`,
          division: 'রংপুর বিভাগ',
          district: baseCenter.district,
          upazila: baseCenter.upazila,
          union: baseCenter.union,
          village: baseCenter.village,
          road: 'Local Link Road',
          postcode: '5600',
          ndvi: parseFloat((0.22 + Math.random() * 0.45).toFixed(2)),
          carbon_estimate: parseFloat((quantity * 0.45).toFixed(2)),
          geofence_score: Math.floor(92 + Math.random() * 8),
          geofence_details: null,
          plants: [
            {
              plant_id: `PL-GEN-${runningIdCount}-1`,
              site_id: siteId,
              category: speciesTemplate.category,
              species: speciesTemplate.name,
              variety: speciesTemplate.variety,
              plantation_date: '2026-07-01',
              seedling_age: speciesTemplate.age,
              quantity,
              photos: [],
              validation_status: 'Valid'
            }
          ],
          personnel: {
            site_id: siteId,
            planter_name: farmerName,
            planter_mobile: farmerMobile,
            caretaker_name: farmerName,
            caretaker_mobile: farmerMobile,
            is_caretaker_same_as_planter: true
          }
        }
      ]
    });

    runningIdCount++;
  }

  return submissions;
}
