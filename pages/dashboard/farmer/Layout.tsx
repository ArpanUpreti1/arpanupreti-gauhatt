import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../../../components/dashboard/Sidebar';
import { getCurrentUser } from '../../../services/api';

const FarmerLayout: React.FC = () => {
    const navigate = useNavigate();
    const [isChecking, setIsChecking] = useState(true);
    const user = getCurrentUser();

    useEffect(() => {
        // Check if user is logged in and is a farmer
        const token = localStorage.getItem('token');
        
        if (!token || !user) {
            // Not logged in, redirect to login
            navigate('/login');
            return;
        }
        
        if (user.role !== 'Farmer') {
            // Not a farmer, redirect to appropriate page
            if (user.role === 'Consumer') {
                navigate('/home');
            } else if (user.role === 'Admin') {
                navigate('/admin');
            } else {
                navigate('/login');
            }
            return;
        }
        
        // User is authenticated and is a farmer
        setIsChecking(false);
    }, [user, navigate]);

    // Show nothing while checking auth to prevent flash
    if (isChecking) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex">
            {/* Fixed Sidebar */}
            <Sidebar />

            {/* Main Content Wrapper */}
            <div className="flex-1 ml-64 min-h-screen flex flex-col">
                {/* Main Content Area */}
                <main className="flex-1 p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default FarmerLayout;
