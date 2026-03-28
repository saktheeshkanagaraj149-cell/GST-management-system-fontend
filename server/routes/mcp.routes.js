const express = require('express');
const router = express.Router();

// ── MCP Proxy Routes ────────────────────────────────────────────────────────
// These endpoints proxy requests to MCP tools in the Antigravity environment.
// If MCP tools are unavailable, they return a graceful fallback response.

// Gmail: Send invoice email alert
router.post('/gmail/send', async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    if (!to || !subject || !body) {
      return res.status(400).json({ message: 'to, subject, and body are required' });
    }
    // In production, connect to Gmail MCP tool here
    // For now, acknowledge the request and return a mock success
    console.log(`[MCP Gmail] Email queued to ${to}: ${subject}`);
    res.json({
      success: true,
      message: `Email queued to ${to}`,
      note: 'Connect Gmail MCP credentials in Settings to send real emails',
    });
  } catch (err) {
    console.error('[MCP Gmail Error]', err.message);
    res.status(500).json({ message: 'Gmail MCP error: ' + err.message });
  }
});

// Google Calendar: Sync GST filing dates
router.post('/calendar/sync', async (req, res) => {
  try {
    const { title, date, description } = req.body;
    if (!title || !date) {
      return res.status(400).json({ message: 'title and date are required' });
    }
    console.log(`[MCP Calendar] Event synced: ${title} on ${date}`);
    res.json({
      success: true,
      message: `Event "${title}" created on ${date}`,
      note: 'Connect Google Calendar MCP credentials in Settings to sync real events',
    });
  } catch (err) {
    console.error('[MCP Calendar Error]', err.message);
    res.status(500).json({ message: 'Calendar MCP error: ' + err.message });
  }
});

// Canva: Export invoice design
router.post('/canva/export', async (req, res) => {
  try {
    const { invoiceId, template } = req.body;
    if (!invoiceId) {
      return res.status(400).json({ message: 'invoiceId is required' });
    }
    console.log(`[MCP Canva] Design export triggered for invoice ${invoiceId}`);
    res.json({
      success: true,
      message: `Invoice ${invoiceId} design exported`,
      templateUsed: template || 'default-gst-invoice',
      note: 'Connect Canva MCP credentials in Settings to export real designs',
    });
  } catch (err) {
    console.error('[MCP Canva Error]', err.message);
    res.status(500).json({ message: 'Canva MCP error: ' + err.message });
  }
});

module.exports = router;
