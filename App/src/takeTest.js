import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ChevronRight, Clock, ChevronLeft, Flag, Bookmark } from 'lucide-react';
import Papa from 'papaparse';
import { motion } from 'framer-motion';

const TakeTest = () => {
  const navigate = useNavigate();
  const chapter = localStorage.getItem('currentChapter');
  const userEmail = localStorage.getItem('userEmail');

  // State management
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [loading, setLoading] = useState(true);
  const [showConfirmEndModal, setShowConfirmEndModal] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [testCompleted, setTestCompleted] = useState(false);
  const [analytics, setAnalytics] = useState({
    score: 0,
    totalScore: 0,
    wrongQuestions: [],
    strongTopics: [],
    weakTopics: [],
    difficultyStats: { easy: 0, medium: 0, hard: 0 },
    totalByDifficulty: { easy: 0, medium: 0, hard: 0 }
  });
  const [showQuestionNav, setShowQuestionNav] = useState(false);
  const [testStartTime, setTestStartTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const timerRef = useRef(null);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Load questions from CSV
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetch(`http://localhost:5000/serve?filename=output_${chapter}.csv`);
          
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }  
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            const shuffledQuestions = results.data
              .filter(q => q.Question && q.Question.trim() !== '')
              .sort(() => Math.random() - 0.5);
            
            setQuestions(shuffledQuestions);
            setUserAnswers(new Array(shuffledQuestions.length).fill(null));
            setLoading(false);
            setTestStartTime(Date.now()); // Set test start time when questions load
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
            alert('Failed to load test questions. Please try again.');
            navigate('/');
          }
        });
      } catch (error) {
        console.error('Error loading questions:', error);
        alert('Failed to load test questions. Please try again.');
        navigate('/');
      }
    };

    if (chapter) {
      loadQuestions();
    } else {
      alert('Missing chapter information');
      navigate('/');
    }
  }, [chapter, navigate]);

  // Timer logic based on system time
  useEffect(() => {
    if (loading || testCompleted || !testStartTime) return;

    const calculateTimeLeft = () => {
      const elapsedSeconds = Math.floor((Date.now() - testStartTime) / 1000);
      const remainingSeconds = Math.max(60 * 60 - elapsedSeconds, 0);
      setTimeLeft(remainingSeconds);
      
      if (remainingSeconds <= 0) {
        handleEndTest(true);
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Then set up interval
    timerRef.current = setInterval(calculateTimeLeft, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [loading, testCompleted, testStartTime]);

  // Handle answer selection
  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = option;
    setUserAnswers(newAnswers);
  };

  // Go to previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
      setSelectedOption(userAnswers[currentQuestionIndex - 1] || '');
    }
  };

  // Go to the next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setSelectedOption(userAnswers[currentQuestionIndex + 1] || '');
    } else {
      setShowConfirmEndModal(true);
    }
  };

  // Jump to specific question
  const jumpToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    setSelectedOption(userAnswers[index] || '');
  };

  // Calculate test results
  const calculateResults = useCallback(() => {
    const results = {
      score: 0,
      totalScore: 0,
      wrongQuestions: [],
      strongTopics: {},
      weakTopics: {},
      difficultyStats: { easy: 0, medium: 0, hard: 0 },
      totalByDifficulty: { easy: 0, medium: 0, hard: 0 }
    };

    questions.forEach((question, index) => {
      const userAnswer = userAnswers[index];
      const correctAnswerText = question['Correct Option'];
      const subtopic = question.Subtopic;
      const subtopicDetail = question['Subtopic Detail'];
      const difficulty = question.Difficulty?.toLowerCase() || 'e';
      
      let points = 1;
      if (difficulty === 'm') points = 2;
      if (difficulty === 'h') points = 3;
      
      if (difficulty === 'e') results.totalByDifficulty.easy += 1;
      else if (difficulty === 'm') results.totalByDifficulty.medium += 1;
      else if (difficulty === 'h') results.totalByDifficulty.hard += 1;
      
      results.totalScore += points;

      const correctAnswer = Object.entries(question).find(([key, value]) =>
        key.startsWith('Option') && value.trim() === correctAnswerText.trim()
      )?.[0]?.split(' ')[1];
      
      if (userAnswer && userAnswer === correctAnswer) {
        results.score += points;
        
        if (difficulty === 'e') results.difficultyStats.easy += 1;
        else if (difficulty === 'm') results.difficultyStats.medium += 1;
        else if (difficulty === 'h') results.difficultyStats.hard += 1;
        
        if (!results.strongTopics[subtopic]) {
          results.strongTopics[subtopic] = [];
        }
        if (!results.strongTopics[subtopic].includes(subtopicDetail)) {
          results.strongTopics[subtopic].push(subtopicDetail);
        }
      } else {
        results.wrongQuestions.push({
          question: question.Question,
          correctAnswer,
          userAnswer: userAnswer || 'No answer',
          subtopic,
          subtopicDetail
        });
        
        if (!results.weakTopics[subtopic]) {
          results.weakTopics[subtopic] = [];
        }
        if (!results.weakTopics[subtopic].includes(subtopicDetail)) {
          results.weakTopics[subtopic].push(subtopicDetail);
        }
      }
    });
    
    const strongTopicsArray = Object.entries(results.strongTopics).map(([topic, details]) => ({
      topic,
      details
    }));
    
    const weakTopicsArray = Object.entries(results.weakTopics).map(([topic, details]) => ({
      topic,
      details
    }));
    
    return {
      ...results,
      strongTopics: strongTopicsArray,
      weakTopics: weakTopicsArray,
      percentScore: (results.score / results.totalScore) * 100
    };
  }, [questions, userAnswers]);

  // End the test and submit results
  const handleEndTest = async (isAutoSubmit = false) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setTestCompleted(true);
    const results = calculateResults();
    setAnalytics(results);
    
    try {
      const response = await fetch('http://localhost:5000/submit_test_results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          chapter: chapter,
          score: results.score,
          totalScore: results.totalScore,
          percentScore: results.percentScore,
          strongTopics: results.strongTopics,
          weakTopics: results.weakTopics,
          wrongQuestions: results.wrongQuestions,
          difficultyStats: results.difficultyStats,
          startTime: testStartTime,
          endTime: Date.now()
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('testResults', JSON.stringify(results));
        navigate('/test-results');
      } else {
        console.error('Failed to submit test results:', data.message);
        alert('Test completed, but there was an issue saving your results. ' + 
              (isAutoSubmit ? 'Time expired. ' : '') +
              'Please contact support.');
        navigate('/test-results');
      }
    } catch (error) {
      console.error('Error submitting test results:', error);
      alert('Test completed, but there was an issue saving your results. ' + 
            (isAutoSubmit ? 'Time expired. ' : '') +
            'Please contact support.');
      navigate('/test-results');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-stone-100 font-serif flex items-center justify-center">
        <div className="text-stone-800 text-xl">Loading test questions...</div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const options = ['A', 'B', 'C', 'D'];

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

      <div className="pt-24 pb-12 px-6 max-w-6xl mx-auto flex">
        {/* Main content area */}
        <div className={`${showQuestionNav ? 'mr-8' : ''} flex-1 transition-all duration-300`}>
          {/* Timer and Progress Bar */}
          <div className="bg-white/50 rounded-xl p-4 mb-6 shadow-md border border-stone-300/50 backdrop-blur-sm flex justify-between items-center">
            <div className="flex items-center text-stone-800">
              <Clock className="h-5 w-5 mr-2" />
              <span className="font-bold">{formatTime(timeLeft)}</span>
            </div>
            <div className="text-stone-800">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-stone-700/20 text-stone-800 px-3 py-1 rounded-full flex items-center border border-stone-700/30 text-sm"
              onClick={() => setShowQuestionNav(!showQuestionNav)}
            >
              <Bookmark className="h-4 w-4 mr-1" />
              {showQuestionNav ? 'Hide Navigation' : 'Question Navigator'}
            </motion.button>
          </div>
          
          {/* Question Card */}
          <div className="bg-white/70 rounded-xl shadow-lg p-8 mb-8 border border-stone-300/50 backdrop-blur-sm">
            <h3 className="text-2xl font-bold mb-6 text-stone-800">{currentQuestion?.Question}</h3>
            
            <div className="space-y-4">
              {options.map((option, index) => (
                <motion.button
                  key={option}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    selectedOption === option
                      ? 'bg-stone-700/10 border-stone-700/50'
                      : 'bg-white/50 border-stone-300 hover:bg-stone-100/50'
                  }`}
                  onClick={() => handleOptionSelect(option)}
                >
                  <span className="font-medium mr-2 text-stone-800">{option}.</span>
                  <span className="text-stone-700">{currentQuestion?.[`Option ${option}`]}</span>
                </motion.button>
              ))}
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex justify-between">
            <div className="flex space-x-4">
              {currentQuestionIndex > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-stone-700/20 text-stone-800 px-4 py-2 rounded-full flex items-center border border-stone-700/30"
                  onClick={handlePreviousQuestion}
                >
                  <ChevronLeft className="h-5 w-5 mr-1" />
                  Previous
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-stone-700/20 text-stone-800 px-4 py-2 rounded-full flex items-center border border-stone-700/30"
                onClick={() => setShowConfirmEndModal(true)}
              >
                <Flag className="h-5 w-5 mr-1" />
                End Test
              </motion.button>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-stone-700 to-stone-600 text-amber-50 px-6 py-2 rounded-full flex items-center shadow-md"
              onClick={handleNextQuestion}
            >
              {currentQuestionIndex < questions.length - 1 ? (
                <>
                  Next <ChevronRight className="ml-1 h-5 w-5" />
                </>
              ) : (
                'Finish Test'
              )}
            </motion.button>
          </div>
        </div>

        {/* Question Navigation Sidebar - Now persistent when shown */}
        {showQuestionNav && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-64 bg-white/70 rounded-xl shadow-lg p-4 border border-stone-300/50 backdrop-blur-sm h-fit sticky top-28"
          >
            <h3 className="text-lg font-bold mb-4 text-stone-800 flex items-center">
              <Bookmark className="h-5 w-5 mr-2" />
              Question Navigator
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    currentQuestionIndex === index
                      ? 'bg-stone-700 text-amber-50'
                      : userAnswers[index]
                      ? 'bg-stone-700/20 text-stone-800 font-bold border border-stone-700/30'
                      : 'bg-white/50 text-stone-700 border border-stone-300'
                  }`}
                  onClick={() => jumpToQuestion(index)}
                >
                  {index + 1}
                </motion.button>
              ))}
            </div>
            <div className="mt-4 text-sm text-stone-600">
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 rounded-full bg-stone-700 mr-2"></div>
                <span>Current</span>
              </div>
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 rounded-full bg-stone-700/20 border border-stone-700/30 mr-2"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-white/50 border border-stone-300 mr-2"></div>
                <span>Unanswered</span>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Confirmation Modal */}
        {showConfirmEndModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 rounded-xl p-6 max-w-md w-full border border-stone-300/50 backdrop-blur-sm"
            >
              <h3 className="text-xl font-bold mb-4 flex items-center text-stone-800">
                <AlertCircle className="h-6 w-6 text-amber-600 mr-2" />
                End Test Confirmation
              </h3>
              <p className="mb-6 text-stone-700">
                Are you sure you want to end the test? You have answered {userAnswers.filter(a => a !== null).length} out of {questions.length} questions.
              </p>
              <div className="flex justify-end space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 border border-stone-300 rounded-full hover:bg-stone-100 text-stone-800"
                  onClick={() => setShowConfirmEndModal(false)}
                >
                  Continue Test
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-gradient-to-r from-stone-700 to-stone-600 text-amber-50 rounded-full hover:opacity-90"
                  onClick={() => {
                    setShowConfirmEndModal(false);
                    handleEndTest();
                  }}
                >
                  End Test
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TakeTest;