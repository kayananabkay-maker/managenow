import { redirect } from 'next/navigation';
import { getLoggedInUser } from '@/lib/actions/user.actions.sqlite';
import TransactionsPage from '@/components/pages/TransactionsPage';

export default async function Transactions() {
  const loggedIn = await getLoggedInUser();
  
  if (!loggedIn) {
    redirect('/sign-in');
  }

  return <TransactionsPage user={loggedIn} />;
}
