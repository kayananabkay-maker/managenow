'use client';

import CountUp from 'react-countup';
import { useCurrency } from './CurrencyProvider';

interface AnimatedCounterProps {
    amount: number;
    decimals?: number;
    prefix?: string;
}

const AnimatedCounter = ({ amount, decimals = 0, prefix }: AnimatedCounterProps) => {
    const { currencySymbol, isLoading } = useCurrency();
    
    // If prefix is undefined, use currency symbol. If prefix is "", use nothing. Otherwise use provided prefix.
    // While loading, default to 'Rp ' to prevent flash
    const displayPrefix = prefix === undefined 
        ? (isLoading ? 'Rp ' : `${currencySymbol} `) 
        : prefix;
    
    return (
        <span className="inline-block">
            <CountUp
                duration={2}
                decimals={decimals}
                separator=","
                prefix={displayPrefix}
                end={amount} 
            />
        </span>
    );
};

export default AnimatedCounter;