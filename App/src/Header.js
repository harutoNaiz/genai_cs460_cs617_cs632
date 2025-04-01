import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { motion } from 'framer-motion';

const Header = () => {
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    const userCourse = localStorage.getItem('userCourse');

    const toggleDropdown = () => {
        setDropdownOpen((prev) => !prev);
    };

    const handleLogout = () => {
        localStorage.removeItem('userEmail');
        navigate('/', { replace: true });
        window.location.reload();
    };

    const handleProfilePage = () => {
        navigate('/profile');
    };

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
        <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full fixed top-0 left-0 z-50"
        >
            <div className="flex justify-between items-center p-4 bg-gradient-to-b from-stone-800/90 to-stone-700/70 text-amber-50 font-serif backdrop-blur-sm shadow-lg">
                {/* Course Info */}
                <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="text-xl font-bold ml-4 bg-stone-800/30 px-4 py-2 rounded-lg shadow-md border border-stone-700/50"
                >
                    {userCourse ? `Course: ${userCourse}` : "Course: Not Set"}
                </motion.div>

                {/* User Info & Dropdown */}
                <div ref={dropdownRef} className="relative flex items-center mr-4">
                    {userName && (
                        <motion.span 
                            whileHover={{ scale: 1.05 }}
                            className="mr-3 text-lg bg-stone-800/30 px-3 py-1 rounded-lg shadow-md border border-stone-700/50"
                        >
                            {userName}
                        </motion.span>
                    )}

                    <motion.div 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="cursor-pointer" 
                        onClick={toggleDropdown}
                    >
                        <User size={36} className="text-amber-50 bg-stone-800/30 p-1 rounded-full shadow-md border border-stone-700/50" />
                    </motion.div>

                    {dropdownOpen && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute right-0 mt-2 w-48 bg-white/95 text-stone-800 rounded-lg shadow-xl z-10 border border-stone-300/50 backdrop-blur-sm"
                        >
                            <motion.div 
                                whileHover={{ scale: 1.02, backgroundColor: 'rgba(245, 245, 244, 0.9)' }}
                                className="px-4 py-2 cursor-pointer rounded-t-lg border-b border-stone-200/50"
                                onClick={handleProfilePage}
                            >
                                Profile
                            </motion.div>
                            <motion.div 
                                whileHover={{ scale: 1.02, backgroundColor: 'rgba(245, 245, 244, 0.9)' }}
                                className="px-4 py-2 cursor-pointer rounded-b-lg"
                                onClick={handleLogout}
                            >
                                Logout
                            </motion.div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Subtle bottom fade effect */}
            <div className="h-4 w-full bg-gradient-to-b from-stone-700/70 to-transparent"></div>
        </motion.div>
    );
};

export default Header;