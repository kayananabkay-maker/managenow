'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AnimatedCounter from '@/components/AnimatedCounter';
import { useCurrency } from '@/components/CurrencyProvider';
import {
  getBills,
  getUpcomingBills,
  createBill,
  markBillAsPaid,
  getCategories
} from '@/lib/actions/financial.actions';

export default function BillsPage({ user }: { user: any }) {
  const router = useRouter();
  const { currencySymbol } = useCurrency();
  const [bills, setBills] = useState<any[]>([]);
  const [upcomingBills, setUpcomingBills] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    categoryId: '',
    name: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    frequency: 'monthly' as 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly',
    dueDay: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    reminderDays: '3',
    autoCreateTransaction: false,
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [billsRes, upcomingRes, catRes] = await Promise.all([
      getBills(user.$id, true),
      getUpcomingBills(user.$id),
      getCategories(user.$id)
    ]);

    if (billsRes.success && billsRes.data) setBills(billsRes.data);
    if (upcomingRes.success && upcomingRes.data) setUpcomingBills(upcomingRes.data);
    if (catRes.success && catRes.data) setCategories(catRes.data);
    
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const result = await createBill({
      userId: user.$id,
      categoryId: parseInt(formData.categoryId),
      name: formData.name,
      amount: parseFloat(formData.amount),
      type: formData.type,
      frequency: formData.frequency,
      dueDay: parseInt(formData.dueDay),
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      reminderDays: parseInt(formData.reminderDays),
      autoCreateTransaction: formData.autoCreateTransaction,
      notes: formData.notes
    });

    if (result.success) {
      setShowAddForm(false);
      setFormData({
        categoryId: '',
        name: '',
        amount: '',
        type: 'expense',
        frequency: 'monthly',
        dueDay: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        reminderDays: '3',
        autoCreateTransaction: false,
        notes: ''
      });
      loadData();
    } else {
      alert(result.error);
    }
  }

  async function handleMarkPaid(billPaymentId: number) {
    const result = await markBillAsPaid(billPaymentId, user.$id);
    if (result.success) {
      loadData();
    } else {
      alert(result.error);
    }
  }

  function getDayLabel(frequency: string) {
    switch (frequency) {
      case 'daily':
        return 'Not applicable';
      case 'weekly':
        return 'Day of week (1=Monday, 7=Sunday)';
      case 'monthly':
      case 'quarterly':
      case 'yearly':
        return 'Day of month (1-31)';
      default:
        return 'Day';
    }
  }

  const filteredCategories = categories.filter(c => c.type === formData.type);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-36 font-bold text-gray-900 mb-2">Bills & Recurring Payments</h1>
          <p className="text-16 text-gray-600">Track your recurring income and expenses</p>
        </div>

        {/* Upcoming Bills Alert */}
        {upcomingBills.length > 0 && (
          <div className="card mb-8">
            <h2 className="text-20 font-semibold text-gray-900 mb-6 flex items-center gap-2">
              ⏰ Upcoming Bills ({upcomingBills.length})
            </h2>
            <div className="space-y-4">
              {upcomingBills.slice(0, 5).map(bill => (
                <div key={bill.id} className="flex items-center justify-between bg-gray-50 p-6 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{bill.name}</p>
                    <p className="text-14 text-gray-600">
                      Due: {new Date(bill.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {' • '}
                      {bill.days_until_due >= 0 ? `${bill.days_until_due} days` : `${Math.abs(bill.days_until_due)} days overdue`}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <span className={`badge ${bill.type === 'income' ? 'badge-success' : 'badge-danger'}`}>
                        {bill.type}
                      </span>
                      <p className={`text-18 font-semibold mt-1 ${bill.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {bill.type === 'income' ? '+' : '-'}<AnimatedCounter amount={parseFloat(bill.amount)} />
                      </p>
                    </div>
                    {bill.status === 'pending' && (
                      <button
                        onClick={() => handleMarkPaid(bill.id)}
                        className="btn btn-success"
                      >
                        Mark Paid
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Bill Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary"
          >
            {showAddForm ? '✕ Cancel' : '+ Add Recurring Bill'}
          </button>
        </div>

        {/* Add Bill Form */}
        {showAddForm && (
          <div className="card mb-8">
            <h2 className="card-title">New Recurring Bill</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Toggle */}
              <div className="form-group">
                <label className="form-label">Type</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'income', categoryId: '' })}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                      formData.type === 'income'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    💰 Recurring Income
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'expense', categoryId: '' })}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                      formData.type === 'expense'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    📄 Recurring Bill
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="form-group">
                  <label className="form-label">Bill Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Electric Bill, Rent, Salary"
                    className="form-input"
                  />
                </div>

                {/* Category */}
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="form-select"
                  >
                    <option value="">Select a category</option>
                    {filteredCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount */}
                <div className="form-group">
                  <label className="form-label">Amount</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    className="form-input"
                  />
                </div>

                {/* Frequency */}
                <div className="form-group">
                  <label className="form-label">Frequency</label>
                  <select
                    required
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                    className="form-select"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                {/* Due Day */}
                <div className="form-group">
                  <label className="form-label">
                    {getDayLabel(formData.frequency)}
                  </label>
                  <input
                    type="number"
                    required={formData.frequency !== 'daily'}
                    min="1"
                    max={formData.frequency === 'weekly' ? '7' : '31'}
                    value={formData.dueDay}
                    onChange={(e) => setFormData({ ...formData, dueDay: e.target.value })}
                    placeholder="1-31"
                    disabled={formData.frequency === 'daily'}
                    className="form-input disabled:bg-gray-100"
                  />
                </div>

                {/* Start Date */}
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="form-input"
                  />
                </div>

                {/* End Date */}
                <div className="form-group">
                  <label className="form-label">End Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="form-input"
                  />
                </div>

                {/* Reminder Days */}
                <div className="form-group">
                  <label className="form-label">Reminder (days before)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.reminderDays}
                    onChange={(e) => setFormData({ ...formData, reminderDays: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Auto Create Transaction */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="autoCreate"
                  checked={formData.autoCreateTransaction}
                  onChange={(e) => setFormData({ ...formData, autoCreateTransaction: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="autoCreate" className="text-14 font-medium text-gray-700 cursor-pointer">
                  Automatically create transaction when due
                </label>
              </div>

              {/* Notes */}
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional notes..."
                  rows={2}
                  className="form-textarea"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
              >
                Add Recurring Bill
              </button>
            </form>
          </div>
        )}

        {/* All Bills List */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">All Recurring Bills</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : bills.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📄</div>
              <div className="empty-state-title">No Recurring Bills</div>
              <div className="empty-state-description">Add your first recurring bill to get started</div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {bills.map(bill => (
                <div key={bill.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${bill.category_color}20` }}
                      >
                        {bill.category_icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-lg">{bill.name}</p>
                        <p className="text-sm text-gray-600">
                          {bill.category_name} • {bill.frequency} • 
                          {bill.frequency !== 'daily' && ` Due: Day ${bill.due_day}`}
                        </p>
                        {bill.notes && (
                          <p className="text-xs text-gray-500 mt-1">{bill.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${
                        bill.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {bill.type === 'income' ? '+' : '-'}{currencySymbol} {parseFloat(bill.amount).toLocaleString('id-ID')}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Started: {new Date(bill.start_date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
