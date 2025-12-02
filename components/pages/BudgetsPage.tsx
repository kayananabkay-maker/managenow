'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AnimatedCounter from '@/components/AnimatedCounter';
import { useCurrency } from '@/components/CurrencyProvider';
import {
  getBudgets,
  getBudgetSummary,
  createBudget,
  deleteBudget,
  getCategories,
  createTransaction
} from '@/lib/actions/financial.actions';

export default function BudgetsPage({ user }: { user: any }) {
  const router = useRouter();
  const { currencySymbol } = useCurrency();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSpendingModal, setShowSpendingModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<any>(null);
  
  // Current month
  const [currentMonth, setCurrentMonth] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM
  );
  
  // Form state
  const [formData, setFormData] = useState({
    categoryId: '',
    allocatedAmount: '',
    notes: ''
  });

  // Spending form state
  const [spendingData, setSpendingData] = useState({
    amount: '',
    description: '',
  });

  useEffect(() => {
    loadData();
  }, [currentMonth]);

  async function loadData() {
    setLoading(true);
    const [budgetRes, summaryRes, catRes] = await Promise.all([
      getBudgets(user.$id, currentMonth),
      getBudgetSummary(user.$id, currentMonth),
      getCategories(user.$id, 'expense')
    ]);

    console.log('Budget response:', budgetRes);
    if (budgetRes.success && budgetRes.data) {
      console.log('First budget:', budgetRes.data[0]);
      setBudgets(budgetRes.data);
    }
    if (summaryRes.success) setSummary(summaryRes.data);
    if (catRes.success && catRes.data) setCategories(catRes.data);
    
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const result = await createBudget({
      userId: user.$id,
      categoryId: parseInt(formData.categoryId),
      monthYear: currentMonth,
      allocatedAmount: parseFloat(formData.allocatedAmount),
      notes: formData.notes
    });

    if (result.success) {
      setShowAddForm(false);
      setFormData({
        categoryId: '',
        allocatedAmount: '',
        notes: ''
      });
      loadData();
    } else {
      alert(result.error);
    }
  }

  async function handleDelete(budgetId: number) {
    if (!confirm('Are you sure you want to delete this budget? This action cannot be undone.')) {
      return;
    }
    
    const result = await deleteBudget(budgetId, user.$id);
    
    if (result.success) {
      loadData();
    } else {
      alert(result.error || 'Failed to delete budget');
    }
  }

  async function handleAddSpending(e: React.FormEvent) {
    e.preventDefault();
    
    if (!selectedBudget) return;
    
    console.log('Selected budget:', selectedBudget);
    console.log('Category ID type:', typeof selectedBudget.category_id);
    console.log('Category ID value:', selectedBudget.category_id);
    
    // Validate category_id
    if (!selectedBudget.category_id) {
      alert('Error: Budget has no category ID');
      console.error('Selected budget:', selectedBudget);
      return;
    }
    
    const categoryId = parseInt(selectedBudget.category_id);
    console.log('Parsed category ID:', categoryId, 'type:', typeof categoryId);
    
    // Create expense transaction for this budget category
    const result = await createTransaction({
      userId: user.$id,
      type: 'expense',
      amount: parseFloat(spendingData.amount),
      categoryId: categoryId,
      description: spendingData.description || `Spending from ${selectedBudget.category_name} budget`,
      transactionDate: new Date().toISOString().split('T')[0],
      notes: `Budget expense for ${selectedBudget.category_name}`
    });

    if (result.success) {
      setShowSpendingModal(false);
      setSelectedBudget(null);
      setSpendingData({ amount: '', description: '' });
      loadData();
    } else {
      alert(result.error || 'Failed to add spending');
    }
  }

  function openSpendingModal(budget: any) {
    console.log('Opening modal for budget:', budget);
    console.log('Category ID:', budget.category_id);
    setSelectedBudget(budget);
    setShowSpendingModal(true);
  }

  function getProgressColor(percentage: number) {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  }

  function getProgressBarColor(percentage: number) {
    if (percentage >= 100) return 'bg-red-100';
    if (percentage >= 80) return 'bg-yellow-100';
    return 'bg-green-100';
  }

  const totalAllocated = summary?.total_allocated || 0;
  const totalSpent = summary?.total_spent || 0;
  const totalRemaining = summary?.total_remaining || 0;
  const avgPercentage = summary?.avg_percentage_used || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-36 font-bold text-gray-900 mb-2">Envelope Budgets</h1>
          <p className="text-16 text-gray-600">Allocate your money to different spending categories</p>
        </div>

        <div className="mb-8 flex items-center gap-4">
          <label className="form-label">Month:</label>
          <input
            type="month"
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            className="form-input"
          />
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <p className="text-14 font-medium text-gray-500 mb-2">Total Allocated</p>
              <p className="text-32 font-bold text-blue-600">
                <AnimatedCounter amount={parseFloat(totalAllocated)} />
              </p>
            </div>
            <div className="card">
              <p className="text-14 font-medium text-gray-500 mb-2">Total Spent</p>
              <p className="text-32 font-bold text-purple-600">
                <AnimatedCounter amount={parseFloat(totalSpent)} />
              </p>
            </div>
            <div className="card">
              <p className="text-14 font-medium text-gray-500 mb-2">Remaining</p>
              <p className={`text-32 font-bold ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <AnimatedCounter amount={parseFloat(totalRemaining)} />
              </p>
            </div>
            <div className="card">
              <p className="text-14 font-medium text-gray-500 mb-2">Average Used</p>
              <p className="text-32 font-bold text-gray-900">
                <AnimatedCounter amount={parseFloat(avgPercentage)} decimals={1} prefix="" />%
              </p>
            </div>
          </div>
        )}

        {/* Add Budget Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary"
          >
            {showAddForm ? '✕ Cancel' : '+ Allocate Budget'}
          </button>
        </div>

        {/* Add Budget Form */}
        {showAddForm && (
          <div className="card mb-8">
            <h2 className="card-title">Allocate Budget</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="form-select"
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Amount to Allocate</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.allocatedAmount}
                  onChange={(e) => setFormData({ ...formData, allocatedAmount: e.target.value })}
                  placeholder="0.00"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Budget notes..."
                  rows={2}
                  className="form-textarea"
                />
              </div>

              <button type="submit" className="btn btn-primary w-full">
                Allocate Budget
              </button>
            </form>
          </div>
        )}

        {/* Budget Envelopes */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Budget Envelopes</h2>
          </div>
          
          {loading ? (
            <div className="empty-state">
              <div className="empty-state-icon">⏳</div>
              <p className="empty-state-title">Loading budgets...</p>
            </div>
          ) : budgets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💰</div>
              <p className="empty-state-title">No Budgets Allocated</p>
              <p className="empty-state-description">
                Click "Allocate Budget" above to get started!
              </p>
            </div>
          ) : (
            <div className="card-body">
              {budgets.map(budget => {
                const percentage = budget.percentage_used || 0;
                const isOverBudget = percentage > 100;
                
                return (
                  <div key={budget.id} className="p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-18 mb-1">
                          {budget.category_name}
                        </h3>
                        <div className="flex items-center gap-4 text-14 text-gray-600">
                          <span>
                            <AnimatedCounter amount={parseFloat(budget.spent_amount)} />
                            {' of '}
                            <AnimatedCounter amount={parseFloat(budget.allocated_amount)} />
                          </span>
                          <span className={isOverBudget ? 'text-red-600 font-medium' : 'text-green-600'}>
                            {isOverBudget ? 'Over' : 'Remaining'}: 
                            <AnimatedCounter amount={Math.abs(parseFloat(budget.remaining))} />
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className={`text-24 font-bold ${
                          percentage >= 100 ? 'text-red-600' : 
                          percentage >= 80 ? 'text-yellow-600' : 
                          'text-green-600'
                        }`}>
                          {parseFloat(percentage).toFixed(0)}%
                        </p>
                        <button
                          onClick={() => openSpendingModal(budget)}
                          className="btn btn-primary text-sm"
                          title="Add expense"
                        >
                          + Expense
                        </button>
                        <button
                          onClick={() => handleDelete(budget.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete budget"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="progress-bar mb-2">
                      <div
                        className={`progress-bar-fill ${
                          percentage >= 100 ? 'danger' : 
                          percentage >= 80 ? 'warning' : ''
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    
                    {/* Over budget indicator */}
                    {isOverBudget && (
                      <div className="mt-3 px-3 py-2 bg-red-50 rounded-lg">
                        <p className="text-14 text-red-600 font-medium">
                          ⚠️ Over budget by {currencySymbol} {(parseFloat(budget.spent_amount) - parseFloat(budget.allocated_amount)).toLocaleString('id-ID')}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Spending Modal */}
        {showSpendingModal && selectedBudget && (
          <div className="modal-overlay" onClick={() => setShowSpendingModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Add Expense to {selectedBudget.category_name}</h2>
                <button
                  onClick={() => setShowSpendingModal(false)}
                  className="modal-close"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddSpending} className="modal-body space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-blue-900">
                    Budget: {currencySymbol} {parseFloat(selectedBudget.allocated_amount).toLocaleString('id-ID')}
                  </p>
                  <p className="text-sm text-blue-900">
                    Spent: {currencySymbol} {parseFloat(selectedBudget.spent_amount).toLocaleString('id-ID')}
                  </p>
                  <p className="text-sm text-blue-900 font-semibold">
                    Remaining: {currencySymbol} {parseFloat(selectedBudget.remaining).toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">Amount Spent</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={spendingData.amount}
                    onChange={(e) => setSpendingData({ ...spendingData, amount: e.target.value })}
                    placeholder="0.00"
                    className="form-input"
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    required
                    value={spendingData.description}
                    onChange={(e) => setSpendingData({ ...spendingData, description: e.target.value })}
                    placeholder="What did you buy?"
                    className="form-input"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSpendingModal(false)}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                  >
                    Add Expense
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
