'use client';

import { useCurrency } from './CurrencyProvider';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  categoryName?: string;
  categoryIcon?: string;
  description?: string;
  transaction_date: string;
}

export default function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  const { currencySymbol } = useCurrency();

  return (
    <div className="recent-transactions">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-24 font-semibold text-gray-900">Recent Transactions</h2>
        <a href="/transactions" className="text-14 font-medium text-bankGradient hover:opacity-80 transition-opacity">
          View All →
        </a>
      </div>
      <div className="space-y-3">
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <div 
              key={transaction.id} 
              className="flex justify-between items-center p-5 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  transaction.type === 'income' ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <span className="text-20">
                    {transaction.categoryIcon || (transaction.type === 'income' ? '💰' : '💸')}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-16 text-gray-900">
                    {transaction.categoryName || 'Uncategorized'}
                  </p>
                  <p className="text-14 text-gray-500 mt-1">
                    {transaction.description || 'No description'} • {new Date(transaction.transaction_date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className={`font-bold text-18 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                {transaction.type === 'income' ? '+' : '-'}{currencySymbol} {transaction.amount.toLocaleString('id-ID')}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-16 text-gray-500">No transactions yet</p>
            <p className="text-14 text-gray-400 mt-2">Start tracking your finances!</p>
          </div>
        )}
      </div>
    </div>
  );
}
