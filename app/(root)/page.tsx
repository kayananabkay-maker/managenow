import React from 'react'
import HeaderBox from '@/components/HeaderBox'
import TotalBalanceBox from '@/components/TotalBalanceBox'
import RightSidebar from '@/components/RightSidebar';
import { getLoggedInUser } from '@/lib/actions/user.actions.mysql';
import { redirect } from 'next/navigation';

const HomePage = async () => {
  // Get the actual logged-in user from the database
  const loggedIn = await getLoggedInUser();
  
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
    address1: loggedIn.address || '',
    city: loggedIn.city || '',
    state: '',
    postalCode: loggedIn.postalCode || '',
    dateOfBirth: loggedIn.dateOfBirth || '',
    ssn: ''
  };

  // Sample account data
  const accounts: Account[] = [
    {
      id: '1',
      availableBalance: 35000000,
      currentBalance: 35550000,
      officialName: 'Bank Central Asia',
      mask: '1234',
      institutionId: 'bca_id',
      name: 'BCA',
      type: 'depository',
      subtype: 'checking',
      appwriteItemId: 'item_1',
      shareableId: 'share_1'
    },
    {
      id: '2', 
      availableBalance: 24500000,
      currentBalance: 25000000,
      officialName: 'Bank Mandiri',
      mask: '5678',
      institutionId: 'mandiri_id',
      name: 'Mandiri',
      type: 'depository',
      subtype: 'savings',
      appwriteItemId: 'item_2',
      shareableId: 'share_2'
    },
    {
      id: '3',
      availableBalance: 13500000,
      currentBalance: 13750000,
      officialName: 'Bank Negara Indonesia',
      mask: '9012',
      institutionId: 'bni_id',
      name: 'BNI',
      type: 'depository',
      subtype: 'checking',
      appwriteItemId: 'item_3',
      shareableId: 'share_3'
    }
  ];

  return (
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <HeaderBox 
            type="greeting"
            title="Welcome"
            user={user?.firstName || "Guest"}
            subtext="Access and manage your account and transactions efficiently."
          />

          <TotalBalanceBox
            accounts={accounts}
            totalBanks={3}
            totalCurrentBalance={74300000}
          />
        </header>
        
        RECENT TRANSACTIONS
      </div>

      <RightSidebar
       user={user}
       transactions={[]}
       banks={accounts.slice(0, 2)}
      />

    </section>
  )
}

export default HomePage