import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { MOCK_CHART_DATA } from '../constants';
import { Users, Car, DollarSign, Activity, Map, Settings, LogOut } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';

export const AdminDashboard: React.FC = () => {
  const { theme } = useTheme();
  const axisColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';
  const tooltipStyle = {
    backgroundColor: theme === 'dark' ? '#1e293b' : '#fff',
    borderColor: theme === 'dark' ? '#334155' : '#fff',
    color: theme === 'dark' ? '#f8fafc' : '#0f172a',
    borderRadius: '8px', 
    border: 'none', 
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
  };

  return (
    <div className="flex h-full bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden transition-colors duration-300">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col transition-colors">
        <div className="p-6">
          <h1 className="text-2xl font-black text-wobio-600 dark:text-wobio-500 tracking-tight">WOBIO<span className="text-slate-400 dark:text-slate-600">.admin</span></h1>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {[
            { name: 'Dashboard', icon: Activity, active: true },
            { name: 'Live Map', icon: Map },
            { name: 'Riders', icon: Users },
            { name: 'Drivers', icon: Car },
            { name: 'Financials', icon: DollarSign },
            { name: 'Settings', icon: Settings },
          ].map((item) => (
            <button key={item.name} className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${item.active ? 'bg-wobio-50 dark:bg-wobio-900/20 text-wobio-600 dark:text-wobio-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <item.icon className="w-5 h-5" />
              {item.name}
            </button>
          ))}
        </nav>
        
        <div className="px-6 py-4">
           <ThemeToggle showLabel className="w-full justify-center bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700" />
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
           <button className="flex items-center gap-2 text-red-500 text-sm font-medium hover:text-red-600">
             <LogOut className="w-4 h-4" /> Sign Out
           </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex justify-between items-center sticky top-0 z-20 transition-colors">
          <h2 className="text-xl font-bold">Dashboard Overview</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 dark:text-slate-400">Admin User</span>
            <div className="w-8 h-8 bg-wobio-100 dark:bg-wobio-900 rounded-full flex items-center justify-center text-wobio-700 dark:text-wobio-300 font-bold">A</div>
          </div>
        </header>

        <main className="p-8 space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Rides', val: '1,204', sub: '+12% from last week', color: 'bg-blue-500' },
              { label: 'Active Drivers', val: '342', sub: '48 currently online', color: 'bg-green-500' },
              { label: 'Total Revenue', val: '$42,500', sub: '+8% from last month', color: 'bg-purple-500' },
              { label: 'Avg Rating', val: '4.8', sub: 'Based on 500 reviews', color: 'bg-orange-500' },
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{stat.label}</div>
                <div className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{stat.val}</div>
                <div className="text-xs text-green-600 dark:text-green-400 font-medium">{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 h-96 transition-colors">
              <h3 className="font-bold text-lg mb-6 text-slate-900 dark:text-white">Weekly Revenue</h3>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={MOCK_CHART_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: axisColor}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: axisColor}} />
                  <Tooltip cursor={{fill: theme === 'dark' ? '#334155' : '#f1f5f9'}} contentStyle={tooltipStyle} />
                  <Bar dataKey="amt" fill="#1877F2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Trips Chart */}
             <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 h-96 transition-colors">
              <h3 className="font-bold text-lg mb-6 text-slate-900 dark:text-white">Trip Volume</h3>
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={MOCK_CHART_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: axisColor}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: axisColor}} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="trips" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981', strokeWidth: 2, stroke: theme === 'dark' ? '#0f172a' : '#fff'}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Recent Activity Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Recent Rides</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                  <tr>
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Rider</th>
                    <th className="px-6 py-3">Driver</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Fare</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[1,2,3,4,5].map(id => (
                    <tr key={id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-500">#TR-{2000+id}</td>
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">Customer {id}</td>
                      <td className="px-6 py-4">Driver {id}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                          Completed
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">$1{id}.50</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};