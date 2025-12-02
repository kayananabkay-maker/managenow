'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AnimatedCounter from '@/components/AnimatedCounter';
import { useCurrency } from '@/components/CurrencyProvider';
import {
  getMonthlySpending,
  getSpendingTrends,
  getDashboardSummary,
  exportTransactionsCSV
} from '@/lib/actions/financial.actions';

export default function AnalyticsPage({ user }: { user: any }) {
  const router = useRouter();
  const { currencySymbol } = useCurrency();
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM
  );

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  async function loadData() {
    setLoading(true);
    const [monthlyRes, trendsRes, summaryRes] = await Promise.all([
      getMonthlySpending(user.$id, selectedMonth),
      getSpendingTrends(user.$id, 6),
      getDashboardSummary(user.$id)
    ]);

    if (monthlyRes.success && monthlyRes.data) setMonthlyData(monthlyRes.data);
    if (trendsRes.success && trendsRes.data) setTrends(trendsRes.data);
    if (summaryRes.success) setSummary(summaryRes.data);
    
    setLoading(false);
  }

  async function handleExport() {
    const result = await exportTransactionsCSV(user.$id);
    if (result.success && result.data && result.filename) {
      // Create download link
      const blob = new Blob([result.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      alert(result.error);
    }
  }

  // Calculate totals for current month
  const incomeData = monthlyData.filter(d => d.type === 'income');
  const expenseData = monthlyData.filter(d => d.type === 'expense');
  
  const totalIncome = incomeData.reduce((sum, d) => sum + parseFloat(d.total_amount), 0);
  const totalExpense = expenseData.reduce((sum, d) => sum + parseFloat(d.total_amount), 0);
  const netIncome = totalIncome - totalExpense;

  // Top categories
  const topExpenses = expenseData.sort((a, b) => parseFloat(b.total_amount) - parseFloat(a.total_amount)).slice(0, 5);
  const maxExpense = topExpenses.length > 0 ? parseFloat(topExpenses[0].total_amount) : 1;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-36 font-bold text-gray-900 mb-2">Analytics & Reports</h1>
            <p className="text-16 text-gray-600">Visualize your spending patterns</p>
          </div>
          <button
            onClick={handleExport}
            className="btn btn-success"
          >
            📊 Export CSV
          </button>
        </div>

        {/* Month Selector */}
        <div className="mb-8 flex items-center gap-4">
          <label className="form-label">Month:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="form-input"
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="card">
            <p className="text-14 font-medium text-gray-500 mb-2 truncate">Total Income</p>
            <p className="text-32 font-bold text-green-600 wrap-break-word">
              <AnimatedCounter amount={totalIncome} />
            </p>
            <p className="text-12 text-gray-500 mt-2">
              {incomeData.length} categories
            </p>
          </div>
          <div className="card">
            <p className="text-14 font-medium text-gray-500 mb-2 truncate">Total Expenses</p>
            <p className="text-32 font-bold text-red-600 wrap-break-word">
              <AnimatedCounter amount={totalExpense} />
            </p>
            <p className="text-12 text-gray-500 mt-2">
              {expenseData.length} categories
            </p>
          </div>
          <div className="card">
            <p className="text-14 font-medium text-gray-500 mb-2 truncate">Net Income</p>
            <p className={`text-32 font-bold wrap-break-word ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <AnimatedCounter amount={Math.abs(netIncome)} />
            </p>
            <p className="text-12 text-gray-500 mt-2">
              {netIncome >= 0 ? 'Surplus' : 'Deficit'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Expense Categories */}
          <div className="card">
            <h2 className="text-20 font-semibold text-gray-900 mb-6">Top Expense Categories</h2>
            {loading ? (
              <div className="text-center text-gray-500 py-8">Loading...</div>
            ) : topExpenses.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📊</div>
                <div className="empty-state-title">No Expense Data</div>
                <div className="empty-state-description">No expense data for this month</div>
              </div>
            ) : (
              <div className="space-y-4">
                {topExpenses.map((item, index) => (
                  <div key={item.category_name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {index + 1}. {item.category_name}
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        <AnimatedCounter amount={parseFloat(item.total_amount)} />
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill danger"
                        style={{ width: `${(parseFloat(item.total_amount) / maxExpense) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.transaction_count} transactions • <AnimatedCounter amount={((parseFloat(item.total_amount) / totalExpense) * 100)} decimals={1} prefix="" />% of total
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Income vs Expense Breakdown */}
          <div className="card">
            <h2 className="text-20 font-semibold text-gray-900 mb-6">Income vs Expenses</h2>
            <div className="space-y-6">
              {/* Income */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Income</span>
                  <span className="text-sm font-bold text-green-600">
                    {currencySymbol} {totalIncome.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 flex items-center justify-end pr-3"
                    style={{ width: `${(totalIncome / (totalIncome + totalExpense)) * 100}%` }}
                  >
                    <span className="text-white text-xs font-medium">
                      {((totalIncome / (totalIncome + totalExpense)) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Expenses */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Expenses</span>
                  <span className="text-sm font-bold text-red-600">
                    {currencySymbol} {totalExpense.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 flex items-center justify-end pr-3"
                    style={{ width: `${(totalExpense / (totalIncome + totalExpense)) * 100}%` }}
                  >
                    <span className="text-white text-xs font-medium">
                      {((totalExpense / (totalIncome + totalExpense)) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Savings Rate */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Savings Rate</span>
                  <span className={`text-lg font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalIncome > 0 ? ((netIncome / totalIncome) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {netIncome >= 0 
                    ? `You're saving ${((netIncome / totalIncome) * 100).toFixed(0)}% of your income!`
                    : 'Spending more than earning this month'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* All Expense Categories */}
          <div className="card">
            <h2 className="text-20 font-semibold text-gray-900 mb-6">All Expense Categories</h2>
            {loading ? (
              <div className="text-center text-gray-500 py-8">Loading...</div>
            ) : expenseData.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">💰</div>
                <div className="empty-state-title">No Expense Data</div>
                <div className="empty-state-description">No expense data for this month</div>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {expenseData.map(item => (
                  <div key={item.category_name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.category_name}</p>
                      <p className="text-xs text-gray-500">{item.transaction_count} transactions</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {currencySymbol} {parseFloat(item.total_amount).toLocaleString('id-ID')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {((parseFloat(item.total_amount) / totalExpense) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Income Categories */}
          <div className="card">
            <h2 className="text-20 font-semibold text-gray-900 mb-6">Income Sources</h2>
            {loading ? (
              <div className="text-center text-gray-500 py-8">Loading...</div>
            ) : incomeData.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">💵</div>
                <div className="empty-state-title">No Income Data</div>
                <div className="empty-state-description">No income data for this month</div>
              </div>
            ) : (
              <div className="space-y-3">
                {incomeData.map(item => (
                  <div key={item.category_name} className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.category_name}</p>
                      <p className="text-xs text-gray-500">{item.transaction_count} transactions</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {currencySymbol} {parseFloat(item.total_amount).toLocaleString('id-ID')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {((parseFloat(item.total_amount) / totalIncome) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
