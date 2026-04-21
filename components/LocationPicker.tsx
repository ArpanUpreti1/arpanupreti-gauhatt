import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Loader2, X, Check, AlertCircle } from 'lucide-react';
import { LocationUtils, DeliveryService, getAuthToken } from '../services/api';
import { UserLocation } from '../types';

interface LocationPickerProps {
  onLocationChange?: (location: UserLocation | null) => void;
  showSaveButton?: boolean;
  compact?: boolean;
  className?: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationChange,
  showSaveButton = true,
  compact = false,
  className = ''
}) => {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [manualInput, setManualInput] = useState({ lat: '', lng: '', address: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load saved location on mount
    const saved = LocationUtils.getSavedLocation();
    if (saved) {
      setLocation(saved);
      onLocationChange?.(saved);
    }
  }, []);

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
      
      setLocation(newLocation);
      LocationUtils.saveLocation(newLocation);
      onLocationChange?.(newLocation);
      
      // Try to save to server if user is logged in
      const token = getAuthToken();
      if (token && showSaveButton) {
        try {
          await DeliveryService.updateLocation(newLocation);
        } catch {
          // Silently fail - location is still saved locally
        }
      }
    } catch (err: any) {
      console.error('Location error:', err);
      if (err.code === 1) {
        setError('Location permission denied. Please enable location access.');
      } else if (err.code === 2) {
        setError('Unable to determine your location. Please try again.');
      } else if (err.code === 3) {
        setError('Location request timed out. Please try again.');
      } else {
        setError('Failed to get location. Please enter manually.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async () => {
    const lat = parseFloat(manualInput.lat);
    const lng = parseFloat(manualInput.lng);
    
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
    
    setSaving(true);
    const newLocation: UserLocation = {
      latitude: lat,
      longitude: lng,
      address: manualInput.address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    };
    
    setLocation(newLocation);
    LocationUtils.saveLocation(newLocation);
    onLocationChange?.(newLocation);
    
    // Try to save to server
    const token = getAuthToken();
    if (token) {
      try {
        await DeliveryService.updateLocation(newLocation);
      } catch {
        // Silently fail
      }
    }
    
    setSaving(false);
    setShowModal(false);
    setManualInput({ lat: '', lng: '', address: '' });
  };

  const handleClearLocation = () => {
    setLocation(null);
    LocationUtils.clearLocation();
    onLocationChange?.(null);
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {location ? (
          <>
            <div className="flex items-center gap-1.5 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
              <MapPin className="w-4 h-4" />
              <span className="truncate max-w-[150px]">{location.address || 'Location set'}</span>
            </div>
            <button
              onClick={handleClearLocation}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              title="Clear location"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={handleGetCurrentLocation}
            disabled={loading}
            className="flex items-center gap-1.5 text-sm text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full
                     hover:bg-primary-100 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            <span>Set Location</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary-500" />
          Delivery Location
        </h3>
        {location && (
          <button
            onClick={handleClearLocation}
            className="text-xs text-gray-500 hover:text-red-500 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {location ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-700">
            <Check className="w-5 h-5" />
            <span className="font-medium">Location Set</span>
          </div>
          <p className="text-sm text-green-600 mt-1">
            {location.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
          </p>
          <p className="text-xs text-green-500 mt-1">
            Products within 40km will be shown
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            onClick={handleGetCurrentLocation}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary-500 text-white 
                     rounded-lg font-medium shadow-lg shadow-primary-500/20
                     hover:bg-primary-600 disabled:opacity-50 transition-all duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Getting Location...
              </>
            ) : (
              <>
                <Navigation className="w-5 h-5" />
                Use My Current Location
              </>
            )}
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="w-full py-2.5 border border-gray-200 text-gray-700 rounded-lg font-medium
                     hover:bg-gray-50 transition-colors"
          >
            Enter Location Manually
          </button>
        </div>
      )}

      {/* Manual Location Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          
          <div 
            className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-500" />
              Enter Location
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  value={manualInput.lat}
                  onChange={e => setManualInput(prev => ({ ...prev, lat: e.target.value }))}
                  placeholder="e.g., 27.7172"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  value={manualInput.lng}
                  onChange={e => setManualInput(prev => ({ ...prev, lng: e.target.value }))}
                  placeholder="e.g., 85.3240"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Address (Optional)
                </label>
                <input
                  type="text"
                  value={manualInput.address}
                  onChange={e => setManualInput(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="e.g., Kathmandu, Nepal"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <p className="text-xs text-gray-500">
                You can find coordinates using Google Maps. Right-click on a location and select "What's here?" to see the coordinates.
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-medium
                           hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleManualSubmit}
                  disabled={!manualInput.lat || !manualInput.lng || saving}
                  className="flex-1 py-2.5 bg-primary-500 text-white rounded-lg font-medium
                           hover:bg-primary-600 disabled:opacity-50 transition-colors
                           flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Save Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
