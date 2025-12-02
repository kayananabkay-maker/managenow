import { redirect } from 'next/navigation';
import { getLoggedInUser } from '@/lib/actions/user.actions.sqlite';
import BillsPage from '@/components/pages/BillsPage';

export default async function Bills() {
  const loggedIn = await getLoggedInUser();
  
  if (!loggedIn) {
    redirect('/sign-in');
  }

  return <BillsPage user={loggedIn} />;
}
