import useStore from '../store/useStore';

/**
 * useMCP — calls MCP tools via the Antigravity environment
 * Each function uses the global `use_mcp_tool` pattern available through
 * the Antigravity MCP bridge. In production, these are wired to the MCP server.
 *
 * Fallback: Shows a browser alert if MCP is not connected.
 */
export const useMCP = () => {
  const { addToast } = useStore();

  // ── Gmail: Send invoice email ─────────────────────
  const sendInvoiceEmail = async (invoice, partyEmail) => {
    try {
      const subject = `Invoice ${invoice.invoiceNo} — ₹${invoice.total.toFixed(2)}`;
      const body = buildInvoiceEmailBody(invoice);

      // MCP call via fetch to backend proxy
      const res = await fetch('/api/mcp/gmail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('gstflow_token')}` },
        body: JSON.stringify({ to: partyEmail, subject, body }),
      });

      if (res.ok) {
        addToast('Invoice email sent successfully via Gmail', 'success');
        return { success: true };
      } else {
        throw new Error('Gmail MCP unavailable');
      }
    } catch (err) {
      addToast(`Gmail: ${err.message}`, 'error');
      return { success: false, error: err.message };
    }
  };

  // ── Gmail: GST due date alert ─────────────────────
  const sendGSTDueAlert = async (returnType, dueDate, gstin) => {
    try {
      const subject = `GST Filing Due Soon — ${returnType}`;
      const body = `<p>Dear Taxpayer,</p><p>Your <strong>${returnType}</strong> filing is due on <strong>${dueDate}</strong>.</p><p>GSTIN: ${gstin}</p><p>Please file on time to avoid penalties.</p><br/><p>— GSTFlow Pro</p>`;

      const res = await fetch('/api/mcp/gmail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('gstflow_token')}` },
        body: JSON.stringify({ subject, body }),
      });

      if (res.ok) addToast(`${returnType} due date reminder sent via email`, 'success');
      else throw new Error('MCP unavailable');
    } catch (err) {
      addToast(`Alert: ${err.message}`, 'error');
    }
  };

  // ── Google Calendar: Sync GST dates ───────────────
  const syncGSTDatesToCalendar = async () => {
    try {
      const events = [
        { title: 'GSTR-1 Filing Due', day: 11, description: 'Monthly GSTR-1 filing deadline' },
        { title: 'GSTR-3B Filing Due', day: 20, description: 'Monthly GSTR-3B filing deadline' },
      ];

      const res = await fetch('/api/mcp/calendar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('gstflow_token')}` },
        body: JSON.stringify({ events }),
      });

      if (res.ok) {
        const data = await res.json();
        addToast('GST filing dates synced to Google Calendar', 'success');
        return data;
      } else {
        throw new Error('Calendar MCP unavailable');
      }
    } catch (err) {
      addToast(`Calendar: ${err.message}`, 'error');
      return null;
    }
  };

  // ── Google Calendar: Invoice follow-up ───────────
  const createInvoiceFollowUp = async (invoice) => {
    try {
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + 7);

      const res = await fetch('/api/mcp/calendar/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('gstflow_token')}` },
        body: JSON.stringify({
          title: `Follow up: Invoice ${invoice.invoiceNo} with ${invoice.party.name}`,
          date: followUpDate.toISOString(),
          description: `Invoice Total: ₹${invoice.total?.toFixed(2)}\nParty: ${invoice.party.name}\nGSTIN: ${invoice.party.gstin || 'N/A'}`,
        }),
      });

      if (res.ok) addToast('Follow-up reminder set in Google Calendar', 'success');
      else throw new Error('Calendar MCP unavailable');
    } catch (err) {
      addToast(`Calendar: ${err.message}`, 'error');
    }
  };

  // ── Canva: Generate invoice design ───────────────
  const generateInvoiceDesign = async (invoice) => {
    try {
      const res = await fetch('/api/mcp/canva/design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('gstflow_token')}` },
        body: JSON.stringify({ type: 'document', invoice }),
      });

      if (res.ok) {
        const { url } = await res.json();
        addToast('Invoice design created in Canva', 'success');
        window.open(url, '_blank');
        return url;
      } else {
        throw new Error('Canva MCP unavailable');
      }
    } catch (err) {
      addToast(`Canva: ${err.message}`, 'error');
      return null;
    }
  };

  // ── Canva: Export monthly report poster ──────────
  const exportMonthlyReportToCanva = async (reportData) => {
    try {
      const res = await fetch('/api/mcp/canva/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('gstflow_token')}` },
        body: JSON.stringify({ type: 'infographic', reportData }),
      });

      if (res.ok) {
        const { url } = await res.json();
        addToast('GST Report poster created in Canva', 'success');
        window.open(url, '_blank');
        return url;
      } else {
        throw new Error('Canva MCP unavailable');
      }
    } catch (err) {
      addToast(`Canva: ${err.message}`, 'error');
      return null;
    }
  };

  return {
    sendInvoiceEmail,
    sendGSTDueAlert,
    syncGSTDatesToCalendar,
    createInvoiceFollowUp,
    generateInvoiceDesign,
    exportMonthlyReportToCanva,
  };
};

// ── Utility: build HTML email body ────────────────
const buildInvoiceEmailBody = (invoice) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px;">
  <h2 style="color: #0077ff;">Invoice ${invoice.invoiceNo}</h2>
  <p>Dear ${invoice.party.name},</p>
  <p>Please find below your invoice details:</p>
  <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
    <tr style="background:#0077ff; color:white;">
      <th style="padding:8px; text-align:left;">Item</th>
      <th style="padding:8px;">Qty</th>
      <th style="padding:8px;">Rate</th>
      <th style="padding:8px;">Amount</th>
    </tr>
    ${invoice.items?.map(item => `
    <tr style="border-bottom: 1px solid #ddd;">
      <td style="padding:8px;">${item.desc}</td>
      <td style="padding:8px; text-align:center;">${item.qty}</td>
      <td style="padding:8px; text-align:right;">₹${item.rate}</td>
      <td style="padding:8px; text-align:right;">₹${item.amount?.toFixed(2)}</td>
    </tr>`).join('')}
  </table>
  <div style="text-align:right; margin-top:12px; font-size:14px;">
    <p>Taxable: ₹${invoice.taxable?.toFixed(2)}</p>
    ${invoice.cgst > 0 ? `<p>CGST: ₹${invoice.cgst?.toFixed(2)}</p><p>SGST: ₹${invoice.sgst?.toFixed(2)}</p>` : `<p>IGST: ₹${invoice.igst?.toFixed(2)}</p>`}
    <h3 style="color:#0077ff;">Total: ₹${invoice.total?.toFixed(2)}</h3>
  </div>
  <p style="margin-top:20px; color:#666; font-size:12px;">Generated by GSTFlow Pro</p>
</div>
`;
