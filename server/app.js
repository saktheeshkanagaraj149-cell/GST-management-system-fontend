//app.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const partyRoutes = require('./routes/party.routes');
const productRoutes = require('./routes/product.routes');
const reportRoutes = require('./routes/report.routes');
const mcpRoutes = require('./routes/mcp.routes');
const { errorHandler, notFound } = require('./middleware/error.middleware');

const app = express();

let isConnected = false;

const ensureDB = async () => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
};

app.use(async (req, res, next) => {
  await ensureDB();
  next();
});

// Security
app.use(helmet());
app.use(cors({
  origin: [process.env.CLIENT_URLS ? process.env.CLIENT_URLS.split(',') : []],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => res.json({ 
  status: 'ok',
  timestamp: new Date().toISOString(),
  database: isConnected ? 'connected' : 'disconnected',
  cors: process.env.CLIENT_URLS ? process.env.CLIENT_URLS.split(',') : [],

}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/parties', partyRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/mcp', mcpRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

module.exports = app;
