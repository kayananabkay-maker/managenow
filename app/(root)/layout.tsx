import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/ui/MobileNav";
import Image from "next/image";

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
    
    return (
        <main className="flex h-screen w-full font-inter">
            <Sidebar user={loggedIn} />

            
            <div className="flex size-full flex-col">
                <div className="root-layout">
                    <Image src="/icons/logo.svg" width={34} height={34} alt="logo" />
                    <MobileNav user={loggedIn} />
                </div>
                {children}
            </div>
        </main>
    );
}
