import { redirect } from 'next/navigation';
import { getLoggedInUser } from '@/lib/actions/user.actions.sqlite';
import AnalyticsPage from '@/components/pages/AnalyticsPage';

export default async function Analytics() {
  const loggedIn = await getLoggedInUser();
  
  if (!loggedIn) {
    redirect('/sign-in');
  }

  return <AnalyticsPage user={loggedIn} />;
}
