import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { UserRole } from '../types';
import { ThemeToggle } from '../components/ThemeToggle';
import { Car, ShieldCheck, CheckCircle2, AlertCircle, ChevronDown, Search, X, ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react';
import { WobioLogo } from '../components/WobioLogo';
import { COUNTRIES, Country } from '../countries';

interface AuthProps {
  onRequestOtp: (phoneNumber: string, isSignup: boolean, role: UserRole, password?: string) => void;
  initialMessage?: string | null;
}

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5 text-[#1877F2] fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 2.848-5.978 5.817-5.978.953 0 1.871.1 2.582.145v3.422l-1.517.001c-1.337 0-2.389.264-2.389 1.623v2.368h4.414l-.595 3.667h-3.819v7.98H9.101z"/>
  </svg>
);

const AppleIcon = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.027-3.029 2.467-4.468 2.577-4.533-1.415-2.078-3.623-2.312-4.403-2.338-2.175-.195-3.597 1.04-4.577 1.04zM11.334 1.957c.922 1.13 1.519 2.714 1.35 4.312-1.325.052-2.91-.883-3.83-1.987-.845-1.026-1.585-2.65-1.39-4.26 1.494.117 3.013 1.001 3.87 1.935z"/>
  </svg>
);

export const Auth: React.FC<AuthProps> = ({ onRequestOtp, initialMessage }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(initialMessage || null);
  
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES.find(c => c.code === 'ZW') || COUNTRIES[0]);
  const [isCountryPickerOpen, setIsCountryPickerOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  useEffect(() => {
    if (initialMessage) {
      setSuccessMessage(initialMessage);
      setIsSignup(false);
    }
  }, [initialMessage]);

  const handleAction = (role: UserRole = 'RIDER') => {
    const cleanPhone = phoneNumber.trim();
    if (cleanPhone.length < 3) return;
    
    if (isSignup && password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (!password) return;

    const fullPhoneNumber = `${selectedCountry.dial_code} ${cleanPhone}`;
    onRequestOtp(fullPhoneNumber, isSignup, role, password);
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setSuccessMessage(null);
    setPassword('');
    setConfirmPassword('');
  };

  const filteredCountries = COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) || 
    c.dial_code.includes(countrySearch)
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col relative transition-colors duration-300">
      
      <div className="bg-wobio-500 h-[38vh] w-full rounded-b-[40px] flex flex-col items-center pt-12 relative shadow-lg">
        <div className="absolute top-6 right-6">
          <ThemeToggle className="bg-wobio-600 text-white hover:bg-wobio-700 border-none" />
        </div>

        <div className="mb-4 animate-in zoom-in duration-500 shadow-xl rounded-full">
           <WobioLogo className="w-20 h-20" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-wide">WOBIO</h1>
        <p className="text-wobio-100 text-sm font-medium mt-1 uppercase tracking-widest">Connect & Move</p>
      </div>

      <div className="px-6 -mt-16 flex-1 flex flex-col pb-8 z-10">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6 w-full flex flex-col gap-4 animate-in slide-in-from-bottom-10 duration-500 border border-slate-100 dark:border-slate-800 overflow-y-auto no-scrollbar">
          
          <h2 className="text-center font-black text-slate-800 dark:text-white text-lg uppercase tracking-tight">
            {isSignup ? "Create Account" : "Secure Login"}
          </h2>

          {successMessage && (
            <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs p-3 rounded-xl flex items-start gap-2 animate-in fade-in border border-green-200 dark:border-green-900/30">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-bold">{successMessage}</span>
            </div>
          )}

          {/* Social Registration Options */}
          <div className="space-y-3 mt-2">
            <button className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-[0.98] shadow-sm">
              <GoogleIcon />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Continue with Google</span>
            </button>
            <button className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-[#1877F2]/5 dark:bg-[#1877F2]/10 border border-[#1877F2]/20 dark:border-[#1877F2]/30 rounded-xl hover:bg-[#1877F2]/10 dark:hover:bg-[#1877F2]/20 transition-all active:scale-[0.98] shadow-sm">
              <FacebookIcon />
              <span className="text-sm font-bold text-[#1877F2]">Continue with Facebook</span>
            </button>
            <button className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-black dark:bg-white border border-transparent rounded-xl hover:opacity-90 transition-all active:scale-[0.98] shadow-sm">
              <div className="text-white dark:text-black"><AppleIcon /></div>
              <span className="text-sm font-bold text-white dark:text-black">Continue with Apple</span>
            </button>
          </div>

          <div className="flex items-center gap-3 my-2">
            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Or Use Phone</span>
            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
          </div>

          {isSignup && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Full Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-wobio-500 text-sm"
                  placeholder="Enter your name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Email Address <span className="text-red-500">*</span></label>
                <input 
                  type="email" 
                  className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-wobio-500 text-sm"
                  placeholder="name@example.com *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Mobile Number <span className="text-red-500">*</span></label>
            <div className="flex bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:border-wobio-500 overflow-hidden transition-all">
               <button 
                 onClick={() => setIsCountryPickerOpen(true)}
                 className="flex items-center justify-center px-3 bg-slate-100 dark:bg-slate-700 border-r border-slate-200 dark:border-slate-600 hover:bg-slate-200 transition-colors gap-2"
               >
                  <span className="text-xl">{selectedCountry.flag}</span>
                  <span className="text-xs font-black text-slate-700 dark:text-slate-300">{selectedCountry.dial_code}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
               </button>
               <input 
                 type="tel" 
                 className="flex-1 bg-transparent px-4 py-3 text-slate-900 dark:text-white font-black focus:outline-none text-sm"
                 placeholder="77 123 4567 *"
                 value={phoneNumber}
                 onChange={(e) => setPhoneNumber(e.target.value)}
               />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-wobio-500 text-sm pr-12"
                placeholder="•••••••• *"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isSignup && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Confirm Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input 
                  type="password"
                  className={`w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold border focus:outline-none focus:border-wobio-500 text-sm pr-12 ${
                    confirmPassword && password !== confirmPassword ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                  placeholder="Repeat password *"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400"><Lock className="w-3.5 h-3.5" /></div>
              </div>
            </div>
          )}
            
          <Button 
            fullWidth 
            size="lg" 
            onClick={() => handleAction('RIDER')} 
            className="mt-2 shadow-lg shadow-wobio-500/20 font-black uppercase tracking-widest py-4 rounded-2xl"
            disabled={
              phoneNumber.length < 3 || !password || (isSignup && (!name || !email || !confirmPassword || password !== confirmPassword))
            }
          >
            {isSignup ? "Create Account" : "Log In"}
          </Button>
          
           <div className="text-center mt-2">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
              {isSignup ? "Already registered? " : "New to WOBIO? "}
              <button onClick={toggleMode} className="text-wobio-600 hover:text-wobio-700 font-black underline underline-offset-2">
                {isSignup ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>
        </div>

        {!isSignup && (
          <div className="mt-8 flex flex-col items-center gap-3 opacity-60">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Partner Portal</div>
            <div className="flex gap-4">
              <button onClick={() => handleAction('DRIVER')} className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest hover:bg-slate-50 transition-colors">
                <Car className="w-3.5 h-3.5" /> Driver
              </button>
              <button onClick={() => handleAction('ADMIN')} className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest hover:bg-slate-50 transition-colors">
                <ShieldCheck className="w-3.5 h-3.5" /> Admin
              </button>
            </div>
          </div>
        )}
      </div>

      {isCountryPickerOpen && (
        <div className="fixed inset-0 z-[60] bg-white dark:bg-slate-900 flex flex-col animate-in slide-in-from-bottom duration-300">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 shadow-sm bg-white dark:bg-slate-900 z-10">
             <button onClick={() => setIsCountryPickerOpen(false)} className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
               <ArrowLeft className="w-6 h-6 text-slate-900 dark:text-white" />
             </button>
             <h2 className="font-black text-lg text-slate-900 dark:text-white flex-1 uppercase tracking-tight">Select Region</h2>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 sticky top-[68px] z-10">
             <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-wobio-500">
               <Search className="w-4 h-4 text-slate-400 mr-2" />
               <input 
                 autoFocus
                 type="text" 
                 className="flex-1 bg-transparent focus:outline-none text-slate-900 dark:text-white font-bold text-sm"
                 placeholder="Search country..."
                 value={countrySearch}
                 onChange={(e) => setCountrySearch(e.target.value)}
               />
             </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredCountries.map((country) => (
              <button 
                key={country.code} 
                onClick={() => { setSelectedCountry(country); setIsCountryPickerOpen(false); setCountrySearch(''); }}
                className="w-full flex items-center px-6 py-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 transition-colors"
              >
                 <span className="text-3xl mr-4">{country.flag}</span>
                 <div className="flex-1 text-left">
                    <div className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-wider">{country.name}</div>
                    <div className="text-slate-500 text-sm font-bold">{country.dial_code}</div>
                 </div>
                 {selectedCountry.code === country.code && <CheckCircle2 className="w-5 h-5 text-wobio-500" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};