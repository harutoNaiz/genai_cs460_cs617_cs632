import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';

const Header = () => {
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    const userCourse = localStorage.getItem('userCourse'); // Retrieve course

    const toggleDropdown = () => {
        setDropdownOpen((prev) => !prev);
    };

    const handleLogout = () => {
        localStorage.removeItem('userEmail');
        navigate('/', { replace: true }); // Prevents going back to the previous page
        window.location.reload(); // Ensures the login page reloads to clear previous session state
    };

    const handleProfilePage = () => {
        navigate('/profile');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="flex justify-between items-center p-4 bg-purple-600 text-white">
            {/* Display Course on the Left - Bigger Text */}
            <div className="text-2xl font-bold ml-4">
                {userCourse ? `Course: ${userCourse}` : "Course: Not Set"}
            </div>

            {/* User Info & Dropdown on the Right */}
            <div ref={dropdownRef} className="relative flex items-center mr-4">
                {/* Display User Name Next to Icon */}
                {userName && <span className="mr-2 text-lg">{userName}</span>}

                {/* User Icon */}
                <div className="cursor-pointer" onClick={toggleDropdown}>
                    <User size={40} className="text-white" />
                </div>

                {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white text-purple-600 rounded shadow-lg z-10">
                        <div className="px-4 py-2 hover:bg-gray-200 cursor-pointer" onClick={handleProfilePage}>
                            Profile
                        </div>
                        <div className="px-4 py-2 hover:bg-gray-200 cursor-pointer" onClick={handleLogout}>
                            Logout
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Header;
