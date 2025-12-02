import { redirect } from 'next/navigation';
import { getLoggedInUser } from '@/lib/actions/user.actions.sqlite';
import SettingsPage from '@/components/pages/SettingsPage';

export default async function Settings() {
  const loggedIn = await getLoggedInUser();

  if (!loggedIn) {
    redirect('/sign-in');
  }

  const user = {
    $id: loggedIn.id,
    id: loggedIn.id,
    email: loggedIn.email,
    userId: loggedIn.id,
    firstName: loggedIn.firstName,
    lastName: loggedIn.lastName,
    name: `${loggedIn.firstName} ${loggedIn.lastName}`,
    address1: loggedIn.address1 || '',
    city: loggedIn.city || '',
    postalCode: loggedIn.postalCode || '',
    dateOfBirth: loggedIn.dateOfBirth || '',
  };

  return <SettingsPage user={user} />;
}
