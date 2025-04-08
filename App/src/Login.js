import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();
            console.log(result)
            if (response.ok && result.success) {
                localStorage.setItem("userEmail", result.user.email);
                localStorage.setItem("userName", result.user.name); // Store name too
                localStorage.setItem("userCourse", result.user.course || "Not Set");                

                // Redirect to admin page if email is admin
                if (result.user.email === "admin@admin") {
                    navigate('/admin');
                } else {
                    navigate('/chapters');
                }
            } else {
                setError(result.message || 'Invalid email or password.');
            }
        } catch (error) {
            setError('An error occurred while logging in.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-stone-100 font-serif flex flex-col justify-center items-center p-4">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 overflow-hidden opacity-10">
                {[...Array(15)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full bg-stone-400"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            width: `${Math.random() * 60 + 20}px`,
                            height: `${Math.random() * 60 + 20}px`,
                        }}
                        animate={{
                            y: [0, Math.random() * 50 - 25],
                            opacity: [0.05, 0.1, 0.05],
                        }}
                        transition={{
                            duration: Math.random() * 10 + 15,
                            repeat: Infinity,
                            repeatType: "reverse",
                        }}
                    />
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white bg-opacity-20 p-8 rounded-lg shadow-lg w-full max-w-md relative z-10"
            >
                <h2 className="text-3xl mb-6 text-center text-stone-800">Login to LearnAI</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block mb-1 text-stone-800">Email</label>
                        <div className="relative">
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 bg-white bg-opacity-50 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300 pl-10
                                shadow-md border border-stone-500 backdrop-blur-md"
                                required
                            />
                            <Mail className="absolute left-3 top-2.5 text-gray-500" size={20} />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password" className="block mb-1 text-stone-800">Password</label>
                        <div className="relative">
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 bg-white bg-opacity-50 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300 pl-10
                                shadow-md border border-stone-500 backdrop-blur-md"
                                required
                            />
                            <Lock className="absolute left-3 top-2.5 text-gray-500" size={20} />
                        </div>
                    </div>
                    <br/>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-1/2 mx-auto bg-gradient-to-r from-stone-700 to-stone-600 text-amber-50 py-2.5 px-5 rounded-full text-xl shadow-md flex items-center justify-center transition-all mt-12"
                        type="submit"
                    >
                        Login
                    </motion.button>
                    {error && <p className="text-red-500 text-center mt-2">{error}</p>}
                </form>
                <div className="mt-6 text-center">
                    <p className="text-stone-800">Don't have an account? <a href="/signup" className="text-brown-600 hover:underline">Sign up</a></p>
                </div>
            </motion.div>
            <motion.div className="relative z-10 mt-8">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-stone-800 flex items-center cursor-pointer"
                    onClick={() => navigate('/')}
                >
                    <ArrowLeft className="mr-2" />
                    Back to Home
                </motion.button>
            </motion.div>

        </div>
    );
};

export default LoginPage;