import Image from "next/image"
export default function RootLayout ({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <main className="flex min-h-screen w-full justify-between font-inter">
            {children}
            <div className="auth-asset">
                <div className="relative w-full max-w-[600px] p-8">
                    {/* Logo at top */}
                    <div className="mb-8 flex items-center gap-2">
                        <Image 
                            src="/icons/logo.svg"
                            alt="ManageNow"
                            width={34}
                            height={34}
                        />
                        <h1 className="text-26 font-bold text-white">ManageNow</h1>
                    </div>
                    
                    {/* Dashboard Preview Mockup */}
                    <div className="rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="mb-4">
                            <p className="text-14 text-gray-600">Welcome back</p>
                            <h2 className="text-24 font-bold text-gray-900">Dashboard Preview</h2>
                        </div>
                        
                        {/* Balance display */}
                        <div className="mb-6 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                            <p className="text-14 opacity-90">Total Balance</p>
                            <p className="text-36 font-bold">Rp 74,300,000</p>
                            <p className="text-12 opacity-80">Across 3 bank accounts</p>
                        </div>
                        
                        {/* Feature list */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-14 text-gray-700">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-blue-600">🏦</span>
                                </div>
                                <span>Manage multiple bank accounts</span>
                            </div>
                            <div className="flex items-center gap-3 text-14 text-gray-700">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-blue-600">📊</span>
                                </div>
                                <span>Track transactions in real-time</span>
                            </div>
                            <div className="flex items-center gap-3 text-14 text-gray-700">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-blue-600">💸</span>
                                </div>
                                <span>Transfer funds securely</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Bottom text */}
                    <p className="mt-6 text-center text-14 text-white/80">
                        Manage your finances efficiently in one place
                    </p>
                </div>
            </div>
        </main>
    )
}