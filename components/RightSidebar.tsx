import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

const RightSidebar = ({user, transactions, upcomingBills = 0, activeGoals = 0}:RightSidebarProps) => {
  return (
    <aside className="right-sidebar">
        <section className="flex flex-col pb-10">
            <div className="profile-banner"/>
            <div className="profile">
                <div className="profile-img">
                    <span className="text-5xl font-bold text-gray-700">{user.firstName[0]}</span>
                </div>
            </div>
            <div className="profile-details">
                <h1 className='profile-name'>
                    {user.firstName} {user.lastName}
                </h1>
                <p className='profile-email'>
                    {user.email}
                </p>
            </div>
        </section>

        <section className="banks">
            <div className="flex flex-col gap-5">
                <div className="bg-linear-to-br from-red-500 to-orange-400 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <Image src="/icons/dollar-circle.svg" width={20} height={20} alt="bills" />
                        </div>
                        <h3 className="text-16 font-semibold">Upcoming Bills</h3>
                    </div>
                    <p className="text-40 font-bold mb-2">{upcomingBills}</p>
                    <Link href="/bills" className="text-14 font-medium opacity-90 hover:opacity-100 transition-opacity inline-flex items-center gap-1">
                        View all <span>→</span>
                    </Link>
                </div>

                <div className="bg-linear-to-br from-emerald-500 to-teal-400 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <Image src="/icons/home.svg" width={20} height={20} alt="goals" />
                        </div>
                        <h3 className="text-16 font-semibold">Active Goals</h3>
                    </div>
                    <p className="text-40 font-bold mb-2">{activeGoals}</p>
                    <Link href="/goals" className="text-14 font-medium opacity-90 hover:opacity-100 transition-opacity inline-flex items-center gap-1">
                        View all <span>→</span>
                    </Link>
                </div>
            </div>
        </section>
    </aside>
  )
}

export default RightSidebar