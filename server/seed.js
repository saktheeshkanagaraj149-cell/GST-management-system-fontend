require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Inline minimal User model to avoid circular deps
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  businessName: String,
  gstin: String,
  state: String,
  role: { type: String, default: 'admin' },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected for seeding...');

    const testEmail = 'admin@gstflowpro.in';
    const testPassword = 'Admin@2025';

    const existing = await User.findOne({ email: testEmail });
    if (existing) {
      console.log('⚠️  Test user already exists:', testEmail);
    } else {
      const hash = await bcrypt.hash(testPassword, 12);
      await User.create({
        name: 'GSTFlow Admin',
        email: testEmail,
        password: hash,
        businessName: 'GSTFlow Demo Business',
        gstin: '33AABCS1234L1ZF',
        state: 'Tamil Nadu',
        role: 'admin',
      });
      console.log('✅ Test user created successfully!');
    }

    console.log('');
    console.log('══════════════════════════════════');
    console.log('  TEST LOGIN CREDENTIALS');
    console.log('  Email   : admin@gstflowpro.in');
    console.log('  Password: Admin@2025');
    console.log('══════════════════════════════════');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seed();
