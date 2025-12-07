import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from '../../components/Button';
import { AuthService } from '../../services/api';
import ParticleBackground from '../../components/ParticleBackground';

const OTPVerify: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || 'user@example.com'; 
  
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("Please enter complete 6-digit code");
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const isValid = await AuthService.verifyOtp(otpValue);
      if (isValid) {
        navigate('/login');
      } else {
        setError("Invalid OTP code. Try 123456.");
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 relative">
      <ParticleBackground />
      {/* Removed rounded-2xl */}
      <div className="bg-white shadow-lg w-full max-w-md p-8 sm:p-12 animate-fade-in-up text-center border border-gray-100 z-10 relative">
        
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Verify Your Email Address</h2>
        
        <div className="text-gray-500 text-sm mb-2">We've sent a 6 digit code to</div>
        <div className="text-gray-900 font-medium mb-8">{email}</div>

        <div className="flex justify-center gap-2 sm:gap-3 mb-6">
          {otp.map((data, index) => (
            <input
              key={index}
              // Removed rounded-lg
              className={`w-10 h-12 sm:w-12 sm:h-14 border text-center text-xl font-bold focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}`}
              type="text"
              name="otp"
              maxLength={1}
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              ref={(el) => { 
                inputRefs.current[index] = el; 
              }}
            />
          ))}
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button 
          type="button"
          onClick={() => setOtp(new Array(6).fill(""))}
          className="flex items-center justify-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm mb-8 mx-auto transition-colors"
        >
          Resend OTP <RotateCcw size={14} />
        </button>

        <Button 
          onClick={handleVerify} 
          fullWidth
          isLoading={loading}
        >
          Verify OTP
        </Button>

        <button 
          onClick={() => navigate('/register')}
          className="mt-6 flex items-center justify-center gap-2 text-gray-500 hover:text-gray-900 text-sm mx-auto transition-colors"
        >
          <ArrowLeft size={16} /> Back to registration
        </button>

      </div>
    </div>
  );
};

export default OTPVerify;