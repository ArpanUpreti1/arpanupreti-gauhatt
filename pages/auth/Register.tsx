import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Tractor, User as UserIcon, Mail, Phone, Check, MapPin, ArrowRight, ArrowLeft, Image as ImageIcon, Upload, Leaf, Truck, Navigation, Loader2 } from 'lucide-react';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import { UserRole, UserLocation } from '../../types';
import { AuthService, LocationUtils } from '../../services/api';
import ParticleBackground from '../../components/ParticleBackground';
import { useLanguage } from '../../contexts/LanguageContext';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [role, setRole] = useState<UserRole>(UserRole.CONSUMER);
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
    farmPhoto: null as File | null,
    identityProof: null as File | null,
    // Delivery Person fields
    fullName: '',
    vehicleType: '',
    vehicleNumber: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const handleGetLocation = async () => {
    setLocationLoading(true);
    try {
      const position = await LocationUtils.getCurrentLocation();
      const loc: UserLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        address: 'Current Location'
      };
      setUserLocation(loc);
      if (errors.location) {
        setErrors(prev => ({ ...prev, location: '' }));
      }
    } catch (err: any) {
      setErrors(prev => ({ ...prev, location: t('register.error.locationAccess', 'Unable to get location. Please allow location access.') }));
    } finally {
      setLocationLoading(false);
    }
  };

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'farmPhoto' | 'identityProof') => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, [field]: file });
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

    if (!formData.username.trim()) newErrors.username = t('register.error.usernameRequired', 'Username is required');
    if (!emailRegex.test(formData.email)) newErrors.email = t('register.error.invalidEmail', 'Invalid email address');

    if (!formData.password) {
      newErrors.password = t('register.error.passwordRequired', 'Password is required');
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = t('register.error.passwordRules', 'Password must be 6+ chars with 1 special character');
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('register.error.passwordMismatch', 'Passwords do not match');
    }

    // Location is mandatory for all roles
    if (!userLocation) {
      newErrors.location = t('register.error.locationRequired', 'Location is required. Please set your location.');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    const phoneRegex = /^\d{10}$/;

    if (role === UserRole.FARMER) {
      if (!formData.farmName.trim()) newErrors.farmName = t('register.error.farmNameRequired', 'Farm Name is required');
      if (!formData.location) newErrors.location = t('register.error.locationRequiredShort', 'Location is required');
      if (!formData.farmAddress.trim()) newErrors.farmAddress = t('register.error.addressRequired', 'Address is required');
      if (!phoneRegex.test(formData.phoneNumber)) newErrors.phoneNumber = t('register.error.phoneDigits', 'Phone number must be 10 digits');
    } else if (role === UserRole.DELIVERY_PERSON) {
      if (!formData.fullName.trim()) newErrors.fullName = t('register.error.fullNameRequired', 'Full name is required');
      if (!phoneRegex.test(formData.phoneNumber)) newErrors.phoneNumber = t('register.error.phoneDigits', 'Phone number must be 10 digits');
      if (!formData.vehicleType) newErrors.vehicleType = t('register.error.vehicleTypeRequired', 'Vehicle type is required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (validateStep1()) {
      if (role === UserRole.FARMER) {
        // Validate step 1 with API
        setLoading(true);
        try {
          const response = await AuthService.registerFarmerStep1({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword
          });

          if (!response.success) {
            setErrors({ form: response.message || t('register.error.validationFailed', 'Validation failed') });
            return;
          }

          setIsAnimating(true);
          setTimeout(() => {
            setStep(2);
            setIsAnimating(false);
          }, 300);
        } catch (err: any) {
          const message = err.response?.data?.message || err.message || t('register.error.validationFailed', 'Validation failed');
          setErrors({ form: message });
        } finally {
          setLoading(false);
        }
      } else if (role === UserRole.DELIVERY_PERSON) {
        setIsAnimating(true);
        setTimeout(() => {
          setStep(2);
          setIsAnimating(false);
        }, 300);
      } else {
        setIsAnimating(true);
        setTimeout(() => {
          setStep(2);
          setIsAnimating(false);
        }, 300);
      }
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

    if (role === UserRole.CONSUMER) {
      if (!validateStep1()) return;
    } else {
      if (!validateStep2()) return;
    }

    setLoading(true);
    try {
      if (role === UserRole.CONSUMER) {
        const response = await AuthService.registerConsumer({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          latitude: userLocation!.latitude,
          longitude: userLocation!.longitude,
          locationAddress: userLocation!.address,
        });

        if (!response.success) {
          setErrors({ form: response.message || t('register.error.registrationFailed', 'Registration failed') });
          return;
        }
      } else if (role === UserRole.DELIVERY_PERSON) {
        const response = await AuthService.registerDeliveryPerson({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          vehicleType: formData.vehicleType,
          vehicleNumber: formData.vehicleNumber || undefined,
          latitude: userLocation!.latitude,
          longitude: userLocation!.longitude,
          locationAddress: userLocation!.address,
        });

        if (!response.success) {
          setErrors({ form: response.message || t('register.error.registrationFailed', 'Registration failed') });
          return;
        }
      } else {
        // Farmer registration with file uploads
        const farmerFormData = new FormData();
        farmerFormData.append('Username', formData.username);
        farmerFormData.append('Email', formData.email);
        farmerFormData.append('Password', formData.password);
        farmerFormData.append('ConfirmPassword', formData.confirmPassword);
        farmerFormData.append('FarmName', formData.farmName);
        farmerFormData.append('District', formData.location);
        farmerFormData.append('FarmAddress', formData.farmAddress);
        farmerFormData.append('PhoneNumber', formData.phoneNumber);
        formData.cropTypes.forEach(crop => {
          farmerFormData.append('CropTypes', crop);
        });
        if (formData.farmPhoto) {
          farmerFormData.append('FarmPhoto', formData.farmPhoto);
        }
        if (formData.identityProof) {
          farmerFormData.append('IdentityProof', formData.identityProof);
        }
        farmerFormData.append('Latitude', userLocation!.latitude.toString());
        farmerFormData.append('Longitude', userLocation!.longitude.toString());
        if (userLocation!.address) {
          farmerFormData.append('LocationAddress', userLocation!.address);
        }

        // Debug logging
        console.log('Sending farmer registration with files:');
        console.log('FarmPhoto:', formData.farmPhoto);
        console.log('IdentityProof:', formData.identityProof);
        for (const [key, value] of farmerFormData.entries()) {
          console.log(`FormData: ${key} =`, value);
        }

        const response = await AuthService.registerFarmer(farmerFormData);

        if (!response.success) {
          setErrors({ form: response.message || t('register.error.registrationFailed', 'Registration failed') });
          return;
        }
      }

      navigate('/otp-verify', { state: { email: formData.email } });
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || t('register.error.registrationFailed', 'Registration failed');
      setErrors({ form: message });
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

      <div className="bg-white shadow-lg w-full max-w-md p-8 sm:p-10 animate-fade-in-up transition-all duration-500 border border-gray-100 z-10 relative mt-16">

        <div className="text-center mb-6">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">{t('register.title', 'Create an Account')}</h2>
          <p className="text-gray-500 text-sm">{t('register.subtitle', 'Join our community of sustainable food.')}</p>
        </div>

        {/* Role Toggle */}
        <div className="flex gap-3 mb-8">
          <button
            type="button"
            onClick={() => setRole(UserRole.CONSUMER)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 border transition-all duration-200 ${role === UserRole.CONSUMER
              ? 'bg-primary-500 border-primary-500 text-white shadow-md transform scale-105'
              : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
          >
            <User size={16} />
            <span className="font-medium text-xs sm:text-sm">{t('register.role.consumer', 'Consumer')}</span>
          </button>

          <button
            type="button"
            onClick={() => setRole(UserRole.FARMER)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 border transition-all duration-200 ${role === UserRole.FARMER
              ? 'bg-primary-500 border-primary-500 text-white shadow-md transform scale-105'
              : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
          >
            <Tractor size={16} />
            <span className="font-medium text-xs sm:text-sm">{t('register.role.farmer', 'Farmer')}</span>
          </button>

          <button
            type="button"
            onClick={() => setRole(UserRole.DELIVERY_PERSON)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 border transition-all duration-200 ${role === UserRole.DELIVERY_PERSON
              ? 'bg-primary-500 border-primary-500 text-white shadow-md transform scale-105'
              : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
          >
            <Truck size={16} />
            <span className="font-medium text-xs sm:text-sm">{t('register.role.delivery', 'Delivery')}</span>
          </button>
        </div>

        {/* Animated Stepper for Farmer & Delivery Person */}
        {(role === UserRole.FARMER || role === UserRole.DELIVERY_PERSON) && (
          <div className="mb-8 relative px-4">
            <div className="flex items-center justify-between relative z-10">
              {/* Step 1 Square */}
              <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={step === 2 ? handleBack : undefined}>
                <div className={`w-10 h-10 flex items-center justify-center transition-all duration-500 border-2 ${step >= 1 ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                  {step > 1 ? <Check size={20} /> : <span className="font-bold">1</span>}
                </div>
                <span className={`text-xs font-medium transition-colors duration-300 ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>{t('register.step.account', 'Account')}</span>
              </div>

              {/* Step 2 Square */}
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 flex items-center justify-center transition-all duration-500 border-2 ${step === 2 ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                  <span className="font-bold">2</span>
                </div>
                <span className={`text-xs font-medium transition-colors duration-300 ${step === 2 ? 'text-primary-600' : 'text-gray-400'}`}>
                  {role === UserRole.FARMER ? t('register.step.farmInfo', 'Farm Info') : t('register.step.details', 'Details')}
                </span>
              </div>
            </div>

            {/* Connecting Line */}
            <div className="absolute top-5 left-0 w-full px-12 z-0 h-0.5">
              <div className="w-full h-full bg-gray-200"></div>
            </div>
            <div className="absolute top-5 left-0 w-full px-12 z-0 h-0.5">
              <div className={`h-full bg-primary-500 transition-all duration-700 ease-out ${step === 2 ? 'w-full' : 'w-0'}`}></div>
            </div>
          </div>
        )}

        {errors.form && <div className="text-red-500 text-center mb-4 text-sm bg-red-50 p-2 border border-red-100">{errors.form}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 min-h-[320px] flex flex-col justify-between overflow-hidden relative">

          <div className={`transition-all duration-300 transform ${isAnimating ? 'opacity-0 -translate-x-10' : 'opacity-100 translate-x-0'} flex-1`}>

            {(role === UserRole.CONSUMER || ((role === UserRole.FARMER || role === UserRole.DELIVERY_PERSON) && step === 1)) && (
              <div className="space-y-4 animate-fade-in">
                <Input
                  name="username"
                  placeholder={t('register.username', 'Username')}
                  value={formData.username}
                  onChange={handleChange}
                  error={errors.username}
                  icon={<UserIcon size={18} />}
                />

                <Input
                  name="email"
                  type="email"
                  placeholder={t('register.email', 'Email address')}
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  icon={<Mail size={18} />}
                />

                <Input
                  name="password"
                  type="password"
                  placeholder={t('register.password', 'Password')}
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                />

                <Input
                  name="confirmPassword"
                  type="password"
                  placeholder={t('register.confirmPassword', 'Confirm Password')}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                />

                {/* Location Picker - Mandatory */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin size={14} className="inline mr-1" />
                    {t('register.yourLocation', 'Your Location')} <span className="text-red-500">*</span>
                  </label>
                  {userLocation ? (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <Check size={16} className="text-green-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">{t('register.locationSet', 'Location Set')}</p>
                        <p className="text-xs text-green-600">
                          {userLocation.address || `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleGetLocation}
                        className="text-xs text-green-700 underline hover:text-green-900"
                      >
                        {t('register.update', 'Update')}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={locationLoading}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-primary-50 border-2 border-dashed border-primary-300 
                               text-primary-700 rounded-lg hover:bg-primary-100 transition-colors disabled:opacity-50"
                    >
                      {locationLoading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span className="text-sm">{t('register.gettingLocation', 'Getting location...')}</span>
                        </>
                      ) : (
                        <>
                          <Navigation size={18} />
                          <span className="text-sm font-medium">{t('register.setMyLocation', 'Set My Location')}</span>
                        </>
                      )}
                    </button>
                  )}
                  {errors.location && (
                    <p className="text-red-500 text-xs mt-1">{errors.location}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {t('register.locationHint', 'Location is required for delivery calculations (within 40km range)')}
                  </p>
                </div>
              </div>
            )}

            {role === UserRole.FARMER && step === 2 && (
              <div className="space-y-4 animate-fade-in pb-2">
                <Input
                  name="farmName"
                  placeholder={t('register.farmName', 'Farm Name')}
                  value={formData.farmName}
                  onChange={handleChange}
                  error={errors.farmName}
                />

                <Select
                  name="location"
                  placeholder={t('register.selectDistrict', 'Select District')}
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
                  placeholder={t('register.farmAddress', 'Complete farm address')}
                  value={formData.farmAddress}
                  onChange={handleChange}
                  error={errors.farmAddress}
                />

                {/* Crop Types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('register.cropType', 'Crop Type')}</label>
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
                        <span className="text-sm text-gray-600">{t(`register.crop.${type.toLowerCase()}`, type)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Farm Photo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('register.farmPhoto', 'Farm Photo')}</label>
                  <div className="w-full h-32 bg-[#ebebeb] border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors relative">
                    {formData.farmPhoto ? (
                      <span className="text-sm text-gray-600">{formData.farmPhoto.name}</span>
                    ) : (
                      <ImageIcon size={48} className="text-[#a0a0a0] opacity-80" />
                    )}
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'farmPhoto')}
                    />
                  </div>
                </div>

                {/* Identity Proof Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('register.identityProof', 'Identity Proof')}</label>
                  <div className="w-full h-32 bg-[#ebebeb] border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors relative">
                    {formData.identityProof ? (
                      <span className="text-sm text-gray-600">{formData.identityProof.name}</span>
                    ) : (
                      <ImageIcon size={48} className="text-[#a0a0a0] opacity-80" />
                    )}
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'identityProof')}
                    />
                  </div>
                </div>

                <Input
                  name="phoneNumber"
                  type="tel"
                  placeholder={t('register.phone', 'Phone Number (10 digits)')}
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  error={errors.phoneNumber}
                  icon={<Phone size={18} />}
                />
              </div>
            )}

            {role === UserRole.DELIVERY_PERSON && step === 2 && (
              <div className="space-y-4 animate-fade-in pb-2">
                <Input
                  name="fullName"
                  placeholder={t('register.fullName', 'Full Name')}
                  value={formData.fullName}
                  onChange={handleChange}
                  error={errors.fullName}
                  icon={<UserIcon size={18} />}
                />

                <Input
                  name="phoneNumber"
                  type="tel"
                  placeholder={t('register.phone', 'Phone Number (10 digits)')}
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  error={errors.phoneNumber}
                  icon={<Phone size={18} />}
                />

                <Select
                  name="vehicleType"
                  placeholder={t('register.vehicleType', 'Select Vehicle Type')}
                  value={formData.vehicleType}
                  onChange={handleChange}
                  error={errors.vehicleType}
                  options={[
                    { value: 'Bike', label: 'Bike' },
                    { value: 'Motorcycle', label: 'Motorcycle' },
                    { value: 'Car', label: 'Car' },
                    { value: 'Van', label: 'Van' },
                  ]}
                />

                <Input
                  name="vehicleNumber"
                  placeholder={t('register.vehicleNumber', 'Vehicle Number (Optional)')}
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  error={errors.vehicleNumber}
                  icon={<Truck size={18} />}
                />
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            {(role === UserRole.FARMER || role === UserRole.DELIVERY_PERSON) ? (
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
                  {step === 1 ? <>{t('register.nextStep', 'Next Step')} <ArrowRight size={18} /></> : t('register.createAccount', 'Create Account')}
                </Button>
              </div>
            ) : (
              <Button type="submit" fullWidth isLoading={loading}>
                {t('register.submit', 'Register')}
              </Button>
            )}
          </div>

        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500 uppercase">{t('common.or', 'OR')}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 p-4 border border-gray-100 bg-gray-50">
          <span className="text-sm text-gray-600">{t('register.alreadyHaveAccount', 'Already have an account?')}</span>
          <button onClick={() => navigate('/login')} className="text-sm font-medium text-primary-600 hover:text-primary-700">{t('register.signIn', 'sign in')}</button>
        </div>
      </div>
    </div>
  );
};

export default Register;
