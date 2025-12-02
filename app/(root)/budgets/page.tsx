import { redirect } from 'next/navigation';
import { getLoggedInUser } from '@/lib/actions/user.actions.sqlite';
import BudgetsPage from '@/components/pages/BudgetsPage';

export default async function Budgets() {
  const loggedIn = await getLoggedInUser();
  
  if (!loggedIn) {
    redirect('/sign-in');
  }

  return <BudgetsPage user={loggedIn} />;
}
