import api from '../api/axios.config';
import useStore from '../store/useStore';

export const useInvoices = () => {
  const { invoices, invoicesLoading, invoiceMeta, fetchInvoices, addInvoice, updateInvoiceInStore, removeInvoice, addToast } = useStore();

  const createInvoice = async (data) => {
    const res = await api.post('/invoices', data);
    addInvoice(res.data);
    addToast('Invoice created successfully', 'success');
    return res.data;
  };

  const updateInvoice = async (id, data) => {
    const res = await api.put(`/invoices/${id}`, data);
    updateInvoiceInStore(res.data);
    addToast('Invoice updated', 'success');
    return res.data;
  };

  const deleteInvoice = async (id) => {
    await api.delete(`/invoices/${id}`);
    removeInvoice(id);
    addToast('Invoice deleted', 'info');
  };

  const getInvoice = async (id) => {
    const res = await api.get(`/invoices/${id}`);
    return res.data;
  };

  return { invoices, invoicesLoading, invoiceMeta, fetchInvoices, createInvoice, updateInvoice, deleteInvoice, getInvoice };
};
