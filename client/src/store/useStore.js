import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../api/axios.config';

// ── Synchronous localStorage read ──────────────────────────────────────────
// This ensures we have a definitive auth state on the VERY FIRST render.
const getInitialAuth = () => {
  try {
    const raw = localStorage.getItem('gstflow_store');
    if (!raw) return { user: null, token: null };
    const { state } = JSON.parse(raw);
    return { user: state?.user || null, token: state?.token || null };
  } catch {
    return { user: null, token: null };
  }
};

const initial = getInitialAuth();

const useStore = create(
  persist(
    (set, get) => ({
      // ── Auth ────────────────────────────────────────────────────────────
      user: initial.user,
      token: initial.token,
      isAuthReady: true, // Use a flag so we can force a "loading" state if needed

      setUser: (user, token) => {
        set({ user, token });
        // Duplicate to simple key for axios interceptor's easy access
        if (token) localStorage.setItem('gstflow_token', token);
        else localStorage.removeItem('gstflow_token');
      },
      logout: () => {
        set({ user: null, token: null, invoices: [], parties: [], products: [] });
        localStorage.removeItem('gstflow_token');
        localStorage.removeItem('gstflow_user');
      },

      // ── Invoices ────────────────────────────────────────────────────────
      invoices: [],
      invoicesLoading: false,
      invoiceMeta: { total: 0, page: 1, pages: 1 },
      fetchInvoices: async (params = {}) => {
        set({ invoicesLoading: true });
        try {
          const res = await api.get('/invoices', { params });
          set({
            invoices: res.data.invoices || [],
            invoiceMeta: { total: res.data.total, page: res.data.page, pages: res.data.pages }
          });
        } catch (_) {
          set({ invoices: [] });
        } finally {
          set({ invoicesLoading: false });
        }
      },
      addInvoice: (inv) => set((s) => ({ invoices: [inv, ...s.invoices] })),
      updateInvoiceInStore: (updated) =>
        set((s) => ({ invoices: s.invoices.map((i) => (i._id === updated._id ? updated : i)) })),
      removeInvoice: (id) => set((s) => ({ invoices: s.invoices.filter((i) => i._id !== id) })),

      // ── Parties ─────────────────────────────────────────────────────────
      parties: [],
      partiesLoading: false,
      fetchParties: async (params = {}) => {
        set({ partiesLoading: true });
        try {
          const res = await api.get('/parties', { params });
          set({ parties: res.data || [] });
        } catch (_) {
          set({ parties: [] });
        } finally {
          set({ partiesLoading: false });
        }
      },
      addParty: (p) => set((s) => ({ parties: [...s.parties, p] })),
      updatePartyInStore: (party) => {
        set(state => ({
          parties: state.parties.map(p => p._id === party._id ? party : p)
        }));
      },
      removeParty: (id) => set((s) => ({ parties: s.parties.filter((p) => p._id !== id) })),

      // ── Products ─────────────────────────────────────────────────────────
      products: [],
      productsLoading: false,
      fetchProducts: async (params = {}) => {
        set({ productsLoading: true });
        try {
          const res = await api.get('/products', { params });
          set({ products: res.data || [] });
        } catch (_) {
          set({ products: [] });
        } finally {
          set({ productsLoading: false });
        }
      },
      addProduct: (p) => set((s) => ({ products: [...s.products, p] })),
      updateProductInStore: (updated) =>
        set((s) => ({ products: s.products.map((p) => (p._id === updated._id ? updated : p)) })),
      removeProduct: (id) => set((s) => ({ products: s.products.filter((p) => p._id !== id) })),

      // ── Dashboard Stats ──────────────────────────────────────────────────
      dashboardStats: null,
      statsLoading: false,
      fetchDashboardStats: async () => {
        set({ statsLoading: true });
        try {
          const res = await api.get('/reports/dashboard');
          set({ dashboardStats: res.data });
        } catch (_) {
          set({ dashboardStats: null });
        } finally {
          set({ statsLoading: false });
        }
      },

      // ── UI ───────────────────────────────────────────────────────────────
      sidebarOpen: true,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

      // ── Toasts ───────────────────────────────────────────────────────────
      toasts: [],
      addToast: (message, type = 'info') => {
        const id = Date.now();
        set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
        setTimeout(() => get().removeToast(id), 4000);
      },
      removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    {
      name: 'gstflow_store',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ user: s.user, token: s.token }),
    }
  )
);

export default useStore;
