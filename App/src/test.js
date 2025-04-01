import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ListOrdered, ShieldAlert, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from './Header';

const TestPage = () => {
  const navigate = useNavigate();
  const chapter_ = localStorage.getItem('currentChapter');
  const userEmail = localStorage.getItem('userEmail');

  const [emojiIndex, setEmojiIndex] = useState(0);
  const [testReady, setTestReady] = useState(false);
  const [status, setStatus] = useState('Generating questions...');
  const emojis = ["📚", "✍️", "🧠", "⚡", "✅", "🎯", "🔍", "📝", "⏱️", "🏆"];

  useEffect(() => {
    const interval = setInterval(() => {
      setEmojiIndex((prev) => (prev + 1) % emojis.length);
    }, 800); // Slightly faster rotation

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!chapter_ || !userEmail) {
      alert('Missing chapter or email information. Please try again.');
      navigate('/');
      return;
    }

    const prepareTest = async () => {
      try {
        setStatus('Generating questions...');
        const response = await fetch('http://localhost:5000/temp_start_bp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chapter_: chapter_, email: userEmail }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to start test');
        }

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to generate test questions');
        }
        
        setStatus('Processing questions...');
        const csvResponse = await fetch('http://localhost:5000/generate_csv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chapter_: chapter_ }),
        });
        
        if (!csvResponse.ok) {
          const errorData = await csvResponse.json();
          throw new Error(errorData.message || 'Failed to process test questions');
        }
        
        const csvData = await csvResponse.json();
        
        if (csvData.success) {
          setStatus('Test ready! 🎉');
          setTestReady(true);
        } else {
          throw new Error(csvData.message || 'Failed to prepare test data');
        }
      } catch (error) {
        console.error('Error preparing test:', error);
        alert(error.message || 'Failed to prepare test.');
      }
    };

    prepareTest();
  }, [chapter_, userEmail, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-stone-100 font-serif relative">
      {/* Background pattern */}
      <div className="fixed inset-0 overflow-hidden opacity-10 -z-10 pointer-events-none">
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

      <Header />
      <br/>
      <br/>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pt-24 pb-12 px-6 max-w-4xl mx-auto"
      >
        <div className="bg-white/50 rounded-xl p-8 shadow-lg border border-stone-300/50 backdrop-blur-sm">
          <h2 className="text-3xl font-bold mb-6 text-center text-stone-800">
            Test Instructions 📋
          </h2>

          <div className="space-y-4 mb-8">
            <motion.div 
              whileHover={{ x: 5 }}
              className="flex items-start p-4 bg-stone-700/10 rounded-lg border border-stone-700/20"
            >
              <span className="text-2xl mr-3">📝</span>
              <div>
                <h3 className="font-bold text-stone-800 mb-1">Question Format</h3>
                <p className="text-stone-700">The test consists of 25 multiple choice questions.</p>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ x: 5 }}
              className="flex items-start p-4 bg-stone-700/10 rounded-lg border border-stone-700/20"
            >
              <span className="text-2xl mr-3">⏱️</span>
              <div>
                <h3 className="font-bold text-stone-800 mb-1">Time Limit</h3>
                <p className="text-stone-700">You have 60 minutes to complete the test.</p>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ x: 5 }}
              className="flex items-start p-4 bg-stone-700/10 rounded-lg border border-stone-700/20"
            >
              <span className="text-2xl mr-3">👁️</span>
              <div>
                <h3 className="font-bold text-stone-800 mb-1">Test Proctoring</h3>
                <p className="text-stone-700">The test is proctored. Please maintain academic integrity!</p>
              </div>
            </motion.div>
          </div>

          <div className="flex justify-center">
            {testReady ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/taketest')}
                className="bg-gradient-to-r from-stone-700 to-stone-600 text-amber-50 py-3 px-8 rounded-full text-lg shadow-md flex items-center"
              >
                Begin Test <ArrowRight className="ml-2 h-5 w-5" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                disabled
                className="bg-stone-700/30 text-stone-800 py-3 px-6 rounded-full shadow-inner flex items-center border border-stone-700/30"
              >
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                <span>{status} <span className="text-xl ml-1">{emojis[emojiIndex]}</span></span>
              </motion.button>
            )}
          </div>

          {testReady && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-center text-stone-600 text-sm"
            >
              <p>Good luck! You've got this! 💪</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TestPage;