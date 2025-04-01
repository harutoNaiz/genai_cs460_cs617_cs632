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
        {step === 1 ? (
          <>
            <h2 className="text-3xl mb-6 text-center text-stone-800">Join LearnAI</h2>
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label htmlFor="name" className="block mb-1 text-stone-800">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-white bg-opacity-50 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300 pl-10
                    shadow-md border border-stone-500 backdrop-blur-md"
                    required
                  />
                  <User className="absolute left-3 top-2.5 text-gray-500" size={20} />
                </div>
              </div>
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
                Continue
              </motion.button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-3xl mb-6 text-center text-stone-800">Additional Details</h2>
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div>
                <label htmlFor="course" className="block mb-1 text-stone-800">Course</label>
                <div className="relative">
                  <select
                    id="course"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full px-3 py-2 bg-white bg-opacity-50 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300 pl-10
                    shadow-md border border-stone-500 backdrop-blur-md appearance-none"
                    required
                  >
                    <option value="" disabled selected hidden>Select a course</option>
                    <option value="Data Structures and Algorithms">Data Structures and Algorithms</option>
                    <option value="Computer Networks">Computer Networks</option>
                    <option value="Operating system">Operating system</option>
                  </select>
                  <BookOpen className="absolute left-3 top-2.5 text-gray-500" size={20} />
                </div>
              </div>
              <div>
                <label htmlFor="dob" className="block mb-1 text-stone-800">Date of Birth</label>
                <div className="relative">
                  <input
                    type="date"
                    id="dob"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-2 bg-white bg-opacity-50 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300 pl-10
                    shadow-md border border-stone-500 backdrop-blur-md"
                    required
                  />
                  <Calendar className="absolute left-3 top-2.5 text-gray-500" size={20} />
                </div>
              </div>
              <br/>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-1/2 mx-auto bg-gradient-to-r from-stone-700 to-stone-600 text-amber-50 py-2.5 px-5 rounded-full text-xl shadow-md flex items-center justify-center transition-all mt-12"
                type="submit"
              >
                Complete
              </motion.button>
            </form>
          </>
        )}
        <div className="mt-6 text-center">
          <p className="text-stone-800">
            {step === 1 ? "Already have an account?" : "Want to change something?"} 
            <a href={step === 1 ? "/login" : "/signup"} className="text-brown-600 hover:underline ml-1">
              {step === 1 ? "Log in" : "Go back"}
            </a>
          </p>
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

export default SignupPage;