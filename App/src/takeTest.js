import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ChevronRight, Clock, CheckCircle } from 'lucide-react';
import Papa from 'papaparse';

const TakeTest = () => {
  const navigate = useNavigate();
  const chapter = localStorage.getItem('currentChapter');
  const userEmail = localStorage.getItem('userEmail');

  // State management
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes in seconds
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
        // http://localhost:5000/static/generated_tests/output_${chapter}.csv
        // const response = await fetch(`http://localhost:5000/serve`);

        const response = await fetch(`http://localhost:5000/serve?filename=output_${chapter}.csv`);
          
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }  
        const csvText = await response.text();
        console.log(`Attempting to fetch: http://localhost:5000/serve?filename=output_${chapter}.csv`);
        
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            // Shuffle questions for random order
            const shuffledQuestions = results.data
              .filter(q => q.Question && q.Question.trim() !== '') // Filter out empty questions
              .sort(() => Math.random() - 0.5);
            
            setQuestions(shuffledQuestions);
            setUserAnswers(new Array(shuffledQuestions.length).fill(null));
            setLoading(false);
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

  // Timer logic
  useEffect(() => {
    if (loading || testCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleEndTest(true); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, testCompleted]);

  // Handle answer selection
  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    
    // Update user answers array
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = option;
    setUserAnswers(newAnswers);
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
      
      // Determine points based on difficulty
      let points = 1;
      if (difficulty === 'm') points = 2;
      if (difficulty === 'h') points = 3;
      
      // Update difficulty counters
      if (difficulty === 'e') results.totalByDifficulty.easy += 1;
      else if (difficulty === 'm') results.totalByDifficulty.medium += 1;
      else if (difficulty === 'h') results.totalByDifficulty.hard += 1;
      
      results.totalScore += points;

      // Find the correct option letter by checking which option matches the correct answer text
      const correctAnswer = Object.entries(question).find(([key, value]) =>
        key.startsWith('Option') && value.trim() === correctAnswerText.trim()
      )?.[0]?.split(' ')[1]; // Extract 'A', 'B', 'C', or 'D'
      
      // Check if answer is correct
      if (userAnswer && userAnswer === correctAnswer) {
        results.score += points;
        
        // Track difficulty stats for correct answers
        if (difficulty === 'e') results.difficultyStats.easy += 1;
        else if (difficulty === 'm') results.difficultyStats.medium += 1;
        else if (difficulty === 'h') results.difficultyStats.hard += 1;
        
        // Track strong topics
        if (!results.strongTopics[subtopic]) {
          results.strongTopics[subtopic] = [];
        }
        if (!results.strongTopics[subtopic].includes(subtopicDetail)) {
          results.strongTopics[subtopic].push(subtopicDetail);
        }
      } else {
        // Track wrong questions
        results.wrongQuestions.push({
          question: question.Question,
          correctAnswer,
          userAnswer: userAnswer || 'No answer',
          subtopic,
          subtopicDetail
        });
        
        // Track weak topics
        if (!results.weakTopics[subtopic]) {
          results.weakTopics[subtopic] = [];
        }
        if (!results.weakTopics[subtopic].includes(subtopicDetail)) {
          results.weakTopics[subtopic].push(subtopicDetail);
        }
      }
    });
    
    // Convert topic objects to arrays for database storage
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
    setTestCompleted(true);
    const results = calculateResults();
    setAnalytics(results);
    
    try {
      // Send results to backend
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
          difficultyStats: results.difficultyStats
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Store results in localStorage for analytics page
        localStorage.setItem('testResults', JSON.stringify(results));
        
        // Navigate to results page
        navigate('/test-results');
      } else {
        console.error('Failed to submit test results:', data.message);
        alert('Test completed, but there was an issue saving your results. ' + 
              (isAutoSubmit ? 'Time expired. ' : '') +
              'Please contact support.');
        
        // Still navigate to results page even if there was an error
        navigate('/test-results');
      }
    } catch (error) {
      console.error('Error submitting test results:', error);
      alert('Test completed, but there was an issue saving your results. ' + 
            (isAutoSubmit ? 'Time expired. ' : '') +
            'Please contact support.');
      
      // Still navigate to results even if there was an error
      navigate('/test-results');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-white text-xl">Loading test questions...</div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const options = ['A', 'B', 'C', 'D'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      {/* Timer and Progress Bar */}
      <div className="max-w-3xl mx-auto bg-white bg-opacity-20 rounded-lg p-4 mb-4 flex justify-between items-center">
        <div className="flex items-center">
          <Clock className="h-5 w-5 mr-2 text-white" />
          <span className="text-white font-bold">{formatTime(timeLeft)}</span>
        </div>
        <div className="text-white">
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
      </div>
      
      {/* Question Card */}
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-bold mb-6">{currentQuestion?.Question}</h3>
        
        <div className="space-y-4">
          {options.map((option, index) => (
            <button
              key={option}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                selectedOption === option
                  ? 'bg-blue-100 border-blue-500'
                  : 'bg-white border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => handleOptionSelect(option)}
            >
              <span className="font-medium mr-2">{option}.</span>
              {currentQuestion?.[`Option ${option}`]}
            </button>
          ))}
        </div>
      </div>
      
      {/* Navigation */}
      <div className="max-w-3xl mx-auto flex justify-between">
        <div></div> {/* Empty div for spacing */}
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center"
          onClick={handleNextQuestion}
        >
          {currentQuestionIndex < questions.length - 1 ? (
            <>
              Next <ChevronRight className="ml-1 h-5 w-5" />
            </>
          ) : (
            'Finish Test'
          )}
        </button>
      </div>
      
      {/* Confirmation Modal */}
      {showConfirmEndModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <AlertCircle className="h-6 w-6 text-yellow-500 mr-2" />
              End Test Confirmation
            </h3>
            <p className="mb-6">
              Are you sure you want to end the test? You have answered {userAnswers.filter(a => a !== null).length} out of {questions.length} questions.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                onClick={() => setShowConfirmEndModal(false)}
              >
                Continue Test
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={() => {
                  setShowConfirmEndModal(false);
                  handleEndTest();
                }}
              >
                End Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeTest;