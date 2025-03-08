import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Mail, User, Calendar, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SignupPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(1);
  const [course, setCourse] = useState('');
  const [dob, setDob] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        setStep(2); // Move to the next step
      } else {
        console.error('Signup failed');
      }
    } catch (error) {
      console.error('Error signing up:', error);
    }
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/update-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, course, dob }),
      });

      if (response.ok) {
        console.log('User details updated successfully');
        navigate('/'); // Navigate to home or another page
      } else {
        console.error('Failed to update details');
      }
    } catch (error) {
      console.error('Error updating details:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 text-white flex flex-col justify-center items-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white bg-opacity-20 p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        {step === 1 ? (
          <>
            <h2 className="text-3xl font-bold mb-6 text-center">Join AgentX</h2>
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label htmlFor="name" className="block mb-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-white bg-opacity-50 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300 pl-10"
                    required
                  />
                  <User className="absolute left-3 top-2.5 text-gray-500" size={20} />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block mb-1">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white bg-opacity-50 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300 pl-10"
                    required
                  />
                  <Mail className="absolute left-3 top-2.5 text-gray-500" size={20} />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block mb-1">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-white bg-opacity-50 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300 pl-10"
                    required
                  />
                  <Lock className="absolute left-3 top-2.5 text-gray-500" size={20} />
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-red-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
                type="submit"
              >
                Sign Up
              </motion.button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold mb-6 text-center">Additional Details</h2>
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div>
                <label htmlFor="course" className="block mb-1">Course</label>
                <div className="relative">
                  <select
                    id="course"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full px-3 py-2 bg-white bg-opacity-50 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300 pl-10"
                    required
                  >
                    <option value="" disabled selected hidden>Select a course</option>
                    <option value="DSA">Data Structures and Algorithms</option>
                    <option value="CN">Computer Networks</option>
                    <option value="OS">Operating system</option>
                  </select>
                  <BookOpen className="absolute left-3 top-2.5 text-gray-500" size={20} />
                </div>
              </div>
              <div>
                <label htmlFor="dob" className="block mb-1">Date of Birth</label>
                <div className="relative">
                  <input
                    type="date"
                    id="dob"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-2 bg-white bg-opacity-50 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300 pl-10"
                    required
                  />
                  <Calendar className="absolute left-3 top-2.5 text-gray-500" size={20} />
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-red-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
                type="submit"
              >
                Continue
              </motion.button>
            </form>
          </>
        )}
        <div className="mt-6 text-center">
          <p>Already have an account? <a href="/login" className="text-red-600 hover:underline">Log in</a></p>
        </div>
      </motion.div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-8 text-white flex items-center"
        onClick={() => {
          navigate('/');
        }}
      >
        <ArrowLeft className="mr-2" />
        Back to Home
      </motion.button>
    </div>
  );
};

export default SignupPage;