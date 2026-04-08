'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminShell } from '@/components/AdminShell';
import { RequireAuth } from '@/components/RequireAuth';
import { adminApi, BillingInvoice, BillingPlan, BillingSubscription } from '@/lib/api';
import { formatRupiah } from '@/lib/money';

type InvoiceForm = {
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'void' | 'overdue';
  notes: string;
  description: string;
  qty: number;
  price: number;
};

const initialForm: InvoiceForm = {
  due_date: new Date().toISOString().slice(0, 10),
  status: 'draft',
  notes: '',
  description: 'Langganan bulanan Cafe-X',
  qty: 1,
  price: 299000,
};

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<BillingSubscription | null>(null);
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState<InvoiceForm>(initialForm);

  async function load() {
    try {
      setLoading(true);
      setError('');
      const [subRes, invRes] = await Promise.all([adminApi.billingSubscription(), adminApi.billingInvoices()]);
      setSubscription(subRes.subscription || null);
      setPlans(subRes.plans || []);
      setInvoices(invRes.items || []);
    } catch (e: any) {
      setError(e.message || 'Gagal memuat billing');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const mrr = useMemo(() => {
    const active = invoices.filter((x) => x.status === 'paid');
    return active.reduce((acc, x) => acc + Number(x.amount || 0), 0);
  }, [invoices]);

  async function activatePlan(code: 'basic' | 'pro' | 'premium') {
    try {
      setSaving(true);
      setError('');
      await adminApi.billingUpsertSubscription({ plan_code: code, status: 'active' });
      setMessage(`Plan ${code.toUpperCase()} aktif`);
      await load();
    } catch (e: any) {
      setError(e.message || 'Gagal update plan');
    } finally {
      setSaving(false);
    }
  }

  async function createInvoice() {
    try {
      setSaving(true);
      setError('');
      await adminApi.billingCreateInvoice({
        due_date: form.due_date,
        status: form.status,
        notes: form.notes,
        items: [{ description: form.description, qty: form.qty, price: form.price }],
      });
      setMessage('Invoice berhasil dibuat');
      setForm(initialForm);
      await load();
    } catch (e: any) {
      setError(e.message || 'Gagal buat invoice');
    } finally {
      setSaving(false);
    }
  }

  async function markPaid(id: number) {
    try {
      setSaving(true);
      setError('');
      await adminApi.billingMarkPaid(id);
      setMessage('Invoice ditandai paid');
      await load();
    } catch (e: any) {
      setError(e.message || 'Gagal mark paid');
    } finally {
      setSaving(false);
    }
  }

  return (
    <RequireAuth>
      <AdminShell title="Subscription & Billing" subtitle="Plan aktif, invoice manual, dan kontrol monetisasi">
        <div className="grid3">
          <div className="card">
            <div className="small">Plan aktif</div>
            <h2>{subscription?.plan_name || '-'}</h2>
            <div className="small">Status: {subscription?.status || '-'}</div>
          </div>
          <div className="card">
            <div className="small">Periode</div>
            <h2>{subscription?.period_start?.slice(0, 10) || '-'}</h2>
            <div className="small">s/d {subscription?.period_end?.slice(0, 10) || '-'}</div>
          </div>
          <div className="card">
            <div className="small">Paid Revenue (demo)</div>
            <h2>{formatRupiah(mrr)}</h2>
          </div>
        </div>

        <div className="card">
          <div className="small">Ganti plan</div>
          <div className="toolbar" style={{ marginTop: 10 }}>
            {plans.map((plan) => (
              <button
                key={plan.id}
                className={subscription?.plan_code === plan.code ? 'btn' : 'btn outline'}
                onClick={() => activatePlan(plan.code)}
                disabled={saving}
              >
                {plan.name} - {formatRupiah(Number(plan.price_monthly || 0))}/bulan
              </button>
            ))}
          </div>
        </div>

        <div className="grid2">
          <div className="card">
            <h3>Buat Invoice Manual</h3>
            <div className="grid2">
              <div>
                <div className="small">Jatuh tempo</div>
                <input type="date" value={form.due_date} onChange={(e) => setForm((prev) => ({ ...prev, due_date: e.target.value }))} />
              </div>
              <div>
                <div className="small">Status awal</div>
                <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as InvoiceForm['status'] }))}>
                  <option value="draft">draft</option>
                  <option value="sent">sent</option>
                  <option value="paid">paid</option>
                  <option value="void">void</option>
                  <option value="overdue">overdue</option>
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <div className="small">Deskripsi</div>
                <input value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
              </div>
              <div>
                <div className="small">Qty</div>
                <input type="number" value={form.qty} onChange={(e) => setForm((prev) => ({ ...prev, qty: Number(e.target.value) }))} />
              </div>
              <div>
                <div className="small">Harga</div>
                <input type="number" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: Number(e.target.value) }))} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <div className="small">Catatan</div>
                <textarea rows={3} value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} />
              </div>
            </div>
            <div className="toolbar" style={{ marginTop: 10 }}>
              <button className="btn" onClick={createInvoice} disabled={saving}>Buat Invoice</button>
              <button className="btn outline" onClick={() => setForm(initialForm)} disabled={saving}>Reset</button>
            </div>
          </div>

          <div className="card">
            <h3>Invoice List</h3>
            {loading ? <div className="small">Memuat invoice...</div> : null}
            <div style={{ maxHeight: 380, overflow: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nominal</th>
                    <th>Status</th>
                    <th>Due</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td>{inv.invoice_no}</td>
                      <td>{formatRupiah(Number(inv.amount || 0))}</td>
                      <td>{inv.status}</td>
                      <td>{inv.due_date?.slice(0, 10)}</td>
                      <td>
                        {inv.status !== 'paid' ? (
                          <button className="btn outline" disabled={saving} onClick={() => markPaid(inv.id)}>
                            Mark Paid
                          </button>
                        ) : (
                          <span className="pill success">Paid</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="small">Belum ada invoice</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {message ? <div className="card" style={{ borderColor: 'rgba(16,185,129,0.45)' }}>{message}</div> : null}
        {error ? <div className="card" style={{ borderColor: 'rgba(239,68,68,0.45)' }}>{error}</div> : null}
      </AdminShell>
    </RequireAuth>
  );
}
