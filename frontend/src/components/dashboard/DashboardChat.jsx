import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Phone, Video, MoreVertical, Search, MessageSquare, X, AlertCircle, User as UserIcon, Mail, Briefcase, MapPin, Globe, Linkedin, Slash, Check } from "lucide-react";
import axios from '../../api/axiosInstance';
import { useAuth } from "../../context/AuthContext";
import { toast } from 'react-toastify';


const DashboardChat = ({ initialActiveUser }) => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false); // Mobile state to toggle between list and chat
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false); // Profile Modal

  // Context Menu & Delete Modal State
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, contact: null });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [deleteHistoryChecked, setDeleteHistoryChecked] = useState(false);



  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchContacts(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (initialActiveUser) {
      setActiveChat(initialActiveUser);
      // If on mobile, show chat view
      if (window.innerWidth < 768) {
        setShowMobileChat(true);
      }
    }
  }, [initialActiveUser]);

  useEffect(() => {
    if (activeChat && activeChat._id) {
      fetchMessages(activeChat._id);
      // Optional: Polling for new messages
      const interval = setInterval(() => fetchMessages(activeChat._id), 3000);
      return () => clearInterval(interval);
    }
  }, [activeChat]);

  /* Fetch Contacts */
  const fetchContacts = async (query = '') => {
    try {
      const response = await axios.get(`/chat/contacts?search=${query}`);

      if (response.data.success && response.data.contacts) {
        // Add simulated status for demo purposes (matching MentorChat)
        const contactsWithStatus = response.data.contacts.map(contact => ({
          ...contact,
          status: Math.random() > 0.3 ? 'online' : 'offline', // 70% chance of being online
          lastSeen: new Date(Date.now() - Math.floor(Math.random() * 10000000)).toLocaleDateString()
        }));
        setContacts(contactsWithStatus);
      } else {
        setContacts([]);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast.error("Failed to load contacts");
      setContacts([]);
    }
  };

  const fetchMessages = async (userId) => {
    if (!userId) return;
    try {
      const response = await axios.get(`/chat/${userId}`);
      if (response.data.success) {
        setMessages(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      // Don't toast on 400 (invalid ID) to avoid spamming user
      if (error.response?.status !== 400) {
        toast.error("Failed to load messages");
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    try {
      const payload = {
        receiverId: activeChat._id,
        content: newMessage
      };

      const response = await axios.post("/chat", payload);
      if (response.data.success) {
        setMessages([...messages, response.data.data]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const handleBlockUser = async () => {
    if (!activeChat) return;
    if (window.confirm(`Are you sure you want to block ${activeChat.name}?`)) {
      try {
        await axios.post('/chat/block', { targetUserId: activeChat._id });
        toast.success("User blocked");
        // Update local state
        setActiveChat(prev => ({ ...prev, isBlocked: true }));
        setContacts(prev => prev.map(c => c._id === activeChat._id ? { ...c, isBlocked: true } : c));
      } catch (err) {
        toast.error("Failed to block user");
        console.error(err);
      }
    }
  };

  const handleUnblockUser = async () => {
    if (!activeChat) return;
    try {
      await axios.post('/chat/unblock', { targetUserId: activeChat._id });
      toast.success("User unblocked");
      // Update local state
      setActiveChat(prev => ({ ...prev, isBlocked: false }));
      setContacts(prev => prev.map(c => c._id === activeChat._id ? { ...c, isBlocked: false } : c));
    } catch (err) {
      toast.error("Failed to unblock user");
      console.error(err);
    }
  };

  /* Call Handler */
  const handleCall = (type) => {
    console.log("HandleCall Clicked", { type, user, activeChat });

    if (!user?._id) {
      console.error("User ID missing");
      toast.error("You must be logged in to call");
      return;
    }
    if (!activeChat?._id) {
      console.error("Active Chat ID missing");
      toast.error("Select a chat to call");
      return;
    }

    try {
      // Generate a unique room ID for this pair
      const participants = [user._id, activeChat._id].sort();
      const roomId = `StartupLift-Call-${participants[0]}-${participants[1]}`;
      const url = `https://meet.jit.si/${roomId}`;

      console.log("Opening Call URL:", url);

      window.open(url, '_blank', 'noreferrer');
    } catch (err) {
      console.error("Error opening call:", err);
      toast.error("Failed to start call");
    }
  };

  // Handle Right Click
  const handleContextMenu = (e, contact) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.pageX,
      y: e.pageY,
      contact: contact
    });
  };

  const handleConfirmDelete = async () => {
    if (!contactToDelete) return;

    try {
      if (deleteHistoryChecked) {
        // 1. Clear History
        await axios.post('/chat/clear', { targetUserId: contactToDelete._id });
        toast.success("Chat history cleared");
        if (activeChat?._id === contactToDelete._id) setMessages([]);
      }
      // 2. Hide from List (always happens on delete)
      await axios.post('/chat/delete', { targetUserId: contactToDelete._id });
      toast.success("Chat removed from list");

      setContacts(prev => prev.filter(c => c._id !== contactToDelete._id));
      if (activeChat?._id === contactToDelete._id) setActiveChat(null);
      setShowDeleteModal(false);
      setContactToDelete(null);
      setDeleteHistoryChecked(false);
    } catch (err) {
      toast.error("Failed to delete chat");
      console.error(err);
    }
  };




  return (
    <div className="h-[calc(100vh-160px)] flex flex-col md:flex-row gap-0 sm:gap-6 relative">
      {/* Sidebar List */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`w-full md:w-80 flex flex-col bg-[var(--bg-primary)]/50 backdrop-blur-xl border border-[var(--text-primary)]/10 rounded-2xl overflow-hidden ${showMobileChat ? 'hidden md:flex' : 'flex'}`}
      >
        <div className="p-4 border-b border-[var(--text-primary)]/10">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-[var(--text-secondary)]" size={18} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[var(--color-primary)]/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {contacts.map((contact) => (
            <div
              key={contact._id}
              onClick={() => {
                setActiveChat(contact);
                setShowMobileChat(true);
              }}
              onContextMenu={(e) => handleContextMenu(e, contact)}
              className={`p-4 flex items-center gap-3 hover:bg-[var(--color-primary)]/5 cursor-pointer border-b border-[var(--text-primary)]/5 transition-colors ${activeChat?._id === contact._id ? 'bg-[var(--color-primary)]/5' : ''}`}
            >
              <div className="relative w-10 h-10 shrink-0">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] font-bold overflow-hidden">
                  {contact.avatar ? <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" /> : contact.name.charAt(0)}
                </div>
                {contact.status === 'online' && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[var(--bg-primary)] rounded-full"></span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h4 className="font-semibold text-[var(--text-primary)] text-sm truncate">{contact.name}</h4>
                </div>
                <p className="text-xs text-[var(--color-primary)] truncate font-medium mb-0.5">
                  {contact.role === 'Mentor' ? 'Mentor' : (contact.company ? `Founder @ ${contact.company}` : 'Founder')}
                </p>
                <p className="text-xs text-[var(--text-secondary)] truncate flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${contact.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                  {contact.status === 'online' ? 'Online' : `Last seen ${contact.lastSeen || 'recently'}`}
                </p>
              </div>
            </div>
          ))}
          {contacts.length === 0 && (
            <div className="p-8 text-center text-[var(--text-secondary)]">
              <MessageSquare className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No conversations yet.</p>
              <p className="text-xs mt-2">Connect with a mentor to start chatting!</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Chat Window */}
      {activeChat ? (
        <motion.div
          key={activeChat._id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`flex-1 flex flex-col bg-[var(--bg-primary)]/50 backdrop-blur-xl border border-[var(--text-primary)]/10 rounded-2xl overflow-hidden ${showMobileChat ? 'flex' : 'hidden md:flex'}`}
        >
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-[var(--text-primary)]/10 flex justify-between items-center bg-[var(--bg-primary)]/80">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setShowMobileChat(false)}
                className="md:hidden p-2 -ml-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X size={20} />
              </button>
              <div
                className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] font-bold overflow-hidden shrink-0 cursor-pointer"
                onClick={() => setShowProfileModal(true)}
              >
                {activeChat.avatar ? <img src={activeChat.avatar} alt={activeChat.name} className="w-full h-full object-cover" /> : activeChat.name.charAt(0)}
              </div>
              <div className="min-w-0 cursor-pointer" onClick={() => setShowProfileModal(true)}>
                <h3 className="font-bold text-[var(--text-primary)] truncate">{activeChat.name}</h3>
                <p className={`text-[10px] sm:text-xs flex items-center gap-1 ${activeChat.status === 'online' ? 'text-green-500' : 'text-[var(--text-secondary)]'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${activeChat.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                  {activeChat.status === 'online' ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <button onClick={() => handleCall('audio')} className="p-2 text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors"><Phone size={20} /></button>
              <button onClick={() => handleCall('video')} className="p-2 text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors"><Video size={20} /></button>

              <div className="relative group">
                <button className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"><MoreVertical size={20} /></button>
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                  <button
                    onClick={() => {
                      if (!activeChat) return;
                      setContactToDelete(activeChat);
                      setDeleteHistoryChecked(false);
                      setShowDeleteModal(true);
                      // Close dropdown implicitly by losing focus or we can add state if needed, but standard dropdown closes on click usually.
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-red-500/10 text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
                  >
                    Delete Chat
                  </button>
                  <button
                    onClick={async () => {
                      if (!activeChat) return;
                      // Confirms permanent deletion (Delete History)
                      if (window.confirm("Are you sure you want to permanently delete the history of this chat? The conversation will remain in your list.")) {
                        try {
                          await axios.post('/chat/clear', { targetUserId: activeChat._id });
                          toast.success("Chat history cleared");
                          setMessages([]); // Clear local state
                        } catch (err) {
                          toast.error("Failed to delete history");
                          console.error(err);
                        }
                      }
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm font-medium transition-colors"
                  >
                    Clear History
                  </button>
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="w-full text-left px-4 py-3 hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-sm font-medium transition-colors">
                    View Profile
                  </button>
                  {activeChat.isBlocked ? (
                    <button
                      onClick={handleUnblockUser}
                      className="w-full text-left px-4 py-3 hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-sm font-medium transition-colors">
                      Unblock User
                    </button>
                  ) : (
                    <button
                      onClick={handleBlockUser}
                      className="w-full text-left px-4 py-3 hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-sm font-medium transition-colors">
                      Block User
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[var(--bg-primary)]/30">
            {messages.map((msg, i) => {
              // Check if message sender is current user
              const senderId = msg.sender?._id || msg.sender;
              const isMe = senderId === user._id;
              return (
                <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 sm:p-3.5 rounded-2xl max-w-[85%] sm:max-w-[70%] ${isMe ? 'bg-[var(--color-primary)] text-white rounded-tr-sm' : 'bg-[var(--text-primary)]/10 text-[var(--text-primary)] rounded-tl-sm shadow-sm'}`}>
                    <p className="text-sm">{msg.content}</p>
                    <span className={`text-[10px] block mt-1 text-right ${isMe ? ' text-white/70' : 'text-[var(--text-secondary)]'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-[var(--text-primary)]/10 bg-[var(--bg-primary)]/80">
            {activeChat.mentorshipStatus === 'ended' ? (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
                <h3 className="text-xl font-bold text-red-500 mb-2">Mentorship Ended</h3>
                <p className="text-[var(--text-secondary)] mb-6">
                  The mentorship with this mentor has ended. You can no longer send messages.
                  <br />
                  Would you like to continue the conversation?
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={async () => {
                      if (!activeChat.requestId) return;
                      try {
                        const res = await axios.post('/chat/restart-mentorship', { requestId: activeChat.requestId });
                        if (res.data.success) {
                          toast.success("Conversation restarted!");
                          fetchContacts(searchQuery); // Refresh to update status
                          setActiveChat(prev => ({ ...prev, mentorshipStatus: 'completed' }));
                        }
                      } catch (err) {
                        toast.error("Failed to restart conversation.");
                        console.error(err);
                      }
                    }}
                    className="px-6 py-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-bold rounded-xl hover:shadow-lg transition-all"
                  >
                    Yes
                  </button>
                  <span className="px-6 py-2 border border-[var(--text-primary)]/10 rounded-xl text-[var(--text-secondary)] font-medium cursor-not-allowed opacity-50">
                    No
                  </span>
                </div>
              </div>
            ) : activeChat.isBlocked ? (
              <div
                onClick={handleUnblockUser}
                className="bg-[var(--bg-secondary)] border border-[var(--text-primary)]/10 rounded-xl p-4 text-center cursor-pointer hover:bg-[var(--text-primary)]/5 transition-colors"
              >
                <p className="text-[var(--text-secondary)] text-sm">
                  You blocked this contact. <span className="text-[var(--color-primary)] font-medium">Tap to unblock.</span>
                </p>
              </div>
            ) : activeChat.hasBlockedMe ? (
              <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 text-center">
                <p className="text-red-500/70 text-sm flex items-center justify-center gap-2">
                  <AlertCircle size={16} />
                  You have been blocked by this user.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-primary)]/50"
                  />
                  <button type="submit" className="bg-[var(--color-primary)] text-white p-3 rounded-xl hover:bg-[var(--color-primary)]/90 transition-colors">
                    <Send size={20} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-[var(--bg-primary)]/50 border border-[var(--text-primary)]/10 rounded-2xl text-[var(--text-secondary)]">
          <div className="text-center">
            <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">Select a contact to start messaging</p>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && activeChat && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="relative h-32 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">
              <button
                onClick={() => setShowProfileModal(false)}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 pb-6 -mt-12">
              <div className="relative w-24 h-24 rounded-full bg-[var(--bg-primary)] p-1 mx-auto mb-4">
                <div className="w-full h-full rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center overflow-hidden">
                  {activeChat.avatar ?
                    <img src={activeChat.avatar} alt={activeChat.name} className="w-full h-full object-cover" /> :
                    <span className="text-2xl font-bold text-[var(--color-primary)]">{activeChat.name?.charAt(0)}</span>
                  }
                </div>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">{activeChat.name}</h2>
                <p className="text-[var(--text-secondary)]">{activeChat.jobTitle || activeChat.role}</p>
                {activeChat.company && <p className="text-[var(--color-primary)] font-medium text-sm">{activeChat.company}</p>}
              </div>

              <div className="space-y-4">
                {activeChat.email && (
                  <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                    <Mail size={18} />
                    <span className="text-sm truncate">{activeChat.email}</span>
                  </div>
                )}
                {activeChat.location && (
                  <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                    <MapPin size={18} />
                    <span className="text-sm truncate">{activeChat.location}</span>
                  </div>
                )}
                {activeChat.role === 'Mentor' && (
                  <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                    <Briefcase size={18} />
                    <span className="text-sm truncate">{activeChat.expertise?.join(', ') || 'Mentor'}</span>
                  </div>
                )}

                <div className="pt-4 border-t border-[var(--text-primary)]/10 flex justify-center gap-4">
                  {activeChat.linkedin && (
                    <a href={activeChat.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 text-[var(--text-secondary)] hover:text-[#0077b5] transition-colors">
                      <Linkedin size={24} />
                    </a>
                  )}
                  {activeChat.portfolio && (
                    <a href={activeChat.portfolio} target="_blank" rel="noopener noreferrer" className="p-2 text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors">
                      <Globe size={24} />
                    </a>
                  )}
                </div>
              </div>



              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--text-primary)]/10 text-[var(--text-primary)] font-medium hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  Close
                </button>
                {activeChat.isBlocked ? (
                  <button
                    onClick={() => { handleUnblockUser(); setShowProfileModal(false); }}
                    className="flex-1 py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary)]/90 transition-colors"
                  >
                    Unblock
                  </button>
                ) : (
                  <button
                    onClick={() => { handleBlockUser(); setShowProfileModal(false); }}
                    className="flex-1 py-2.5 rounded-xl border border-red-500/20 text-red-500 font-medium hover:bg-red-500/5 transition-colors"
                  >
                    Block
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}


      {/* Custom Context Menu */}
      {contextMenu.visible && (
        <div
          className="fixed bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-xl shadow-xl z-[100] py-2 w-48 overflow-hidden"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={() => {
              setContactToDelete(contextMenu.contact);
              setShowDeleteModal(true);
              setDeleteHistoryChecked(false);
              setContextMenu({ ...contextMenu, visible: false });
            }}
            className="w-full text-left px-4 py-2 hover:bg-red-500/10 text-[var(--text-primary)] hover:text-red-500 text-sm font-medium transition-colors flex items-center gap-2"
          >
            <X size={16} /> Delete Chat
          </button>

          <button
            onClick={async () => {
              // Direct clear history action
              if (window.confirm("Permanently clear history with " + contextMenu.contact.name + "?")) {
                setContactToDelete(contextMenu.contact);
                try {
                  await axios.post('/chat/clear', { targetUserId: contextMenu.contact._id });
                  toast.success("Chat history cleared");
                  if (activeChat?._id === contextMenu.contact._id) setMessages([]); // Clear if open
                } catch (err) {
                  toast.error("Failed to clear chat");
                  console.error(err);
                } finally {
                  setContactToDelete(null);
                  setContextMenu({ ...contextMenu, visible: false });
                }
              }
            }}
            className="w-full text-left px-4 py-2 hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Slash size={16} /> Clear History
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative"
          >
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Delete Chat?</h3>
            <p className="text-[var(--text-secondary)] mb-6 text-sm">
              This will remove <span className="font-bold text-[var(--text-primary)]">{contactToDelete?.name}</span> from your chat list.
            </p>

            <div className="flex items-center gap-3 mb-6 p-3 bg-[var(--bg-secondary)]/50 rounded-xl border border-[var(--text-primary)]/5 cursor-pointer" onClick={() => setDeleteHistoryChecked(!deleteHistoryChecked)}>
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${deleteHistoryChecked ? 'bg-red-500 border-red-500' : 'border-[var(--text-secondary)]'}`}>
                {deleteHistoryChecked && <Check size={12} className="text-white" />}
              </div>
              <span className="text-sm text-[var(--text-primary)] select-none">Also delete chat history permanently</span>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleConfirmDelete}
                className="w-full py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg hover:shadow-red-500/20"
              >
                {deleteHistoryChecked ? "Delete Permanently" : "Delete Chat"}
              </button>

              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-full py-3 bg-transparent text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)] transition-colors"
              >
                Cancel
              </button>
            </div>

            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <X size={20} />
            </button>
          </motion.div>
        </div>
      )}

    </div>
  );
};


export default DashboardChat;
