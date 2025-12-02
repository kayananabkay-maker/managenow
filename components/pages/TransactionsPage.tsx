'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AnimatedCounter from '@/components/AnimatedCounter';
import { useCurrency } from '@/components/CurrencyProvider';
import {
  getTransactions,
  getCategories,
  createTransaction,
  deleteTransaction,
  getQuickShortcuts
} from '@/lib/actions/financial.actions';

export default function TransactionsPage({ user }: { user: any }) {
  const router = useRouter();
  const { currencySymbol } = useCurrency();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [shortcuts, setShortcuts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    categoryId: '',
    amount: '',
    description: '',
    transactionDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [txRes, catRes, shortcutRes] = await Promise.all([
      getTransactions(user.$id),
      getCategories(user.$id),
      getQuickShortcuts(user.$id)
    ]);

    if (txRes.success && txRes.data) setTransactions(txRes.data);
    if (catRes.success && catRes.data) setCategories(catRes.data);
    if (shortcutRes.success && shortcutRes.data) setShortcuts(shortcutRes.data);
    
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const result = await createTransaction({
      userId: user.$id,
      categoryId: parseInt(formData.categoryId),
      amount: parseFloat(formData.amount),
      type: formData.type,
      description: formData.description,
      transactionDate: formData.transactionDate,
      notes: formData.notes
    });

    if (result.success) {
      setShowAddForm(false);
      setFormData({
        type: 'expense',
        categoryId: '',
        amount: '',
        description: '',
        transactionDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
      loadData();
    } else {
      alert(result.error);
    }
  }

  async function handleDelete(transactionId: number) {
    if (!confirm('Delete this transaction?')) return;
    
    const result = await deleteTransaction(transactionId, user.$id);
    if (result.success) {
      loadData();
    } else {
      alert(result.error);
    }
  }

  async function handleQuickAdd(shortcut: any) {
    const amount = shortcut.amount || prompt(`Enter amount for ${shortcut.name}:`);
    if (!amount) return;

    const result = await createTransaction({
      userId: user.$id,
      categoryId: shortcut.category_id,
      amount: parseFloat(amount),
      type: shortcut.type,
      description: shortcut.name,
      transactionDate: new Date().toISOString().split('T')[0]
    });

    if (result.success) {
      loadData();
    }
  }

  const filteredCategories = categories.filter(c => c.type === formData.type);

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-36 font-bold text-gray-900 mb-2">Transactions</h1>
          <p className="text-16 text-gray-600">Track your income and expenses</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <p className="text-14 font-medium text-gray-500 mb-2">Total Income</p>
            <p className="text-32 font-bold text-green-600">
              <AnimatedCounter amount={totalIncome} />
            </p>
          </div>
          <div className="card">
            <p className="text-14 font-medium text-gray-500 mb-2">Total Expenses</p>
            <p className="text-32 font-bold text-red-600">
              <AnimatedCounter amount={totalExpense} />
            </p>
          </div>
          <div className="card">
            <p className="text-14 font-medium text-gray-500 mb-2">Net</p>
            <p className={`text-32 font-bold ${totalIncome - totalExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <AnimatedCounter amount={totalIncome - totalExpense} />
            </p>
          </div>
        </div>

        {/* Quick Shortcuts */}
        {shortcuts.length > 0 && (
          <div className="card mb-8">
            <h2 className="text-20 font-semibold mb-6">⚡ Quick Add</h2>
            <div className="flex flex-wrap gap-3">
              {shortcuts.map(shortcut => (
                <button
                  key={shortcut.id}
                  onClick={() => handleQuickAdd(shortcut)}
                  className="btn btn-primary"
                >
                  <span>{shortcut.icon}</span>
                  <span>{shortcut.name}</span>
                  {shortcut.amount && <span className="text-sm">({shortcut.category_icon} ${shortcut.amount})</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add Transaction Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary"
          >
            {showAddForm ? '✕ Cancel' : '+ Add Transaction'}
          </button>
        </div>

        {/* Add Transaction Form */}
        {showAddForm && (
          <div className="card mb-8">
            <h2 className="card-title">New Transaction</h2>
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
                    💰 Income
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
                    💸 Expense
                  </button>
                </div>
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

              {/* Date */}
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  required
                  value={formData.transactionDate}
                  onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                  className="form-input"
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional"
                  className="form-input"
                />
              </div>

              {/* Notes */}
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional"
                  rows={2}
                  className="form-textarea"
                />
              </div>

              <button type="submit" className="btn btn-primary w-full">
                Add Transaction
              </button>
            </form>
          </div>
        )}

        {/* Transactions List */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Transactions</h2>
          </div>
          
          {loading ? (
            <div className="empty-state">
              <div className="empty-state-icon">⏳</div>
              <p className="empty-state-title">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💳</div>
              <p className="empty-state-title">No Transactions Yet</p>
              <p className="empty-state-description">
                Add your first transaction above to start tracking!
              </p>
            </div>
          ) : (
            <div className="card-body">
              {transactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0"
                      style={{ backgroundColor: `${tx.category_color}20` }}
                    >
                      {tx.category_icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{tx.category_name}</p>
                      {tx.description && (
                        <p className="text-14 text-gray-600 truncate">{tx.description}</p>
                      )}
                      <p className="text-12 text-gray-500">
                        {new Date(tx.transaction_date).toLocaleDateString('id-ID', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4 shrink-0">
                    <div>
                      <span className={`badge ${tx.type === 'income' ? 'badge-success' : 'badge-danger'}`}>
                        {tx.type}
                      </span>
                      <p className={`text-18 font-semibold mt-1 whitespace-nowrap ${
                        tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}{currencySymbol} {parseFloat(tx.amount).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete transaction"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
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
