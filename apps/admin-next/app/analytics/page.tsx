'use client';

import React from 'react';

export default function AnalyticsPage() {
  const financialData = {
    revenue: 125000000,
    cogs: 45000000,
    opex: 30000000,
    grossProfit: 80000000,
    netProfit: 50000000,
    margin: '40%',
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-gray-900">Financial Analytics (P&L)</h1>
        <div className="flex gap-4">
           <button className="px-4 py-2 bg-white border rounded-lg shadow-sm font-medium">Export PDF</button>
           <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm font-medium">Monthly Report</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Gross Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">Rp {financialData.revenue.toLocaleString()}</p>
          <p className="text-xs text-green-600 mt-1">↑ 12% vs last month</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">COGS (Recipes)</p>
          <p className="text-2xl font-bold text-red-600 mt-2">Rp {financialData.cogs.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Net Profit</p>
          <p className="text-2xl font-bold text-indigo-600 mt-2">Rp {financialData.netProfit.toLocaleString()}</p>
          <p className="text-xs text-indigo-500 mt-1">Margin: {financialData.margin}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Total Outlets</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">8 Cabang</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Performance Chart Simulation */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-6">Revenue Trend (7 Days)</h2>
          <div className="h-48 flex items-end gap-4">
             {[40, 60, 45, 80, 90, 75, 100].map((h, i) => (
               <div key={i} className="flex-1 bg-indigo-500 rounded-t-lg" style={{ height: `${h}%` }}></div>
             ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-gray-400">
             <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>

        {/* Expenses Breakdown */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-6">Expense Breakdown</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1"><span>Raw Materials (Biji Kopi, Susu)</span><span>55%</span></div>
              <div className="w-full bg-gray-100 h-2 rounded-full"><div className="bg-amber-500 h-2 rounded-full" style={{width: '55%'}}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span>Operational (Listrik, Air)</span><span>25%</span></div>
              <div className="w-full bg-gray-100 h-2 rounded-full"><div className="bg-blue-500 h-2 rounded-full" style={{width: '25%'}}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span>Staff Payroll</span><span>20%</span></div>
              <div className="w-full bg-gray-100 h-2 rounded-full"><div className="bg-green-500 h-2 rounded-full" style={{width: '20%'}}></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
