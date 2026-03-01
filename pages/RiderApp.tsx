import React, { useState, useEffect } from 'react';
import { MapVisualization } from '../components/MapVisualization';
import { Button } from '../components/Button';
import { VEHICLES } from '../constants';
import { VehicleType, UserProfile } from '../types';
import { 
  MapPin, Clock, CreditCard, ChevronRight, Star, Menu, User, Car, 
  Package, ArrowLeft, CarFront, Bus, Crown, Banknote, Wallet, 
  ShieldAlert, X, Minus, Plus, Info, AlertCircle, MessageCircle, 
  Phone, Video, Bell, Shield, PhoneCall, Users, Share2, Copy, 
  MessageSquare, CheckCircle, Navigation, FileCheck, Sparkles, Luggage,
  ShieldCheck, ScanFace, Coins, ChevronDown, HeartPulse
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { ChatInterface } from '../components/ChatInterface';
import { CallInterface } from '../components/CallInterface';
import { TripInvoice } from '../App';

interface RiderAppProps {
  onProfileClick: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  isTripRecording?: boolean;
  isTripFinished?: boolean;
  setIsTripFinished?: (val: boolean) => void;
  invoice?: TripInvoice | null;
  isInsuranceSelected: boolean;
  setIsInsuranceSelected: (val: boolean) => void;
}

type RideStatus = 'ARRIVING' | 'DRIVER_ARRIVED' | 'IN_PROGRESS';

const playDriverFoundSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    const playNote = (freq: number, startTime: number, duration: number, vol: number = 0.2) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(vol, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
    };
    const now = ctx.currentTime;
    playNote(523.25, now, 0.4);      
    playNote(659.25, now + 0.12, 0.4); 
    playNote(783.99, now + 0.24, 0.6); 
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

const playChimeSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.5);
  } catch (e) {}
};

const playArrivalSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const playTone = (startTime: number) => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.frequency.value = 420; 
        osc1.type = 'sawtooth';
        osc2.frequency.value = 520;
        osc2.type = 'sawtooth';
        const gainVal = 0.15;
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start(startTime);
        osc2.start(startTime);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(gainVal, startTime + 0.02);
        gain.gain.linearRampToValueAtTime(0, startTime + 0.15);
        osc1.stop(startTime + 0.15);
        osc2.stop(startTime + 0.15);
    };
    const now = ctx.currentTime;
    playTone(now);
    playTone(now + 0.2); 
  } catch (e) {}
};

export const RiderApp: React.FC<RiderAppProps> = ({ 
  onProfileClick, 
  userProfile, 
  onUpdateProfile,
  isTripRecording = false, 
  isTripFinished = false,
  setIsTripFinished,
  invoice,
  isInsuranceSelected,
  setIsInsuranceSelected
}) => {
  const [step, setStep] = useState<'SERVICE_SELECTION' | 'HOME' | 'SELECT_VEHICLE' | 'SEARCHING' | 'ON_RIDE'>('SERVICE_SELECTION');
  const [serviceType, setServiceType] = useState<'TAXI' | 'DELIVERY'>('TAXI');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>(VehicleType.STANDARD);
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  
  // Luggage state
  const [hasLuggage, setHasLuggage] = useState<boolean | null>(null);
  const [luggageDetails, setLuggageDetails] = useState('');

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [callMode, setCallMode] = useState<'VOICE' | 'VIDEO' | null>(null);
  
  const [showInsuranceCoverage, setShowInsuranceCoverage] = useState(false);
  
  const [rideStatus, setRideStatus] = useState<RideStatus>('ARRIVING');
  const [showDriverArrivedModal, setShowDriverArrivedModal] = useState(false);
  const [showPanicModal, setShowPanicModal] = useState(false);
  const [showNearbyAlert, setShowNearbyAlert] = useState(false);
  const [showRecordingNotice, setShowRecordingNotice] = useState(false);
  const [showDriverFoundToast, setShowDriverFoundToast] = useState(false);

  const [showCashConfirmation, setShowCashConfirmation] = useState(false);
  const [fareAdjustment, setFareAdjustment] = useState(0);
  const [searchStatusInfo, setSearchStatusInfo] = useState({ text: 'Connecting to nearby drivers...', time: '2 min' });

  const isVerified = userProfile.riderVerificationStatus === 'APPROVED';

  const mockDriver = {
      name: "Michael S.",
      rating: 4.9,
      rides: "2.5k",
      carModel: "Toyota Camry",
      carColor: "Silver",
      plate: "ABD-123",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces"
  };

  useEffect(() => {
    setFareAdjustment(0);
  }, [selectedVehicle]);

  useEffect(() => {
    if (isTripRecording && step === 'ON_RIDE') {
      setShowRecordingNotice(true);
      const timer = setTimeout(() => setShowRecordingNotice(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [isTripRecording, step]);

  useEffect(() => {
    if (step === 'SEARCHING') {
      setSearchStatusInfo({ text: 'Connecting to nearby drivers...', time: '2 min' });
      const updates = [
          { text: 'Contacting drivers in your area...', time: '1 min' },
          { text: 'Expanding search radius...', time: '1 min' },
          { text: 'Priority matching enabled...', time: '1 min' },
          { text: 'Finalizing driver match...', time: '< 1 min' },
      ];
      let i = 0;
      const interval = setInterval(() => {
          i = (i + 1) % updates.length;
          setSearchStatusInfo(updates[i]);
      }, 2000); 

      const timer = setTimeout(() => {
        setStep('ON_RIDE');
        setRideStatus('ARRIVING');
        setShowDriverFoundToast(true);
        playDriverFoundSound(); 
        setTimeout(() => setShowDriverFoundToast(false), 4000);
      }, 8000); 

      return () => {
          clearInterval(interval);
          clearTimeout(timer);
      };
    }
  }, [step]);

  useEffect(() => {
    if (step === 'ON_RIDE' && rideStatus === 'ARRIVING') {
        const nearbyTimer = setTimeout(() => {
            setShowNearbyAlert(true);
            playChimeSound();
            setTimeout(() => setShowNearbyAlert(false), 5000);
        }, 7000);
        const arrivalTimer = setTimeout(() => {
            setRideStatus('DRIVER_ARRIVED');
            setShowDriverArrivedModal(true);
            playArrivalSound();
        }, 15000);
        return () => {
            clearTimeout(nearbyTimer);
            clearTimeout(arrivalTimer);
        };
    }
    if (step === 'ON_RIDE' && rideStatus === 'DRIVER_ARRIVED') {
        const timer = setTimeout(() => {
            setRideStatus('IN_PROGRESS');
            setShowDriverArrivedModal(false); 
        }, 20000);
        return () => clearTimeout(timer);
    }
  }, [step, rideStatus]);

  const handleServiceSelect = (type: 'TAXI' | 'DELIVERY') => {
    if (!isVerified) {
      setShowVerificationModal(true);
      return;
    }
    setServiceType(type);
    setStep('HOME');
  };

  const handleBookRide = () => {
    if (!isVerified) {
        setShowVerificationModal(true);
        return;
    }
    if (userProfile.preferredPaymentType === 'CASH') {
        setShowCashConfirmation(true);
        return;
    }
    setStep('SEARCHING');
  };

  const confirmCashBooking = () => {
      setShowCashConfirmation(false);
      setStep('SEARCHING');
  };

  const handleTripFinishedOk = () => {
      setIsTripFinished?.(false);
      setStep('SERVICE_SELECTION');
      setRideStatus('ARRIVING');
      setPickup('');
      setDropoff('');
      setHasLuggage(null);
      setLuggageDetails('');
  };

  const getPricing = () => {
    const vehicle = VEHICLES.find(v => v.id === selectedVehicle);
    const basePrice = vehicle ? 12 * vehicle.priceMultiplier : 12;
    const insuranceFee = isInsuranceSelected ? 0.20 : 0;
    const minPrice = basePrice * 0.8;
    const maxPrice = basePrice * 1.2;
    const currentPrice = Math.max(minPrice, Math.min(maxPrice, basePrice + fareAdjustment)) + insuranceFee;
    return { basePrice, currentPrice, minPrice, maxPrice, insuranceFee, isMin: (currentPrice - insuranceFee) <= minPrice + 0.01, isMax: (currentPrice - insuranceFee) >= maxPrice - 0.01, canAdjust: basePrice >= 5.00 };
  };

  const handleAdjustFare = (direction: 'UP' | 'DOWN') => {
      const { currentPrice, minPrice, maxPrice } = getPricing();
      const step = 0.50;
      if (direction === 'UP') {
          if (currentPrice + step <= maxPrice) setFareAdjustment(prev => prev + step);
          else setFareAdjustment(maxPrice - (getPricing().basePrice));
      } else {
          if (currentPrice - step >= minPrice) setFareAdjustment(prev => prev - step);
          else setFareAdjustment(minPrice - (getPricing().basePrice));
      }
  };

  const getVehicleIcon = (type: VehicleType, isSelected: boolean) => {
    const baseClasses = `w-14 h-14 rounded-full flex items-center justify-center mb-0 shrink-0 transition-transform duration-300 ${isSelected ? 'scale-110 shadow-md' : 'shadow-sm'}`;
    switch (type) {
      case VehicleType.STANDARD: return <div className={`${baseClasses} bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300`}><CarFront className="w-8 h-8 fill-current" /></div>;
      case VehicleType.SIX_SEATER: return <div className={`${baseClasses} bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300`}><Bus className="w-8 h-8 fill-current" /></div>;
      case VehicleType.EXECUTIVE: return <div className={`${baseClasses} bg-slate-800 text-yellow-400 border-2 border-slate-700`}><Crown className="w-7 h-7 fill-current" /></div>;
      default: return <Car className="w-8 h-8" />;
    }
  };

  const getPaymentIcon = () => {
    switch(userProfile.preferredPaymentType) {
      case 'CASH': return <Banknote className="w-5 h-5 text-green-600" />;
      case 'WALLET': return <Wallet className="w-5 h-5 text-wobio-600" />;
      case 'CARD': return <CreditCard className="w-5 h-5 text-purple-600" />;
    }
  };

  const getPaymentLabel = () => {
    switch(userProfile.preferredPaymentType) {
      case 'CASH': return 'Cash';
      case 'WALLET': return userProfile.selectedWalletName || 'Mobile Wallet';
      case 'CARD': return `Card • ${userProfile.selectedCardLast4 || '4242'}`;
    }
  };

  return (
    <div className="h-full w-full flex flex-col relative bg-slate-100 dark:bg-slate-900 transition-colors duration-300">
      <ChatInterface isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} peerName={mockDriver.name} peerImage={mockDriver.image} currentUserRole="RIDER" isChatActive={rideStatus === 'ARRIVING'} onVoiceCall={() => setCallMode('VOICE')} onVideoCall={() => setCallMode('VIDEO')} />
      <CallInterface isOpen={!!callMode} onClose={() => setCallMode(null)} mode={callMode || 'VOICE'} peerName={mockDriver.name} peerImage={mockDriver.image} />

      {showDriverFoundToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm animate-in slide-in-from-top-10 duration-500">
            <div className="bg-green-600 text-white rounded-3xl p-4 shadow-2xl flex items-center gap-4 border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div className="flex-1">
                    <h4 className="font-black text-sm uppercase tracking-wider">Driver Matched!</h4>
                    <p className="text-xs text-green-50 font-bold">{mockDriver.name} is on the way.</p>
                </div>
            </div>
        </div>
      )}

      {isTripFinished && invoice && (
        <div className="absolute inset-0 z-120 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in zoom-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] p-0 shadow-2xl relative overflow-hidden flex flex-col border border-slate-100 dark:border-slate-800 animate-in zoom-in-95">
                <div className="bg-wobio-600 p-6 text-white text-center">
                   <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                       <FileCheck className="w-8 h-8 text-white" />
                   </div>
                   <h2 className="text-xl font-black uppercase tracking-tight">Ride Receipt</h2>
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
                         <div className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Time</div>
                         <div className="font-bold text-slate-900 dark:text-white">{invoice.duration}</div>
                      </div>
                   </div>

                   <div className="space-y-3 pt-4 border-t border-dashed border-slate-200 dark:border-slate-800 font-medium text-sm">
                      <div className="flex justify-between text-slate-500 dark:text-slate-400">
                         <span>Subtotal</span>
                         <span className="font-mono text-slate-900 dark:text-white">${invoice.baseFare.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                         <span>Discount Applied</span>
                         <span className="font-mono">-${invoice.discount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 dark:text-slate-400">
                         <span>Service Fee & Tax</span>
                         <span className="font-mono text-slate-900 dark:text-white">${invoice.tax.toFixed(2)}</span>
                      </div>
                      {invoice.insuranceFee && invoice.insuranceFee > 0 && (
                       <div className="flex justify-between text-wobio-600 font-bold">
                          <span>Ride Insurance</span>
                          <span className="font-mono">${invoice.insuranceFee.toFixed(2)}</span>
                       </div>
                      )}
                      <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-end">
                         <div className="text-xs font-black text-slate-400 uppercase">Paid Total</div>
                         <div className="text-3xl font-black text-wobio-600">${invoice.total.toFixed(2)}</div>
                      </div>
                   </div>
                   
                   <div className="mt-8 flex flex-col items-center gap-4">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                         <CreditCard className="w-3.5 h-3.5" />
                         Method: {invoice.paymentMethod}
                      </div>
                      <Button fullWidth onClick={handleTripFinishedOk} className="py-4 font-black tracking-widest uppercase shadow-lg shadow-wobio-500/20">
                         Great, OK
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

      {showRecordingNotice && (
        <div className="absolute inset-0 z-110 flex items-center justify-center p-6 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] p-8 text-center shadow-2xl border-2 border-blue-500 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2 bg-blue-600 animate-pulse"></div>
                <button onClick={() => setShowRecordingNotice(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                </button>
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                    <Video className="w-10 h-10 text-blue-600" />
                    <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></div>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Security Recording</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium text-sm">
                    For your safety and the driver's security, this vehicle is equipped with <span className="text-blue-600 dark:text-blue-400 font-bold">inside video recording</span>. Recording has started.
                </p>
                <Button fullWidth onClick={() => setShowRecordingNotice(false)}>I Understand</Button>
            </div>
        </div>
      )}

      {showShareModal && (
        <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-[32px] p-8 pb-12 animate-in slide-in-from-bottom-10 shadow-2xl">
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-8"></div>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Share Trip</h3>
              <button onClick={() => setShowShareModal(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500"><X className="w-5 h-5" /></button>
            </div>
            <div className="bg-wobio-50 dark:bg-wobio-900/20 p-5 rounded-2xl mb-8 flex items-center gap-4 border border-wobio-100 dark:border-wobio-800">
              <div className="w-12 h-12 bg-wobio-500 rounded-full flex items-center justify-center text-white"><Share2 className="w-6 h-6" /></div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">Live Tracking Active</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Friends can see your location in real-time.</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-6 mb-8">
              {[
                { name: 'WhatsApp', icon: MessageSquare, color: 'bg-green-500' },
                { name: 'Messages', icon: Phone, color: 'bg-blue-500' },
                { name: 'Copy Link', icon: Copy, color: 'bg-slate-700' },
                { name: 'Contacts', icon: Users, color: 'bg-wobio-600' }
              ].map((platform) => (
                <button key={platform.name} className="flex flex-col items-center gap-2 group">
                  <div className={`w-14 h-14 ${platform.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-active:scale-90 transition-transform`}><platform.icon className="w-6 h-6" /></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{platform.name}</span>
                </button>
              ))}
            </div>
            <Button fullWidth size="lg" onClick={() => setShowShareModal(false)}>Done</Button>
          </div>
        </div>
      )}

      {showNearbyAlert && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[90] w-[90%] max-w-sm animate-in slide-in-from-top-10 duration-500">
              <div className="bg-wobio-600 text-white rounded-2xl p-4 shadow-2xl flex items-center gap-4 border border-white/20">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0"><Bell className="w-6 h-6 text-white animate-ring" /></div>
                  <div className="flex-1">
                      <h4 className="font-black text-sm uppercase tracking-wider">Driver is Nearby!</h4>
                      <p className="text-xs text-wobio-50">Please head to the pickup point now to meet your driver.</p>
                  </div>
                  <button onClick={() => setShowNearbyAlert(false)} className="p-1 hover:bg-white/10 rounded-lg"><X className="w-4 h-4" /></button>
              </div>
          </div>
      )}

      {showPanicModal && (
        <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] p-8 text-center shadow-2xl border-2 border-red-500 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2 bg-red-600 animate-pulse"></div>
                <button onClick={() => setShowPanicModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
                <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/20"><Shield className="w-12 h-12 text-red-600" fill="currentColor" /></div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">SOS Emergency</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">Immediate help is available. Choose an option below to secure your safety.</p>
                <div className="space-y-4">
                    <button className="w-full flex items-center justify-between p-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95">
                        <div className="flex items-center gap-3"><PhoneCall className="w-6 h-6" /><span>Call Police (911)</span></div>
                        <ChevronRight className="w-5 h-5 opacity-50" />
                    </button>
                    <button className="w-full flex items-center justify-between p-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold shadow-lg transition-all active:scale-95">
                        <div className="flex items-center justify-between w-full">
                           <div className="flex items-center gap-3"><Users className="w-6 h-6" /><span>Alert Emergency Contacts</span></div>
                           <ChevronRight className="w-5 h-5 opacity-50" />
                        </div>
                    </button>
                </div>
                <button onClick={() => setShowPanicModal(false)} className="mt-8 text-sm font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">Cancel (I am safe)</button>
            </div>
        </div>
      )}

      <div className="absolute top-0 left-0 right-0 z-40 p-4 flex justify-between items-start pointer-events-none">
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="pointer-events-auto bg-white dark:bg-slate-800 p-3 rounded-full shadow-lg text-slate-700 dark:text-slate-200"><Menu className="w-6 h-6" /></button>
        {step === 'ON_RIDE' && (
           <div className="flex flex-col gap-2 items-end">
                <div className={`text-white px-4 py-2 rounded-full shadow-lg font-bold animate-pulse transition-colors duration-500
                    ${rideStatus === 'ARRIVING' ? 'bg-wobio-600' : (rideStatus === 'DRIVER_ARRIVED' ? 'bg-green-600' : 'bg-green-700')}`}>
                    {rideStatus === 'ARRIVING' ? (serviceType === 'TAXI' ? 'Arriving in 4 min' : 'Courier arriving in 4 min') : rideStatus === 'DRIVER_ARRIVED' ? 'Driver has arrived' : 'Trip in Progress'}
                </div>
                {isTripRecording && (
                    <div className="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg border border-white/20 animate-pulse">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>Recording Live
                    </div>
                )}
           </div>
        )}
      </div>

      {isMenuOpen && (
        <div className="absolute inset-0 z-50 bg-black/50" onClick={() => setIsMenuOpen(false)}>
          <div className="bg-white dark:bg-slate-900 w-3/4 h-full p-6 slide-in-from-left duration-200 flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-8 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 -mx-2 p-2 rounded-xl transition-colors" onClick={() => { setIsMenuOpen(false); onProfileClick(); }}>
              <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center overflow-hidden relative">
                {userProfile.profileImage ? <img src={userProfile.profileImage} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-8 h-8 text-slate-500 dark:text-slate-400" />}
                {isVerified && (
                  <div className="absolute bottom-0 right-0 bg-wobio-500 text-white rounded-full p-1 border-2 border-white dark:border-slate-900">
                    <ShieldCheck className="w-3 h-3 fill-current" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate max-w-[140px]">{userProfile.firstName || 'Guest User'}</h3>
                <div className="flex items-center text-sm text-yellow-500"><Star className="w-4 h-4 fill-current mr-1" />4.85</div>
                <div className="text-xs text-wobio-600 font-semibold mt-1">View Profile</div>
              </div>
            </div>
            <div className="space-y-4 flex-1">
              {['Your Trips', 'Payment', 'Support', 'Settings'].map(item => (<div key={item} className="p-3 hover:bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer font-medium text-slate-700 dark:text-slate-200 transition-colors">{item}</div>))}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800"><div className="px-3 flex items-center justify-between"><span className="font-medium text-slate-700 dark:text-slate-200">Theme</span><ThemeToggle /></div></div>
            </div>
             <div className="mt-auto pt-8 border-t border-slate-100 dark:border-slate-800"><div className="text-xs text-slate-400">v1.2.4 • WOBIO</div></div>
          </div>
        </div>
      )}

      <div className="flex-1 relative">
        <MapVisualization showPickup={step !== 'SERVICE_SELECTION' && step !== 'HOME'} showDropoff={step === 'SEARCHING' || step === 'ON_RIDE'} />
        {step === 'ON_RIDE' && (
            <button onClick={() => setShowPanicModal(true)} className="absolute right-4 bottom-80 z-40 w-16 h-16 bg-red-600 text-white rounded-full shadow-2xl shadow-red-600/50 flex flex-col items-center justify-center animate-bounce hover:scale-110 active:scale-95 transition-all border-4 border-white dark:border-slate-900">
                <Shield className="w-6 h-6 mb-0.5" fill="currentColor" /><span className="text-[10px] font-black uppercase tracking-tighter">SOS</span>
            </button>
        )}
        {step === 'ON_RIDE' && (
            <div className="absolute top-20 left-4 right-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 p-4 animate-in slide-in-from-top-4 z-30">
               <div className="absolute left-[29px] top-9 bottom-9 w-0.5 bg-slate-300 dark:bg-slate-600 border-l border-dashed border-slate-400"></div>
               <div className="flex items-center gap-4 mb-4 relative z-10">
                  <div className="w-3 h-3 bg-slate-900 dark:bg-slate-300 rounded-full ring-4 ring-slate-100 dark:ring-slate-800"></div>
                  <div className="flex-1 min-w-0"><div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Pickup</div><div className="text-sm font-bold text-slate-900 dark:text-white truncate">{pickup || 'Current Location'}</div></div>
               </div>
               <div className="flex items-center gap-4 relative z-10">
                  <div className="w-3 h-3 bg-wobio-600 rounded-none ring-4 ring-wobio-50 dark:ring-wobio-900/30 transform rotate-45"></div>
                  <div className="flex-1 min-w-0"><div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Destination</div><div className="text-sm font-bold text-slate-900 dark:text-white truncate">{dropoff || 'Selected Destination'}</div></div>
               </div>
            </div>
        )}
      </div>

      {showVerificationModal && (
        <div className="absolute inset-0 z-[110] bg-black/60 backdrop-blur-lg flex items-center justify-center p-6 animate-in fade-in duration-300">
             <div className="bg-white dark:bg-slate-900 w-full max-sm rounded-[40px] p-8 text-center shadow-2xl relative border-2 border-wobio-500/50">
                 <button onClick={() => setShowVerificationModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                 <div className="w-24 h-24 bg-wobio-50 dark:bg-wobio-900/30 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                    <ShieldCheck className="w-12 h-12 text-wobio-600" />
                    <ScanFace className="absolute -bottom-1 -right-1 w-8 h-8 text-wobio-400 bg-white dark:bg-slate-900 rounded-lg p-1 shadow-sm" />
                 </div>
                 <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">Identity Lock</h2>
                 <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm font-medium leading-relaxed">
                    To maintain the highest level of safety for our community, <span className="text-wobio-600 font-bold">identity verification</span> is mandatory before booking. It takes less than 2 minutes.
                 </p>
                 <div className="space-y-3">
                    <Button fullWidth onClick={() => { setShowVerificationModal(false); onProfileClick(); }} className="py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-wobio-500/20">Verify My Identity</Button>
                    <button onClick={() => setShowVerificationModal(false)} className="w-full py-4 text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-[0.2em]">Maybe Later</button>
                 </div>
             </div>
        </div>
      )}

      {showDriverArrivedModal && (
        <div className="absolute inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in zoom-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center border-4 border-wobio-500 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2 bg-wobio-500 animate-pulse"></div>
                <div className="w-24 h-24 bg-wobio-100 dark:bg-wobio-900/30 rounded-full flex items-center justify-center mx-auto mb-6 relative"><CarFront className="w-12 h-12 text-wobio-600 dark:text-wobio-400" /><div className="absolute -top-1 -right-1 bg-yellow-400 p-2 rounded-full shadow-sm animate-bounce"><Bell className="w-5 h-5 text-black" fill="currentColor" /></div></div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Driver Arrived!</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">{mockDriver.name} is waiting at the pickup point in a {mockDriver.carColor} {mockDriver.carModel} ({mockDriver.plate}).</p>
                <Button fullWidth size="lg" onClick={() => setShowDriverArrivedModal(false)}>OK, I'm coming</Button>
            </div>
        </div>
      )}

      {showCashConfirmation && (
        <div className="absolute inset-0 z-[120] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[40px] p-10 shadow-2xl relative flex flex-col items-center text-center animate-in zoom-in duration-300 border border-slate-100 dark:border-slate-800">
            <button onClick={() => setShowCashConfirmation(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
            
            <div className="w-28 h-28 bg-green-50 dark:bg-green-900/20 rounded-[32px] flex items-center justify-center mb-8 relative rotate-3">
              <Banknote className="w-14 h-14 text-green-600 dark:text-green-400" />
              <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-2xl p-2 shadow-lg border-4 border-white dark:border-slate-900 animate-bounce">
                <Coins className="w-5 h-5 text-slate-900" />
              </div>
            </div>

            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">Cash Payment Ready?</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-10 text-sm font-medium leading-relaxed px-2">
              To avoid any <span className="text-red-500 font-bold">inconveniences</span> at your destination, please confirm you have the <span className="text-green-600 dark:text-green-400 font-bold">exact change</span> ready for your driver.
            </p>

            <div className="w-full space-y-3">
              <Button 
                fullWidth 
                size="lg"
                onClick={confirmCashBooking} 
                className="bg-green-600 hover:bg-green-700 shadow-xl shadow-green-500/20 py-4 rounded-2xl font-black uppercase tracking-widest text-xs"
              >
                Yes, I Have Change
              </Button>
              <button 
                onClick={() => setShowCashConfirmation(false)}
                className="w-full py-3 text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-[0.2em]"
              >
                Go Back & Change Method
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="absolute inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowPaymentModal(false)}>
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-6 animate-in slide-in-from-bottom-10" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Select Payment Method</h3>
            <div className="space-y-3">
              <button onClick={() => { onUpdateProfile({ preferredPaymentType: 'CASH' }); setShowPaymentModal(false); }} className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${userProfile.preferredPaymentType === 'CASH' ? 'border-wobio-500 bg-wobio-50 dark:bg-wobio-900/20' : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}><div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600"><Banknote className="w-5 h-5" /></div><div className="flex-1 text-left font-semibold text-slate-900 dark:text-white">Cash</div>{userProfile.preferredPaymentType === 'CASH' && <div className="w-3 h-3 bg-wobio-500 rounded-full" />}</button>
              
              <button onClick={() => { onUpdateProfile({ preferredPaymentType: 'WALLET' }); setShowPaymentModal(false); }} className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${userProfile.preferredPaymentType === 'WALLET' ? 'border-wobio-500 bg-wobio-50 dark:bg-wobio-900/20' : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                <div className="w-10 h-10 rounded-full bg-wobio-100 dark:bg-wobio-900/30 flex items-center justify-center text-wobio-600"><Wallet className="w-5 h-5" /></div>
                <div className="flex-1 text-left font-semibold text-slate-900 dark:text-white">
                    {userProfile.selectedWalletName || 'Mobile Wallet'}
                </div>
                {userProfile.preferredPaymentType === 'WALLET' && <div className="w-3 h-3 bg-wobio-500 rounded-full" />}
              </button>

              <button onClick={() => { onUpdateProfile({ preferredPaymentType: 'CARD' }); setShowPaymentModal(false); }} className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${userProfile.preferredPaymentType === 'CARD' ? 'border-wobio-500 bg-wobio-50 dark:bg-wobio-900/20' : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600"><CreditCard className="w-5 h-5" /></div>
                <div className="flex-1 text-left font-semibold text-slate-900 dark:text-white">
                    Card • {userProfile.selectedCardLast4 || '4242'}
                </div>
                {userProfile.preferredPaymentType === 'CARD' && <div className="w-3 h-3 bg-wobio-500 rounded-full" />}
              </button>
            </div>
            <button onClick={() => setShowPaymentModal(false)} className="mt-6 w-full py-3 font-semibold text-slate-500">Cancel</button>
          </div>
        </div>
      )}

      <div className={`bg-white dark:bg-slate-900 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-30 transition-all duration-300 ease-in-out border-t border-transparent dark:border-slate-800
        ${(step === 'HOME' || step === 'SERVICE_SELECTION') ? 'h-auto pb-8' : 'h-auto pb-6'}`}>
        
        {step === 'SERVICE_SELECTION' && (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white text-center">Which service would you like?</h2>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => handleServiceSelect('TAXI')} className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent hover:border-wobio-500 hover:bg-wobio-50 dark:hover:bg-wobio-900/20 transition-all group active:scale-95"><div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform"><Car className="w-8 h-8 text-wobio-600 dark:text-wobio-400" /></div><span className="font-bold text-lg text-slate-900 dark:text-white">Taxi</span><span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ride there</span></button>
              <button onClick={() => handleServiceSelect('DELIVERY')} className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent hover:border-wobio-500 hover:bg-wobio-50 dark:hover:bg-wobio-900/20 transition-all group active:scale-95"><div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform"><Package className="w-8 h-8 text-wobio-600 dark:text-wobio-400" /></div><span className="font-bold text-lg text-slate-900 dark:text-white">Delivery</span><span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Send package</span></button>
            </div>
          </div>
        )}

        {step === 'HOME' && (
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
               <button onClick={() => setStep('SERVICE_SELECTION')} className="p-1 -ml-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><ArrowLeft className="w-5 h-5" /></button>
               <h2 className="text-xl font-bold text-slate-800 dark:text-white">{serviceType === 'TAXI' ? 'Where to?' : 'Where to send package?'}</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-3 rounded-xl transition-colors"><MapPin className="w-5 h-5 text-red-500 mx-2 shrink-0 fill-red-500/20" /><input type="text" placeholder="Enter pickup point" className="bg-transparent w-full text-slate-800 dark:text-white font-medium focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500" onChange={(e) => setPickup(e.target.value)} /></div>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-3 rounded-xl transition-colors"><MapPin className="w-5 h-5 text-green-500 mx-2 shrink-0 fill-green-500/20" /><input type="text" placeholder={serviceType === 'TAXI' ? "Enter destination" : "Dropoff Location"} className="bg-transparent w-full text-slate-800 dark:text-white font-medium focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500" onChange={(e) => setDropoff(e.target.value)} /></div>
            </div>
            <div className="mt-4 flex gap-3 overflow-x-auto no-scrollbar pb-2">{['Home', 'Work', 'Gym'].map(pl => (<button key={pl} className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-semibold whitespace-nowrap text-slate-700 dark:text-slate-200 transition-colors"><Clock className="w-3 h-3 text-slate-400" /> {pl}</button>))}</div>
            <Button fullWidth className="mt-4" onClick={() => setStep('SELECT_VEHICLE')} disabled={!dropoff}>{serviceType === 'TAXI' ? 'Confirm Destination' : 'Confirm Package Route'}</Button>
          </div>
        )}

        {step === 'SELECT_VEHICLE' && (() => {
           const pricing = getPricing();
           return (
            <div className="p-6 h-[75vh] flex flex-col">
              <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-lg text-slate-900 dark:text-white">{serviceType === 'TAXI' ? 'Choose a ride' : 'Choose delivery type'}</h3><button onClick={() => setStep('HOME')} className="text-sm text-wobio-600 font-medium">Back</button></div>
              
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-4">
                {/* Vehicle Options */}
                <div className="space-y-3">
                    {VEHICLES.map(v => {
                    const isSelected = selectedVehicle === v.id;
                    const vPrice = 12 * v.priceMultiplier;
                    return (<div key={v.id} onClick={() => setSelectedVehicle(v.id)} className={`flex items-center justify-between p-3 pr-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${isSelected ? 'border-wobio-500 bg-wobio-50 dark:bg-wobio-900/10 shadow-sm' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'}`}><div className="flex items-center gap-4">{getVehicleIcon(v.id, isSelected)}<div><div className="font-bold text-slate-900 dark:text-white text-lg">{v.name}</div><div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {v.eta} • {v.desc}</div></div></div><div className="text-right"><div className="font-bold text-slate-900 dark:text-white text-lg">${isSelected ? pricing.currentPrice.toFixed(2) : vPrice.toFixed(2)}</div>{isSelected && <div className="text-[10px] text-wobio-600 font-bold uppercase tracking-wide">Selected</div>}</div></div>);
                    })}
                </div>

                {/* Luggage Question Section */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-wobio-100 dark:bg-wobio-900/30 rounded-xl flex items-center justify-center text-wobio-600">
                            <Luggage className="w-5 h-5" />
                        </div>
                        <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-tight">Heavy / Abnormal Luggage?</h4>
                    </div>
                    <div className="flex gap-3 mb-4">
                        <button 
                            onClick={() => { setHasLuggage(false); setLuggageDetails(''); }}
                            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border-2 
                                ${hasLuggage === false 
                                    ? 'bg-wobio-500 border-wobio-600 text-white shadow-lg' 
                                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                        >
                            No Luggage
                        </button>
                        <button 
                            onClick={() => setHasLuggage(true)}
                            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border-2 
                                ${hasLuggage === true 
                                    ? 'bg-wobio-500 border-wobio-600 text-white shadow-lg' 
                                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                        >
                            Yes, I have
                        </button>
                    </div>

                    {hasLuggage === true && (
                        <div className="animate-in slide-in-from-top-2 duration-300">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">Specify your luggage (Visible to driver)</label>
                            <textarea 
                                value={luggageDetails}
                                onChange={(e) => setLuggageDetails(e.target.value)}
                                placeholder="E.g. Two large suitcases, bicycle, 3 medium boxes..."
                                className="w-full h-20 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-wobio-500 resize-none font-medium"
                            />
                        </div>
                    )}
                </div>

                 {/* Insurance Opt-in Section */}
                <div className={`rounded-2xl p-5 border-2 transition-all duration-300 ${isInsuranceSelected ? 'bg-wobio-50 dark:bg-wobio-900/10 border-wobio-500 shadow-md' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'}`}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isInsuranceSelected ? 'bg-wobio-500 text-white' : 'bg-wobio-100 dark:bg-wobio-900/30 text-wobio-600'}`}>
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-tight">Protect Your Ride</h4>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Optional trip protection for accidents</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsInsuranceSelected(!isInsuranceSelected)}
                            disabled={step !== 'SELECT_VEHICLE'}
                            className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${isInsuranceSelected ? 'bg-wobio-500' : 'bg-slate-300 dark:bg-slate-700'} ${step !== 'SELECT_VEHICLE' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${isInsuranceSelected ? 'left-7' : 'left-1'}`}></div>
                        </button>
                    </div>

                    {isInsuranceSelected && (
                        <div className="flex items-center gap-2 mb-3 animate-in fade-in slide-in-from-left-2">
                            <CheckCircle className="w-3 h-3 text-wobio-600" />
                            <span className="text-[10px] font-bold text-wobio-600 uppercase tracking-wider">You are protected during this trip (+$0.20)</span>
                        </div>
                    )}

                    <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                        <button 
                            onClick={() => setShowInsuranceCoverage(!showInsuranceCoverage)}
                            className="flex items-center justify-between w-full text-[10px] font-black text-slate-400 hover:text-wobio-600 uppercase tracking-widest transition-colors"
                        >
                            <span>View Coverage Details</span>
                            <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${showInsuranceCoverage ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {showInsuranceCoverage && (
                            <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                {[
                                    { icon: HeartPulse, text: 'Medical emergency support' },
                                    { icon: ShieldAlert, text: 'Trip accident coverage' },
                                    { icon: ShieldCheck, text: 'Personal accident protection' },
                                    { icon: Clock, text: 'Valid only during active trip' }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                        <item.icon className="w-3 h-3 text-wobio-400" />
                                        <span>{item.text}</span>
                                    </div>
                                ))}
                                <p className="text-[9px] text-slate-400 italic mt-2">WOBIO helps keep you protected throughout your journey.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pricing Adjustment */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    {pricing.canAdjust ? (<div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-2xl p-2 border border-slate-200 dark:border-slate-700"><button onClick={() => handleAdjustFare('DOWN')} disabled={pricing.isMin} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-95 ${pricing.isMin ? 'bg-slate-100 dark:bg-slate-700/50 text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-600'}`}><Minus className="w-6 h-6" /></button><div className="flex flex-col items-center"><span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">${pricing.currentPrice.toFixed(2)}</span></div><button onClick={() => handleAdjustFare('UP')} disabled={pricing.isMax} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-95 ${pricing.isMax ? 'bg-slate-100 dark:bg-slate-700/50 text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-600'}`}><Plus className="w-6 h-6" /></button></div>) : (<div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-3 border border-slate-200 dark:border-slate-700 flex items-center justify-center"><span className="text-2xl font-black text-slate-900 dark:text-white">${pricing.basePrice.toFixed(2)}</span></div>)}
                    {pricing.canAdjust && (<div className="text-center mt-2 text-[10px] text-slate-400">Higher fares may increase driver acceptance speed.</div>)}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 mt-auto">
                <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 -ml-2 rounded-lg transition-colors" onClick={() => setShowPaymentModal(true)}>{getPaymentIcon()}<span className="font-semibold text-sm text-slate-700 dark:text-slate-200">{getPaymentLabel()}</span><ChevronRight className="w-4 h-4 text-slate-400" /></div></div>
                <Button 
                    fullWidth 
                    className="shadow-lg shadow-wobio-500/20" 
                    onClick={handleBookRide}
                    disabled={hasLuggage === null || (hasLuggage === true && !luggageDetails.trim())}
                >
                    {serviceType === 'TAXI' ? `Book ${VEHICLES.find(v => v.id === selectedVehicle)?.name} - $${pricing.currentPrice.toFixed(2)}` : 'Book Courier'}
                </Button>
              </div>
            </div>
           );
        })()}

        {step === 'SEARCHING' && (
          <div className="p-8 flex flex-col items-center text-center justify-center h-full">
            <div className="relative mb-8"><div className="w-24 h-24 border-4 border-slate-100 dark:border-slate-800 rounded-full"></div><div className="absolute inset-0 border-4 border-wobio-500 border-t-transparent rounded-full animate-spin"></div><div className="absolute inset-0 flex items-center justify-center"><Car className="w-8 h-8 text-wobio-600 animate-pulse" /></div></div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{serviceType === 'TAXI' ? 'Finding your driver' : 'Finding courier'}</h3>
            <div className="bg-wobio-50 dark:bg-wobio-900/20 px-6 py-3 rounded-2xl mb-6 transition-all duration-500"><span className="text-wobio-700 dark:text-wobio-300 font-bold text-lg block">{searchStatusInfo.time}</span><span className="text-wobio-600/70 dark:text-wobio-400/70 text-xs font-semibold uppercase tracking-wide">Estimated Pickup</span></div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium animate-pulse">{searchStatusInfo.text}</p>
            <button onClick={() => setStep('HOME')} className="mt-12 px-8 py-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all">Cancel Request</button>
          </div>
        )}

        {step === 'ON_RIDE' && (
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div><div className="text-sm text-slate-500 dark:text-slate-400 font-medium">{serviceType === 'TAXI' ? (rideStatus === 'ARRIVING' ? 'Driver is on the way' : rideStatus === 'DRIVER_ARRIVED' ? 'Driver is waiting for you' : 'On trip to destination') : 'Courier is on the way'}</div><div className="text-2xl font-bold text-slate-900 dark:text-white">{rideStatus === 'ARRIVING' ? '4 min' : '15 min left'}</div></div>
              <div className="text-right">
                <div className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-300 font-mono">{mockDriver.plate}</div>
                <div className="text-sm font-semibold mt-1 text-slate-900 dark:text-white">
                    <span className="opacity-60 font-normal">{mockDriver.carColor}</span> {mockDriver.carModel}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
              <div className="w-14 h-14 bg-slate-300 rounded-full overflow-hidden border-2 border-white dark:border-slate-600 shadow-sm relative"><img src={mockDriver.image} alt="Driver" className="w-full h-full object-cover" /></div>
              <div className="flex-1"><div className="font-bold text-slate-900 dark:text-white text-lg">{mockDriver.name}</div><div className="flex items-center text-sm text-slate-500 dark:text-slate-400"><Star className="w-3 h-3 text-yellow-400 fill-current mr-1" /> {mockDriver.rating} • {mockDriver.rides} rides</div></div>
              <div className="flex gap-2">
                <button onClick={() => setShowShareModal(true)} className="p-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors" title="Share Live Location"><Share2 className="w-5 h-5" /></button>
                <button onClick={() => setIsChatOpen(true)} className={`p-2.5 rounded-full transition-colors relative ${rideStatus === 'ARRIVING' || rideStatus === 'DRIVER_ARRIVED' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'}`}><MessageCircle className="w-5 h-5" />{(rideStatus === 'ARRIVING' || rideStatus === 'DRIVER_ARRIVED') && <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></div>}</button>
                <button className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors" onClick={() => setCallMode('VOICE')}><Phone className="w-5 h-5" /></button>
                <button className="p-2.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors" onClick={() => setCallMode('VIDEO')}><Video className="w-5 h-5" /></button>
              </div>
            </div>
            <Button variant="outline" fullWidth className="mt-4" onClick={() => setStep('HOME')}>{serviceType === 'TAXI' ? 'Cancel Trip' : 'Cancel Delivery'}</Button>
          </div>
        )}
      </div>
    </div>
  );
};