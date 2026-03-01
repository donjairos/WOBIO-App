import React, { useState, useEffect, useRef } from 'react';
import { MapVisualization } from '../components/MapVisualization';
import { Button } from '../components/Button';
import { 
  Shield, Bell, Navigation, CheckCircle, ShieldAlert, X, Menu,
  User, FileText, Settings, LogOut, DollarSign, Calendar, Image as ImageIcon, 
  Briefcase, ChevronRight, Star, Phone, MessageCircle, Clock, MapPin, 
  Repeat, PlayCircle, Users, Car, Video, PhoneCall, ArrowLeft, 
  VideoOff, FileCheck, Banknote, ShieldCheck, HeartPulse,
  Package, UserPlus, Trash2, Wallet, TrendingUp, Info, Lock, 
  LayoutGrid, Camera, Zap, CheckCircle2, History, HelpCircle,
  AlertCircle, Grid3X3, Sliders, Timer, RefreshCw, ChevronDown, Filter,
  Timer as TimerIcon, Map as MapIcon, Hourglass, Radio, Circle, CreditCard, Luggage,
  Activity, Eye, BarChart3
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { UserProfile } from '../types';
import { MOCK_HISTORY, MOCK_CHART_DATA } from '../constants';
import { ChatInterface } from '../components/ChatInterface';
import { CallInterface } from '../components/CallInterface';
import { TripInvoice } from '../App';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from 'recharts';

interface DriverAppProps {
    userProfile: UserProfile;
    onNavigateToVerification: () => void;
    onProfileClick: () => void;
    onLogout: () => void;
    onSwitchToRider: () => void;
    isTripRecording?: boolean;
    setIsTripRecording?: (val: boolean) => void;
    isTripFinished?: boolean;
    setIsTripFinished?: (val: boolean) => void;
    invoice?: TripInvoice | null;
    setInvoice?: (inv: TripInvoice | null) => void;
    isInsuranceSelected?: boolean;
}

type DriverView = 'MAP' | 'CONTROL_HUB' | 'MY_SERVICES' | 'DOCUMENTS' | 'VEHICLE' | 'EARNINGS' | 'BOOKINGS' | 'AVAILABILITY' | 'GALLERY' | 'NOTIFICATIONS' | 'SUPPORT' | 'SETTINGS' | 'OWNER_DASHBOARD';
type TripStatus = 'PICKUP' | 'IN_PROGRESS';
type EarningsPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';

const playRequestSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    const playNote = (freq: number, startTime: number, duration: number, vol: number = 0.25) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(vol, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
    };
    const now = ctx.currentTime;
    playNote(880, now, 0.2);
    playNote(880, now + 0.15, 0.3);
    playNote(1174.66, now + 0.3, 0.5);
  } catch (e) {}
};

export const DriverApp: React.FC<DriverAppProps> = ({ 
  userProfile, 
  onNavigateToVerification,
  onProfileClick,
  onLogout,
  onSwitchToRider,
  isTripRecording = false,
  setIsTripRecording,
  isTripFinished = false,
  setIsTripFinished,
  invoice,
  setInvoice,
  isInsuranceSelected = false
}) => {
  const [currentView, setCurrentView] = useState<DriverView>('MAP');
  const [isOnline, setIsOnline] = useState(false);
  const [activeTrip, setActiveTrip] = useState(false);
  const [tripStatus, setTripStatus] = useState<TripStatus>('PICKUP'); 
  const [incomingRequest, setIncomingRequest] = useState<any>(null);
  const [activeRider, setActiveRider] = useState<any>(null);
  const [showComplianceLock, setShowComplianceLock] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [callMode, setCallMode] = useState<'VOICE' | 'VIDEO' | null>(null);

  const [earningsPeriod, setEarningsPeriod] = useState<EarningsPeriod>('WEEKLY');
  const [showCustomRangePicker, setShowCustomRangePicker] = useState(false);

  const [timeLeft, setTimeLeft] = useState(15);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [recDuration, setRecDuration] = useState(0);
  const recTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [services, setServices] = useState([
    { id: 'standard', name: 'Wobio Standard', enabled: true, icon: Car, desc: 'Everyday rides' },
    { id: 'xl', name: 'Wobio XL', enabled: false, icon: Users, desc: '6-Seater groups' },
    { id: 'exec', name: 'Wobio Executive', enabled: false, icon: Zap, desc: 'Premium luxury' },
  ]);

  const [workingHours, setWorkingHours] = useState({ start: '08:00', end: '18:00', enabled: false });

  const isVerified = userProfile.driverVerificationStatus === 'APPROVED';

  useEffect(() => {
    let timer: any;
    if (isOnline && !activeTrip && !incomingRequest && currentView === 'MAP') {
      timer = setTimeout(() => {
        const hasLuggageMock = Math.random() > 0.5;
        setIncomingRequest({
          id: 'REQ_' + Math.floor(Math.random() * 1000),
          pickup: 'Avondale Shopping Centre, Harare',
          dropoff: 'Robert Mugabe Int Airport',
          fare: 22.50, 
          distance: '3.1 km',
          tripTime: '18 mins',
          riderName: 'Tendai C.',
          riderImage: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=faces',
          luggage: hasLuggageMock ? '2 large suitcases, 1 box' : null
        });
        setTimeLeft(15);
        playRequestSound();
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [isOnline, activeTrip, incomingRequest, currentView]);

  useEffect(() => {
    if (incomingRequest && !activeTrip) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleDecline();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [incomingRequest, activeTrip]);

  useEffect(() => {
    if (isTripRecording) {
      recTimerRef.current = setInterval(() => {
        setRecDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (recTimerRef.current) clearInterval(recTimerRef.current);
      setRecDuration(0);
    }
    return () => {
      if (recTimerRef.current) clearInterval(recTimerRef.current);
    };
  }, [isTripRecording]);

  const handleAccept = () => {
    setActiveRider(incomingRequest);
    setActiveTrip(true);
    setIncomingRequest(null);
    setTripStatus('PICKUP');
  };

  const handleDecline = () => {
    setIncomingRequest(null);
    setTimeLeft(15);
  };

  const handleCompleteTrip = () => {
    const insuranceFee = isInsuranceSelected ? 0.20 : 0;
    const baseFare = 22.50;
    const discount = 2.00;
    const tax = 1.50;
    const total = baseFare - discount + tax + insuranceFee;

    const mockInvoice: TripInvoice = {
      tripId: `TR-${Math.floor(Math.random() * 100000)}`,
      distance: '12.4 km',
      duration: '18 mins',
      baseFare,
      discount,
      tax,
      insuranceFee,
      total,
      paymentMethod: userProfile.preferredPaymentType === 'CARD' ? 'Visa • 4242' : 'Cash'
    };
    
    if (setInvoice) setInvoice(mockInvoice);
    if (setIsTripFinished) setIsTripFinished(true);
    
    setActiveTrip(false);
    setActiveRider(null);
    setIsOnline(true);
    if (setIsTripRecording) setIsTripRecording(false);
  };

  const toggleOnline = () => {
    if (!isVerified) {
        setShowComplianceLock(true);
        return;
    }
    setIsOnline(!isOnline);
  };

  const toggleRecording = () => {
    setIsTripRecording?.(!isTripRecording);
  };

  const formatRecTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleBackToMenu = () => setCurrentView('CONTROL_HUB');

  const renderSectionHeader = (title: string) => (
    <div className="bg-wobio-600 px-4 py-5 flex items-center shadow-md z-[60] sticky top-0 border-b border-white/10 text-white transition-colors">
        <button onClick={handleBackToMenu} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-all active:scale-90">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="ml-2 text-lg font-black uppercase tracking-tight">{title}</h1>
    </div>
  );

  const renderControlHub = () => (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 animate-in slide-in-from-left duration-300 overflow-y-auto no-scrollbar">
        <div className="bg-wobio-600 pt-14 pb-12 px-6 relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex items-center gap-5 relative z-10">
                <div className="w-20 h-20 rounded-[28px] bg-white/20 p-1 backdrop-blur-md">
                    <div className="w-full h-full rounded-[22px] bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-white/50 shadow-inner">
                        {userProfile.profileImage ? <img src={userProfile.profileImage} alt="Driver" className="w-full h-full object-cover" /> : <User className="text-wobio-600 w-10 h-10" />}
                    </div>
                </div>
                <div className="flex-1">
                    <h2 className="font-black text-2xl text-white tracking-tight leading-tight">
                        {userProfile.firstName || 'Partner'}<br/>{userProfile.lastName}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isVerified ? 'bg-green-400 text-green-900 shadow-sm' : 'bg-yellow-400 text-yellow-900 animate-pulse'}`}>
                            {isVerified ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            {userProfile.driverVerificationStatus === 'PENDING' ? 'KYC In Review' : isVerified ? 'KYC Approved' : 'KYC Required'}
                        </div>
                    </div>
                </div>
                <button onClick={() => setCurrentView('MAP')} className="bg-white/20 p-3 rounded-2xl text-white hover:bg-white/30 transition-all active:scale-90">
                    <X className="w-6 h-6" />
                </button>
            </div>
        </div>

        <div className="flex-1 px-5 -mt-6 pb-28 space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setCurrentView('EARNINGS')} className="p-5 rounded-[32px] bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-2 active:scale-95 transition-all">
                    <div className="text-2xl font-black text-wobio-600 tracking-tighter">${userProfile.walletBalance.toFixed(0)}</div>
                    <span className="font-black text-[9px] text-slate-400 uppercase tracking-widest">Net Earnings</span>
                </button>
                <button onClick={() => toggleOnline()} className={`p-5 rounded-[32px] shadow-lg flex flex-col items-center justify-center gap-2 transition-all active:scale-95 ${isOnline ? 'bg-green-600 text-white' : 'bg-slate-800 text-white'}`}>
                    <Zap className={`w-5 h-5 ${isOnline ? 'animate-pulse' : ''}`} />
                    <span className="font-black text-[9px] uppercase tracking-widest">{isOnline ? 'Go Offline' : 'Go Online'}</span>
                </button>
            </div>

            {userProfile.isVehicleOwner && (
                <div className="bg-gradient-to-br from-wobio-600 to-wobio-800 p-6 rounded-[32px] text-white shadow-xl shadow-wobio-500/20">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-wobio-100">Fleet Operations</h3>
                            <p className="text-lg font-black uppercase tracking-tight mt-1">Vehicle Asset Hub</p>
                        </div>
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-5">
                        <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                            <p className="text-[9px] font-bold text-wobio-100 uppercase tracking-widest">Today's Fleet Revenue</p>
                            <p className="text-xl font-black mt-0.5">$185.00</p>
                        </div>
                        <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                            <p className="text-[9px] font-bold text-wobio-100 uppercase tracking-widest">Active Drivers</p>
                            <p className="text-xl font-black mt-0.5">3 Online</p>
                        </div>
                    </div>
                    <Button fullWidth variant="secondary" size="sm" onClick={() => setCurrentView('OWNER_DASHBOARD')} className="bg-white text-wobio-600 py-3 font-black uppercase tracking-widest text-[10px]">
                        Open Owner Dashboard
                    </Button>
                </div>
            )}

            <div className="space-y-1">
                <h3 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Operations</h3>
                <div className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
                    <MenuItem id="MY_SERVICES" label="My Services" icon={Grid3X3} sub="Categories & Toggles" onClick={() => setCurrentView('MY_SERVICES')} />
                    <MenuItem id="AVAILABILITY" label="Availability" icon={Timer} sub="Working Hours Setup" onClick={() => setCurrentView('AVAILABILITY')} />
                    <MenuItem id="BOOKINGS" label="Ride Bookings" icon={History} sub="Upcoming & Past Trips" onClick={() => setCurrentView('BOOKINGS')} />
                </div>
            </div>

            <div className="space-y-1">
                <h3 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Identity & Assets</h3>
                <div className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
                    <MenuItem id="PROFILE" label="My Profile" icon={User} sub="Personal Details" onClick={() => setCurrentView('SETTINGS')} />
                    <MenuItem id="DOCUMENTS" label="Documents & KYC" icon={ShieldCheck} sub={isVerified ? "All Documents Valid" : userProfile.driverVerificationStatus === 'PENDING' ? 'Processing Verification' : "Action Required"} color={isVerified ? "text-green-500" : "text-red-500"} onClick={() => setCurrentView('DOCUMENTS')} />
                    <MenuItem id="VEHICLE" label="Vehicle Details" icon={Car} sub="Silver Toyota Corolla" onClick={() => setCurrentView('VEHICLE')} />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
                <button onClick={onSwitchToRider} className="w-full flex items-center gap-4 p-5 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors border-b border-slate-50 dark:border-slate-800">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600"><Repeat className="w-5 h-5" /></div>
                    <div className="flex-1 text-left">
                        <p className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-tight">Switch to Rider</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
                <button onClick={onLogout} className="w-full flex items-center gap-4 p-5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-600"><LogOut className="w-5 h-5" /></div>
                    <div className="flex-1 text-left">
                        <p className="font-bold text-red-600 text-sm uppercase tracking-tight">Logout</p>
                    </div>
                </button>
            </div>
        </div>
    </div>
  );

  const MenuItem = ({ label, icon: Icon, sub, color, onClick }: any) => (
    <button onClick={onClick} className="w-full flex items-center gap-4 p-5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-none">
        <div className={`w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center ${color || 'text-slate-500 dark:text-slate-400'}`}>
            <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 text-left">
            <p className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-tight">{label}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">{sub}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300" />
    </button>
  );

  const renderOwnerDashboard = () => (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 animate-in slide-in-from-right duration-300 overflow-y-auto no-scrollbar">
        {renderSectionHeader("Fleet Management")}
        <div className="p-6 space-y-6">
            <div className="bg-wobio-600 rounded-[40px] p-8 text-white shadow-2xl shadow-wobio-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-wobio-100">Total Fleet Value</span>
                    <BarChart3 className="w-5 h-5 opacity-50" />
                </div>
                <div className="text-5xl font-black mb-1 tracking-tighter">$4,250.00</div>
                <div className="flex items-center gap-2 mb-8">
                    <TrendingUp className="w-3.5 h-3.5 text-green-300" />
                    <span className="text-[10px] font-black text-green-100 uppercase tracking-widest">+18.4% this month</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <button className="bg-white text-wobio-600 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg">Payout Settings</button>
                    <button className="bg-white/20 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] backdrop-blur-sm">Add Vehicle</button>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Assigned Drivers</h3>
                {userProfile.assignedDriver && (
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-wobio-100 dark:bg-wobio-900/30 rounded-2xl flex items-center justify-center text-wobio-600 text-xl font-black">
                                {userProfile.assignedDriver.firstName[0]}
                            </div>
                            <div>
                                <p className="font-black text-slate-900 dark:text-white uppercase text-sm">
                                    {userProfile.assignedDriver.firstName} {userProfile.assignedDriver.lastName}
                                </p>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active & Online</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-black text-slate-900 dark:text-white text-sm">$42.50</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Today</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Revenue Analytics</h3>
                    <button className="text-[9px] font-black text-wobio-600 uppercase tracking-widest flex items-center gap-1">Statement <ChevronRight className="w-3 h-3" /></button>
                </div>
                <div className="h-32 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={MOCK_CHART_DATA}>
                            <Bar dataKey="trips" fill="#1877F2" radius={[4, 4, 0, 0]} />
                            <XAxis dataKey="name" hide />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} labelStyle={{ display: 'none' }} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    </div>
  );

  const renderEarnings = () => (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 animate-in slide-in-from-right duration-300 overflow-y-auto no-scrollbar">
        {renderSectionHeader("Financial Hub")}
        <div className="p-6">
            <div className="flex bg-slate-200/50 dark:bg-slate-900 p-1.5 rounded-[22px] mb-6 shadow-inner">
                {(['DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM'] as EarningsPeriod[]).map((p) => (
                    <button 
                        key={p}
                        onClick={() => {
                            setEarningsPeriod(p);
                            if (p === 'CUSTOM') setShowCustomRangePicker(true);
                        }}
                        className={`flex-1 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300
                            ${earningsPeriod === p 
                                ? 'bg-wobio-600 text-white shadow-lg scale-[1.02]' 
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    >
                        {p}
                    </button>
                ))}
            </div>
            <div className="bg-wobio-600 rounded-[40px] p-8 text-white shadow-2xl shadow-wobio-500/20 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-wobio-100">
                        {earningsPeriod} NET PROFITS
                    </span>
                    <Wallet className="w-5 h-5 opacity-50" />
                </div>
                <div className="text-5xl font-black mb-1 tracking-tighter">
                    ${earningsPeriod === 'DAILY' ? '42.50' : earningsPeriod === 'MONTHLY' ? '1,840.00' : '425.20'}
                </div>
                <div className="flex items-center gap-2 mb-8">
                    <TrendingUp className="w-3.5 h-3.5 text-green-300" />
                    <span className="text-[10px] font-black text-green-100 uppercase tracking-widest">+12.4% vs prev {earningsPeriod.toLowerCase()}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <button className="bg-white text-wobio-600 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg active:scale-95 transition-all">Withdraw</button>
                    <button className="bg-white/20 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] backdrop-blur-sm active:scale-95 transition-all">Analytics</button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Recent Activity</h3>
                    <button className="text-[9px] font-black text-wobio-600 uppercase tracking-widest flex items-center gap-1">
                        Full Statement <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
                {MOCK_HISTORY.map((trip, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600"><Clock className="w-5 h-5" /></div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white text-xs truncate w-32">{trip.dest}</p>
                                <p className="text-[9px] text-slate-400 font-black uppercase">{trip.date}</p>
                            </div>
                        </div>
                        <p className="font-black text-green-600 tracking-tight text-sm">+${trip.price.toFixed(2)}</p>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );

  const renderServices = () => (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 animate-in slide-in-from-right duration-300">
        {renderSectionHeader("My Services")}
        <div className="p-6 space-y-4">
            <div className="bg-wobio-50 dark:bg-wobio-900/20 p-5 rounded-2xl border border-wobio-100 dark:border-wobio-800 mb-4">
                <h3 className="font-black text-wobio-900 dark:text-wobio-100 text-[10px] uppercase tracking-widest mb-1">Service Selection</h3>
                <p className="text-xs text-wobio-700 dark:text-wobio-300 font-bold leading-relaxed">Toggle categories you are willing to serve. Categories with vehicle restrictions are locked until inspected.</p>
            </div>
            <div className="space-y-3">
                {services.map(service => (
                    <div key={service.id} className="bg-white dark:bg-slate-900 p-5 rounded-[28px] flex items-center justify-between border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${service.enabled ? 'bg-wobio-500 text-white shadow-lg shadow-wobio-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                <service.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white text-sm">{service.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{service.desc}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setServices(services.map(s => s.id === service.id ? {...s, enabled: !s.enabled} : s))}
                            className={`w-14 h-8 rounded-full transition-all relative ${service.enabled ? 'bg-wobio-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                        >
                            <div className={`absolute top-1 bg-white w-6 h-6 rounded-full shadow-sm transition-all ${service.enabled ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );

  const renderAvailability = () => (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 animate-in slide-in-from-right duration-300">
        {renderSectionHeader("Working Hours")}
        <div className="p-6 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm text-center">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-wobio-600">
                    <Timer className="w-8 h-8" />
                </div>
                <h2 className="text-lg font-black uppercase tracking-tight">Auto-Availability</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium px-4 mt-1 leading-relaxed">
                    Set your preferred schedule. The app will automatically set you offline outside these hours.
                </p>
                <div className="mt-8 flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                    <span className="font-bold text-sm">Schedule Active</span>
                    <button onClick={() => setWorkingHours({...workingHours, enabled: !workingHours.enabled})} className={`w-12 h-7 rounded-full transition-all relative ${workingHours.enabled ? 'bg-wobio-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                        <div className={`absolute top-1 bg-white w-5 h-5 rounded-full shadow-sm transition-all ${workingHours.enabled ? 'left-6' : 'left-1'}`} />
                    </button>
                </div>
            </div>
            {workingHours.enabled && (
                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-5">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Shift Starts</label>
                        <input type="time" value={workingHours.start} onChange={e => setWorkingHours({...workingHours, start: e.target.value})} className="bg-transparent font-bold text-lg w-full outline-none" />
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Shift Ends</label>
                        <input type="time" value={workingHours.end} onChange={e => setWorkingHours({...workingHours, end: e.target.value})} className="bg-transparent font-bold text-lg w-full outline-none" />
                    </div>
                </div>
            )}
        </div>
    </div>
  );

  const renderGallery = () => (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 animate-in slide-in-from-right duration-300">
        {renderSectionHeader("Media Gallery")}
        <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
                <GalleryCard label="Vehicle Front" img="https://images.unsplash.com/photo-1550355291-bbee04a92027?w=300&h=300&fit=crop" />
                <GalleryCard label="Vehicle Rear" img="https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=300&h=300&fit=crop" />
                <GalleryCard label="Inside Cabin" img="https://images.unsplash.com/photo-1594950195709-a14f66c242d7?w=300&h=300&fit=crop" />
                <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-[32px] border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-wobio-500 transition-colors">
                    <Camera className="w-6 h-6 text-slate-400 group-hover:text-wobio-600 transition-colors" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Add Media</span>
                </div>
            </div>
        </div>
    </div>
  );

  const GalleryCard = ({ label, img }: any) => (
    <div className="group relative aspect-square rounded-[32px] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
        <img src={img} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" alt={label} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
            <span className="text-[10px] font-black text-white uppercase tracking-widest">{label}</span>
        </div>
    </div>
  );

  const handleTripFinishedOk = () => {
    if (setIsTripFinished) setIsTripFinished(false);
    if (setInvoice) setInvoice(null);
  };

  return (
    <div className="h-full w-full flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white relative transition-colors duration-300">
      
      {currentView === 'CONTROL_HUB' && renderControlHub()}
      {currentView === 'MY_SERVICES' && renderServices()}
      {currentView === 'AVAILABILITY' && renderAvailability()}
      {currentView === 'GALLERY' && renderGallery()}
      {currentView === 'EARNINGS' && renderEarnings()}
      {currentView === 'OWNER_DASHBOARD' && renderOwnerDashboard()}
      
      {currentView === 'DOCUMENTS' && (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 animate-in slide-in-from-right duration-300">
            {renderSectionHeader("Documents & KYC")}
            <div className="p-6 space-y-4">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 text-center mb-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isVerified ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {userProfile.driverVerificationStatus === 'PENDING' ? <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" /> : <ShieldCheck className="w-8 h-8" />}
                    </div>
                    <h3 className="font-black text-sm uppercase tracking-tight">
                        {userProfile.driverVerificationStatus === 'PENDING' ? 'Submission Processing' : 'Compliance Status'}
                    </h3>
                    <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${isVerified ? 'text-green-500' : 'text-red-500'}`}>
                        {userProfile.driverVerificationStatus === 'PENDING' ? 'Team is reviewing' : isVerified ? 'Fully Verified' : 'Action Required'}
                    </p>
                </div>
                <div className="space-y-3">
                    {[
                        { label: 'Registration Book', status: isVerified ? 'Approved' : userProfile.driverVerificationStatus === 'PENDING' ? 'Pending' : 'Required', icon: FileText },
                        { label: 'Vehicle Insurance', status: isVerified ? 'Approved' : userProfile.driverVerificationStatus === 'PENDING' ? 'Pending' : 'Required', icon: Shield },
                        { label: 'Driver\'s License', status: isVerified ? 'Approved' : userProfile.driverVerificationStatus === 'PENDING' ? 'Pending' : 'Required', icon: FileCheck },
                    ].map((doc, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-3xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400"><doc.icon className="w-5 h-5" /></div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white text-sm">{doc.label}</p>
                                    <p className={`text-[9px] font-black uppercase tracking-widest ${doc.status === 'Approved' ? 'text-green-500' : 'text-yellow-600'}`}>{doc.status}</p>
                                </div>
                            </div>
                            <button onClick={() => onNavigateToVerification()} className="text-[10px] font-black text-wobio-600 uppercase tracking-widest">Manage</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {currentView === 'VEHICLE' && (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 animate-in slide-in-from-right duration-300">
            {renderSectionHeader("Vehicle Details")}
            <div className="p-6">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-800 text-center mb-6">
                    <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-wobio-600 shadow-inner">
                        <Car className="w-12 h-12" />
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">Toyota Corolla</h2>
                    <p className="text-wobio-600 font-black uppercase tracking-widest text-xs mt-1">Plate: ABD-1234</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Color</p>
                        <p className="font-bold text-sm">Silver Grey</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Seats</p>
                        <p className="font-bold text-sm">4 Passengers</p>
                    </div>
                </div>
            </div>
        </div>
      )}

      {currentView === 'MAP' && (
        <>
            {isTripRecording && (
                <div className="absolute top-16 left-0 right-0 z-[60] px-4 animate-in slide-in-from-top duration-500 pointer-events-none">
                    <div className="bg-red-600 text-white py-2 px-6 rounded-full flex items-center justify-between shadow-2xl border-2 border-white/20 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">REC • Inside Taxi</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 opacity-60" />
                            <span className="font-mono text-xs font-bold">{formatRecTime(recDuration)}</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="absolute top-0 left-0 right-0 p-4 z-40 flex justify-between items-center pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-2">
                    <button onClick={() => setCurrentView('CONTROL_HUB')} className="bg-white dark:bg-slate-800 p-3 rounded-full shadow-lg text-slate-700 dark:text-white hover:bg-slate-50 transition-all active:scale-90 border border-slate-100 dark:border-slate-800">
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2 shadow-lg border border-slate-100 dark:border-slate-800">
                        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-ping' : 'bg-slate-300'}`} />
                        <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{isOnline ? 'Online' : 'Offline'}</span>
                    </div>
                </div>
                <div className="flex gap-2 pointer-events-auto">
                    <ThemeToggle className="bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-slate-800" />
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-full shadow-lg border border-slate-100 dark:border-slate-800"><Bell className="w-5 h-5 text-slate-700 dark:text-white" /></div>
                </div>
            </div>
            <div className="flex-1 relative">
                <MapVisualization isDriver={true} showDropoff={!!activeTrip} status={tripStatus === 'IN_PROGRESS' ? 'ON_TRIP' : 'IDLE'} />
            </div>
            
            {!activeTrip && !incomingRequest && (
                <div className="bg-white dark:bg-slate-900 p-10 pb-16 z-30 flex flex-col items-center border-t border-slate-100 dark:border-slate-800 transition-colors shadow-[0_-20px_60px_rgba(0,0,0,0.1)] rounded-t-[56px] animate-in slide-in-from-bottom duration-700">
                    <div className="w-12 h-1.5 bg-slate-50 dark:bg-slate-800 rounded-full mb-12"></div>
                    <button 
                        onClick={toggleOnline}
                        className={`w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-700 mb-10 border-[10px] group active:scale-95
                        ${isOnline ? 'bg-wobio-500 border-wobio-400/50 shadow-wobio-500/40' : 'bg-slate-800 dark:bg-slate-700 border-slate-700 dark:border-slate-600'}`}
                    >
                        <div className="text-white font-black text-4xl tracking-tighter mb-1 uppercase">{isOnline ? 'ON' : 'GO'}</div>
                        <div className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">{isOnline ? 'Serving' : 'Offline'}</div>
                    </button>
                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest">
                        {isOnline ? (<><div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>Searching for rides...</>) : ('Ready to start earning?')}
                    </div>
                </div>
            )}
        </>
      )}

      {showComplianceLock && (
        <div className="absolute inset-0 z-[110] bg-black/70 backdrop-blur-lg flex items-center justify-center p-6 animate-in fade-in duration-300">
             <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[40px] p-10 text-center shadow-2xl relative border-2 border-red-500/50">
                 <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg"><ShieldAlert className="w-12 h-12 text-red-500" /></div>
                 <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight leading-none">
                    {userProfile.driverVerificationStatus === 'PENDING' ? 'In Review' : 'KYC Locked'}
                 </h2>
                 <p className="text-slate-500 dark:text-slate-400 mb-10 text-sm font-medium leading-relaxed">
                    {userProfile.driverVerificationStatus === 'PENDING' 
                        ? 'Your Zimbabwean driver credentials are currently being reviewed. This usually takes 2-4 hours. You will receive a notification once approved.'
                        : 'Access to Driver Operations is strictly controlled in Zimbabwe. Please complete your document uploads and identity verification to go online.'}
                 </p>
                 <div className="flex flex-col gap-3">
                    {userProfile.driverVerificationStatus !== 'PENDING' && (
                        <Button fullWidth onClick={() => { setShowComplianceLock(false); onNavigateToVerification(); }} className="py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-wobio-500/20">Complete Registration</Button>
                    )}
                    <button onClick={() => setShowComplianceLock(false)} className="py-4 text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-[0.3em]">Return to Hub</button>
                 </div>
             </div>
        </div>
      )}

      {/* V3 Cube Style Trip Request Overlay */}
      {incomingRequest && !activeTrip && (
        <div className="fixed inset-0 z-[100] bg-wobio-600 flex flex-col animate-in fade-in duration-300">
            <div className="absolute top-0 left-0 right-0 h-2 bg-white/20 z-20">
                <div 
                    className="h-full bg-white transition-all duration-1000 ease-linear shadow-[0_0_10px_white]" 
                    style={{ width: `${(timeLeft / 15) * 100}%` }} 
                />
            </div>

            <div className="flex-1 flex flex-col p-6 pt-12 overflow-y-auto no-scrollbar">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">New Trip<br/>Request</h2>
                        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-[10px] font-black text-white uppercase tracking-widest backdrop-blur-sm">
                            <Zap className="w-3 h-3 fill-current" /> Instant Match
                        </div>
                    </div>
                    <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
                            <circle 
                                cx="40" cy="40" r="36" fill="none" stroke="white" strokeWidth="4" 
                                strokeDasharray="226" 
                                strokeDashoffset={226 - (226 * timeLeft) / 15}
                                className="transition-all duration-1000 ease-linear"
                            />
                        </svg>
                        <span className="text-2xl font-black text-white">{timeLeft}</span>
                    </div>
                </div>

                <div className="bg-white rounded-[40px] p-8 shadow-2xl space-y-8">
                    <div className="relative pl-10 space-y-8">
                        <div className="absolute left-4 top-1 bottom-1 w-0.5 border-l-2 border-dashed border-slate-200" />
                        
                        <div className="relative">
                            <div className="absolute -left-8 top-1 w-4 h-4 bg-slate-900 rounded-full border-4 border-slate-100 shadow-sm" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pickup Location</p>
                            <p className="font-bold text-slate-900 text-lg leading-tight">{incomingRequest.pickup}</p>
                        </div>

                        <div className="relative">
                            <div className="absolute -left-8 top-1 w-4 h-4 bg-wobio-600 rounded-none transform rotate-45 border-4 border-wobio-100 shadow-sm" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Drop-off Location</p>
                            <p className="font-bold text-slate-900 text-lg leading-tight">{incomingRequest.dropoff}</p>
                        </div>
                    </div>

                    {incomingRequest.luggage && (
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 bg-wobio-500 rounded-lg flex items-center justify-center text-white">
                                    <Luggage className="w-4 h-4" />
                                </div>
                                <h4 className="font-black text-wobio-700 dark:text-wobio-300 text-[10px] uppercase tracking-widest">Heavy Luggage Identified</h4>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 text-xs font-bold leading-relaxed ml-11">
                                {incomingRequest.luggage}
                            </p>
                        </div>
                    )}

                    <div className="h-px bg-slate-100" />

                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-2 text-slate-500"><MapIcon className="w-5 h-5" /></div>
                            <p className="text-[9px] font-black text-slate-400 uppercase">Distance</p>
                            <p className="font-black text-slate-900 text-sm">{incomingRequest.distance}</p>
                        </div>
                        <div className="text-center border-x border-slate-100">
                            <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-2 text-slate-500"><TimerIcon className="w-5 h-5" /></div>
                            <p className="text-[9px] font-black text-slate-400 uppercase">Trip Time</p>
                            <p className="font-black text-slate-900 text-sm">{incomingRequest.tripTime}</p>
                        </div>
                        <div className="text-center">
                            <div className="w-10 h-10 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-2 text-green-600"><Banknote className="w-5 h-5" /></div>
                            <p className="text-[9px] font-black text-slate-400 uppercase">Net Fare</p>
                            <p className="font-black text-green-600 text-sm">${incomingRequest.fare.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-[32px] p-5 flex items-center gap-4 border border-slate-100">
                        <div className="w-16 h-16 rounded-[22px] overflow-hidden border-2 border-white shadow-sm">
                            {incomingRequest.riderImage ? (
                                <img src={incomingRequest.riderImage} alt="Rider" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-8 h-8 text-slate-400 m-4" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</p>
                            <p className="font-black text-slate-900 text-xl">{incomingRequest.riderName}</p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm">
                            <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                            <span className="font-black text-xs">4.9</span>
                        </div>
                    </div>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-6 pt-12 pb-6">
                    <button 
                        onClick={handleDecline}
                        className="py-6 rounded-3xl bg-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white/20 transition-all active:scale-95"
                    >
                        Decline
                    </button>
                    <button 
                        onClick={handleAccept}
                        className="py-6 rounded-3xl bg-white text-wobio-600 font-black uppercase tracking-widest text-xs shadow-2xl shadow-black/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        Accept Trip
                    </button>
                </div>
            </div>
        </div>
      )}

      {activeTrip && activeRider && (
         <div className="bg-white dark:bg-slate-900 p-6 pb-10 rounded-t-[56px] shadow-[0_-20px_60px_rgba(0,0,0,0.3)] z-50 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom-20 duration-500">
            <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto mb-8"></div>
            
            <div className="flex justify-between items-center mb-8 px-2">
              <div className="flex items-center gap-4">
                 <div className="w-16 h-16 bg-wobio-100 dark:bg-wobio-900/30 rounded-2xl flex items-center justify-center border-2 border-white dark:border-slate-700 shadow-sm overflow-hidden">
                    {activeRider.riderImage ? (
                        <img src={activeRider.riderImage} alt="Rider" className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-8 h-8 text-wobio-600" />
                    )}
                 </div>
                 <div>
                   <div className="font-black text-2xl uppercase tracking-tight text-slate-900 dark:text-white mb-1">{activeRider.riderName}</div>
                   <div className="flex items-center gap-2">
                        <div className="text-[10px] font-black uppercase tracking-widest text-wobio-600 flex items-center gap-1.5 bg-wobio-50 dark:bg-wobio-900/20 px-2.5 py-1 rounded-full w-fit">
                            <div className="w-1.5 h-1.5 rounded-full bg-wobio-600 animate-pulse"></div>
                            {tripStatus === 'PICKUP' ? 'En Route' : 'In Progress'}
                        </div>
                        {isTripRecording && (
                            <div className="bg-red-50 text-red-600 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 border border-red-100">
                                <Circle className="w-2 h-2 fill-current animate-pulse" /> REC
                            </div>
                        )}
                   </div>
                 </div>
              </div>
              <div className="flex gap-2.5">
                 <button 
                    onClick={toggleRecording} 
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90 border shadow-sm
                        ${isTripRecording 
                            ? 'bg-red-600 border-red-700 text-white shadow-red-200' 
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200'}`}
                    title="Toggle Inside Recording"
                 >
                    <Video className="w-5 h-5" />
                 </button>
                 <button onClick={() => setIsChatOpen(true)} className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-all active:scale-90 border border-slate-100 dark:border-slate-700"><MessageCircle className="w-5 h-5" /></button>
                 <button onClick={() => setCallMode('VOICE')} className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 transition-all active:scale-90 border border-blue-100 dark:border-blue-900/30"><Phone className="w-5 h-5" /></button>
              </div>
            </div>

            <div className="space-y-4">
                {activeRider.luggage && (
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-[24px] flex items-start gap-4 border border-slate-100 dark:border-slate-800">
                        <Luggage className="w-6 h-6 text-wobio-600 mt-0.5 shrink-0" />
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rider's Luggage</span>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-1">{activeRider.luggage}</p>
                        </div>
                    </div>
                )}

                {!isTripRecording && (
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-slate-800">
                        <ShieldCheck className="w-4 h-4 text-green-600" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Safety recording available for this trip</span>
                    </div>
                )}

                {tripStatus === 'PICKUP' ? (
                    <Button fullWidth size="lg" className="bg-green-600 hover:bg-green-700 py-6 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-green-600/20" onClick={() => setTripStatus('IN_PROGRESS')}>Start Trip</Button>
                ) : (
                    <Button fullWidth size="lg" className="py-6 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-wobio-600/20" onClick={handleCompleteTrip}>Complete Trip</Button>
                )}
            </div>
         </div>
      )}

      {isTripFinished && invoice && (
        <div className="absolute inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in zoom-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] p-0 shadow-2xl relative overflow-hidden flex flex-col border border-slate-100 dark:border-slate-800 animate-in zoom-in-95">
                <div className="bg-wobio-600 p-6 text-white text-center">
                   <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                       <FileCheck className="w-8 h-8 text-white" />
                   </div>
                   <h2 className="text-xl font-black uppercase tracking-tight">Trip Completed</h2>
                   <p className="text-xs text-wobio-100 font-medium">{invoice.tripId}</p>
                </div>
                
                <div className="p-8">
                   <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2">
                         <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <Navigation className="w-5 h-5 text-slate-500" />
                         </div>
                         <div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Distance</div>
                            <div className="font-bold text-slate-900 dark:text-white">{invoice.distance}</div>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Duration</div>
                         <div className="font-bold text-slate-900 dark:text-white">{invoice.duration}</div>
                      </div>
                   </div>

                   <div className="space-y-3 pt-4 border-t border-dashed border-slate-200 dark:border-slate-800 font-medium text-sm">
                      <div className="flex justify-between text-slate-500 dark:text-slate-400">
                         <span>Trip Fare</span>
                         <span className="font-mono text-slate-900 dark:text-white">${invoice.baseFare.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                         <span>Promo/Adjustment</span>
                         <span className="font-mono">-${invoice.discount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 dark:text-slate-400">
                         <span>Service Fee</span>
                         <span className="font-mono text-slate-900 dark:text-white">${invoice.tax.toFixed(2)}</span>
                      </div>
                      <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-end">
                         <div className="text-xs font-black text-slate-400 uppercase">Net Earning</div>
                         <div className="text-3xl font-black text-wobio-600">${invoice.total.toFixed(2)}</div>
                      </div>
                   </div>
                   
                   <div className="mt-8 flex flex-col items-center gap-4">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                         <CreditCard className="w-3.5 h-3.5" />
                         Payment: {invoice.paymentMethod}
                      </div>
                      <Button fullWidth onClick={handleTripFinishedOk} className="py-4 font-black tracking-widest uppercase shadow-lg shadow-wobio-500/20">
                         Back to Map
                      </Button>
                   </div>
                </div>
                <div className="flex justify-between px-2 -mb-2">
                   {Array.from({length: 12}).map((_, i) => (
                      <div key={i} className="w-4 h-4 bg-[#F2F4F7] dark:bg-slate-950 rounded-full"></div>
                   ))}
                </div>
            </div>
        </div>
      )}

      <ChatInterface isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} peerName={activeRider?.riderName || "Rider"} peerImage={activeRider?.riderImage} currentUserRole="DRIVER" isChatActive={tripStatus === 'PICKUP'} />
      <CallInterface isOpen={!!callMode} onClose={() => setCallMode(null)} mode={callMode || 'VOICE'} peerName={activeRider?.riderName || "Rider"} peerImage={activeRider?.riderImage} isDriver={true} />
    </div>
  );
};