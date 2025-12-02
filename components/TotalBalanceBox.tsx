'use client'

import AnimatedCounter from './AnimatedCounter';
import DoughnutChart from './DoughnutChart';
import { useCurrency } from './CurrencyProvider';

const TotalBalanceBox = ({ 
    totalIncome = 0,
    totalExpense = 0,
    netBalance = 0
}: TotalBalanceBoxProps) => {
    const { currencySymbol } = useCurrency();
    
    return ( 
        <section className="total-balance">
            <div className="total-balance-chart">
                <DoughnutChart totalIncome={totalIncome} totalExpense={totalExpense} />
            </div>

            <div className="flex flex-col gap-6 flex-1">
                <div>
                    <p className="text-14 font-medium text-gray-600 mb-2">Monthly Net Balance</p>
                    <div className={`flex items-baseline gap-2 ${netBalance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                        <span className="text-14 font-medium">{currencySymbol}</span>
                        <span className="text-36 font-bold">
                            <AnimatedCounter amount={Math.abs(netBalance)} prefix="" />
                        </span>
                    </div>
                </div>
                
                <div className="flex gap-8 pt-6 border-t border-gray-200">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <p className="text-14 text-gray-600">Income</p>
                        </div>
                        <p className="text-20 font-bold text-gray-900">
                            {currencySymbol} <AnimatedCounter amount={totalIncome} prefix="" />
                        </p>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <p className="text-14 text-gray-600">Expenses</p>
                        </div>
                        <p className="text-20 font-bold text-gray-900">
                            {currencySymbol} <AnimatedCounter amount={totalExpense} prefix="" />
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TotalBalanceBox;