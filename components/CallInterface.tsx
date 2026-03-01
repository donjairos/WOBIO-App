import React, { useState, useEffect, useRef } from 'react';
import { 
  PhoneOff, Mic, MicOff, Video, VideoOff, 
  Volume2, VolumeX, User, ShieldCheck, Wifi, RefreshCw 
} from 'lucide-react';

interface CallInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'VOICE' | 'VIDEO';
  peerName: string;
  peerImage?: string | null;
  isDriver?: boolean;
}

type CallStatus = 'DIALING' | 'RINGING' | 'CONNECTED' | 'RECONNECTING' | 'ENDED';

export const CallInterface: React.FC<CallInterfaceProps> = ({
  isOpen,
  onClose,
  mode,
  peerName,
  peerImage,
  isDriver = false
}) => {
  const [status, setStatus] = useState<CallStatus>('DIALING');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false); // For Voice
  const [isVideoEnabled, setIsVideoEnabled] = useState(true); // For Video
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  
  const videoSelfRef = useRef<HTMLVideoElement>(null);

  // Initialize Call
  useEffect(() => {
    if (isOpen) {
      setStatus('DIALING');
      setDuration(0);
      
      // Simulate Connection Flow
      const ringTimer = setTimeout(() => setStatus('RINGING'), 1500);
      const connectTimer = setTimeout(() => {
        setStatus('CONNECTED');
        if (mode === 'VIDEO') startCamera();
      }, 4000);

      return () => {
        clearTimeout(ringTimer);
        clearTimeout(connectTimer);
        stopCamera();
      };
    }
  }, [isOpen, mode]);

  // Call Duration Timer
  useEffect(() => {
    let interval: any;
    if (status === 'CONNECTED') {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  // Simulate Network Fluctuation
  useEffect(() => {
    if (status === 'CONNECTED') {
      const random = Math.random();
      if (random > 0.9) {
        const tempStatus = status;
        setStatus('RECONNECTING');
        setTimeout(() => setStatus(tempStatus), 2000);
      }
    }
  }, [duration, status]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (videoSelfRef.current) {
        videoSelfRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Camera access denied or failed", err);
      setIsVideoEnabled(false);
    }
  };

  const stopCamera = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleEndCall = () => {
    setStatus('ENDED');
    stopCamera();
    setTimeout(onClose, 1000);
  };

  if (!isOpen) return null;

  // --- RENDERERS ---

  const renderStatus = () => {
    switch (status) {
      case 'DIALING': return 'Dialing...';
      case 'RINGING': return 'Ringing...';
      case 'CONNECTED': return formatTime(duration);
      case 'RECONNECTING': return 'Reconnecting...';
      case 'ENDED': return 'Call Ended';
    }
  };

  // VIDEO CALL UI
  if (mode === 'VIDEO') {
    return (
      <div className="fixed inset-0 z-[70] bg-black flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Main Video Area (Remote - Simulated with Avatar/Placeholder) */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-slate-900">
           {status === 'CONNECTED' ? (
             <div className="absolute inset-0">
               {/* Simulated Remote Video Feed - In real app, this is WebRTC stream */}
               <div className="w-full h-full flex items-center justify-center bg-slate-800">
                  <div className="text-center animate-pulse">
                    <User className="w-32 h-32 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold">Remote Video Paused</p>
                  </div>
               </div>
             </div>
           ) : (
             <div className="flex flex-col items-center z-10">
               <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center overflow-hidden mb-4 shadow-2xl">
                 {peerImage ? (
                   <img src={peerImage} alt={peerName} className="w-full h-full object-cover" />
                 ) : (
                   <User className="w-10 h-10 text-slate-400" />
                 )}
               </div>
               <h2 className="text-2xl font-bold text-white mb-1">{peerName}</h2>
               <p className="text-slate-400 text-sm font-medium animate-pulse">{renderStatus()}</p>
             </div>
           )}

           {/* Self View (PiP) */}
           {status === 'CONNECTED' && isVideoEnabled && (
             <div className="absolute top-4 right-4 w-28 h-40 bg-black rounded-xl border-2 border-white/20 shadow-2xl overflow-hidden z-20">
               <video ref={videoSelfRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
             </div>
           )}

           {/* Reconnecting Overlay */}
           {status === 'RECONNECTING' && (
             <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-30">
               <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-3 text-white font-bold">
                 <RefreshCw className="w-5 h-5 animate-spin" />
                 Poor Connection
               </div>
             </div>
           )}
        </div>

        {/* Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 pb-12 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex justify-center gap-6 z-40">
           <button 
             onClick={() => setIsMuted(!isMuted)}
             className={`p-4 rounded-full backdrop-blur-md transition-all ${isMuted ? 'bg-white text-black' : 'bg-white/20 text-white hover:bg-white/30'}`}
           >
             {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
           </button>

           <button 
             onClick={handleEndCall}
             className="p-4 rounded-full bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600 transform hover:scale-110 transition-all"
           >
             <PhoneOff className="w-8 h-8" />
           </button>

           <button 
             onClick={() => setIsVideoEnabled(!isVideoEnabled)}
             className={`p-4 rounded-full backdrop-blur-md transition-all ${!isVideoEnabled ? 'bg-white text-black' : 'bg-white/20 text-white hover:bg-white/30'}`}
           >
             {!isVideoEnabled ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
           </button>
        </div>
        
        {/* Secure Badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur px-3 py-1.5 rounded-full z-20">
           <ShieldCheck className="w-4 h-4 text-green-400" />
           <span className="text-[10px] text-white/80 font-medium">End-to-End Encrypted</span>
        </div>
      </div>
    );
  }

  // VOICE CALL UI
  return (
    <div className="fixed inset-0 z-[70] bg-[#1877F2] flex flex-col items-center pt-24 pb-12 animate-in slide-in-from-bottom duration-300">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>

      {/* Peer Info */}
      <div className="relative z-10 flex flex-col items-center flex-1">
        <div className="w-32 h-32 rounded-full bg-white/20 p-1 mb-6 relative">
           {status === 'RINGING' && (
             <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping"></div>
           )}
           <div className="w-full h-full rounded-full bg-slate-200 overflow-hidden relative z-10">
             {peerImage ? (
                <img src={peerImage} alt={peerName} className="w-full h-full object-cover" />
             ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/10">
                   <User className="w-12 h-12 text-white" />
                </div>
             )}
           </div>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-2 text-center px-4">{peerName}</h2>
        <div className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full">
           {status === 'RECONNECTING' ? <Wifi className="w-4 h-4 text-yellow-300 animate-pulse" /> : null}
           <span className="text-wobio-100 font-medium tracking-wide text-lg">
             {renderStatus()}
           </span>
        </div>
        
        <div className="mt-4 flex items-center gap-2 text-white/60 text-xs">
           <ShieldCheck className="w-3 h-3" />
           <span>Number hidden for privacy</span>
        </div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-sm px-8 grid grid-cols-3 gap-6 items-center z-10">
         <div className="flex flex-col items-center gap-2">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-white text-wobio-600' : 'bg-white/20 text-white hover:bg-white/30'}`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            <span className="text-xs text-wobio-100">Mute</span>
         </div>

         <div className="flex flex-col items-center">
            <button 
              onClick={handleEndCall}
              className="w-20 h-20 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/40 hover:bg-red-600 active:scale-95 transition-all"
            >
              <PhoneOff className="w-8 h-8" />
            </button>
            <span className="text-xs text-wobio-100 mt-2 font-bold">End</span>
         </div>

         <div className="flex flex-col items-center gap-2">
            <button 
              onClick={() => setIsSpeaker(!isSpeaker)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isSpeaker ? 'bg-white text-wobio-600' : 'bg-white/20 text-white hover:bg-white/30'}`}
            >
              {isSpeaker ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </button>
            <span className="text-xs text-wobio-100">Speaker</span>
         </div>
      </div>
    </div>
  );
};