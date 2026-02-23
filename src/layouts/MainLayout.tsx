import React from 'react';
import { Header } from '../components/Header';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProductivity } from '../contexts/ProductivityContext';
import { Trophy, BellRing, X } from 'lucide-react';
import { useAudio } from '../hooks/useAudio';

export const MainLayout: React.FC = () => {
    // We only need notification from context here for the toast
    // And initAudio for the global click handler
    const { notification, setNotification } = useProductivity();
    const { initAudio } = useAudio();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans transition-all duration-700" onClick={initAudio}>
            <div className="max-w-7xl mx-auto space-y-6">
                <Header />
                <Outlet />
            </div>

            {notification?.visible && (
                <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-6 animate-in fade-in zoom-in slide-in-from-top-10 duration-500">
                    <div className={`px-8 py-6 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] text-white font-black flex items-center gap-6 border-2 border-white/20 backdrop-blur-md ${notification.type === 'error' ? 'bg-red-600' :
                        notification.type === 'alert' ? 'bg-orange-600' :
                            notification.type === 'celebration' ? 'bg-gradient-to-r from-yellow-400 to-orange-600 scale-110 shadow-orange-500/50' :
                                notification.type === 'info' ? 'bg-slate-900' : 'bg-slate-900'
                        }`}>
                        <div className="bg-white/10 p-3 rounded-2xl animate-pulse">
                            {notification.type === 'celebration' ? <Trophy size={24} /> : <BellRing size={24} className="text-white" />}
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] opacity-60 uppercase tracking-widest mb-1 font-black">
                                {notification.type === 'celebration' ? 'Conquista Suvinil' : 'Sistema Cloud'}
                            </p>
                            <span className="text-sm block tracking-tight leading-tight uppercase italic font-black">{notification.message}</span>
                        </div>
                        <button onClick={() => setNotification(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
                    </div>
                </div>
            )}

            <style>{`
        @keyframes shrinkWidth { from { width: 100%; } to { width: 0%; } }
        .animate-in { animation-duration: 0.7s; animation-fill-mode: both; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoom-in { from { transform: scale(0.9); } to { transform: scale(1); } }
        @keyframes slide-in-from-top-10 { from { transform: translateY(-2.5rem); } to { transform: translateY(0); } }
        .fade-in { animation-name: fade-in; }
        .zoom-in { animation-name: zoom-in; }
        .slide-in-from-top-10 { animation-name: slide-in-from-top-10; }
      `}</style>
        </div>
    );
};
