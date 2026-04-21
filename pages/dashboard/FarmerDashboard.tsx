import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, LogOut, User, Mail, MapPin, Tractor, Phone, FileText, Image } from 'lucide-react';
import { clearAuthData, getCurrentUser } from '../../services/api';

const FarmerDashboard: React.FC = () => {
    const navigate = useNavigate();
    const user = getCurrentUser();

    const handleLogout = () => {
        clearAuthData();
        navigate('/login');
    };

    if (!user) {
        navigate('/login');
        return null;
    }

    // Parse crop types from JSON string
    let cropTypes: string[] = [];
    try {
        if (user.cropTypes) {
            cropTypes = JSON.parse(user.cropTypes);
        }
    } catch (e) {
        cropTypes = user.cropTypes ? [user.cropTypes] : [];
    }

    // Base URL for farm photos
    const baseUrl = 'https://localhost:7216';

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="inline-flex items-center gap-2">
                        <div className="w-9 h-9 bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
                            <Leaf size={22} fill="currentColor" />
                        </div>
                        <span className="text-2xl font-serif font-bold text-gray-900 tracking-tight">GAUHATT</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 sm:p-8">
                <div className="max-w-5xl mx-auto">

                    {/* Welcome Banner with Farm Photo */}
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6 sm:p-8 mb-6 shadow-lg">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            {/* Farm Photo */}
                            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white/20 backdrop-blur rounded overflow-hidden flex-shrink-0 border-4 border-white/30">
                                {user.farmPhotoUrl ? (
                                    <img
                                        src={`${baseUrl}${user.farmPhotoUrl}`}
                                        alt="Farm Photo"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '';
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-5xl flex items-center justify-center h-full">🌾</span>';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-5xl">🌾</span>
                                    </div>
                                )}
                            </div>

                            <div className="text-center sm:text-left">
                                <h1 className="text-2xl sm:text-3xl font-serif font-bold mb-2">
                                    Welcome, {user.username}!
                                </h1>
                                <p className="text-amber-100 text-sm sm:text-base mb-3">
                                    {user.farmName || 'Your Farm'} • {user.district || 'Location'}
                                </p>
                                {cropTypes.length > 0 && (
                                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                        {cropTypes.map((crop, index) => (
                                            <span key={index} className="px-3 py-1 bg-white/20 text-white text-xs rounded-full">
                                                {crop}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Profile Information */}
                        <div className="bg-white shadow-lg border border-gray-100 p-6">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                                    <User size={20} className="text-amber-600" />
                                </div>
                                <h2 className="text-lg font-serif font-bold text-gray-900">Profile Information</h2>
                            </div>

                            <div className="space-y-4">
                                {/* Username */}
                                <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-100">
                                    <User size={18} className="text-primary-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Username</p>
                                        <p className="text-gray-900 font-medium">{user.username}</p>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-100">
                                    <Mail size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                                        <p className="text-gray-900 font-medium break-all">{user.email}</p>
                                    </div>
                                </div>

                                {/* Phone */}
                                {user.phoneNumber && (
                                    <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-100">
                                        <Phone size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Phone Number</p>
                                            <p className="text-gray-900 font-medium">{user.phoneNumber}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Role */}
                                <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-100">
                                    <span className="text-lg mt-0.5">👨‍🌾</span>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Role</p>
                                        <p className="text-gray-900 font-medium">{user.role}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Farm Information */}
                        <div className="bg-white shadow-lg border border-gray-100 p-6">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <Tractor size={20} className="text-green-600" />
                                </div>
                                <h2 className="text-lg font-serif font-bold text-gray-900">Farm Information</h2>
                            </div>

                            <div className="space-y-4">
                                {/* Farm Name */}
                                <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-100">
                                    <Tractor size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Farm Name</p>
                                        <p className="text-gray-900 font-medium">{user.farmName || 'Not specified'}</p>
                                    </div>
                                </div>

                                {/* District */}
                                <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-100">
                                    <MapPin size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">District</p>
                                        <p className="text-gray-900 font-medium">{user.district || 'Not specified'}</p>
                                    </div>
                                </div>

                                {/* Farm Address */}
                                {user.farmAddress && (
                                    <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-100">
                                        <MapPin size={18} className="text-purple-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Farm Address</p>
                                            <p className="text-gray-900 font-medium">{user.farmAddress}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Crop Types */}
                                {cropTypes.length > 0 && (
                                    <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-100">
                                        <span className="text-lg mt-0.5">🌱</span>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Crop Types</p>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {cropTypes.map((crop, index) => (
                                                    <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                                        {crop}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Documents Section */}
                    {(user.farmPhotoUrl || user.identityProofUrl) && (
                        <div className="mt-6 bg-white shadow-lg border border-gray-100 p-6">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <FileText size={20} className="text-blue-600" />
                                </div>
                                <h2 className="text-lg font-serif font-bold text-gray-900">Documents & Photos</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Farm Photo */}
                                {user.farmPhotoUrl && (
                                    <div className="border border-gray-200 p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Image size={16} className="text-green-600" />
                                            <p className="text-sm font-medium text-gray-700">Farm Photo</p>
                                        </div>
                                        <div className="aspect-video bg-gray-100 overflow-hidden">
                                            <img
                                                src={`${baseUrl}${user.farmPhotoUrl}`}
                                                alt="Farm"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Identity Proof */}
                                {user.identityProofUrl && (
                                    <div className="border border-gray-200 p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <FileText size={16} className="text-blue-600" />
                                            <p className="text-sm font-medium text-gray-700">Identity Proof</p>
                                        </div>
                                        <div className="aspect-video bg-gray-100 overflow-hidden">
                                            <img
                                                src={`${baseUrl}${user.identityProofUrl}`}
                                                alt="Identity Proof"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Quick Stats */}
                    <div className="mt-6 bg-white shadow-lg border border-gray-100 p-6">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Quick Stats</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                                <p className="text-2xl font-bold text-green-600">0</p>
                                <p className="text-xs text-green-700">Products</p>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                                <p className="text-2xl font-bold text-blue-600">0</p>
                                <p className="text-xs text-blue-700">Orders</p>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200">
                                <p className="text-2xl font-bold text-amber-600">0</p>
                                <p className="text-xs text-amber-700">Reviews</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FarmerDashboard;
