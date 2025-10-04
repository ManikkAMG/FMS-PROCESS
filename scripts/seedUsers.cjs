// Self-contained user seeding script (Node 18+ - uses global fetch)

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const API_URL = process.env.VITE_APPS_SCRIPT_URL;

if (!API_URL) {
  console.error('Error: VITE_APPS_SCRIPT_URL environment variable is not set in .env');
  process.exit(1);
}

const sampleUsers = [
  { username: 'admin', password: 'admin123', name: 'Administrator', role: 'admin', department: 'Management' },
  { username: 'john.doe', password: 'password123', name: 'John Doe', role: 'user', department: 'Engineering' },
  { username: 'jane.smith', password: 'password123', name: 'Jane Smith', role: 'user', department: 'Marketing' },
  { username: 'robert.johnson', password: 'password123', name: 'Robert Johnson', role: 'manager', department: 'Sales' },
  { username: 'sarah.williams', password: 'password123', name: 'Sarah Williams', role: 'user', department: 'Finance' },
  { username: 'michael.brown', password: 'password123', name: 'Michael Brown', role: 'user', department: 'HR' }
];

async function callAPI(action, params = {}) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...params })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (err) {
    return { success: false, message: err.message || String(err) };
  }
}

async function createUser(user) {
  return callAPI('createUser', user);
}

async function seedUsers() {
  console.log('Starting user seeding...');
  for (const user of sampleUsers) {
    console.log('Creating:', user.username);
    const result = await createUser(user);
    if (result.success) {
      console.log('✅', user.username);
    } else {
      console.error('❌', user.username, result.message || result);
    }
    await new Promise((r) => setTimeout(r, 600));
  }
  console.log('Seeding completed.');
}

seedUsers().catch((e) => {
  console.error('Seeding failed:', e);
  process.exit(1);
});