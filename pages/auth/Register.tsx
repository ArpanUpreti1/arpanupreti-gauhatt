import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Tractor, User as UserIcon, Mail, Phone, Check, MapPin, ArrowRight, ArrowLeft, Image as ImageIcon, Upload, Leaf } from 'lucide-react';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import { UserRole } from '../../types';
import { AuthService } from '../../services/api';
import ParticleBackground from '../../components/ParticleBackground';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const [step, setStep] = useState(1); 
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Farmer specific fields
    farmName: '',
    location: '',
    farmAddress: '',
    phoneNumber: '',
    cropTypes: [] as string[],
    farmPhoto: null,
    identityProof: null
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setStep(1);
    setErrors({});
  }, [role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxChange = (crop: string) => {
    setFormData(prev => {
      const crops = prev.cropTypes.includes(crop)
        ? prev.cropTypes.filter(c => c !== crop)
        : [...prev.cropTypes, crop];
      return { ...prev, cropTypes: crops };
    });
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/;

    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email address";
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = "Password must be 6+ chars with 1 special character";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    const phoneRegex = /^\d{10}$/;

    if (!formData.farmName.trim()) newErrors.farmName = "Farm Name is required";
    if (!formData.location) newErrors.location = "Location is required";
    if (!formData.farmAddress.trim()) newErrors.farmAddress = "Address is required";
    if (!phoneRegex.test(formData.phoneNumber)) newErrors.phoneNumber = "Phone number must be 10 digits";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setIsAnimating(true);
      setTimeout(() => {
        setStep(2);
        setIsAnimating(false);
      }, 300); 
    }
  };

  const handleBack = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setStep(1);
      setIsAnimating(false);
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (role === UserRole.USER) {
       if (!validateStep1()) return;
    } else {
       if (!validateStep2()) return;
    }

    setLoading(true);
    try {
      await AuthService.register({ ...formData, role });
      navigate('/otp-verify', { state: { email: formData.email } });
    } catch (error) {
      console.error(error);
      setErrors({ form: "Registration failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 py-10 font-sans relative">
      <ParticleBackground />

      {/* Top Navigation / Logo */}
      <div className="absolute top-0 left-0 w-full p-6 z-20">
        <div className="inline-flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="w-9 h-9 bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/30 transition-transform group-hover:scale-105">
            <Leaf size={22} fill="currentColor" />
          </div>
          <span className="text-2xl font-serif font-bold text-gray-900 tracking-tight">GAUHATT</span>
        </div>
      </div>

      {/* Removed rounded-2xl */}
      <div className="bg-white shadow-lg w-full max-w-md p-8 sm:p-10 animate-fade-in-up transition-all duration-500 border border-gray-100 z-10 relative mt-16">
        
        <div className="text-center mb-6">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Create an Account</h2>
          <p className="text-gray-500 text-sm">Join our community of sustainable food.</p>
        </div>

        {/* Role Toggle - Removed rounded-lg */}
        <div className="flex gap-4 mb-8">
          <button
            type="button"
            onClick={() => setRole(UserRole.USER)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 border transition-all duration-200 ${
              role === UserRole.USER 
                ? 'bg-primary-500 border-primary-500 text-white shadow-md transform scale-105' 
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <User size={18} />
            <span className="font-medium text-sm">User</span>
          </button>
          
          <button
            type="button"
            onClick={() => setRole(UserRole.FARMER)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 border transition-all duration-200 ${
              role === UserRole.FARMER 
                ? 'bg-primary-500 border-primary-500 text-white shadow-md transform scale-105' 
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Tractor size={18} />
            <span className="font-medium text-sm">Farmer</span>
          </button>
        </div>

        {/* Animated Stepper for Farmer */}
        {role === UserRole.FARMER && (
            <div className="mb-8 relative px-4">
                <div className="flex items-center justify-between relative z-10">
                    {/* Step 1 Square */}
                    <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={step === 2 ? handleBack : undefined}>
                        {/* Changed rounded-full to rounded-none (square) */}
                        <div className={`w-10 h-10 flex items-center justify-center transition-all duration-500 border-2 ${
                            step >= 1 ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-white border-gray-300 text-gray-400'
                        }`}>
                            {step > 1 ? <Check size={20} /> : <span className="font-bold">1</span>}
                        </div>
                        <span className={`text-xs font-medium transition-colors duration-300 ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>Account</span>
                    </div>

                    {/* Step 2 Square */}
                    <div className="flex flex-col items-center gap-2">
                         <div className={`w-10 h-10 flex items-center justify-center transition-all duration-500 border-2 ${
                            step === 2 ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-white border-gray-300 text-gray-400'
                        }`}>
                             <span className="font-bold">2</span>
                        </div>
                        <span className={`text-xs font-medium transition-colors duration-300 ${step === 2 ? 'text-primary-600' : 'text-gray-400'}`}>Farm Info</span>
                    </div>
                </div>
                
                {/* Connecting Line */}
                <div className="absolute top-5 left-0 w-full px-12 z-0 h-0.5">
                    <div className="w-full h-full bg-gray-200"></div>
                </div>
                <div className="absolute top-5 left-0 w-full px-12 z-0 h-0.5">
                    {/* Removed rounded-full */}
                    <div className={`h-full bg-primary-500 transition-all duration-700 ease-out ${step === 2 ? 'w-full' : 'w-0'}`}></div>
                </div>
            </div>
        )}

        {errors.form && <div className="text-red-500 text-center mb-4 text-sm bg-red-50 p-2 border border-red-100">{errors.form}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 min-h-[320px] flex flex-col justify-between overflow-hidden relative">
            
            <div className={`transition-all duration-300 transform ${isAnimating ? 'opacity-0 -translate-x-10' : 'opacity-100 translate-x-0'} flex-1`}>
                
                {(role === UserRole.USER || (role === UserRole.FARMER && step === 1)) && (
                    <div className="space-y-4 animate-fade-in">
                        <Input 
                            name="username"
                            placeholder="Username" 
                            value={formData.username}
                            onChange={handleChange}
                            error={errors.username}
                            icon={<UserIcon size={18} />}
                        />
                        
                        <Input 
                            name="email"
                            type="email"
                            placeholder="Email address" 
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                            icon={<Mail size={18} />}
                        />

                        <Input 
                            name="password"
                            type="password"
                            placeholder="Password" 
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                        />
                        
                        <Input 
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirm Password" 
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            error={errors.confirmPassword}
                        />
                    </div>
                )}

                {role === UserRole.FARMER && step === 2 && (
                    <div className="space-y-4 animate-fade-in pb-2">
                        <Input 
                            name="farmName"
                            placeholder="Farm Name"
                            value={formData.farmName}
                            onChange={handleChange}
                            error={errors.farmName}
                        />

                        <Select 
                            name="location"
                            placeholder="Select District"
                            value={formData.location}
                            onChange={handleChange}
                            error={errors.location}
                            options={[
                            { value: 'Morang', label: 'Morang' },
                            { value: 'Sunsari', label: 'Sunsari' },
                            { value: 'Jhapa', label: 'Jhapa' },
                            { value: 'Kathmandu', label: 'Kathmandu' },
                            { value: 'Lalitpur', label: 'Lalitpur' },
                            { value: 'Bhaktapur', label: 'Bhaktapur' },
                            { value: 'Chitwan', label: 'Chitwan' },
                            ]}
                        />

                        <Input 
                            name="farmAddress"
                            placeholder="Complete farm address"
                            value={formData.farmAddress}
                            onChange={handleChange}
                            error={errors.farmAddress}
                        />

                        {/* Crop Types */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Crop Type</label>
                            <div className="grid grid-cols-2 gap-3">
                                {['Vegetables', 'Grain', 'Fruits', 'Pulses'].map((type) => (
                                    <label key={type} className="flex items-center space-x-2 cursor-pointer group">
                                        <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${formData.cropTypes.includes(type) ? 'bg-primary-500 border-primary-500' : 'bg-white border-gray-300 group-hover:border-primary-400'}`}>
                                            {formData.cropTypes.includes(type) && <Check size={12} className="text-white" />}
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            className="hidden"
                                            checked={formData.cropTypes.includes(type)}
                                            onChange={() => handleCheckboxChange(type)}
                                        />
                                        <span className="text-sm text-gray-600">{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Farm Photo Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Farm Photo</label>
                            <div className="w-full h-32 bg-[#ebebeb] border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors relative">
                                <ImageIcon size={48} className="text-[#a0a0a0] opacity-80" />
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                            </div>
                        </div>

                        {/* Identity Proof Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Identity Proof</label>
                            <div className="w-full h-32 bg-[#ebebeb] border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors relative">
                                <ImageIcon size={48} className="text-[#a0a0a0] opacity-80" />
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                            </div>
                        </div>

                         <Input 
                            name="phoneNumber"
                            type="tel"
                            placeholder="Phone Number (10 digits)" 
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            error={errors.phoneNumber}
                            icon={<Phone size={18} />}
                        />
                    </div>
                )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
                {role === UserRole.FARMER ? (
                     <div className="flex gap-3">
                        {step === 2 && (
                            <Button type="button" variant="outline" onClick={handleBack} className="w-1/3">
                                <ArrowLeft size={18} />
                            </Button>
                        )}
                        <Button 
                            type={step === 2 ? 'submit' : 'button'} 
                            onClick={step === 1 ? handleNext : undefined}
                            fullWidth 
                            isLoading={loading}
                            className="flex-1 flex items-center justify-center gap-2"
                        >
                            {step === 1 ? <>Next Step <ArrowRight size={18} /></> : 'Create Account'}
                        </Button>
                     </div>
                ) : (
                    <Button type="submit" fullWidth isLoading={loading}>
                        Register
                    </Button>
                )}
            </div>

        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500 uppercase">OR</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 p-4 border border-gray-100 bg-gray-50">
          <span className="text-sm text-gray-600">Already have an account?</span>
          <button onClick={() => navigate('/login')} className="text-sm font-medium text-primary-600 hover:text-primary-700">sign in</button>
        </div>
      </div>
    </div>
  );
};

export default Register;