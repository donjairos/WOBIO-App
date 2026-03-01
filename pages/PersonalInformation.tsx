import React, { useRef, useState, useEffect } from 'react';
import { 
  ArrowLeft, CheckCircle2, AlertCircle, Shield, Camera, User, 
  ChevronRight, FileText, Check, Upload, ScanFace,
  CreditCard, Smartphone, Eye, Smile, RefreshCw, Lock, Car, Users, UserPlus, Image as ImageIcon,
  Loader2, Sparkles, ShieldCheck, UserCheck, UserPlus as UserPlusIcon
} from 'lucide-react';
import { Button } from '../components/Button';
import { UserProfile, VehicleDetails, DriverDocuments, VerificationStatus, AssignedDriverInfo } from '../types';

interface PersonalInfoProps {
  onBack: () => void;
  isMandatory?: boolean;
  isDriverOnboarding?: boolean;
  onComplete?: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (data: Partial<UserProfile>) => void;
}

type OnboardingStep = 'PERSONAL' | 'VEHICLE' | 'OWNERSHIP_TYPE' | 'DRIVER_INFO' | 'DOCUMENTS' | 'ID_UPLOAD' | 'KYC_SELFIE' | 'SUBMITTED';
type LivenessAction = 'CENTER' | 'BLINK' | 'TURN_LEFT' | 'TURN_RIGHT' | 'SMILE' | 'MATCHING' | 'SUCCESS';

export const PersonalInformation: React.FC<PersonalInfoProps> = ({ 
  onBack, 
  isMandatory = false,
  isDriverOnboarding = false,
  onComplete,
  userProfile,
  onUpdateProfile
}) => {
  const [step, setStep] = useState<OnboardingStep>('PERSONAL');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  // Liveness check state for Riders
  const [livenessAction, setLivenessAction] = useState<LivenessAction>('CENTER');

  // Driver Specific State
  const [vehicle, setVehicle] = useState<VehicleDetails>(userProfile.driverDetails?.vehicle || {
    type: 'Sedan', make: '', model: '', year: '', color: '', plateNumber: '', seats: 4
  });
  const [docs, setDocs] = useState<DriverDocuments>(userProfile.driverDetails?.documents || {
    vehicleRegistration: null, vehicleInsurance: null, driverLicense: null, nationalId: null
  });

  const [isOwnerDriven, setIsOwnerDriven] = useState<boolean>(userProfile.isOwnerDriven ?? true);
  const [assignedDriver, setAssignedDriver] = useState<Partial<AssignedDriverInfo>>(userProfile.assignedDriver || {
    firstName: '', lastName: '', phoneNumber: '', verificationStatus: 'UNVERIFIED'
  });

  // Common/Rider State
  const [idFront, setIdFront] = useState<string | null>(userProfile.idImageFront);
  const [selfie, setSelfie] = useState<string | null>(userProfile.selfieImage);
  const [holdingIdSelfie, setHoldingIdSelfie] = useState<string | null>(userProfile.driverDetails?.holdingIdSelfie || null);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Liveness simulation logic
  useEffect(() => {
    if (!isDriverOnboarding && step === 'KYC_SELFIE' && cameraStream && livenessAction !== 'MATCHING' && livenessAction !== 'SUCCESS') {
      const timer = setTimeout(() => {
        if (livenessAction === 'CENTER') setLivenessAction('BLINK');
        else if (livenessAction === 'BLINK') setLivenessAction('TURN_LEFT');
        else if (livenessAction === 'TURN_LEFT') setLivenessAction('TURN_RIGHT');
        else if (livenessAction === 'TURN_RIGHT') setLivenessAction('SMILE');
        else if (livenessAction === 'SMILE') {
          captureSelfie();
          setLivenessAction('MATCHING');
        }
      }, 1500); // Shortened from 2500
      return () => clearTimeout(timer);
    }
  }, [livenessAction, step, cameraStream]);

  // Matching animation logic
  useEffect(() => {
    if (livenessAction === 'MATCHING') {
      const timer = setTimeout(() => {
        setLivenessAction('SUCCESS');
      }, 2000); // Shortened from 3500
      return () => clearTimeout(timer);
    }
  }, [livenessAction]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      setCameraStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Camera access is required for identity verification.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const captureSelfie = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      // Ensure video is ready
      if (video.readyState < 2) return; 

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Flip horizontally for selfie
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0);
      }
      const imageUrl = canvas.toDataURL('image/jpeg');
      
      if (isDriverOnboarding && step === 'KYC_SELFIE') {
        setHoldingIdSelfie(imageUrl);
        stopCamera();
      } else {
        setSelfie(imageUrl);
      }
    }
  };

  const handleDocUpload = (field: keyof DriverDocuments) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setDocs(prev => ({ ...prev, [field]: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleIdUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setIdFront(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateProfile({ profileImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStepComplete = () => {
    if (isDriverOnboarding) {
      if (step === 'PERSONAL') setStep('VEHICLE');
      else if (step === 'VEHICLE') setStep('OWNERSHIP_TYPE');
      else if (step === 'OWNERSHIP_TYPE') {
        if (isOwnerDriven) setStep('DOCUMENTS');
        else setStep('DRIVER_INFO');
      }
      else if (step === 'DRIVER_INFO') setStep('DOCUMENTS');
      else if (step === 'DOCUMENTS') setStep('KYC_SELFIE');
      else if (step === 'KYC_SELFIE') handleFinalSubmit();
    } else {
      if (step === 'PERSONAL') setStep('ID_UPLOAD');
      else if (step === 'ID_UPLOAD') setStep('KYC_SELFIE');
      else if (step === 'KYC_SELFIE') handleFinalSubmit();
    }
  };

  const handleFinalSubmit = () => {
    stopCamera();
    if (isDriverOnboarding) {
      onUpdateProfile({
        driverVerificationStatus: 'APPROVED',
        isVehicleOwner: true,
        isOwnerDriven: isOwnerDriven,
        assignedDriver: isOwnerDriven ? undefined : (assignedDriver as AssignedDriverInfo),
        driverDetails: {
          vehicle,
          documents: docs,
          holdingIdSelfie
        }
      });
    } else {
      onUpdateProfile({
        riderVerificationStatus: 'APPROVED',
        idVerified: true,
        idImageFront: idFront,
        selfieImage: selfie,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email
      });
    }
    setStep('SUBMITTED');
  };

  const renderProgressBar = () => {
    const steps: OnboardingStep[] = isDriverOnboarding 
      ? ['PERSONAL', 'VEHICLE', 'OWNERSHIP_TYPE', 'DOCUMENTS', 'KYC_SELFIE']
      : ['PERSONAL', 'ID_UPLOAD', 'KYC_SELFIE'];
    
    const currentIdx = steps.indexOf(step);
    if (currentIdx === -1) return null;

    return (
      <div className="flex gap-1.5 px-6 mb-8">
        {steps.map((s, idx) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${idx <= currentIdx ? 'bg-wobio-500 shadow-[0_0_8px_rgba(24,119,242,0.4)]' : 'bg-slate-200 dark:bg-slate-800'}`} />
        ))}
      </div>
    );
  };

  const renderLivenessPrompt = () => {
    const prompts = {
      CENTER: { title: "Center Your Face", sub: "Position your face in the oval", icon: ScanFace },
      BLINK: { title: "Blink Slow", sub: "Checking for liveness", icon: Eye },
      TURN_LEFT: { title: "Turn Left", sub: "Rotate your head slightly", icon: RefreshCw },
      TURN_RIGHT: { title: "Turn Right", sub: "Rotate your head the other way", icon: RefreshCw },
      SMILE: { title: "Smile Big!", sub: "Almost done...", icon: Smile },
      MATCHING: { title: "Analyzing Identity", sub: "Matching with ID document", icon: Loader2 },
      SUCCESS: { title: "Verification Complete", sub: "Identity confirmed", icon: ShieldCheck },
    };

    const current = prompts[livenessAction];
    const Icon = current.icon;

    return (
      <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-wobio-100 dark:bg-wobio-900/30 text-wobio-600 ${livenessAction === 'MATCHING' ? 'animate-spin' : ''}`}>
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{current.title}</h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{current.sub}</p>
      </div>
    );
  };

  const renderStep = () => {
    switch(step) {
      case 'PERSONAL':
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
             <div className="text-center mb-8">
                <div 
                  onClick={() => profileInputRef.current?.click()}
                  className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[32px] flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-300 dark:border-slate-700 shadow-inner relative group cursor-pointer overflow-hidden"
                >
                    {userProfile.profileImage ? (
                      <img src={userProfile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-wobio-600" />
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                    <input type="file" ref={profileInputRef} onChange={handleProfileImageUpload} accept="image/*" className="hidden" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Basic Profile</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    Your display name and contact info
                </p>
             </div>
             <div className="bg-white dark:bg-slate-900 rounded-[32px] p-2 shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 p-4">
                   <User className="w-4 h-4 text-slate-300" />
                   <input type="text" value={userProfile.firstName} onChange={(e) => onUpdateProfile({ firstName: e.target.value })} placeholder="First Name *" className="w-full bg-transparent text-sm font-bold text-slate-900 dark:text-white outline-none" />
                </div>
                <div className="h-px bg-slate-50 dark:bg-slate-800 mx-4"></div>
                <div className="flex items-center gap-3 p-4">
                   <div className="w-4 h-4" />
                   <input type="text" value={userProfile.lastName} onChange={(e) => onUpdateProfile({ lastName: e.target.value })} placeholder="Last Name *" className="w-full bg-transparent text-sm font-bold text-slate-900 dark:text-white outline-none" />
                </div>
                <div className="h-px bg-slate-50 dark:bg-slate-800 mx-4"></div>
                <div className="flex items-center gap-3 p-4">
                   <FileText className="w-4 h-4 text-slate-300" />
                   <input type="email" value={userProfile.email} onChange={(e) => onUpdateProfile({ email: e.target.value })} placeholder="Email Address *" className="w-full bg-transparent text-sm font-bold text-slate-900 dark:text-white outline-none" />
                </div>
             </div>
             <Button fullWidth size="lg" onClick={handleStepComplete} disabled={!userProfile.firstName || !userProfile.lastName || !userProfile.email} className="py-4 font-black uppercase tracking-widest text-xs">
                 {isDriverOnboarding ? "Next: Vehicle Details" : "Next: Identity Verification"}
             </Button>
          </div>
        );

      case 'ID_UPLOAD':
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
             <div className="text-center mb-8">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-[28px] flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-slate-700 shadow-inner">
                    <Shield className="w-10 h-10 text-wobio-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Identity Document</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Upload your Zimbabwean ID or Passport</p>
             </div>
             
             <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                <button 
                  onClick={handleIdUpload}
                  className={`w-full aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all
                    ${idFront ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-slate-200 dark:border-slate-800 hover:border-wobio-500'}`}
                >
                  {idFront ? (
                    <img src={idFront} className="w-full h-full object-cover rounded-xl" alt="ID Front" />
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-slate-300" />
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tap to upload ID Front</span>
                    </>
                  )}
                </button>
                <div className="mt-4 flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-blue-700 dark:text-blue-300 font-bold leading-relaxed uppercase">
                    Ensure all text is readable and your photo is clearly visible.
                  </p>
                </div>
             </div>

             <div className="space-y-3">
               <Button fullWidth size="lg" onClick={handleStepComplete} disabled={!idFront} className="py-4 font-black uppercase tracking-widest text-xs">
                   Continue to Face Match
               </Button>
               <button 
                 onClick={() => {
                   setIdFront("https://picsum.photos/seed/id/400/250");
                   // We need to wait for state update or just call handleStepComplete with a slight delay if needed, 
                   // but handleStepComplete uses idFront state which might be stale.
                   // Actually handleStepComplete doesn't check idFront, it just advances step.
                   handleStepComplete();
                 }}
                 className="w-full py-3 text-[10px] font-black text-slate-400 hover:text-wobio-600 uppercase tracking-[0.2em] transition-colors"
               >
                 Skip ID Upload (Debug)
               </button>
             </div>
          </div>
        );

      case 'VEHICLE':
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
             <div className="text-center mb-8">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-[28px] flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-slate-700 shadow-inner">
                    <Car className="w-10 h-10 text-wobio-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Vehicle Specs</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Tell us about your Zimbabwean registered car</p>
             </div>
             <div className="bg-white dark:bg-slate-900 rounded-[32px] p-2 shadow-sm border border-slate-100 dark:border-slate-800 space-y-1">
                <div className="grid grid-cols-2">
                   <input type="text" value={vehicle.make} onChange={e => setVehicle({...vehicle, make: e.target.value})} placeholder="Make (e.g. Honda) *" className="p-4 bg-transparent text-sm font-bold border-r border-slate-50 dark:border-slate-800 outline-none" />
                   <input type="text" value={vehicle.model} onChange={e => setVehicle({...vehicle, model: e.target.value})} placeholder="Model (e.g. Fit) *" className="p-4 bg-transparent text-sm font-bold outline-none" />
                </div>
                <div className="h-px bg-slate-50 dark:bg-slate-800 mx-4"></div>
                <div className="grid grid-cols-2">
                   <input type="text" value={vehicle.year} onChange={e => setVehicle({...vehicle, year: e.target.value})} placeholder="Year (e.g. 2018) *" className="p-4 bg-transparent text-sm font-bold border-r border-slate-50 dark:border-slate-800 outline-none" />
                   <input type="text" value={vehicle.color} onChange={e => setVehicle({...vehicle, color: e.target.value})} placeholder="Color *" className="p-4 bg-transparent text-sm font-bold outline-none" />
                </div>
                <div className="h-px bg-slate-50 dark:bg-slate-800 mx-4"></div>
                <input type="text" value={vehicle.plateNumber} onChange={e => setVehicle({...vehicle, plateNumber: e.target.value.toUpperCase()})} placeholder="License Plate (e.g. AGE 1234) *" className="w-full p-4 bg-transparent text-sm font-black uppercase tracking-widest outline-none" />
                <div className="h-px bg-slate-50 dark:bg-slate-800 mx-4"></div>
                <div className="flex items-center justify-between p-4">
                   <span className="text-sm font-bold text-slate-400 uppercase tracking-tight">Passenger Seats</span>
                   <div className="flex items-center gap-4">
                      <button onClick={() => setVehicle({...vehicle, seats: Math.max(1, vehicle.seats-1)})} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold">-</button>
                      <span className="font-black w-4 text-center">{vehicle.seats}</span>
                      <button onClick={() => setVehicle({...vehicle, seats: Math.min(8, vehicle.seats+1)})} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold">+</button>
                   </div>
                </div>
             </div>
             <Button fullWidth size="lg" onClick={handleStepComplete} disabled={!vehicle.make || !vehicle.plateNumber} className="py-4 font-black uppercase tracking-widest text-xs">Next: Setup Driver</Button>
          </div>
        );

      case 'OWNERSHIP_TYPE':
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
             <div className="text-center mb-8">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-[28px] flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-slate-700 shadow-inner">
                    <UserCheck className="w-10 h-10 text-wobio-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Who will drive?</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Select the operational structure for this car</p>
             </div>
             
             <div className="space-y-4">
                <button 
                   onClick={() => setIsOwnerDriven(true)}
                   className={`w-full flex items-center gap-5 p-6 rounded-[32px] border-2 transition-all text-left ${isOwnerDriven ? 'bg-wobio-50 dark:bg-wobio-900/20 border-wobio-500 shadow-md' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm'}`}
                >
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isOwnerDriven ? 'bg-wobio-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      <User className="w-7 h-7" />
                   </div>
                   <div className="flex-1">
                      <div className={`font-black uppercase text-sm ${isOwnerDriven ? 'text-wobio-700 dark:text-wobio-300' : 'text-slate-900 dark:text-white'}`}>I am the Driver</div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">Owner-driven vehicle for personal earning</p>
                   </div>
                   {isOwnerDriven && <CheckCircle2 className="w-6 h-6 text-wobio-600" />}
                </button>

                <button 
                   onClick={() => setIsOwnerDriven(false)}
                   className={`w-full flex items-center gap-5 p-6 rounded-[32px] border-2 transition-all text-left ${!isOwnerDriven ? 'bg-wobio-50 dark:bg-wobio-900/20 border-wobio-500 shadow-md' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm'}`}
                >
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${!isOwnerDriven ? 'bg-wobio-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      <UserPlusIcon className="w-7 h-7" />
                   </div>
                   <div className="flex-1">
                      <div className={`font-black uppercase text-sm ${!isOwnerDriven ? 'text-wobio-700 dark:text-wobio-300' : 'text-slate-900 dark:text-white'}`}>Another Person</div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">Assign a full-time driver while I manage the earnings</p>
                   </div>
                   {!isOwnerDriven && <CheckCircle2 className="w-6 h-6 text-wobio-600" />}
                </button>
             </div>

             <Button fullWidth size="lg" onClick={handleStepComplete} className="py-4 font-black uppercase tracking-widest text-xs">
                {isOwnerDriven ? "Proceed to Documents" : "Enter Driver Details"}
             </Button>
          </div>
        );

      case 'DRIVER_INFO':
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
             <div className="text-center mb-8">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-[28px] flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-slate-700 shadow-inner">
                    <UserPlusIcon className="w-10 h-10 text-wobio-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Driver Details</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Register the person who will drive your car</p>
             </div>

             <div className="bg-white dark:bg-slate-900 rounded-[32px] p-2 shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 p-4">
                   <User className="w-4 h-4 text-slate-300" />
                   <input type="text" value={assignedDriver.firstName} onChange={(e) => setAssignedDriver({...assignedDriver, firstName: e.target.value})} placeholder="Driver's First Name *" className="w-full bg-transparent text-sm font-bold text-slate-900 dark:text-white outline-none" />
                </div>
                <div className="h-px bg-slate-50 dark:bg-slate-800 mx-4"></div>
                <div className="flex items-center gap-3 p-4">
                   <div className="w-4 h-4" />
                   <input type="text" value={assignedDriver.lastName} onChange={(e) => setAssignedDriver({...assignedDriver, lastName: e.target.value})} placeholder="Driver's Last Name *" className="w-full bg-transparent text-sm font-bold text-slate-900 dark:text-white outline-none" />
                </div>
                <div className="h-px bg-slate-50 dark:bg-slate-800 mx-4"></div>
                <div className="flex items-center gap-3 p-4">
                   <Smartphone className="w-4 h-4 text-slate-300" />
                   <input type="tel" value={assignedDriver.phoneNumber} onChange={(e) => setAssignedDriver({...assignedDriver, phoneNumber: e.target.value})} placeholder="Driver's Phone (+263) *" className="w-full bg-transparent text-sm font-bold text-slate-900 dark:text-white outline-none" />
                </div>
             </div>

             <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border border-yellow-100 dark:border-yellow-800 flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-yellow-700 dark:text-yellow-300 font-bold leading-relaxed uppercase">
                   The assigned driver will be invited to complete their own identity verification before the car can go online.
                </p>
             </div>

             <Button fullWidth size="lg" onClick={handleStepComplete} disabled={!assignedDriver.firstName || !assignedDriver.phoneNumber} className="py-4 font-black uppercase tracking-widest text-xs">
                Continue to Paperwork
             </Button>
          </div>
        );

      case 'DOCUMENTS':
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
             <div className="text-center mb-8">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-[28px] flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-slate-700 shadow-inner">
                    <FileText className="w-10 h-10 text-wobio-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Required Documents</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Clear photos of your legal paperwork</p>
             </div>
             <div className="space-y-3">
                <DocItem label="Registration Book" sub="ZINARA / CVR Blue Book" isUploaded={!!docs.vehicleRegistration} onClick={() => handleDocUpload('vehicleRegistration')} />
                <DocItem label="Vehicle Insurance" sub="Valid Disk / Policy" isUploaded={!!docs.vehicleInsurance} onClick={() => handleDocUpload('vehicleInsurance')} />
                <DocItem label="Driver's License" sub="VID Zimbabwe Plastic Card" isUploaded={!!docs.driverLicense} onClick={() => handleDocUpload('driverLicense')} />
                <DocItem label="National Identity" sub=" Zimbabwean ID or Passport" isUploaded={!!docs.nationalId} onClick={() => handleDocUpload('nationalId')} />
             </div>
             <Button fullWidth size="lg" onClick={handleStepComplete} disabled={Object.values(docs).some(d => !d)} className="py-4 font-black uppercase tracking-widest text-xs">Proceed to Verification</Button>
          </div>
        );

      case 'KYC_SELFIE':
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300 flex flex-col items-center">
             {!isDriverOnboarding && renderLivenessPrompt()}
             {isDriverOnboarding && (
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Liveness Check</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 leading-relaxed text-center px-4">
                    Hold your Driver's License next to your face. Ensure both are clearly visible.
                  </p>
                </div>
             )}

             {/* Camera View */}
             {(cameraStream && !(isDriverOnboarding ? holdingIdSelfie : (livenessAction === 'SUCCESS'))) ? (
               <div className="w-full max-w-sm aspect-[3/4] bg-black rounded-[40px] overflow-hidden relative border-4 border-wobio-500 shadow-2xl">
                  <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" />
                  
                  {/* Biometric Overlay */}
                  <div className="absolute inset-0 border-[40px] border-black/30 pointer-events-none rounded-[36px]"></div>
                  
                  {/* Oval Frame */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 border-2 border-dashed border-white/50 rounded-full flex items-center justify-center">
                     {!isDriverOnboarding && livenessAction !== 'MATCHING' && (
                        <div className={`w-full h-full rounded-full transition-colors duration-500 ${['BLINK', 'TURN_LEFT', 'TURN_RIGHT', 'SMILE'].includes(livenessAction) ? 'bg-green-500/10 border-green-500/50' : 'bg-wobio-500/10'}`}></div>
                     )}
                     {!isDriverOnboarding && livenessAction === 'MATCHING' && (
                        <div className="absolute inset-0 overflow-hidden rounded-full">
                           <div className="w-full h-1 bg-wobio-400 shadow-[0_0_15px_#1877F2] absolute animate-[scan_2s_linear_infinite]"></div>
                        </div>
                     )}
                  </div>

                  {/* Liveness Check Marks */}
                  {!isDriverOnboarding && (
                    <div className="absolute top-8 left-0 right-0 flex justify-center gap-2">
                       {['BLINK', 'TURN_LEFT', 'TURN_RIGHT', 'SMILE'].map((action, i) => (
                          <div key={i} className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                            (['BLINK', 'TURN_LEFT', 'TURN_RIGHT', 'SMILE'].indexOf(livenessAction) > i || livenessAction === 'MATCHING') ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-white/30'
                          }`}></div>
                       ))}
                    </div>
                  )}

                  {/* Capture Button (Only for Driver - Rider is automated) */}
                  {isDriverOnboarding && (
                    <button onClick={captureSelfie} className="absolute bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-wobio-500 flex items-center justify-center active:scale-90 transition-transform">
                       <Camera className="w-8 h-8 text-wobio-600" />
                    </button>
                  )}
               </div>
             ) : (isDriverOnboarding ? holdingIdSelfie : (livenessAction === 'SUCCESS')) ? (
               <div className="w-full max-w-sm space-y-6">
                  <div className="aspect-[3/4] rounded-[40px] overflow-hidden relative shadow-2xl border-4 border-green-500 animate-in zoom-in duration-500">
                     <img src={(isDriverOnboarding ? holdingIdSelfie : selfie) || ''} alt="KYC Verification" className="w-full h-full object-cover" />
                     {!isDriverOnboarding && (
                        <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center">
                           <div className="bg-green-500 text-white p-4 rounded-full shadow-lg">
                              <ShieldCheck className="w-12 h-12" />
                           </div>
                        </div>
                     )}
                     {isDriverOnboarding && (
                        <button onClick={() => { setHoldingIdSelfie(null); startCamera(); }} className="absolute top-4 right-4 bg-black/50 p-3 rounded-2xl text-white backdrop-blur-md">
                           <RefreshCw className="w-6 h-6" />
                        </button>
                     )}
                  </div>
                  <Button fullWidth size="lg" onClick={handleStepComplete} className="py-4 font-black uppercase tracking-widest text-xs">
                    {isDriverOnboarding ? "Submit Application" : "Confirm & Proceed"}
                  </Button>
               </div>
             ) : (
               <div className="w-full flex flex-col items-center gap-8 py-10">
                  <div className="w-48 h-48 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center shadow-inner relative overflow-hidden">
                     <ScanFace className="w-20 h-20 text-wobio-500 animate-pulse" />
                     {!isDriverOnboarding && (
                        <div className="absolute inset-0 border-2 border-dashed border-wobio-500/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
                     )}
                  </div>
                  <div className="text-center max-w-xs">
                     <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                        {isDriverOnboarding 
                           ? "Hold your ID card next to your face for a quick verification photo."
                           : "We need a quick live scan to confirm your identity. This prevents fraud and keeps WOBIO safe for everyone."}
                     </p>
                     <div className="space-y-3">
                        <Button fullWidth size="lg" onClick={startCamera}>Open Secure Camera</Button>
                        <button 
                          onClick={() => {
                            if (!isDriverOnboarding) {
                              setSelfie("https://picsum.photos/seed/face/400/600");
                              setLivenessAction('SUCCESS');
                            } else {
                              setHoldingIdSelfie("https://picsum.photos/seed/driver/400/600");
                            }
                          }}
                          className="w-full py-3 text-[10px] font-black text-slate-400 hover:text-wobio-600 uppercase tracking-[0.2em] transition-colors"
                        >
                          Skip Verification (Debug)
                        </button>
                     </div>
                  </div>
               </div>
             )}

             <style>{`
               @keyframes scan {
                  0% { top: 0; }
                  100% { top: 100%; }
               }
             `}</style>
          </div>
        );

      case 'SUBMITTED':
        return (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-in zoom-in duration-500">
             <div className="w-32 h-32 bg-green-100 dark:bg-green-900/30 rounded-[40px] flex items-center justify-center mb-8 relative">
                <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-400" />
                <div className="absolute inset-0 border-4 border-green-200 dark:border-green-800 rounded-[40px] animate-ping opacity-20"></div>
             </div>
             <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tighter">Verification Successful</h2>
             <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-10 text-sm font-medium leading-relaxed">
                {isDriverOnboarding 
                  ? (isOwnerDriven 
                      ? "Your driver partner profile and Zimbabwean compliance documents have been verified. You can now start earning!"
                      : `Vehicle registered successfully. An invitation has been sent to ${assignedDriver.firstName}. Once they complete their face scan, the car will go live!`)
                  : "Your identity has been verified. You can now book rides with WOBIO with full security features enabled and your verification badge is active."}
             </p>
             <div className="w-full flex flex-col gap-4">
                <Button fullWidth onClick={onComplete || onBack} className="py-4 font-black tracking-widest uppercase text-xs">
                  {isDriverOnboarding ? (isOwnerDriven ? "Start Earning" : "Return to Hub") : "Start Booking Rides"}
                </Button>
                {!isDriverOnboarding && (
                  <div className="flex items-center justify-center gap-2 text-wobio-600 dark:text-wobio-400 bg-wobio-50 dark:bg-wobio-900/20 py-3 px-4 rounded-2xl">
                     <ShieldCheck className="w-5 h-5" />
                     <span className="text-[10px] font-black uppercase tracking-wider">Trusted Profile Badge Active</span>
                  </div>
                )}
             </div>
          </div>
        );
    }
  };

  const DocItem = ({ label, sub, isUploaded, onClick }: any) => (
    <button onClick={onClick} className={`w-full flex items-center gap-4 p-5 rounded-[28px] border-2 transition-all active:scale-[0.98] ${isUploaded ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm'}`}>
       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isUploaded ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
          {isUploaded ? <Check className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
       </div>
       <div className="flex-1 text-left">
          <div className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-tight">{label}</div>
          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{sub}</div>
       </div>
       {!isUploaded && <div className="text-[9px] font-black text-wobio-600 uppercase tracking-widest flex items-center gap-1">Upload <ChevronRight className="w-3 h-3" /></div>}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#F2F4F7] dark:bg-slate-950 flex flex-col h-full w-full transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 px-4 py-4 flex items-center shadow-sm z-20 sticky top-0 border-b border-slate-100 dark:border-slate-800">
          <button onClick={() => { 
              if(step === 'PERSONAL') onBack(); 
              else if (step === 'VEHICLE') setStep('PERSONAL');
              else if (step === 'OWNERSHIP_TYPE') setStep('VEHICLE');
              else if (step === 'DRIVER_INFO') setStep('OWNERSHIP_TYPE');
              else if (step === 'DOCUMENTS') setStep(isOwnerDriven ? 'OWNERSHIP_TYPE' : 'DRIVER_INFO');
              else if (step === 'ID_UPLOAD') setStep('PERSONAL');
              else if (step === 'KYC_SELFIE') setStep(isDriverOnboarding ? 'DOCUMENTS' : 'ID_UPLOAD');
          }} className="p-2 -ml-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="ml-2 text-lg font-black text-slate-900 dark:text-white flex-1 uppercase tracking-tight">
              {isDriverOnboarding ? "Driver Partner Setup" : "Identity Safety Hub"}
          </h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4 pt-6 pb-24">
        {renderProgressBar()}
        {renderStep()}
      </div>
    </div>
  );
};