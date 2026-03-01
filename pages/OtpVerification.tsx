import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Timer, RotateCcw, AlertCircle } from 'lucide-react';
import { Button } from '../components/Button';

interface OtpVerificationProps {
  phoneNumber: string;
  onBack: () => void;
  onVerify: (otp: string) => void;
  isSignup: boolean;
  isLoading?: boolean;
}

export const OtpVerification: React.FC<OtpVerificationProps> = ({ 
  phoneNumber, 
  onBack, 
  onVerify, 
  isSignup,
  isLoading = false 
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer Countdown
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Handle Input Change
  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    setError(null); // Clear error on type

    // Focus next input
    if (element.value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    setTimer(30);
    setOtp(['', '', '', '', '', '']);
    setError(null);
    inputRefs.current[0]?.focus();
    // Logic to trigger backend resend would go here
  };

  const handleSubmit = () => {
    const otpString = otp.join('');
    if (otpString.length < 6) {
      setError("Please enter all 6 digits.");
      return;
    }
    // Mock Validation
    if (otpString === '000000') {
      setError("Invalid OTP. Please try again.");
      return;
    }
    onVerify(otpString);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F2F4F7] dark:bg-slate-950 flex flex-col h-full w-full">
      {/* 1. Header Section */}
      <div className="bg-white dark:bg-slate-900 px-4 py-4 flex items-center shadow-sm z-20">
        <button 
          onClick={onBack} 
          className="p-2 -ml-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="ml-2 text-lg font-bold text-slate-900 dark:text-white flex-1">
          {isSignup ? "Verify Phone" : "Two-Step Verification"}
        </h1>
      </div>

      <div className="flex-1 p-6 flex flex-col items-center pt-10">
        {/* Title & Subtitle */}
        <div className="text-center mb-10 animate-in slide-in-from-bottom-5 duration-500">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Verify it's you</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
            We have sent a 6-digit code to <br/>
            <span className="font-bold text-slate-900 dark:text-white text-lg">{phoneNumber}</span>
          </p>
        </div>

        {/* 2. OTP Input Section */}
        <div className="flex gap-2 mb-8 w-full justify-center">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="tel"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`w-11 h-14 text-center text-xl font-bold rounded-lg border-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none transition-all
                ${error ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-wobio-500 focus:ring-4 focus:ring-wobio-500/10'}`}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg mb-6 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-bold">{error}</span>
          </div>
        )}

        {/* 3. Timer / Resend Section */}
        <div className="text-center mb-8">
          {timer > 0 ? (
            <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-full">
              <Timer className="w-4 h-4" />
              <span className="tabular-nums">00:{timer < 10 ? `0${timer}` : timer}</span>
            </div>
          ) : (
            <button 
              onClick={handleResend}
              className="flex items-center justify-center gap-2 text-wobio-600 dark:text-wobio-400 font-bold hover:underline"
            >
              <RotateCcw className="w-4 h-4" /> Resend Code
            </button>
          )}
        </div>

        {/* 4. Verify Button */}
        <div className="w-full mt-auto mb-6">
          <Button 
            fullWidth 
            size="lg" 
            onClick={handleSubmit}
            disabled={otp.join('').length < 6 || isLoading}
            className="shadow-xl shadow-wobio-500/20"
          >
            {isLoading ? 'Verifying...' : 'Verify & Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}