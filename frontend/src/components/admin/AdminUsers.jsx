import React, { useState, useEffect } from 'react';
import { Search, Trash2, X, Plus } from 'lucide-react';
import axios from '../../api/axiosInstance';

const AdminUsers = () => {
   const [users, setUsers] = useState([]);
   const [loading, setLoading] = useState(true);
   const [isAdmin, setIsAdmin] = useState(false);
   const [showLoginModal, setShowLoginModal] = useState(false);
   const [loginCredentials, setLoginCredentials] = useState({ email: '', password: '' });

   // Add User State
   const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Admin', status: 'Active' });
   const [isAdding, setIsAdding] = useState(false);

   useEffect(() => {
      fetchUsers();
   }, []);

   const fetchUsers = async () => {
      try {
         const res = await axios.get('/admin/users');
         setUsers(res.data);
         setLoading(false);
      } catch (err) {
         console.error('Error fetching users:', err);
         setLoading(false);
      }
   };

   const handleLogin = (e) => {
      e.preventDefault();
      // Mock Admin credentials
      if (loginCredentials.email === 'admin@startup.com' && loginCredentials.password === 'admin123') {
         setIsAdmin(true);
         setShowLoginModal(false);
         setLoginCredentials({ email: '', password: '' });
      } else {
         alert('Invalid credentials! (Try: admin@startup.com / admin123)');
      }
   };

   const handleAddUser = async (e) => {
      e.preventDefault();
      try {
         const res = await axios.post('/admin/users', { ...newUser, role: 'Admin' });
         if (res.status === 200 || res.status === 201) {
            fetchUsers();
            setIsAdding(false);
            setNewUser({ name: '', email: '', role: 'Admin', status: 'Active' });
         }
      } catch (err) {
         console.error('Error adding user:', err);
      }
   };

   const handleDeleteUser = async (id) => {
      if (!isAdmin) {
         alert('Only Admins can delete users. Please login first.');
         return;
      }
      if (!window.confirm('Are you sure you want to delete this user?')) return;
      try {
         const res = await axios.delete(`/admin/users/${id}`);
         if (res.status === 200) {
            alert('User account deleted.');
            fetchUsers();
         }
      } catch (err) {
         console.error('Error deleting user:', err);
      }
   };

   return (
      <div className="space-y-10 animate-in fade-in duration-700">
         <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 px-2 sm:px-0">
            <div>
               <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">User Access <span className="text-emerald-500/80">Control</span></h1>
               <p className="text-sm sm:text-base text-gray-500 font-medium">Security-first management of platform accounts and administrative privileges.</p>
            </div>


            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
               {isAdmin && (
                  <button
                     onClick={() => setIsAdding(!isAdding)}
                     className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-2xl flex items-center justify-center transition-all duration-300 text-sm font-black uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95"
                  >
                     <Plus size={18} className="mr-2" />
                     Add Admin
                  </button>

               )}

               {!isAdmin ? (
                  <button
                     onClick={() => setShowLoginModal(true)}
                     className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-6 py-3 rounded-2xl flex items-center justify-center transition-all duration-300 text-sm font-black uppercase tracking-widest backdrop-blur-md"
                  >
                     Elevate Privileges
                  </button>

               ) : (
                  <button
                     onClick={() => setIsAdmin(false)}
                     className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-6 py-3 rounded-2xl transition-all duration-300 border border-red-500/20 text-sm font-black uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                  >
                     Revoke Session
                  </button>

               )}
            </div>
         </div>

         {/* Admin Login Modal (Cinematic) */}
         {showLoginModal && (
            <div className="fixed inset-0 bg-[#020617]/80 flex items-center justify-center z-[200] p-4 backdrop-blur-2xl">
               <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="cinematic-glass bg-[#020617]/90 p-10 rounded-[2.5rem] border border-white/10 w-full max-w-md shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative overflow-hidden"
               >
                  {/* Decorative Radial */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full -mt-32" />

                  <button
                     onClick={() => setShowLoginModal(false)}
                     className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 text-gray-500 hover:text-white transition-colors"
                  >
                     <X size={20} />
                  </button>

                  <div className="relative z-10 mb-8">
                     <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Security <span className="text-emerald-500">Gateway</span></h2>
                     <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Authentication required for administrative actions.</p>
                  </div>


                  <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                     <div>
                        <label className="block text-gray-400 font-black text-[10px] uppercase tracking-widest mb-2 px-1">Access Identity</label>
                        <input
                           type="email"
                           className="w-full bg-white/5 border border-white/10 text-white p-4 rounded-2xl focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all placeholder:text-gray-700"
                           placeholder="admin@startup.com"
                           value={loginCredentials.email}
                           onChange={e => setLoginCredentials({ ...loginCredentials, email: e.target.value })}
                           required
                        />
                     </div>
                     <div>
                        <label className="block text-gray-400 font-black text-[10px] uppercase tracking-widest mb-2 px-1">Security Key</label>
                        <input
                           type="password"
                           className="w-full bg-white/5 border border-white/10 text-white p-4 rounded-2xl focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all placeholder:text-gray-700"
                           placeholder="••••••••"
                           value={loginCredentials.password}
                           onChange={e => setLoginCredentials({ ...loginCredentials, password: e.target.value })}
                           required
                        />
                     </div>
                     <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-black p-4 rounded-2xl transition-all mt-4 uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                        Authorize Session
                     </button>
                  </form>

               </motion.div>
            </div>
         )}

         {/* Add Admin Form (Admin Only - Cinematic) */}
         {isAdding && isAdmin && (
            <div className="cinematic-glass p-8 rounded-[2rem] border border-emerald-500/20 mb-10 shadow-[0_20px_40px_rgba(0,0,0,0.3)] relative overflow-hidden group">
               <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
               <h3 className="relative z-10 text-lg font-black text-white mb-2 uppercase tracking-tight">Provision <span className="text-emerald-500">New Administrator</span></h3>
               <p className="relative z-10 text-xs text-gray-500 font-bold uppercase tracking-widest mb-6">Create a high-privilege account for system management.</p>

               <form onSubmit={handleAddUser} className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <input
                     type="text"
                     placeholder="Identity Name"
                     className="bg-white/5 border border-white/10 text-white p-4 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
                     value={newUser.name}
                     onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                     required
                  />
                  <input
                     type="email"
                     placeholder="Verified Email"
                     className="bg-white/5 border border-white/10 text-white p-4 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
                     value={newUser.email}
                     onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                     required
                  />

                  <button type="submit" className="bg-emerald-500 text-white font-black p-4 rounded-2xl hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] uppercase tracking-widest">
                     Commit Provisioning
                  </button>
               </form>
            </div>
         )}

         {/* Users Table (Cinematic Glass) */}
         <div className="cinematic-glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.4)] transition-all duration-700">
            <div className="overflow-x-auto custom-scrollbar">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-white/[0.02] border-b border-white/5">
                        <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-gray-500">Access Identity</th>
                        <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-gray-500">Digital Location</th>
                        <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-gray-500">Privilege Role</th>
                        <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-gray-500">System Status</th>
                        <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-gray-500">Registration</th>
                        <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-gray-500 text-center">Protocol</th>
                     </tr>
                  </thead>
                  <tbody className="text-gray-300 divide-y divide-white/5">

                     {loading ? (
                        <tr><td colSpan="6" className="p-16 text-center">
                           <div className="flex flex-col items-center gap-4">
                              <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                              <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">Querying Identity Directory...</span>
                           </div>
                        </td></tr>
                     ) : (
                        users.map(user => (
                           <tr key={user._id} className="hover:bg-white/[0.03] transition-all group">

                              <td className="p-6">
                                 <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-[1.25rem] bg-[#004d40] border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-black shadow-[0_0_15px_rgba(16,185,129,0.1)] group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all">
                                       {(user.name || user.username || '?').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                       <p className="text-sm font-black text-white truncate leading-none mb-1">{user.name || user.username}</p>
                                       <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Unique Client ID</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="p-6">
                                 <span className="text-[13px] font-medium text-gray-400">{user.email}</span>
                              </td>

                              <td className="p-6">
                                 <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${user.role === 'Admin'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                                    : 'bg-white/5 text-gray-400 border-white/10'
                                    }`}>
                                    {user.role}
                                 </span>
                              </td>

                              <td className="p-6">
                                 <div className="flex items-center gap-2.5">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]" />
                                    <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">
                                       {user.status}
                                    </span>
                                 </div>
                              </td>
                              <td className="p-6 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                                 {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                              </td>

                              <td className="p-6 text-center">
                                 <button
                                    onClick={() => handleDeleteUser(user._id)}
                                    className={`p-3 rounded-2xl transition-all duration-300 ${isAdmin ? 'text-rose-500 hover:text-white hover:bg-rose-500/20 hover:shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'text-gray-700 cursor-not-allowed grayscale'}`}
                                    title={isAdmin ? "Remove Identity" : "Elevation Required"}
                                 >
                                    <Trash2 size={18} />
                                 </button>
                              </td>
                           </tr>
                        ))
                     )}
                     {!loading && users.length === 0 && (
                        <tr><td colSpan="6" className="p-20 text-center">
                           <div className="flex flex-col items-center gap-2 opacity-30">
                              <Search size={40} className="text-gray-500 mb-4" />
                              <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.3em]">Directory Empty</p>
                           </div>
                        </td></tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
};

export default AdminUsers;
