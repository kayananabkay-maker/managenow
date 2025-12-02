'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AnimatedCounter from '@/components/AnimatedCounter';
import { useCurrency } from '@/components/CurrencyProvider';
import {
  getGoals,
  createGoal,
  addGoalContribution,
  deleteGoal
} from '@/lib/actions/financial.actions';

export default function GoalsPage({ user }: { user: any }) {
  const router = useRouter();
  const { currencySymbol } = useCurrency();
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetAmount: '',
    targetDate: '',
    category: 'savings' as 'savings' | 'debt' | 'investment' | 'purchase' | 'emergency' | 'other',
    icon: '🎯',
    color: '#10b981'
  });

  // Contribution form
  const [contributionAmount, setContributionAmount] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const result = await getGoals(user.$id);
    if (result.success && result.data) setGoals(result.data);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const result = await createGoal({
      userId: user.$id,
      name: formData.name,
      description: formData.description,
      targetAmount: parseFloat(formData.targetAmount),
      targetDate: formData.targetDate || undefined,
      category: formData.category,
      icon: formData.icon,
      color: formData.color
    });

    if (result.success) {
      setShowAddForm(false);
      setFormData({
        name: '',
        description: '',
        targetAmount: '',
        targetDate: '',
        category: 'savings',
        icon: '🎯',
        color: '#10b981'
      });
      loadData();
    } else {
      alert(result.error);
    }
  }

  async function handleAddContribution(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedGoal) return;
    
    const result = await addGoalContribution({
      goalId: selectedGoal.id,
      userId: user.$id,
      amount: parseFloat(contributionAmount)
    });

    if (result.success) {
      setSelectedGoal(null);
      setContributionAmount('');
      loadData();
    } else {
      alert(result.error);
    }
  }

  async function handleDelete(goalId: number) {
    if (!confirm('Are you sure you want to delete this goal? All contributions will also be deleted.')) {
      return;
    }
    
    const result = await deleteGoal(goalId, user.$id);
    
    if (result.success) {
      loadData();
    } else {
      alert(result.error);
    }
  }

  const categoryIcons = {
    savings: '💰',
    debt: '💳',
    investment: '📈',
    purchase: '🛍️',
    emergency: '🚨',
    other: '🎯'
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-36 font-bold text-gray-900 mb-2">Financial Goals</h1>
          <p className="text-16 text-gray-600">Set targets and track your progress</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <p className="text-14 font-medium text-gray-500 mb-2">Active Goals</p>
            <p className="text-32 font-bold text-blue-600">
              <AnimatedCounter amount={activeGoals.length} decimals={0} prefix="" />
            </p>
          </div>
          <div className="card">
            <p className="text-14 font-medium text-gray-500 mb-2">Completed Goals</p>
            <p className="text-32 font-bold text-green-600">
              <AnimatedCounter amount={completedGoals.length} decimals={0} prefix="" />
            </p>
          </div>
          <div className="card">
            <p className="text-14 font-medium text-gray-500 mb-2">Total Target</p>
            <p className="text-32 font-bold text-purple-600">
              <AnimatedCounter amount={activeGoals.reduce((sum, g) => sum + parseFloat(g.target_amount), 0)} />
            </p>
          </div>
        </div>

        <div className="mb-8">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary"
          >
            {showAddForm ? '✕ Cancel' : '+ Add New Goal'}
          </button>
        </div>

        {showAddForm && (
          <div className="card mb-8">
            <h2 className="card-title">Create New Goal</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="form-group">
                  <label className="form-label">Goal Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Emergency Fund, Vacation, Car"
                    className="form-input"
                  />
                </div>

                {/* Category */}
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      category: e.target.value as any,
                      icon: categoryIcons[e.target.value as keyof typeof categoryIcons]
                    })}
                    className="form-select"
                  >
                    <option value="savings">💰 Savings</option>
                    <option value="debt">💳 Debt Payoff</option>
                    <option value="investment">📈 Investment</option>
                    <option value="purchase">🛍️ Purchase</option>
                    <option value="emergency">🚨 Emergency Fund</option>
                    <option value="other">🎯 Other</option>
                  </select>
                </div>

                {/* Target Amount */}
                <div className="form-group">
                  <label className="form-label">Target Amount</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    placeholder="0.00"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Target Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What is this goal for?"
                  rows={2}
                  className="form-textarea"
                />
              </div>

              <button type="submit" className="btn btn-primary w-full">
                Create Goal
              </button>
            </form>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-24 font-semibold mb-6 text-gray-900">Active Goals</h2>
          {loading ? (
            <div className="empty-state">
              <div className="empty-state-icon">⏳</div>
              <p className="empty-state-title">Loading goals...</p>
            </div>
          ) : activeGoals.length === 0 ? (
            <div className="empty-state card">
              <div className="empty-state-icon">🎯</div>
              <p className="empty-state-title">No Active Goals Yet</p>
              <p className="empty-state-description">
                Create your first financial goal to start tracking your progress!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeGoals.map(goal => {
                const percentage = goal.progress_percentage || 0;
                const remaining = parseFloat(goal.target_amount) - parseFloat(goal.current_amount);
                
                return (
                  <div key={goal.id} className="card">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="text-5xl">{goal.icon}</div>
                        <div>
                          <h3 className="font-semibold text-18 text-gray-900">{goal.name}</h3>
                          {goal.description && (
                            <p className="text-14 text-gray-600 mt-1">{goal.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="badge badge-info">
                          {goal.category}
                        </span>
                        <button
                          onClick={() => handleDelete(goal.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete goal"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-14 mb-2">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold text-gray-900">{parseFloat(percentage).toFixed(1)}%</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className={`progress-bar-fill ${percentage >= 100 ? '' : percentage >= 80 ? 'warning' : ''}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Amount Info */}
                    <div className="flex justify-between mb-4">
                      <div>
                        <p className="text-12 text-gray-600 mb-1">Current</p>
                        <p className="text-18 font-bold text-green-600">
                          <AnimatedCounter amount={parseFloat(goal.current_amount)} />
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-12 text-gray-600 mb-1">Target</p>
                        <p className="text-18 font-bold text-blue-600">
                          <AnimatedCounter amount={parseFloat(goal.target_amount)} />
                        </p>
                      </div>
                    </div>

                    {/* Remaining */}
                    <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                      <p className="text-12 text-gray-600 mb-2">Remaining to reach goal</p>
                      <p className="text-20 font-bold text-gray-900">
                        {currencySymbol} {remaining.toLocaleString('id-ID')}
                      </p>
                      {goal.days_remaining !== null && goal.days_remaining >= 0 && (
                        <p className="text-12 text-gray-500 mt-2">
                          {goal.days_remaining} days remaining
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedGoal(goal)}
                      className="btn btn-primary w-full"
                    >
                      + Add Contribution
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {completedGoals.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">🎉 Completed Goals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedGoals.map(goal => (
                <div key={goal.id} className="bg-linear-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-200 p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="text-5xl">{goal.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">{goal.name}</h3>
                        <p className="text-sm text-green-700">✅ Completed</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete goal"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {currencySymbol} {parseFloat(goal.target_amount).toLocaleString('id-ID')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedGoal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4">Add Contribution to {selectedGoal.name}</h3>
              <form onSubmit={handleAddContribution} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0.01"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-900">
                    Current: {currencySymbol} {parseFloat(selectedGoal.current_amount).toLocaleString('id-ID')}
                  </p>
                  {contributionAmount && (
                    <p className="text-sm text-blue-900 mt-1">
                      New total: {currencySymbol} {(parseFloat(selectedGoal.current_amount) + parseFloat(contributionAmount)).toLocaleString('id-ID')}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGoal(null);
                      setContributionAmount('');
                    }}
                    className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
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
