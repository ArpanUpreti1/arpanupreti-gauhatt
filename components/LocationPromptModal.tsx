import React, { useState } from 'react';
import { MapPin, Navigation, Loader2, X, CheckCircle, AlertCircle } from 'lucide-react';
import { LocationUtils, DeliveryService } from '../services/api';
import { UserLocation } from '../types';

interface LocationPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSet: (location: UserLocation) => void;
  userRole?: string;
}

const LocationPromptModal: React.FC<LocationPromptModalProps> = ({
  isOpen,
  onClose,
  onLocationSet,
  userRole = 'consumer'
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCoords, setManualCoords] = useState({ lat: '', lng: '', address: '' });

  if (!isOpen) return null;

  const isFarmer = userRole?.toLowerCase() === 'farmer';
  const locationLabel = isFarmer ? 'farm' : 'delivery';

  const handleGetCurrentLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      const position = await LocationUtils.getCurrentLocation();
      const newLocation: UserLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        address: 'Current Location'
      };

      // Save to localStorage
      LocationUtils.saveLocation(newLocation);

      // Save to server
      try {
        await DeliveryService.updateLocation(newLocation);
      } catch (err) {
        console.error('Failed to save location to server:', err);
        // Continue anyway - location is saved locally
      }

      onLocationSet(newLocation);
      onClose();
    } catch (err: any) {
      console.error('Location error:', err);
      if (err.code === 1) {
        setError('Location permission denied. Please enable location access or enter manually.');
      } else if (err.code === 2) {
        setError('Unable to determine your location. Please enter manually.');
      } else if (err.code === 3) {
        setError('Location request timed out. Please try again or enter manually.');
      } else {
        setError('Failed to get location. Please enter manually.');
      }
      setShowManualInput(true);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async () => {
    const lat = parseFloat(manualCoords.lat);
    const lng = parseFloat(manualCoords.lng);

    if (isNaN(lat) || isNaN(lng)) {
      setError('Please enter valid coordinates');
      return;
    }

    if (lat < -90 || lat > 90) {
      setError('Latitude must be between -90 and 90');
      return;
    }

    if (lng < -180 || lng > 180) {
      setError('Longitude must be between -180 and 180');
      return;
    }

    setLoading(true);
    setError(null);

    const newLocation: UserLocation = {
      latitude: lat,
      longitude: lng,
      address: manualCoords.address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    };

    // Save to localStorage
    LocationUtils.saveLocation(newLocation);

    // Save to server
    try {
      await DeliveryService.updateLocation(newLocation);
    } catch (err) {
      console.error('Failed to save location to server:', err);
    }

    setLoading(false);
    onLocationSet(newLocation);
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white relative">
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <MapPin size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Set Your Location</h2>
              <p className="text-white/80 text-sm">
                {isFarmer 
                  ? 'Help customers find your farm' 
                  : 'Get accurate delivery estimates'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Benefits */}
          <div className="mb-6 space-y-2">
            <div className="flex items-start gap-3 text-sm text-gray-600">
              <CheckCircle size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
              <span>
                {isFarmer 
                  ? 'Customers within 40km can order from you' 
                  : 'See products from farms within 40km'}
              </span>
            </div>
            <div className="flex items-start gap-3 text-sm text-gray-600">
              <CheckCircle size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
              <span>
                {isFarmer 
                  ? 'Automatic delivery fee calculation for orders' 
                  : 'Get accurate delivery fees (NPR 50 per 10km)'}
              </span>
            </div>
            <div className="flex items-start gap-3 text-sm text-gray-600">
              <CheckCircle size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
              <span>
                {isFarmer 
                  ? 'Your products will be visible to nearby consumers' 
                  : 'Filter products by distance'}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-start gap-2">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Location Buttons */}
          {!showManualInput ? (
            <div className="space-y-3">
              <button
                onClick={handleGetCurrentLocation}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Navigation size={20} />
                )}
                Use My Current Location
              </button>
              <button
                onClick={() => setShowManualInput(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                <MapPin size={20} />
                Enter Location Manually
              </button>
            </div>
          ) : (
            /* Manual Input Form */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g., 26.1445"
                    value={manualCoords.lat}
                    onChange={(e) => setManualCoords({ ...manualCoords, lat: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g., 91.7362"
                    value={manualCoords.lng}
                    onChange={(e) => setManualCoords({ ...manualCoords, lng: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address (Optional)
                </label>
                <input
                  type="text"
                  placeholder={isFarmer ? "e.g., Near Village Market, Kamrup" : "e.g., Guwahati, Assam"}
                  value={manualCoords.address}
                  onChange={(e) => setManualCoords({ ...manualCoords, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 outline-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowManualInput(false);
                    setError(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-600 font-medium rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleManualSubmit}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                  Save Location
                </button>
              </div>
            </div>
          )}

          {/* Skip Button */}
          <button
            onClick={handleSkip}
            className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Skip for now
          </button>

          <p className="mt-4 text-xs text-gray-400 text-center">
            You can update your {locationLabel} location anytime from your profile.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocationPromptModal;
