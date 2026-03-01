import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Building2, TrendingUp, Loader, Users, Clock } from "lucide-react";
import axios from '../../api/axiosInstance';
import { toast } from 'react-toastify';

const DashboardNetwork = ({ setActiveTab, setSelectedChatUser }) => {
  const [founders, setFounders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFounders();
  }, []);

  const fetchFounders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/network');

      if (response.data.success) {
        setFounders(response.data.data);
      } else {
        setError('Failed to load founder network');
      }
    } catch (err) {
      console.error('Error fetching founders:', err);
      setError('Failed to load founder network');
      toast.error('Failed to load founder network');
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
      }
    }
    return 'Just now';
  };

  const handleConnect = async (founderId) => {
    try {
      const response = await axios.post('/network/connect', { recipientId: founderId });
      if (response.data.success) {
        toast.success('Connection request sent!');
        setFounders(prev => prev.map(f =>
          f._id === founderId ? { ...f, connectionStatus: 'pending' } : f
        ));
      }
    } catch (err) {
      console.error('Error connecting:', err);
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Failed to send connection request');
      }
    }
  };

  const handleAccept = async (requesterId) => {
    try {
      const response = await axios.post('/network/accept', { requesterId });
      if (response.data.success) {
        toast.success('Request accepted! You can now chat.');
        setFounders(prev => prev.map(f =>
          f._id === requesterId ? { ...f, connectionStatus: 'accepted' } : f
        ));
      }
    } catch (err) {
      console.error('Error accepting:', err);
      toast.error('Failed to accept request');
    }
  };

  const handleChat = (founder) => {
    setSelectedChatUser(founder);
    setActiveTab('messages');
  };

  const getButtonContent = (founder) => {
    switch (founder.connectionStatus) {
      case 'accepted':
        return (
          <button
            onClick={() => handleChat(founder)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500/10 text-green-500 rounded-xl font-medium text-sm cursor-pointer hover:bg-green-500/20 transition-all">
            <MessageSquare size={16} />
            Connected
          </button>
        );
      case 'pending':
        return (
          <button disabled className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--text-secondary)]/10 text-[var(--text-secondary)] rounded-xl font-medium text-sm cursor-not-allowed">
            <Clock size={16} />
            Pending
          </button>
        );
      case 'received':
        return (
          <button
            onClick={() => handleAccept(founder._id)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--color-primary)] text-white rounded-xl hover:opacity-90 transition-all font-medium text-sm">
            Accept Request
          </button>
        );
      default:
        return (
          <button
            onClick={() => handleConnect(founder._id)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-xl hover:bg-[var(--color-primary)] hover:text-white transition-all font-medium text-sm"
          >
            <Users size={16} />
            Connect
          </button>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin text-[var(--color-primary)]" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        <p>{error}</p>
        <button onClick={fetchFounders} className="mt-4 text-[var(--color-primary)] underline">Try Again</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Founder Network</h1>
        <p className="text-[var(--text-secondary)] mt-1">Connect with {founders.length} real founders building amazing startups.</p>
      </motion.div>

      {/* Founders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {founders.length === 0 ? (
          <div className="col-span-2 text-center py-12">
            <Users className="mx-auto mb-4 text-[var(--text-secondary)] opacity-50" size={48} />
            <p className="text-[var(--text-secondary)]">No founders found yet.</p>
            <p className="text-sm text-[var(--text-secondary)] mt-2">Check back later to connect with other founders!</p>
          </div>
        ) : (
          founders.map((founder, i) => (
            <motion.div
              key={founder._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[var(--bg-primary)]/50 backdrop-blur-xl border border-[var(--color-primary)]/10 rounded-2xl p-6 hover:border-[var(--color-primary)]/30 transition-all hover:shadow-lg"
            >
              {/* Founder Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)] font-bold text-xl overflow-hidden flex-shrink-0">
                  {founder.avatar ? (
                    <img src={founder.avatar} alt={founder.name} className="w-full h-full object-cover" />
                  ) : (
                    founder.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[var(--text-primary)] text-lg truncate">{founder.name}</h3>
                  <p className="text-sm text-[var(--text-secondary)] flex items-center gap-2 mt-1">
                    <Building2 size={14} />
                    <span className="truncate">Founder @ {founder.startup.name}</span>
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Joined {getTimeAgo(founder.joinedAt)}
                  </p>
                </div>
              </div>

              {/* Startup Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-bold uppercase tracking-wide">
                    {founder.startup.stage}
                  </span>
                  {founder.startup.category && (
                    <span className="px-3 py-1 rounded-full bg-white/5 text-[var(--text-secondary)] text-xs font-medium">
                      {founder.startup.category}
                    </span>
                  )}
                </div>

                {founder.startup.description && (
                  <p className="text-sm text-[var(--text-primary)] line-clamp-2 leading-relaxed">
                    {founder.startup.description}
                  </p>
                )}

                {founder.startup.fundingRaised && founder.startup.fundingRaised !== '₹0' && (
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp size={14} className="text-green-500" />
                    <span className="text-[var(--text-secondary)]">Raised: </span>
                    <span className="font-bold text-green-500">{founder.startup.fundingRaised}</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {getButtonContent(founder)}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default DashboardNetwork;
