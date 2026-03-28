const express = require('express');
const router = express.Router();
const { getGSTR1, getGSTR3B, getMonthlyTrend, getTopParties, getHSNSummary, getDashboardStats } = require('../controllers/report.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/gstr1', getGSTR1);
router.get('/gstr3b', getGSTR3B);
router.get('/monthly', getMonthlyTrend);
router.get('/top-parties', getTopParties);
router.get('/hsn', getHSNSummary);
router.get('/dashboard', getDashboardStats);

module.exports = router;
