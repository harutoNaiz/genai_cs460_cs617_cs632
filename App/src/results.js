import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, CheckCircle, XCircle, BookOpen, Award, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from './Header';

const TestResults = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  
  useEffect(() => {
    const storedResults = localStorage.getItem('testResults');
    
    if (storedResults) {
      setResults(JSON.parse(storedResults));
    } else {
      alert('Test results not found. Redirecting to home page.');
      navigate('/');
    }
  }, [navigate]);
  
  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-stone-100 font-serif flex items-center justify-center">
        <div className="text-stone-800 text-xl">Loading results...</div>
      </div>
    );
  }
  
  const percentCorrect = Math.round((results.score / results.totalScore) * 100);
  const passedTest = percentCorrect >= 80;
  
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
      
      <div className="pt-24 pb-12 px-8 max-w-6xl mx-auto">
        {/* Results Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 rounded-xl shadow-lg p-8 mb-8 border border-stone-300/50 backdrop-blur-sm"
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4 text-stone-800">Test Results</h1>
            <div className="flex items-center justify-center mb-6">
              {passedTest ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center text-green-600"
                >
                  <CheckCircle className="h-10 w-10 mr-3" />
                  <span className="text-2xl font-bold">Congratulations!</span>
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center text-amber-600"
                >
                  <BookOpen className="h-10 w-10 mr-3" />
                  <span className="text-2xl font-bold">Keep Practicing</span>
                </motion.div>
              )}
            </div>
            
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-6xl font-bold mb-4 text-stone-800"
            >
              {percentCorrect}%
            </motion.div>
            
            <div className="text-stone-600 mb-6 text-lg">
              You scored {results.score} out of {results.totalScore} points
            </div>
            
            {passedTest && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-green-100/80 text-green-800 p-4 rounded-xl inline-flex items-center border border-green-200/50"
              >
                <Award className="h-6 w-6 mr-2" />
                {percentCorrect >= 90 
                  ? "Excellent! You've mastered this chapter." 
                  : "Good job! You've passed this chapter."}
              </motion.div>
            )}
          </div>
        </motion.div>
        
        {/* Performance by Difficulty */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/70 rounded-xl shadow-lg p-8 mb-8 border border-stone-300/50 backdrop-blur-sm"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center text-stone-800">
            <PieChart className="h-6 w-6 mr-3 text-stone-700" />
            Performance by Difficulty
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-green-50/70 p-6 rounded-xl text-center border border-green-200/50"
            >
              <div className="text-lg font-medium text-green-700 mb-2">Easy</div>
              <div className="text-3xl font-bold text-stone-800 mb-1">
                {results.difficultyStats.easy}/{results.totalByDifficulty.easy}
              </div>
              <div className="text-sm text-stone-600">
                {Math.round((results.difficultyStats.easy / 
                  (results.totalByDifficulty.easy || 1)) * 100)}% Correct
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-amber-50/70 p-6 rounded-xl text-center border border-amber-200/50"
            >
              <div className="text-lg font-medium text-amber-700 mb-2">Medium</div>
              <div className="text-3xl font-bold text-stone-800 mb-1">
                {results.difficultyStats.medium}/{results.totalByDifficulty.medium}
              </div>
              <div className="text-sm text-stone-600">
                {Math.round((results.difficultyStats.medium / 
                  (results.totalByDifficulty.medium || 1)) * 100)}% Correct
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-red-50/70 p-6 rounded-xl text-center border border-red-200/50"
            >
              <div className="text-lg font-medium text-red-700 mb-2">Hard</div>
              <div className="text-3xl font-bold text-stone-800 mb-1">
                {results.difficultyStats.hard}/{results.totalByDifficulty.hard}
              </div>
              <div className="text-sm text-stone-600">
                {Math.round((results.difficultyStats.hard / 
                  (results.totalByDifficulty.hard || 1)) * 100)}% Correct
              </div>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Strong and Weak Topics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Strong Topics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/70 rounded-xl shadow-lg p-8 border border-stone-300/50 backdrop-blur-sm"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center text-stone-800">
              <CheckCircle className="h-6 w-6 mr-3 text-green-600" />
              Strong Topics
            </h2>
            
            {results.strongTopics.length === 0 ? (
              <p className="text-stone-600 italic">No strong topics identified</p>
            ) : (
              <ul className="space-y-4">
                {results.strongTopics.map((topicObj, index) => (
                  <motion.li 
                    key={index} 
                    whileHover={{ x: 5 }}
                    className="bg-green-50/70 p-4 rounded-lg border border-green-200/50"
                  >
                    <div className="font-medium text-green-700">{topicObj.topic}</div>
                    <div className="text-sm text-stone-600 mt-1">
                      {topicObj.details.join(', ')}
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>
          
          {/* Weak Topics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/70 rounded-xl shadow-lg p-8 border border-stone-300/50 backdrop-blur-sm"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center text-stone-800">
              <XCircle className="h-6 w-6 mr-3 text-red-600" />
              Areas for Improvement
            </h2>
            
            {results.weakTopics.length === 0 ? (
              <p className="text-stone-600 italic">No weak topics identified</p>
            ) : (
              <ul className="space-y-4">
                {results.weakTopics.map((topicObj, index) => (
                  <motion.li 
                    key={index} 
                    whileHover={{ x: 5 }}
                    className="bg-red-50/70 p-4 rounded-lg border border-red-200/50"
                  >
                    <div className="font-medium text-red-700">{topicObj.topic}</div>
                    <div className="text-sm text-stone-600 mt-1">
                      {topicObj.details.join(', ')}
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>
        </div>
        
        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="bg-stone-700/20 text-stone-800 px-6 py-3 rounded-full flex items-center justify-center border border-stone-700/30"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Return to Dashboard
          </motion.button>
          
          {!passedTest && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/chapters`)}
              className="bg-gradient-to-r from-stone-700 to-stone-600 text-amber-50 px-6 py-3 rounded-full flex items-center justify-center shadow-md"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Study Chapter Again
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TestResults;