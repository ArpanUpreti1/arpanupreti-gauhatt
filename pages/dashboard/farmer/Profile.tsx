import React, { useState } from 'react';
import { User, Mail, MapPin, Tractor, Phone, FileText, Image, Edit3, Save, X } from 'lucide-react';
import { getCurrentUser } from '../../../services/api';

const FarmerProfile: React.FC = () => {
    const user = getCurrentUser();
    const [isEditing, setIsEditing] = useState(false);
    // Mock state for story (in real app, this comes from API/User context)
    const [story, setStory] = useState("We are a family-owned farm dedicated to sustainable organic farming practices. For over 3 generations, we have cultivated the land with love and care, ensuring that every product that reaches your table is pure, fresh, and healthy.");

    if (!user) return null;

    // Parse crop types from JSON string
    let cropTypes: string[] = [];
    try {
        if (user.cropTypes) {
            cropTypes = JSON.parse(user.cropTypes);
        }
    } catch (e) {
        cropTypes = user.cropTypes ? [user.cropTypes] : [];
    }

    const baseUrl = 'https://localhost:7216';

    const handleSave = () => {
        // Logic to save profile/story updates to API would go here
        setIsEditing(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 font-serif">My Profile</h1>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                >
                    {isEditing ? <><X size={18} /> Cancel</> : <><Edit3 size={18} /> Edit Profile</>}
                </button>
            </div>

            {/* Banner Card */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-8 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>

                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 w-full">
                    <div className="w-32 h-32 md:w-40 md:h-40 bg-white/20 backdrop-blur-md rounded-2xl overflow-hidden border-4 border-white/30 shadow-inner flex-shrink-0 relative group">
                        {user.farmPhotoUrl ? (
                            <img src={`${baseUrl}${user.farmPhotoUrl}`} alt="Farm" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-5xl">🌾</div>
                        )}
                        {isEditing && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/50 transition-colors">
                                <Edit3 className="text-white" size={24} />
                            </div>
                        )}
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <h2 className="text-3xl font-bold mb-2 font-serif">{user.farmName || 'Your Farm'}</h2>
                        <p className="text-orange-50 text-lg mb-4 flex items-center justify-center md:justify-start gap-2">
                            <MapPin size={18} />
                            {user.district || 'Location Unspecified'}
                        </p>
                        {cropTypes.length > 0 && (
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                {cropTypes.map((crop, index) => (
                                    <span key={index} className="px-3 py-1 bg-white/20 backdrop-blur text-white text-xs font-medium rounded-full border border-white/20">
                                        {crop}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Farm Story Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <FileText size={100} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 font-serif relative z-10">Our Story</h3>
                {isEditing ? (
                    <textarea
                        value={story}
                        onChange={(e) => setStory(e.target.value)}
                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-200 outline-none text-gray-600 leading-relaxed min-h-[150px]"
                        placeholder="Tell your customers about your farm, your practices, and your journey..."
                    />
                ) : (
                    <p className="text-gray-600 leading-relaxed relative z-10">{story}</p>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Info */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
                            <User size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Personal Details</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                            <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1">Full Name</p>
                            <div className="flex items-center gap-2 text-gray-700 font-medium">
                                <User size={16} className="text-amber-500" />
                                {user.username}
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                            <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1">Email Address</p>
                            <div className="flex items-center gap-2 text-gray-700 font-medium">
                                <Mail size={16} className="text-blue-500" />
                                {user.email}
                            </div>
                        </div>
                        {user.phoneNumber && (
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                                <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1">Phone Number</p>
                                <div className="flex items-center gap-2 text-gray-700 font-medium">
                                    <Phone size={16} className="text-green-500" />
                                    {user.phoneNumber}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Farm Details */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                            <Tractor size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Farm Details</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                            <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1">Farm Name</p>
                            <div className="flex items-center gap-2 text-gray-700 font-medium">
                                <Tractor size={16} className="text-amber-600" />
                                {isEditing ? (
                                    <input defaultValue={user.farmName} className="bg-white px-2 py-1 rounded border border-gray-300 w-full" />
                                ) : user.farmName || 'Not specified'}
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                            <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1">District</p>
                            <div className="flex items-center gap-2 text-gray-700 font-medium">
                                <MapPin size={16} className="text-red-500" />
                                {user.district || 'Not specified'}
                            </div>
                        </div>
                        {user.farmAddress && (
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                                <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1">Full Address</p>
                                <div className="flex items-center gap-2 text-gray-700 font-medium">
                                    <MapPin size={16} className="text-purple-500" />
                                    {user.farmAddress}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Documents */}
            {(user.farmPhotoUrl || user.identityProofUrl) && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                            <FileText size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Documents</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {user.farmPhotoUrl && (
                            <div className="group relative rounded-2xl overflow-hidden border border-gray-200 aspect-video bg-gray-100">
                                <img src={`${baseUrl}${user.farmPhotoUrl}`} alt="Farm" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                    <p className="text-white font-medium flex items-center gap-2"><Image size={16} /> Farm Photo</p>
                                </div>
                            </div>
                        )}
                        {user.identityProofUrl && (
                            <div className="group relative rounded-2xl overflow-hidden border border-gray-200 aspect-video bg-gray-100">
                                <img src={`${baseUrl}${user.identityProofUrl}`} alt="Identity" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                    <p className="text-white font-medium flex items-center gap-2"><FileText size={16} /> Identity Proof</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {isEditing && (
                <div className="fixed bottom-6 right-6 flex gap-3 z-50">
                    <button onClick={() => setIsEditing(false)} className="px-6 py-3 bg-white text-gray-700 font-bold rounded-full shadow-lg border border-gray-100 hover:bg-gray-50">Cancel</button>
                    <button onClick={handleSave} className="px-6 py-3 bg-green-600 text-white font-bold rounded-full shadow-lg shadow-green-500/30 hover:bg-green-700 flex items-center gap-2">
                        <Save size={20} /> Save Changes
                    </button>
                </div>
            )}
        </div>
    );
};

export default FarmerProfile;
