import { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../api/axiosInstance';

// Components
import MentorSidebar from '../components/mentor/MentorSidebar';
import MentorNavbar from '../components/mentor/MentorNavbar';
const MentorOverview = lazy(() => import('../components/mentor/MentorOverview'));
const MentorFundingRequests = lazy(() => import('../components/mentor/MentorFundingRequests'));
const MentorStartups = lazy(() => import('../components/mentor/MentorStartups'));
const MentorRequests = lazy(() => import('../components/mentor/MentorRequests'));
const MentorMentees = lazy(() => import('../components/mentor/MentorMentees'));
const MentorSessions = lazy(() => import('../components/mentor/MentorSessions'));
const MentorTasks = lazy(() => import('../components/mentor/MentorTasks'));
const MentorChat = lazy(() => import('../components/mentor/MentorChat'));
const MentorResources = lazy(() => import('../components/mentor/MentorResources'));
const MentorProfile = lazy(() => import('../components/mentor/MentorProfile'));
const MentorSettings = lazy(() => import('../components/mentor/MentorSettings'));
import MentorFooter from '../components/mentor/MentorFooter';
import Particles from '../components/Particles';

const MentorDashboard = () => {
  const { user, logout, loading, checkAuthStatus } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [requestStats, setRequestStats] = useState({ mentorship: 0, funding: 0 });
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    // Fetch notifications (Pending Requests + Unread Messages)
    const fetchNotifications = async () => {
      if (!user || user.role !== 'Mentor') return;

      try {
        let combinedNotifications = [];

        // Fetch requests with error handling
        try {
          const reqRes = await axios.get('/mentors/my-requests?status=pending');
          if (reqRes.data.success) {
            const reqs = reqRes.data.data || [];
            const mentorshipCount = reqs.filter(r => r.requestType === 'Mentorship').length;
            const fundingCount = reqs.filter(r => r.requestType === 'Funding').length;

            setRequestStats({ mentorship: mentorshipCount, funding: fundingCount });

            const reqNotifs = reqs.map(req => ({
              type: req.requestType === 'Funding' ? 'funding' : 'request',
              message: `New ${req.requestType} request from ${req.founderId?.name || 'a founder'}`,
              time: new Date(req.createdAt).toLocaleDateString(),
              id: req._id
            }));
            combinedNotifications = [...combinedNotifications, ...reqNotifs];
          }
        } catch (reqError) {
          console.warn("Error fetching mentor requests:", reqError.message);
          // Continue with other notifications
        }

        // Fetch chat contacts with error handling
        try {
          const chatRes = await axios.get('/chat/contacts');
          if (chatRes.data.success && chatRes.data.contacts) {
            const unreadChats = chatRes.data.contacts.filter(c => c.unreadCount > 0);
            const chatNotifs = unreadChats.map(c => ({
              id: `msg-${c._id}`,
              type: 'message',
              message: `New message from ${c.name}`,
              time: c.lastMessage?.timestamp ? new Date(c.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
              unread: true
            }));
            combinedNotifications = [...combinedNotifications, ...chatNotifs];
          }
        } catch (chatError) {
          console.warn("Error fetching chat contacts:", chatError.message);
          // Continue without chat notifications
        }

        setNotifications(combinedNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        // Set empty notifications on complete failure
        setNotifications([]);
      }
    };

    fetchNotifications();
  }, [user]);

  useEffect(() => {
    if (!loading && !user) navigate('/login');
    if (user && user.role !== "Mentor") navigate('/dashboard');
    checkAuthStatus();
  }, [user, loading, navigate, checkAuthStatus]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <MentorOverview user={user} setActiveTab={setActiveTab} />;
      case 'requests': return <MentorRequests />;
      case 'fundingRequests': return <MentorFundingRequests />;
      case 'startups': return <MentorStartups />;
      case 'mentees': return <MentorMentees viewMode="accepted" setActiveTab={setActiveTab} />;
      case 'sessions': return <MentorSessions initialViewMode="grid" />;
      case 'sessions-calendar': return <MentorSessions initialViewMode="calendar" />;
      case 'tasks': return <MentorTasks />;
      case 'messages': return <MentorChat />;
      case 'resources': return <MentorResources />;
      case 'profile': return <MentorProfile user={user} />;
      case 'settings': return <MentorSettings user={user} />;
      default: return <MentorOverview user={user} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="relative min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-inter flex flex-col transition-colors duration-300 overflow-hidden">

      {/* 1. Cinematic Night Forest Background Layers */}

      {/* Background Ambience (Consistent with Landing Page) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-25%] left-[-15%] w-[400px] md:w-[700px] h-[400px] md:h-[700px] bg-[var(--color-primary)]/5 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-25%] right-[-15%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] bg-[var(--color-primary)]/8 blur-[120px] rounded-full" />
      </div>

      <MentorNavbar
        user={user}
        logout={logout}
        toggleDrawer={() => setIsSidebarOpen(!isSidebarOpen)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifications={notifications}
        requestStats={requestStats}
        isNotificationsOpen={isNotificationsOpen}
        setIsNotificationsOpen={setIsNotificationsOpen}
      />

      <MentorSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        logout={logout}
        user={user}
      />

      <div className="flex-grow flex flex-col min-h-screen relative z-10">
        <main className="flex-grow pt-28 md:pt-36">
          <div className="max-w-7xl mx-auto px-4 md:px-8 pb-20">
            <AnimatePresence mode="wait">
              <Suspense fallback={
                <div className="flex items-center justify-center p-20">
                  <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                </div>
              }>
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderContent()}
                </motion.div>
              </Suspense>
            </AnimatePresence>
          </div>
        </main>

        {activeTab !== 'messages' && <MentorFooter setActiveTab={setActiveTab} />}
      </div>
    </div>
  );
};

export default MentorDashboard;
