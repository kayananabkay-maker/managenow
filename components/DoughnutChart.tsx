'use client'

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({ totalIncome, totalExpense }: DoughnutChartProps) => {
  // If both values are 0, show placeholder data
  const hasData = totalIncome > 0 || totalExpense > 0;
  const displayIncome = hasData ? totalIncome : 1;
  const displayExpense = hasData ? totalExpense : 1;
  
  const data = {
    datasets: [
      {
        label: 'Financial Overview',
        data: [displayIncome, displayExpense],
        backgroundColor: ['#10b981', '#ef4444'],
        borderWidth: 0,
        hoverOffset: 4
      }
    ],
    labels: ['Income', 'Expenses']
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Doughnut 
        data={data} 
        options={{
          responsive: true,
          maintainAspectRatio: true,
          cutout: '65%',
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              enabled: hasData,
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed;
                  return `${label}: Rp ${value.toLocaleString('id-ID')}`;
                }
              }
            }
          }
        }}
      />
      {!hasData && (
        <div className="absolute text-center">
          <p className="text-12 text-gray-400">No data</p>
        </div>
      )}
    </div>
  );
};

export default DoughnutChart;