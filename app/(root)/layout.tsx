import Sidebar from "@/components/Sidebar";

export default function RootLayout ({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <main className="flex h-screen w-full font-inter">
            <Sidebar />
            <div className="flex size-full flex-col">
                <div className="root-layout">
                    <h1 className="text-2xl font-semibold">ManageNow</h1>
                </div>
                {children}
            </div>
        </main>
    )
}