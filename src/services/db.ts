/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Submission, 
  OfflineSyncQueueItem,
  User,
  Office,
  Species,
  GeoFence,
  PlantPhoto,
  ValidationTask,
  Inspection,
  NDVIHistory,
  CarbonHistory,
  Notification,
  AuditLog,
  SyncQueue,
  QRCode,
  Division,
  District,
  Upazila,
  UnionBoundary
} from '../types';

const DB_NAME = 'PlantationSubmissionDB';
const DB_VERSION = 2;

// Standard Stores
export const STORE_SUBMISSIONS = 'submissions';
export const STORE_SYNC_QUEUE = 'sync_queue';

// 12 New Relational & Meta-data Stores
export const STORE_USERS = 'users';
export const STORE_OFFICES = 'offices';
export const STORE_SPECIES = 'species';
export const STORE_GEOFENCES = 'geofences';
export const STORE_PLANT_PHOTOS = 'plant_photos';
export const STORE_VALIDATION_TASKS = 'validation_tasks';
export const STORE_INSPECTIONS = 'inspections';
export const STORE_NDVI_HISTORY = 'ndvi_history';
export const STORE_CARBON_HISTORY = 'carbon_history';
export const STORE_NOTIFICATIONS = 'notifications';
export const STORE_AUDIT_LOGS = 'audit_logs';
export const STORE_SYNC_QUEUES = 'sync_queues';
export const STORE_QR_CODES = 'qr_codes';
export const STORE_DIVISIONS = 'divisions';
export const STORE_DISTRICTS = 'districts';
export const STORE_UPAZILAS = 'upazilas';
export const STORE_UNIONS = 'unions';

class IndexedDBService {
  private db: IDBDatabase | null = null;

  private initDB(): Promise<IDBDatabase> {
    if (this.db) return Promise.resolve(this.db);

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Helper to safely create stores
        const ensureStore = (name: string, keyPath: string) => {
          if (!db.objectStoreNames.contains(name)) {
            db.createObjectStore(name, { keyPath });
          }
        };

        ensureStore(STORE_SUBMISSIONS, 'submission_id');
        ensureStore(STORE_SYNC_QUEUE, 'queue_id');
        ensureStore(STORE_USERS, 'user_id');
        ensureStore(STORE_OFFICES, 'office_id');
        ensureStore(STORE_SPECIES, 'species_id');
        ensureStore(STORE_GEOFENCES, 'geofence_id');
        ensureStore(STORE_PLANT_PHOTOS, 'photo_id');
        ensureStore(STORE_VALIDATION_TASKS, 'task_id');
        ensureStore(STORE_INSPECTIONS, 'inspection_id');
        ensureStore(STORE_NDVI_HISTORY, 'history_id');
        ensureStore(STORE_CARBON_HISTORY, 'history_id');
        ensureStore(STORE_NOTIFICATIONS, 'notification_id');
        ensureStore(STORE_AUDIT_LOGS, 'log_id');
        ensureStore(STORE_SYNC_QUEUES, 'queue_id');
        ensureStore(STORE_QR_CODES, 'qr_id');
        ensureStore(STORE_DIVISIONS, 'division_id');
        ensureStore(STORE_DISTRICTS, 'district_id');
        ensureStore(STORE_UPAZILAS, 'upazila_id');
        ensureStore(STORE_UNIONS, 'union_id');
      };

      request.onsuccess = async (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        await this.seedDatabaseIfEmpty();
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  // --- Generic Store Operations ---

  public async saveItem<T>(storeName: string, item: T): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async getItem<T>(storeName: string, key: string): Promise<T | null> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  public async getAllItems<T>(storeName: string): Promise<T[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  public async deleteItem(storeName: string, key: string): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- Submissions Store (Legacy Helpers preserved for AppContext backwards compatibility) ---

  public async saveSubmission(submission: Submission): Promise<void> {
    return this.saveItem(STORE_SUBMISSIONS, submission);
  }

  public async getSubmission(submissionId: string): Promise<Submission | null> {
    return this.getItem(STORE_SUBMISSIONS, submissionId);
  }

  public async getAllSubmissions(): Promise<Submission[]> {
    return this.getAllItems(STORE_SUBMISSIONS);
  }

  public async deleteSubmission(submissionId: string): Promise<void> {
    return this.deleteItem(STORE_SUBMISSIONS, submissionId);
  }

  // --- Sync Queue Store (Legacy Helpers preserved) ---

  public async addToSyncQueue(item: OfflineSyncQueueItem): Promise<void> {
    return this.saveItem(STORE_SYNC_QUEUE, item);
  }

  public async getSyncQueue(): Promise<OfflineSyncQueueItem[]> {
    return this.getAllItems(STORE_SYNC_QUEUE);
  }

  public async removeFromSyncQueue(queueId: string): Promise<void> {
    return this.deleteItem(STORE_SYNC_QUEUE, queueId);
  }

  // --- Automatic Database Seeding on Bootstrap ---

  private async seedDatabaseIfEmpty(): Promise<void> {
    // 1. Seed Species Master Data
    const existingSpecies = await this.getAllItems<Species>(STORE_SPECIES);
    if (existingSpecies.length === 0) {
      const initialSpecies: Species[] = [
        { species_id: 'SP-001', category: 'Fruit', scientific_name: 'Mangifera indica', local_name: 'Mango (আম)', carbon_factor: 12.4, life_span: 60, recommended_spacing: '5m x 5m' },
        { species_id: 'SP-002', category: 'Fruit', scientific_name: 'Artocarpus heterophyllus', local_name: 'Jackfruit (কাঁঠাল)', carbon_factor: 14.8, life_span: 80, recommended_spacing: '6m x 6m' },
        { species_id: 'SP-003', category: 'Timber', scientific_name: 'Swietenia mahagoni', local_name: 'Mahogany (মেহগনি)', carbon_factor: 22.5, life_span: 40, recommended_spacing: '4m x 4m' },
        { species_id: 'SP-004', category: 'Timber', scientific_name: 'Tectona grandis', local_name: 'Teak (সেগুন)', carbon_factor: 24.1, life_span: 50, recommended_spacing: '4m x 4m' },
        { species_id: 'SP-005', category: 'Medicinal', scientific_name: 'Azadirachta indica', local_name: 'Neem (নিম)', carbon_factor: 18.2, life_span: 120, recommended_spacing: '5m x 5m' },
        { species_id: 'SP-006', category: 'Medicinal', scientific_name: 'Terminalia arjuna', local_name: 'Arjun (অর্জুন)', carbon_factor: 19.5, life_span: 100, recommended_spacing: '5m x 5m' },
      ];
      for (const s of initialSpecies) {
        await this.saveItem(STORE_SPECIES, s);
      }
    }

    // 2. Seed Administrative Boundary Master Tables
    const divisions = await this.getAllItems<Division>(STORE_DIVISIONS);
    if (divisions.length === 0) {
      const initialDivisions: Division[] = [
        { division_id: 'DIV-01', name_en: 'Dhaka Division', name_bn: 'ঢাকা বিভাগ' },
        { division_id: 'DIV-02', name_en: 'Chittagong Division', name_bn: 'চট্টগ্রাম বিভাগ' },
        { division_id: 'DIV-03', name_en: 'Rajshahi Division', name_bn: 'রাজশাহী বিভাগ' },
        { division_id: 'DIV-04', name_en: 'Sylhet Division', name_bn: 'সিলেট বিভাগ' },
        { division_id: 'DIV-05', name_en: 'Khulna Division', name_bn: 'খুলনা বিভাগ' },
      ];
      const initialDistricts: District[] = [
        { district_id: 'DIST-01', division_id: 'DIV-01', name_en: 'Dhaka', name_bn: 'ঢাকা' },
        { district_id: 'DIST-02', division_id: 'DIV-02', name_en: 'Chittagong', name_bn: 'চট্টগ্রাম' },
        { district_id: 'DIST-03', division_id: 'DIV-03', name_en: 'Rajshahi', name_bn: 'রাজশাহী' },
        { district_id: 'DIST-04', division_id: 'DIV-04', name_en: 'Sylhet', name_bn: 'সিলেট' },
        { district_id: 'DIST-05', division_id: 'DIV-05', name_en: 'Khulna', name_bn: 'খুলনা' },
      ];
      const initialUpazilas: Upazila[] = [
        { upazila_id: 'UPA-01', district_id: 'DIST-01', name_en: 'Savar', name_bn: 'সাভার' },
        { upazila_id: 'UPA-02', district_id: 'DIST-02', name_en: 'Hathazari', name_bn: 'হাটহাজারী' },
        { upazila_id: 'UPA-03', district_id: 'DIST-03', name_en: 'Paba', name_bn: 'পবা' },
        { upazila_id: 'UPA-04', district_id: 'DIST-04', name_en: 'Sreemangal', name_bn: 'শ্রীমঙ্গল' },
        { upazila_id: 'UPA-05', district_id: 'DIST-05', name_en: 'Dumuria', name_bn: 'ডুমুরিয়া' },
      ];
      const initialUnions: UnionBoundary[] = [
        { union_id: 'UNI-01', upazila_id: 'UPA-01', name_en: 'Ashulia', name_bn: 'আশুলিয়া' },
        { union_id: 'UNI-02', upazila_id: 'UPA-01', name_en: 'Tetuljhora', name_bn: 'তেঁতুলঝোড়া' },
        { union_id: 'UNI-03', upazila_id: 'UPA-02', name_en: 'Ghalia', name_bn: 'ঘালিয়া' },
        { union_id: 'UNI-04', upazila_id: 'UPA-03', name_en: 'Harian', name_bn: 'হরিয়ান' },
        { union_id: 'UNI-05', upazila_id: 'UPA-04', name_en: 'Kalighat', name_bn: 'কালীঘাট' },
        { union_id: 'UNI-06', upazila_id: 'UPA-05', name_en: 'Shovana', name_bn: 'শোভনা' },
      ];

      for (const d of initialDivisions) await this.saveItem(STORE_DIVISIONS, d);
      for (const ds of initialDistricts) await this.saveItem(STORE_DISTRICTS, ds);
      for (const up of initialUpazilas) await this.saveItem(STORE_UPAZILAS, up);
      for (const un of initialUnions) await this.saveItem(STORE_UNIONS, un);
    }

    // 3. Seed Users & Offices
    const users = await this.getAllItems<User>(STORE_USERS);
    if (users.length === 0) {
      const initialUsers: User[] = [
        { user_id: 'USR-001', name: 'Mithun Islam', designation: 'Agriculture Extension Officer', role: 'Planter', office: 'Savar Extension Office', district: 'Dhaka', upazila: 'Savar', block: 'Ashulia-B' },
        { user_id: 'USR-002', name: 'Zakir Hossain', designation: 'Senior Validator', role: 'Validator', office: 'Department of Agricultural Extension, Dhaka', district: 'Dhaka', upazila: 'Savar', block: 'Central' },
        { user_id: 'USR-003', name: 'Sharmin Akter', designation: 'GIS Analyst', role: 'Admin', office: 'Remote Sensing Lab, Dhaka', district: 'Dhaka', upazila: 'Central', block: 'System' },
      ];
      const initialOffices: Office[] = [
        { office_id: 'OFF-001', name: 'Savar Upazila Agriculture Extension Office', region: 'Dhaka Region', contact_number: '+880299661122' },
        { office_id: 'OFF-002', name: 'Hathazari Range Forest Office', region: 'Chittagong Region', contact_number: '+880317112233' },
      ];
      for (const u of initialUsers) await this.saveItem(STORE_USERS, u);
      for (const o of initialOffices) await this.saveItem(STORE_OFFICES, o);
    }

    // 4. Seed some sample ValidationTasks & Inspections to show mock audit lists
    const tasks = await this.getAllItems<ValidationTask>(STORE_VALIDATION_TASKS);
    if (tasks.length === 0) {
      await this.saveItem(STORE_VALIDATION_TASKS, {
        task_id: 'TSK-201',
        submission_id: 'SUB-881204',
        site_id: 'SITE-101',
        validator_id: 'USR-002',
        validator_name: 'Zakir Hossain',
        validator_role: 'Senior Validator',
        assigned_date: Date.now() - 3 * 24 * 60 * 60 * 1000,
        due_date: Date.now() + 5 * 24 * 60 * 60 * 1000,
        status: 'Completed',
        remarks: 'NDVI signatures match perfect sapling density threshold.',
        approved_at: Date.now() - 2 * 24 * 60 * 60 * 1000,
        rejected_at: null,
      } as ValidationTask);

      await this.saveItem(STORE_VALIDATION_TASKS, {
        task_id: 'TSK-202',
        submission_id: 'SUB-492102',
        site_id: 'SITE-102',
        validator_id: 'USR-002',
        validator_name: 'Zakir Hossain',
        validator_role: 'Senior Validator',
        assigned_date: Date.now() - 1 * 24 * 60 * 60 * 1000,
        due_date: Date.now() + 7 * 24 * 60 * 60 * 1000,
        status: 'Pending',
        remarks: 'Assigned for satellite alignment verification.',
        approved_at: null,
        rejected_at: null,
      } as ValidationTask);
    }

    const inspections = await this.getAllItems<Inspection>(STORE_INSPECTIONS);
    if (inspections.length === 0) {
      await this.saveItem(STORE_INSPECTIONS, {
        inspection_id: 'INSP-501',
        site_id: 'SITE-101',
        inspection_date: Date.now() - 15 * 24 * 60 * 60 * 1000,
        inspector_id: 'USR-002',
        inspector_name: 'Zakir Hossain',
        survival_count: 72,
        dead_count: 3,
        height: 1.25,
        canopy: 18,
        health_status: 'Excellent',
        remarks: 'Excellent soil preparation. Fast budding seen in mango trees.',
      } as Inspection);
    }

    // 5. Seed some initial NDVI/Carbon History and Notifications
    const ndviHist = await this.getAllItems<NDVIHistory>(STORE_NDVI_HISTORY);
    if (ndviHist.length === 0) {
      const dates = [
        Date.now() - 120 * 24 * 60 * 60 * 1000,
        Date.now() - 90 * 24 * 60 * 60 * 1000,
        Date.now() - 60 * 24 * 60 * 60 * 1000,
        Date.now() - 30 * 24 * 60 * 60 * 1000,
        Date.now()
      ];
      for (let i = 0; i < dates.length; i++) {
        await this.saveItem(STORE_NDVI_HISTORY, {
          history_id: `NDVI-HIST-101-${i}`,
          site_id: 'SITE-101',
          date: dates[i],
          ndvi: 0.42 + i * 0.082, // rising trend
          source: 'Sentinel-2 Satellite',
        } as NDVIHistory);

        await this.saveItem(STORE_CARBON_HISTORY, {
          history_id: `CARB-HIST-101-${i}`,
          site_id: 'SITE-101',
          date: dates[i],
          carbon: 8.5 + i * 3.2,
          method: 'Biomass Canopy Regression',
        } as CarbonHistory);
      }
    }

    const notifications = await this.getAllItems<Notification>(STORE_NOTIFICATIONS);
    if (notifications.length === 0) {
      await this.saveItem(STORE_NOTIFICATIONS, {
        notification_id: 'NOTIF-01',
        recipient: 'USR-001',
        role: 'Planter',
        title: 'Submission Approved',
        message: 'Your plantation site Savar SITE-101 has been validated and officially approved.',
        status: 'Unread',
        created_at: Date.now() - 4 * 60 * 60 * 1000,
        read_at: null,
      } as Notification);
    }

    // 6. Seed Real Submissions from App_Entry sheet (single plant, 5 plants, and orchard)
    const submissions = await this.getAllItems<Submission>(STORE_SUBMISSIONS);
    if (submissions.length === 0) {
      const initialSubmissions: Submission[] = [
        {
          submission_id: 'SUB-mrd3fmrjqe6os37',
          submitted_by_id: 'USR-001',
          submitted_by_name: 'Mithun Islam',
          office: 'Savar Upazila Agriculture Extension Office, Dhaka',
          submitted_at: new Date('2026-07-08T22:56:05').getTime(),
          status: 'Approved',
          sites: [
            {
              site_id: 'SITE-mrd3fmrjqe6os37',
              submission_id: 'SUB-mrd3fmrjqe6os37',
              plantation_type: 'Single Tree',
              latitude: 25.803363,
              longitude: 89.638701,
              radius: null,
              polygon: null,
              area: 1,
              perimeter: 4,
              centroid: { lat: 25.803363, lng: 89.638701 },
              address: 'R562, বেলগাছা, মোগলবাসা ইউনিয়ন, কুড়িগ্রাম সদর উপজেলা, কুড়িগ্রাম জেলা, রংপুর বিভাগ, বাংলাদেশ',
              division: 'রংপুর বিভাগ',
              district: 'কুড়িগ্রাম',
              upazila: 'কুড়িগ্রাম সদর',
              union: 'মোগলবাসা',
              village: 'বেলগাছা',
              road: 'R562',
              postcode: '5600',
              ndvi: 0.33,
              carbon_estimate: 1.2,
              geofence_score: 98,
              geofence_details: null,
              plants: [
                {
                  plant_id: 'PL-mrd3fmrjqe6os37-1',
                  site_id: 'SITE-mrd3fmrjqe6os37',
                  category: 'Fruit',
                  species: 'Mango (আম)',
                  variety: 'Local',
                  plantation_date: '2026-07-01',
                  seedling_age: '6 months',
                  quantity: 1,
                  photos: [],
                  validation_status: 'Valid'
                }
              ],
              personnel: {
                site_id: 'SITE-mrd3fmrjqe6os37',
                planter_name: 'Test',
                planter_mobile: '01700300040',
                caretaker_name: 'Test',
                caretaker_mobile: '01700300040',
                is_caretaker_same_as_planter: true
              }
            }
          ]
        },
        {
          submission_id: 'SUB-mrd4lahos4sus7',
          submitted_by_id: 'USR-001',
          submitted_by_name: 'Mithun Islam',
          office: 'Savar Upazila Agriculture Extension Office, Dhaka',
          submitted_at: new Date('2026-07-08T23:28:27').getTime(),
          status: 'Approved',
          sites: [
            {
              site_id: 'SITE-mrd4lahos4sus7',
              submission_id: 'SUB-mrd4lahos4sus7',
              plantation_type: 'Small Plantation',
              latitude: 25.802903,
              longitude: 89.637888,
              radius: 10,
              polygon: null,
              area: 314,
              perimeter: 62.8,
              centroid: { lat: 25.802903, lng: 89.637888 },
              address: 'R562, বেলগাছা, মোগলবাসা ইউনিয়ন, কুড়িগ্রাম সদর উপজেলা, কুড়িগ্রাম জেলা, রংপুর বিভাগ, বাংলাদেশ',
              division: 'রংপুর বিভাগ',
              district: 'কুড়িগ্রাম',
              upazila: 'কুড়িগ্রাম সদর',
              union: 'মোগলবাসা',
              village: 'বেলগাছা',
              road: 'R562',
              postcode: '5600',
              ndvi: 0.25,
              carbon_estimate: 4.8,
              geofence_score: 94,
              geofence_details: null,
              plants: [
                {
                  plant_id: 'PL-mrd4lahos4sus7-1',
                  site_id: 'SITE-mrd4lahos4sus7',
                  category: 'Fruit',
                  species: 'Mango (আম)',
                  variety: 'Incentive',
                  plantation_date: '2026-07-09',
                  seedling_age: '6 months',
                  quantity: 5,
                  photos: [],
                  validation_status: 'Valid'
                }
              ],
              personnel: {
                site_id: 'SITE-mrd4lahos4sus7',
                planter_name: 'মনু মিয়া',
                planter_mobile: '01748485819',
                caretaker_name: 'নজরুল ইসলাম',
                caretaker_mobile: '01765856589',
                is_caretaker_same_as_planter: false
              }
            }
          ]
        },
        {
          submission_id: 'SUB-mrd3fmrjqe6os3',
          submitted_by_id: 'USR-001',
          submitted_by_name: 'Mithun Islam',
          office: 'Savar Upazila Agriculture Extension Office, Dhaka',
          submitted_at: new Date('2026-07-08T21:56:07').getTime(),
          status: 'Approved',
          sites: [
            {
              site_id: 'SITE-mrd3fmrjqe6os3',
              submission_id: 'SUB-mrd3fmrjqe6os3',
              plantation_type: 'Orchard / Large Plantation',
              latitude: 25.830043,
              longitude: 89.6245,
              radius: null,
              polygon: [
                { lat: 25.8305, lng: 89.6240 },
                { lat: 25.8305, lng: 89.6250 },
                { lat: 25.8295, lng: 89.6250 },
                { lat: 25.8295, lng: 89.6240 }
              ],
              area: 10000,
              perimeter: 400,
              centroid: { lat: 25.830043, lng: 89.6245 },
              address: 'হলোখানা, হলোখানা ইউনিয়ন, কুড়িগ্রাম সদর উপজেলা, কুড়িগ্রাম জেলা, রংপুর বিভাগ, বাংলাদেশ',
              division: 'রংপুর বিভাগ',
              district: 'কুড়িগ্রাম',
              upazila: 'কুড়িগ্রাম সদর',
              union: 'হলোখানা',
              village: 'হলোখানা',
              road: 'Holokhana Road',
              postcode: '5600',
              ndvi: 0.65,
              carbon_estimate: 84.5,
              geofence_score: 97,
              geofence_details: null,
              plants: [
                {
                  plant_id: 'PL-mrd3fmrjqe6os3-1',
                  site_id: 'SITE-mrd3fmrjqe6os3',
                  category: 'Fruit',
                  species: 'Lemon (লেবু)',
                  variety: 'Seedless (সিডরেস)',
                  plantation_date: '2026-06-02',
                  seedling_age: '9 months',
                  quantity: 220,
                  photos: [],
                  validation_status: 'Valid'
                }
              ],
              personnel: {
                site_id: 'SITE-mrd3fmrjqe6os3',
                planter_name: 'মোঃ আমিনুর ইসলাম',
                planter_mobile: '01723360770',
                caretaker_name: 'এস এম তরিকুল ইসলাম',
                caretaker_mobile: '01716026306',
                is_caretaker_same_as_planter: false
              }
            }
          ]
        }
      ];
      for (const sub of initialSubmissions) {
        await this.saveItem(STORE_SUBMISSIONS, sub);
      }
    }
  }
}

export const dbService = new IndexedDBService();
