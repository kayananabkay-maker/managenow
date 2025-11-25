import React from 'react'
import HeaderBox from '@/components/HeaderBox'
import TotalBalanceBox from '@/components/TotalBalanceBox'
import RightSidebar from '@/components/RightSidebar';

const HomePage = () => {
  const loggedIn: User = { 
    $id: '1',
    email: 'nabkay@praditadirgantara.sch.id',
    userId: '1',
    dwollaCustomerUrl: '',
    dwollaCustomerId: '',
    firstName: 'Nabila', 
    lastName: 'Kayana',
    name: 'Nabila Kayana',
    address1: '',
    city: '',
    state: '',
    postalCode: '',
    dateOfBirth: '',
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
            user={loggedIn?.firstName || "Guest"}
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
       user={loggedIn}
       transactions={[]}
       banks={accounts.slice(0, 2)}
      />

    </section>
  )
}

export default HomePage