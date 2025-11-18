export default function HomePage() {
  return (
    <div className="home">
      <div className="home-content">
        <header className="home-header">
          <h1 className="text-4xl font-semibold text-gray-900">Welcome Back</h1>
          <p className="text-lg text-gray-600">Access & manage your account and transactions efficiently.</p>
        </header>

        <div className="total-balance">
          <div className="total-balance-chart">
            {/* Placeholder for chart */}
            <div className="w-20 h-20 rounded-full bg-blue-100 flex-center">
              💰
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="total-balance-label">Total Current Balance</p>
            <p className="total-balance-amount">$1,250.35</p>
          </div>
        </div>

        <section className="recent-transactions">
          <header className="flex items-center justify-between">
            <h2 className="recent-transactions-label">Recent Transactions</h2>
          </header>
          <div className="mt-4 space-y-4">
            <p className="text-gray-500">No transactions yet</p>
          </div>
        </section>
      </div>
    </div>
  );
}