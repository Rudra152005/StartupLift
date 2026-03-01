import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Video, Clock, User } from 'lucide-react';

const CalendarModal = ({ isOpen, onClose, sessions, onSessionClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Reset selected date when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedDate(new Date());
            setCurrentDate(new Date());
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const checkSameDay = (d1, d2) => {
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };

    const hasSession = (day) => {
        return sessions?.some(s => {
            const sDate = new Date(s.date);
            return sDate.getDate() === day &&
                sDate.getMonth() === currentDate.getMonth() &&
                sDate.getFullYear() === currentDate.getFullYear();
        });
    };

    const getSelectedDaySessions = () => {
        return sessions?.filter(s => {
            const sDate = new Date(s.date);
            return checkSameDay(sDate, selectedDate);
        }) || [];
    };

    const selectedSessions = getSelectedDaySessions();

    return createPortal(
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="flex min-h-full items-start justify-center pt-28 pb-8 px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative mt-4"
                >
                    <div className="flex justify-between items-center mb-6 shrink-0">
                        <h2 className="text-xl font-bold text-[var(--text-primary)] flex flex-col">
                            <span>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                            <span className="text-xs font-normal text-[var(--text-secondary)]">Select a date to view sessions</span>
                        </h2>
                        <div className="flex items-center gap-3">
                            <div className="flex bg-[var(--text-primary)]/5 rounded-full p-1">
                                <button onClick={handlePrevMonth} className="p-1 hover:bg-[var(--text-primary)]/10 rounded-full text-[var(--text-primary)]">
                                    <ChevronLeft size={20} />
                                </button>
                                <button onClick={handleNextMonth} className="p-1 hover:bg-[var(--text-primary)]/10 rounded-full text-[var(--text-primary)]">
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                            <button onClick={onClose} className="p-2 bg-[var(--text-primary)]/5 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/10 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2 mb-2 text-center text-sm font-bold text-[var(--text-secondary)] shrink-0">
                        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                    </div>

                    <div className="grid grid-cols-7 gap-2 shrink-0">
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                            <div key={`empty-${i}`} />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                            const isSession = hasSession(day);
                            const isSelected = checkSameDay(dateObj, selectedDate);
                            const isToday = checkSameDay(dateObj, new Date());

                            return (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDate(dateObj)}
                                    className={`
                                  aspect-square flex flex-col items-center justify-center rounded-xl text-sm relative transition-all
                                  ${isSelected
                                            ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-emerald-500/30 scale-105'
                                            : isSession
                                                ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold border border-[var(--color-primary)]/20 shadow-sm hover:bg-[var(--color-primary)]/20'
                                                : 'hover:bg-[var(--text-primary)]/5 text-[var(--text-primary)]'
                                        }
                                  ${isToday && !isSelected ? 'border border-[var(--text-primary)]/30' : ''}
                                `}
                                >
                                    {day}
                                    {isSession && !isSelected && (
                                        <span className="absolute bottom-1.5 w-1 h-1 bg-[var(--color-primary)] rounded-full"></span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-6 pt-6 border-t border-[var(--text-primary)]/10">
                        <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                            <span className="text-xs font-normal text-[var(--text-secondary)] bg-[var(--text-primary)]/5 px-2 py-0.5 rounded-full">
                                {selectedSessions.length} Session{selectedSessions.length !== 1 ? 's' : ''}
                            </span>
                        </h3>

                        <div className="space-y-3">
                            {selectedSessions.length > 0 ? selectedSessions.map(s => (
                                <div
                                    key={s.id}
                                    onClick={() => onSessionClick && onSessionClick(s)}
                                    className="p-4 rounded-xl bg-[var(--text-primary)]/5 border border-[var(--text-primary)]/10 hover:border-[var(--color-primary)]/30 transition-colors group cursor-pointer hover:bg-[var(--text-primary)]/10"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-[var(--text-primary)] text-base">{s.title}</h4>
                                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${s.status === 'scheduled' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-green-500/10 text-green-500'}`}>
                                            {s.status}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)] mb-3">
                                        <div className="flex items-center gap-1">
                                            <Clock size={14} />
                                            {new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <User size={14} />
                                            {s.mentorName || "Mentor"}
                                        </div>
                                    </div>

                                    {s.meetingLink && s.status === 'scheduled' && (
                                        <button
                                            onClick={() => window.open(s.meetingLink, '_blank')}
                                            className="w-full py-2 bg-[var(--color-primary)] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-[var(--color-secondary)] transition-all shadow-lg shadow-emerald-500/20"
                                        >
                                            <Video size={14} /> Join Meeting
                                        </button>
                                    )}
                                </div>
                            )) : (
                                <div className="text-center py-8 text-[var(--text-secondary)] bg-[var(--text-primary)]/5 rounded-xl border border-dashed border-[var(--text-primary)]/10">
                                    <p>No sessions scheduled for this date.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </motion.div>
            </div>
        </div>,
        document.body
    );
};

export default CalendarModal;
