import React from 'react';
import axios from '../../api/axiosInstance';
import { Users, Briefcase, UserPlus, FileText, AlertTriangle } from 'lucide-react';
import StatsCard from './Dashboard/StatsCard';
import GrowthChart from './Dashboard/GrowthChart';
import RecentActivity from './Dashboard/RecentActivity';

const AdminOverview = ({ setActiveTab }) => {
   const [data, setData] = React.useState(null);
   const [loading, setLoading] = React.useState(true);
   const [error, setError] = React.useState(null);

   const icons = [Users, Briefcase, UserPlus, FileText];

   // Map each stat card to its corresponding navigation section
   const navMapping = {
      'Total Users': 'users',
      'Active Startups': 'startups',
      'Pending Mentors': 'mentors',
      'Total Requests': 'sessions'
   };

   React.useEffect(() => {
      axios.get('/admin/stats')
         .then(res => {
            setData(res.data);
            setLoading(false);
         })
         .catch(err => {
            console.error(err);
            setError(err.message);
            setLoading(false);
         });
   }, []);

   const handleCardClick = (label) => {
      const targetSection = navMapping[label];
      if (targetSection && setActiveTab) {
         setActiveTab(targetSection);
      }
   };

   if (loading) {
      return (
         <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="p-8 text-rose-400 bg-rose-500/10 rounded-[2rem] border border-rose-500/20 flex items-center gap-4">
            <AlertTriangle size={24} />
            <span className="font-black text-[10px] uppercase tracking-widest">Protocol Retrieval Error: {error}</span>
         </div>
      );
   }

   return (
      <div className="space-y-12 animate-in fade-in duration-700">
         <div className="px-2 sm:px-0">
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
               Intelligence <span className="text-emerald-500/80">Command</span>
            </h1>
            <p className="text-sm sm:text-lg text-gray-500 font-medium">Synchronized overview of global platform telemetry and operational nexus.</p>
         </div>

         {/* Stats Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {data?.stats?.map((stat, index) => {
               const Icon = icons[index] || Users;
               return (
                  <div
                     key={index}
                     onClick={() => handleCardClick(stat.label)}
                     className="cursor-pointer group h-full"
                  >
                     <StatsCard
                        icon={Icon}
                        label={stat.label}
                        value={stat.value}
                        trend={stat.trend}
                        trendUp={stat.trendUp}
                        alert={stat.alert}
                     />
                  </div>
               );
            })}
         </div>

         {/* Main Grid */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart Section */}
            <div className="lg:col-span-2">
               <GrowthChart data={data?.growth} />
            </div>

            {/* Activity Section */}
            <div className="lg:col-span-1">
               <RecentActivity activities={data?.activities} />
            </div>
         </div>
      </div>
   );
};

export default AdminOverview;
