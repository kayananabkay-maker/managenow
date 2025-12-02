import React from 'react'
import HeaderBox from '@/components/HeaderBox'
import TotalBalanceBox from '@/components/TotalBalanceBox'
import RightSidebar from '@/components/RightSidebar';
import RecentTransactions from '@/components/RecentTransactions';
import { getLoggedInUser } from '@/lib/actions/user.actions.sqlite';
import { 
  getRecentTransactions, 
  getMonthlyIncome, 
  getMonthlyExpenses,
  getUpcomingBills,
  getActiveGoals 
} from '@/lib/actions/financial.actions';
import { redirect } from 'next/navigation';

const HomePage = async () => {
  // Get the actual logged-in user from the database
  const loggedIn = await getLoggedInUser();
  
  console.log('[Homepage] loggedIn:', loggedIn);
  
  // If no user is logged in, redirect to sign-in page
  if (!loggedIn) {
    redirect('/sign-in');
  }

  // Transform to match User type
  const user: User = {
    $id: loggedIn.id,
    email: loggedIn.email,
    userId: loggedIn.id,
    dwollaCustomerUrl: '',
    dwollaCustomerId: '',
    firstName: loggedIn.firstName,
    lastName: loggedIn.lastName,
    name: `${loggedIn.firstName} ${loggedIn.lastName}`,
    address1: loggedIn.address1 || '',
    city: loggedIn.city || '',
    state: '',
    postalCode: loggedIn.postalCode || '',
    dateOfBirth: loggedIn.dateOfBirth || '',
    ssn: ''
  };

  // Get financial data
  const transactions = await getRecentTransactions(loggedIn.id, 10);
  const monthlyIncome = await getMonthlyIncome(loggedIn.id);
  const monthlyExpenses = await getMonthlyExpenses(loggedIn.id);
  const upcomingBillsResult = await getUpcomingBills(loggedIn.id);
  const activeGoals = await getActiveGoals(loggedIn.id);
  
  const upcomingBills = (upcomingBillsResult?.success && Array.isArray(upcomingBillsResult.data)) ? upcomingBillsResult.data : [];
  const netBalance = monthlyIncome - monthlyExpenses;

  console.log('📊 Homepage Data:', { 
    monthlyIncome, 
    monthlyExpenses, 
    netBalance,
    transactionCount: Array.isArray(transactions) ? transactions.length : 0,
    upcomingBillsCount: upcomingBills.length,
    activeGoalsCount: Array.isArray(activeGoals) ? activeGoals.length : 0
  });

  return (
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <HeaderBox 
            type="greeting"
            title="Welcome back"
            user={user?.firstName || "Guest"}
            subtext="Track your income, expenses, and financial goals efficiently."
          />

          <TotalBalanceBox
            totalIncome={monthlyIncome}
            totalExpense={monthlyExpenses}
            netBalance={netBalance}
          />
        </header>
        
        <RecentTransactions transactions={transactions} />
      </div>

      <RightSidebar
       user={user}
       transactions={transactions as Transaction[]}
       upcomingBills={upcomingBills.length}
       activeGoals={activeGoals.length}
      />

    </section>
  )
}

export default HomePage