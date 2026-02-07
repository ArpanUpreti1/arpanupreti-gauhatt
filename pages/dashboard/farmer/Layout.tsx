import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../../../components/dashboard/Sidebar';
import { getCurrentUser } from '../../../services/api';

const FarmerLayout: React.FC = () => {
    const navigate = useNavigate();
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
        }
    }, [user, navigate]);

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
