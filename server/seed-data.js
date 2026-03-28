const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const User = require('./models/User.model.js');
const Party = require('./models/Party.model.js');
const Product = require('./models/Product.model.js');
const Invoice = require('./models/Invoice.model.js');

const MONGODB_URI = process.env.MONGODB_URI;

// ── Sample Data ─────────────────────────────────────────────────────────────
const parties = [
  { name: 'TechNova Solutions', type: 'customer', gstin: '33AABCT1234L1ZF', state: 'Tamil Nadu', email: 'billing@technova.in', phone: '9876543210', address: '12, Tech Park, Chennai' },
  { name: 'Global Logistics Pvt Ltd', type: 'vendor', gstin: '27AADCG9876Q1Z5', state: 'Maharashtra', email: 'accounts@globallogistics.com', phone: '9001122334', address: '45, Andheri East, Mumbai' },
  { name: 'Apex Electronics', type: 'customer', gstin: '29AABCA5678M1ZW', state: 'Karnataka', email: 'purchase@apexelectronics.in', phone: '9988776655', address: 'Electronic City, Bangalore' },
  { name: 'Sunrise Traders', type: 'customer', gstin: '33BBXCS9012R2Z8', state: 'Tamil Nadu', email: 'info@sunrisetraders.com', phone: '9840123456', address: 'T Nagar, Chennai' },
  { name: 'MegaCorp Industries', type: 'vendor', gstin: '07AACCM1122P1Z0', state: 'Delhi', email: 'finance@megacorp.in', phone: '9112233445', address: 'Connaught Place, New Delhi' },
];

const products = [
  { name: 'Dell XPS 15 Laptop', hsn: '8471', basePrice: 125000, unit: 'NOS', gstRate: 18, description: 'High-performance laptop for development' },
  { name: 'Logitech MX Master 3S', hsn: '8471', basePrice: 8500, unit: 'NOS', gstRate: 18, description: 'Wireless ergonomic mouse' },
  { name: 'Office Chair (Ergonomic)', hsn: '9403', basePrice: 15000, unit: 'NOS', gstRate: 18, description: 'Mesh adjustable office chair' },
  { name: 'Server Rack 42U', hsn: '8471', basePrice: 45000, unit: 'NOS', gstRate: 28, description: 'Data center server rack' },
  { name: 'Cat6 Ethernet Cable (Box)', hsn: '8544', basePrice: 4500, unit: 'Box', gstRate: 18, description: '305m Cat6 Networking Cable' },
  { name: 'Consulting Services', hsn: '9983', basePrice: 25000, unit: 'HRS', gstRate: 18, description: 'IT Infrastructure Consulting' },
];

const invoices = [
  {
    invoiceNo: 'INV/2024-25/001',
    type: 'sales',
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    status: 'confirmed',
    partyIndex: 0, // TechNova (TN - Intra-state)
    items: [
      { productIndex: 0, qty: 2, rate: 125000, gstRate: 18 },
      { productIndex: 1, qty: 5, rate: 8500, gstRate: 18 }
    ]
  },
  {
    invoiceNo: 'INV/2024-25/002',
    type: 'purchase',
    date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
    status: 'confirmed',
    partyIndex: 1, // Global Logistics (MH - Inter-state)
    items: [
      { productIndex: 4, qty: 10, rate: 4500, gstRate: 18 }
    ]
  },
  {
    invoiceNo: 'INV/2024-25/003',
    type: 'sales',
    date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    status: 'confirmed',
    partyIndex: 2, // Apex Electronics (KA - Inter-state)
    items: [
      { productIndex: 5, qty: 10, rate: 25000, gstRate: 18 },
      { productIndex: 3, qty: 1, rate: 45000, gstRate: 28 }
    ]
  },
  {
    invoiceNo: 'INV/2024-25/004',
    type: 'sales',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    status: 'draft',
    partyIndex: 3, // Sunrise Traders (TN - Intra-state)
    items: [
      { productIndex: 2, qty: 15, rate: 15000, gstRate: 18 }
    ]
  },
  {
    invoiceNo: 'INV/2024-25/005',
    type: 'purchase',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    status: 'confirmed',
    partyIndex: 4, // MegaCorp (DL - Inter-state)
    items: [
      { productIndex: 3, qty: 5, rate: 42000, gstRate: 28 } // Wholesale rate
    ]
  }
];

// ── Connect & Seed ──────────────────────────────────────────────────────────
async function seedDB() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // 1. Get the admin user
    const admin = await User.findOne({ email: 'admin@gstflowpro.in' });
    if (!admin) {
      console.error('❌ Admin user not found! Please run node seed.js first to create the admin user.');
      process.exit(1);
    }
    const userId = admin._id;
    console.log(`👤 Found admin user: ${admin.name}`);

    // 2. Clear existing demo data
    console.log('🗑️ Clearing existing parties, products, and invoices...');
    await Party.deleteMany({ user: userId });
    await Product.deleteMany({ user: userId });
    await Invoice.deleteMany({ user: userId });

    // 3. Insert Parties
    console.log('👥 Seeding Parties...');
    const insertedParties = await Party.insertMany(
      parties.map(p => ({ ...p, user: userId }))
    );
    console.log(`✅ Inserted ${insertedParties.length} parties`);

    // 4. Insert Products
    console.log('📦 Seeding Products...');
    const insertedProducts = await Product.insertMany(
      products.map(p => ({ ...p, user: userId }))
    );
    console.log(`✅ Inserted ${insertedProducts.length} products`);

    // 5. Insert Invoices (with calculated GST)
    console.log('🧾 Seeding Invoices...');
    const adminState = admin.state || 'Tamil Nadu';

    const invoiceDocs = invoices.map(invDef => {
      const party = insertedParties[invDef.partyIndex];
      const items = invDef.items.map(itemDef => {
        const product = insertedProducts[itemDef.productIndex];
        const amount = itemDef.qty * itemDef.rate;
        return {
          desc: product.name,
          hsn: product.hsn,
          qty: itemDef.qty,
          rate: itemDef.rate,
          gstRate: itemDef.gstRate,
          amount: amount
        };
      });

      // Calculate taxes
      let taxable = 0;
      let cgst = 0;
      let sgst = 0;
      let igst = 0;

      const isInterState = party.state !== adminState;

      items.forEach(item => {
        taxable += item.amount;
        const taxVal = item.amount * (item.gstRate / 100);
        
        if (isInterState) {
          igst += taxVal;
        } else {
          cgst += taxVal / 2;
          sgst += taxVal / 2;
        }
      });

      return {
        user: userId,
        invoiceNo: invDef.invoiceNo,
        type: invDef.type,
        date: invDef.date,
        status: invDef.status,
        party: {
          partyId: party._id,
          name: party.name,
          gstin: party.gstin,
          state: party.state
        },
        items: items,
        taxable: taxable,
        cgst: cgst,
        sgst: sgst,
        igst: igst,
        total: taxable + cgst + sgst + igst
      };
    });

    const insertedInvoices = await Invoice.insertMany(invoiceDocs);
    console.log(`✅ Inserted ${insertedInvoices.length} invoices`);

    console.log('🎉 Seeding complete! The dashboard should now be populated with realistic data.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    process.exit(1);
  }
}

seedDB();
