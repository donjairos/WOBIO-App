import React, { useState, useEffect } from 'react';
import { Auth } from './pages/Auth';
import { RiderApp } from './pages/RiderApp';
import { DriverApp } from './pages/DriverApp';
import { AdminDashboard } from './pages/AdminDashboard';
import { PersonalInformation } from './pages/PersonalInformation';
import { ProfilePage } from './pages/ProfilePage';
import { OtpVerification } from './pages/OtpVerification';
import { WobioAssistant } from './components/WobioAssistant';
import { UserRole, UserProfile } from './types';
import { ThemeProvider } from './contexts/ThemeContext';
import { WobioLogo } from './components/WobioLogo';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-wobio-500">
      <style>{`
        @keyframes logo-enter {
          0% { opacity: 0; transform: scale(0.5); }
          100% { opacity: 1; transform: scale(1.5); }
        }
        @keyframes text-enter {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-logo {
          animation: logo-enter 1s ease-out forwards;
        }
        .animate-text {
          opacity: 0; /* Hidden initially */
          animation: text-enter 1s ease-out 300ms forwards;
        }
      `}</style>
      <div className="flex flex-col items-center justify-center">
        <div className="mb-8 drop-shadow-2xl animate-logo">
           <WobioLogo className="w-48 h-48" />
        </div>
        <h1 className="text-6xl font-black text-white tracking-wider drop-shadow-lg font-sans animate-text">
          WOBIO
        </h1>
      </div>
    </div>
  );
};

type ViewState = 'SPLASH' | 'AUTH' | 'OTP' | 'RIDER' | 'DRIVER' | 'ADMIN' | 'PROFILE' | 'PERSONAL_INFO';

export interface TripInvoice {
  tripId: string;
  distance: string;
  duration: string;
  baseFare: number;
  discount: number;
  tax: number;
  insuranceFee?: number;
  total: number;
  paymentMethod: string;
}

function AppContent() {
  const [view, setView] = useState<ViewState>('SPLASH');
  const [role, setRole] = useState<UserRole>('RIDER');
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    profileImage: null,
    emailVerified: false,
    
    riderVerificationStatus: 'UNVERIFIED',
    driverVerificationStatus: 'UNVERIFIED',

    idType: "National ID",
    idNumber: "",
    idImageFront: null,
    idImageBack: null,
    selfieImage: null,
    idVerified: false,

    preferredPaymentType: 'CASH',
    selectedWalletName: 'Ecocash',
    selectedCardLast4: '4242',

    emergencyContacts: [],

    isVehicleOwner: false,
    isOwnerDriven: true,
    walletBalance: 1240.50,
    payoutMethod: "Ecocash (Owner)",

    driverDetails: {
      vehicle: { type: 'Sedan', make: '', model: '', year: '', color: '', plateNumber: '', seats: 4 },
      documents: { vehicleRegistration: null, vehicleInsurance: null, driverLicense: null, nationalId: null },
      holdingIdSelfie: null
    }
  });

  const [authData, setAuthData] = useState<{ phoneNumber: string, isSignup: boolean } | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  const [isTripRecording, setIsTripRecording] = useState(false);
  const [isTripFinished, setIsTripFinished] = useState(false);
  const [isInsuranceSelected, setIsInsuranceSelected] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<TripInvoice | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setView('AUTH');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleRequestOtp = (phoneNumber: string, isSignup: boolean, role: UserRole, password?: string) => {
    setAuthData({ phoneNumber, isSignup });
    setRole(role);
    setView('OTP');
    setAuthMessage(null);
  };

  const handleVerifyOtp = (otp: string) => {
    setTimeout(() => {
       if (authData?.isSignup) {
         setView('AUTH');
         setAuthMessage("Account created successfully. Please log in to continue.");
       } else {
         setUserProfile(prev => ({ ...prev, phoneNumber: authData?.phoneNumber || '' }));
         if (role === 'ADMIN') {
           setView('ADMIN');
         } else {
           if (userProfile.firstName && userProfile.lastName) {
             if (role === 'DRIVER' && userProfile.driverVerificationStatus === 'UNVERIFIED') {
                setView('PERSONAL_INFO');
             } else {
                setView(role === 'DRIVER' ? 'DRIVER' : 'RIDER');
             }
           } else {
             setView('PERSONAL_INFO');
           }
         }
       }
    }, 1000);
  };

  const handleLogout = () => {
    setRole('RIDER');
    setView('AUTH');
    setAuthMessage(null);
    setIsTripRecording(false);
    setIsTripFinished(false);
    setActiveInvoice(null);
    setUserProfile({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      profileImage: null,
      emailVerified: false,
      riderVerificationStatus: 'UNVERIFIED',
      driverVerificationStatus: 'UNVERIFIED',
      idType: "National ID",
      idNumber: "",
      idImageFront: null,
      idImageBack: null,
      selfieImage: null,
      idVerified: false,
      preferredPaymentType: 'CASH',
      selectedWalletName: 'Ecocash',
      selectedCardLast4: '4242',
      emergencyContacts: [],
      isVehicleOwner: false,
      isOwnerDriven: true,
      walletBalance: 0,
      payoutMethod: "Ecocash (Owner)",
      driverDetails: {
        vehicle: { type: 'Sedan', make: '', model: '', year: '', color: '', plateNumber: '', seats: 4 },
        documents: { vehicleRegistration: null, vehicleInsurance: null, driverLicense: null, nationalId: null },
        holdingIdSelfie: null
      }
    });
  };

  const handleSwitchRole = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'DRIVER') {
      if (userProfile.driverVerificationStatus === 'APPROVED') {
        setView('DRIVER');
      } else {
        setView('PERSONAL_INFO');
      }
    } else {
      setView('RIDER');
    }
  };

  const handleProfileUpdate = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
  };

  const renderContent = () => {
    switch (view) {
      case 'SPLASH':
        return <SplashScreen />;
      case 'AUTH':
        return <Auth onRequestOtp={handleRequestOtp} initialMessage={authMessage} />;
      case 'OTP':
        return <OtpVerification phoneNumber={authData?.phoneNumber || ''} isSignup={authData?.isSignup || false} onBack={() => setView('AUTH')} onVerify={handleVerifyOtp} isLoading={false} />;
      case 'ADMIN':
        return <AdminDashboard />;
      case 'RIDER':
        return <RiderApp onProfileClick={() => setView('PROFILE')} userProfile={userProfile} onUpdateProfile={handleProfileUpdate} isTripRecording={isTripRecording} isTripFinished={isTripFinished} setIsTripFinished={setIsTripFinished} invoice={activeInvoice} isInsuranceSelected={isInsuranceSelected} setIsInsuranceSelected={setIsInsuranceSelected} />;
      case 'DRIVER':
        return <DriverApp userProfile={userProfile} onNavigateToVerification={() => setView('PERSONAL_INFO')} onProfileClick={() => setView('PROFILE')} onLogout={handleLogout} onSwitchToRider={() => handleSwitchRole('RIDER')} isTripRecording={isTripRecording} setIsTripRecording={setIsTripRecording} isTripFinished={isTripFinished} setIsTripFinished={setIsTripFinished} invoice={activeInvoice} setInvoice={setActiveInvoice} isInsuranceSelected={isInsuranceSelected} />;
      case 'PROFILE':
        return <ProfilePage onBack={() => setView(role === 'DRIVER' ? 'DRIVER' : 'RIDER')} onNavigateToPersonalInfo={() => setView('PERSONAL_INFO')} onSwitchRole={handleSwitchRole} currentRole={role} onLogout={handleLogout} userProfile={userProfile} onUpdateProfile={handleProfileUpdate} />;
      case 'PERSONAL_INFO':
        // Determine if we are doing driver verification specifically
        const isDriverFlow = role === 'DRIVER' && userProfile.driverVerificationStatus !== 'APPROVED';
        return (
          <PersonalInformation 
            onBack={() => {
                if (userProfile.firstName && userProfile.lastName) {
                    setView(role === 'DRIVER' ? (userProfile.driverVerificationStatus === 'APPROVED' ? 'DRIVER' : 'PROFILE') : 'PROFILE');
                } else {
                    handleLogout();
                }
            }}
            isMandatory={!userProfile.firstName}
            isDriverOnboarding={isDriverFlow}
            onComplete={() => {
                if (role === 'DRIVER' && userProfile.driverVerificationStatus !== 'APPROVED') {
                    // Stay in driver app context but status is pending
                    setView('DRIVER');
                } else {
                    setView(role === 'DRIVER' ? 'DRIVER' : 'RIDER');
                }
            }}
            userProfile={userProfile}
            onUpdateProfile={handleProfileUpdate}
          />
        );
      default:
        return <SplashScreen />;
    }
  };

  return (
    <div className="h-full w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-200">
      {renderContent()}
      {view !== 'SPLASH' && view !== 'AUTH' && view !== 'OTP' && view !== 'PERSONAL_INFO' && role !== 'ADMIN' && <WobioAssistant />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}