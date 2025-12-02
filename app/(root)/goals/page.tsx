import { redirect } from 'next/navigation';
import { getLoggedInUser } from '@/lib/actions/user.actions.sqlite';
import GoalsPage from '@/components/pages/GoalsPage';

export default async function Goals() {
  const loggedIn = await getLoggedInUser();
  
  if (!loggedIn) {
    redirect('/sign-in');
  }

  return <GoalsPage user={loggedIn} />;
}
