import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/ui/MobileNav";
import Image from "next/image";
import { getLoggedInUser } from "@/lib/actions/user.actions.mysql";
import { redirect } from "next/navigation";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const loggedIn = await getLoggedInUser();

    if (!loggedIn) redirect('/sign-in');

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
    
    return (
        <main className="flex h-screen w-full font-inter">
            <Sidebar user={user} />

            
            <div className="flex size-full flex-col">
                <div className="root-layout">
                    <Image src="/icons/logo.svg" width={34} height={34} alt="logo" />
                    <MobileNav user={user} />
                </div>
                {children}
            </div>
        </main>
    );
}
