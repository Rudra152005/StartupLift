import { useState, useEffect, lazy, Suspense } from 'react';
import axios from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// Components
// Lazy Load Components
const DashboardOverview = lazy(() => import('../components/dashboard/DashboardOverview'));
const DashboardProfile = lazy(() => import('../components/dashboard/DashboardProfile'));
const DashboardPrograms = lazy(() => import('../components/dashboard/DashboardPrograms'));
const DashboardMentors = lazy(() => import('../components/dashboard/DashboardMentors'));
const DashboardResources = lazy(() => import('../components/dashboard/DashboardResources'));
const DashboardTracker = lazy(() => import('../components/dashboard/DashboardTracker'));
const DashboardNetwork = lazy(() => import('../components/dashboard/DashboardNetwork'));
const DashboardChat = lazy(() => import('../components/dashboard/DashboardChat'));
const DashboardSettings = lazy(() => import('../components/dashboard/DashboardSettings'));

// Global Components (Shared with Mentor)
import MentorNavbar from '../components/mentor/MentorNavbar';
import MentorFooter from '../components/mentor/MentorFooter';
import Particles from '../components/Particles';
import Sidebar from '../components/dashboard/Sidebar';

const Dashboard = () => {
  const { user, logout, loading, checkAuthStatus } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Navbar States (Consistent with MentorDashboard)
  const [notifications, setNotifications] = useState([]);
  const [requestStats, setRequestStats] = useState({ mentorship: 0, funding: 0 });
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }

    if (user) {
      if (user.role === "Admin") {
        navigate('/admin-dashboard');
      } else if (user.role === "Mentor") {
        navigate('/mentor-dashboard');
      }
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) return;

        let combinedNotifications = [];

        // Fetch Dashboard Overview (with individual error handling)
        try {
          const overviewRes = await axios.get('/dashboard/overview', { timeout: 10000 });
          if (overviewRes.data.success && overviewRes.data.data.notifications) {
            combinedNotifications = [...overviewRes.data.data.notifications];
          }
        } catch (overviewError) {
          // Silently fail - overview is not critical for dashboard load
          if (overviewError.code !== 'ECONNABORTED') {
            console.warn("Dashboard overview unavailable:", overviewError.message);
          }
        }

        // Fetch Chat Contacts (with individual error handling)
        try {
          const chatRes = await axios.get('/chat/contacts', { timeout: 10000 });
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
          // Silently fail - chat notifications are not critical
          if (chatError.code !== 'ECONNABORTED') {
            console.warn("Chat contacts unavailable:", chatError.message);
          }
        }

        setNotifications(combinedNotifications);

      } catch (error) {
        // This should rarely happen now that we have individual error handling
        console.error("Unexpected error in notification fetch:", error);
      }
    };

    if (user && !loading) {
      fetchNotifications();
    }
  }, [user, loading]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  // Redirect if not a regular user
  if (user.role === "Admin" || user.role === "Mentor") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
          <p className="text-[var(--text-secondary)]">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <DashboardOverview user={user} setActiveTab={setActiveTab} />;
      case 'profile': return <DashboardProfile onSave={() => setActiveTab('overview')} />;
      case 'programs': return <DashboardPrograms />;
      case 'mentors': return <DashboardMentors />;
      case 'resources': return <DashboardResources />;
      case 'tracker': return <DashboardTracker />;
      case 'network': return <DashboardNetwork setActiveTab={setActiveTab} setSelectedChatUser={setSelectedChatUser} />;
      case 'messages': return <DashboardChat initialActiveUser={selectedChatUser} />;
      case 'settings': return <DashboardSettings user={user} />;
      default: return <DashboardOverview user={user} />;
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

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        logout={logout}
        user={user}
      />

      <div className="flex-grow flex flex-col min-h-screen relative z-10">
        <main className="flex-grow pt-24 md:pt-32 lg:pt-36 px-4 sm:px-6 md:px-10 max-w-[1600px] mx-auto w-full pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="relative z-10"
            >
              <Suspense fallback={<div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div></div>}>
                {renderContent()}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>

        {activeTab !== 'messages' && <MentorFooter setActiveTab={setActiveTab} userRole={user.role} />}
      </div>
    </div>
  );
};

export default Dashboard;
