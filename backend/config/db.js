import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'esim_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Database Structure
const initialData = {
  users: [],
  admin_users: [],
  devices: [],
  plans: [
    {
      id: 'plan-jio-299',
      operator: 'Jio',
      plan_name: 'Freedom 299',
      price: 299,
      validity_days: 28,
      data_per_day: '1.5 GB/day',
      is_unlimited_5g: true,
      total_data_gb: 42,
      sms_allowance: '100 SMS/day',
      calling_benefits: 'Truly Unlimited Voice Calls (Local+STD)',
      ott_perks: 'JioTV, JioCinema, JioCloud',
      is_popular: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'plan-jio-719',
      operator: 'Jio',
      plan_name: 'Hero 5G 719',
      price: 719,
      validity_days: 84,
      data_per_day: '2.0 GB/day',
      is_unlimited_5g: true,
      total_data_gb: 168,
      sms_allowance: '100 SMS/day',
      calling_benefits: 'Truly Unlimited Calls + 5G Data Booster',
      ott_perks: 'JioHotstar Starter, JioCinema Premium',
      is_popular: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'plan-jio-3599',
      operator: 'Jio',
      plan_name: 'Annual Super 3599',
      price: 3599,
      validity_days: 365,
      data_per_day: '2.5 GB/day',
      is_unlimited_5g: true,
      total_data_gb: 912,
      sms_allowance: '100 SMS/day',
      calling_benefits: 'Unlimited Nationwide Calling + Free Roaming',
      ott_perks: '1 Year Disney+ Hotstar, Prime Video Mobile Edition',
      is_popular: false,
      created_at: new Date().toISOString()
    },
    {
      id: 'plan-airtel-299',
      operator: 'Airtel',
      plan_name: 'Smart 299',
      price: 299,
      validity_days: 28,
      data_per_day: '1.5 GB/day',
      is_unlimited_5g: true,
      total_data_gb: 42,
      sms_allowance: '100 SMS/day',
      calling_benefits: 'Unlimited STD + Local + Free Roaming',
      ott_perks: 'Airtel Xstream Play, Wynk Music Free',
      is_popular: false,
      created_at: new Date().toISOString()
    },
    {
      id: 'plan-airtel-379',
      operator: 'Airtel',
      plan_name: 'Unlimited 5G 379',
      price: 379,
      validity_days: 30,
      data_per_day: '2.0 GB/day',
      is_unlimited_5g: true,
      total_data_gb: 60,
      sms_allowance: '100 SMS/day',
      calling_benefits: 'Truly Unlimited Calls (All Networks)',
      ott_perks: 'Unlimited 5G Data, Apollo 24|7 Circle, Wynk',
      is_popular: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'plan-airtel-859',
      operator: 'Airtel',
      plan_name: 'Hero Combo 859',
      price: 859,
      validity_days: 84,
      data_per_day: '2.0 GB/day',
      is_unlimited_5g: true,
      total_data_gb: 168,
      sms_allowance: '100 SMS/day',
      calling_benefits: 'Unlimited Voice Calls + National Roaming',
      ott_perks: 'Xstream Play, RewardsMini, Spam Protection',
      is_popular: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'plan-vi-299',
      operator: 'Vi',
      plan_name: 'Max Daily 299',
      price: 299,
      validity_days: 28,
      data_per_day: '1.5 GB/day',
      is_unlimited_5g: false,
      total_data_gb: 42,
      sms_allowance: '100 SMS/day',
      calling_benefits: 'Unlimited Calls to Any Network',
      ott_perks: 'Binge All Night (12 AM - 6 AM No Data Limit), Weekend Rollover',
      is_popular: false,
      created_at: new Date().toISOString()
    },
    {
      id: 'plan-vi-479',
      operator: 'Vi',
      plan_name: 'Hero Unlimited 479',
      price: 479,
      validity_days: 56,
      data_per_day: '1.5 GB/day',
      is_unlimited_5g: false,
      total_data_gb: 84,
      sms_allowance: '100 SMS/day',
      calling_benefits: 'Truly Unlimited Voice Calling',
      ott_perks: 'Weekend Data Rollover, Data Delights (2GB Backup)',
      is_popular: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'plan-vi-859',
      operator: 'Vi',
      plan_name: 'Super Binge 859',
      price: 859,
      validity_days: 84,
      data_per_day: '2.0 GB/day',
      is_unlimited_5g: false,
      total_data_gb: 168,
      sms_allowance: '100 SMS/day',
      calling_benefits: 'Unlimited Calling All India',
      ott_perks: 'Night Binge, Vi Movies & TV VIP, Weekend Rollover',
      is_popular: false,
      created_at: new Date().toISOString()
    },
    {
      id: 'plan-bsnl-141',
      operator: 'BSNL',
      plan_name: 'Value Voice 141',
      price: 141,
      validity_days: 30,
      data_per_day: '1.5 GB/day',
      is_unlimited_5g: false,
      total_data_gb: 45,
      sms_allowance: '100 SMS/day',
      calling_benefits: 'Unlimited Voice Calling (Home + Roaming)',
      ott_perks: 'Free BSNL Custom Caller Tunes',
      is_popular: false,
      created_at: new Date().toISOString()
    },
    {
      id: 'plan-bsnl-439',
      operator: 'BSNL',
      plan_name: 'Quarterly Value 439',
      price: 439,
      validity_days: 90,
      data_per_day: '2.0 GB/day',
      is_unlimited_5g: false,
      total_data_gb: 180,
      sms_allowance: '100 SMS/day',
      calling_benefits: 'Unlimited Local and National Calls',
      ott_perks: 'Free PRBT + Eros Now Entertainment Pass',
      is_popular: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'plan-demo-199',
      operator: 'Demo Telecom',
      plan_name: 'eSIM Sandbox Starter',
      price: 199,
      validity_days: 28,
      data_per_day: '2.0 GB/day',
      is_unlimited_5g: true,
      total_data_gb: 56,
      sms_allowance: '100 SMS/day',
      calling_benefits: 'Unlimited Simulated High-Definition Voice (VoNR)',
      ott_perks: 'Full 5G Standalone Simulation Sandbox Access',
      is_popular: true,
      created_at: new Date().toISOString()
    }
  ],
  otp_verifications: [],
  payments: [],
  esim_requests: [],
  activation_logs: []
};

class Database {
  constructor() {
    this.data = this.load();
    this.seedDefaultUsers();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(fileContent);
      }
    } catch (err) {
      console.error('Error reading database file, initializing fresh store:', err);
    }
    this.save(initialData);
    return JSON.parse(JSON.stringify(initialData));
  }

  save(dataToSave = this.data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting database to disk:', err);
    }
  }

  seedDefaultUsers() {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('password123', salt);
    const adminPasswordHash = bcrypt.hashSync('admin123', salt);

    // Default Regular Demo User
    let demoUser = this.data.users.find(u => u.email === 'user@example.com');
    if (!demoUser) {
      demoUser = {
        id: 'usr-demo-001',
        name: 'Alex Johnson',
        email: 'user@example.com',
        phone: '9876543210',
        password_hash: passwordHash,
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.data.users.push(demoUser);
    }

    // Default Demo Admin User
    let demoAdmin = this.data.admin_users.find(a => a.email === 'admin@telecom.demo');
    if (!demoAdmin) {
      demoAdmin = {
        id: 'adm-demo-001',
        name: 'Telecom Administrator',
        email: 'admin@telecom.demo',
        password_hash: adminPasswordHash,
        role: 'admin',
        created_at: new Date().toISOString()
      };
      this.data.admin_users.push(demoAdmin);
    }

    // Seed a registered demo device for the demo user if none exists
    const userDevices = this.data.devices.filter(d => d.user_id === 'usr-demo-001');
    if (userDevices.length === 0) {
      const sampleDevice = {
        id: 'dev-demo-001',
        user_id: 'usr-demo-001',
        device_name: 'iPhone 15 Pro Max',
        device_model: 'A3106 (Global)',
        os: 'iOS 17.5',
        device_type: 'iPhone',
        eid: '89049032000000000000000000001001',
        imei: '354890123456789',
        created_at: new Date().toISOString()
      };
      this.data.devices.push(sampleDevice);

      // Seed a sample completed eSIM activation request
      const sampleRequestId = 'req-demo-001';
      const samplePlan = this.data.plans[0];
      const sampleEsimRequest = {
        id: sampleRequestId,
        request_code: 'REQ-2026-89101',
        user_id: 'usr-demo-001',
        device_id: sampleDevice.id,
        plan_id: samplePlan.id,
        operator: 'Jio',
        eid: sampleDevice.eid,
        msisdn: '9876543210',
        status: 'ACTIVATED',
        activation_code: 'LPA:1$smdp.telecom-demo.io$ACT-DEMO-PROFILE-001',
        smdp_server: 'smdp.telecom-demo.io',
        qr_code_url: null,
        failure_reason: null,
        created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
        updated_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
      };
      this.data.esim_requests.push(sampleEsimRequest);

      // Seed payment
      this.data.payments.push({
        id: 'pay-demo-001',
        user_id: 'usr-demo-001',
        request_id: sampleRequestId,
        plan_id: samplePlan.id,
        amount: 299.00,
        tax: 53.82,
        total_amount: 352.82,
        payment_method: 'MOCK_UPI',
        transaction_id: 'TXN-DEMO-99887766',
        status: 'SUCCESS',
        created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
      });

      // Seed log
      this.data.activation_logs.push({
        id: 'log-demo-001',
        request_id: sampleRequestId,
        from_status: 'PROFILE_GENERATED',
        to_status: 'ACTIVATED',
        note: 'Mock eSIM profile successfully provisioned and installed on demo device.',
        created_by: 'MOCK_SMDP_ENGINE',
        created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
      });
    }

    this.save();
  }

  // Generic collection helpers
  find(collection, filterFn = () => true) {
    return (this.data[collection] || []).filter(filterFn);
  }

  findOne(collection, filterFn) {
    return (this.data[collection] || []).find(filterFn) || null;
  }

  findById(collection, id) {
    return (this.data[collection] || []).find(item => item.id === id) || null;
  }

  insert(collection, item) {
    if (!this.data[collection]) {
      this.data[collection] = [];
    }
    const newItem = {
      id: item.id || `${collection.slice(0, 3)}-${uuidv4().slice(0, 8)}`,
      created_at: new Date().toISOString(),
      ...item
    };
    this.data[collection].push(newItem);
    this.save();
    return newItem;
  }

  update(collection, id, updates) {
    const index = (this.data[collection] || []).findIndex(item => item.id === id);
    if (index === -1) return null;

    this.data[collection][index] = {
      ...this.data[collection][index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.data[collection][index];
  }

  delete(collection, id) {
    const index = (this.data[collection] || []).findIndex(item => item.id === id);
    if (index === -1) return false;

    this.data[collection].splice(index, 1);
    this.save();
    return true;
  }
}

export const db = new Database();
export default db;
