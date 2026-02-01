import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, LogOut } from 'lucide-react';
import { clearAuthData, getCurrentUser } from '../../services/api';
import FarmerApproval from './admin/FarmerApproval';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const user = getCurrentUser();

    const handleLogout = () => {
        clearAuthData();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="inline-flex items-center gap-2">
                        <div className="w-9 h-9 bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
                            <Leaf size={22} fill="currentColor" />
                        </div>
                        <span className="text-2xl font-serif font-bold text-gray-900 tracking-tight">GAUHATT</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {user && (
                            <span className="text-gray-600">
                                Welcome, <span className="font-semibold text-primary-600">{user.username}</span>
                            </span>
                        )}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <div className="max-w-7xl mx-auto">
                    <FarmerApproval />
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
