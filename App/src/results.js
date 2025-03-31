import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, LineChart, CheckCircle, XCircle, BookOpen, Award } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-white text-xl">Loading results...</div>
      </div>
    );
  }
  
  const percentCorrect = Math.round((results.score / results.totalScore) * 100);
  const passedTest = percentCorrect >= 80;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      
      <div className="max-w-4xl mx-auto mt-8">
        {/* Results Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Test Results</h1>
          <div className="flex items-center justify-center mb-4">
            {passedTest ? (
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-8 w-8 mr-2" />
                <span className="text-xl font-bold">Congratulations!</span>
              </div>
            ) : (
              <div className="flex items-center text-orange-500">
                <BookOpen className="h-8 w-8 mr-2" />
                <span className="text-xl font-bold">Keep Practicing</span>
              </div>
            )}
          </div>
          
          <div className="text-5xl font-bold mb-2">
            {percentCorrect}%
          </div>
          
          <div className="text-gray-500 mb-6">
            You scored {results.score} out of {results.totalScore} points
          </div>
          
          {passedTest && (
            <div className="bg-green-100 text-green-800 p-3 rounded-lg inline-flex items-center">
              <Award className="h-5 w-5 mr-2" />
              {percentCorrect >= 90 
                ? "Excellent! You've mastered this chapter." 
                : "Good job! You've passed this chapter."}
            </div>
          )}
        </div>
        
        {/* Performance by Difficulty */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-blue-500" />
            Performance by Difficulty
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-lg font-medium text-green-700">Easy</div>
              <div className="text-2xl font-bold">
                {results.difficultyStats.easy}/{results.totalByDifficulty.easy}
              </div>
              <div className="text-sm text-gray-500">
                {Math.round((results.difficultyStats.easy / 
                  (results.totalByDifficulty.easy || 1)) * 100)}% Correct
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-lg font-medium text-yellow-700">Medium</div>
              <div className="text-2xl font-bold">
                {results.difficultyStats.medium}/{results.totalByDifficulty.medium}
              </div>
              <div className="text-sm text-gray-500">
                {Math.round((results.difficultyStats.medium / 
                  (results.totalByDifficulty.medium || 1)) * 100)}% Correct
              </div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-lg font-medium text-red-700">Hard</div>
              <div className="text-2xl font-bold">
                {results.difficultyStats.hard}/{results.totalByDifficulty.hard}
              </div>
              <div className="text-sm text-gray-500">
                {Math.round((results.difficultyStats.hard / 
                  (results.totalByDifficulty.hard || 1)) * 100)}% Correct
              </div>
            </div>
          </div>
        </div>
        
        {/* Strong and Weak Topics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Strong Topics */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              Strong Topics
            </h2>
            
            {results.strongTopics.length === 0 ? (
              <p className="text-gray-500 italic">No strong topics identified</p>
            ) : (
              <ul className="space-y-2">
                {results.strongTopics.map((topicObj, index) => (
                  <li key={index} className="bg-green-50 p-3 rounded">
                    <div className="font-medium text-green-700">{topicObj.topic}</div>
                    <div className="text-sm text-gray-600">
                      {topicObj.details.join(', ')}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Weak Topics */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <XCircle className="h-5 w-5 mr-2 text-orange-500" />
              Areas for Improvement
            </h2>
            
            {results.weakTopics.length === 0 ? (
              <p className="text-gray-500 italic">No weak topics identified</p>
            ) : (
              <ul className="space-y-2">
                {results.weakTopics.map((topicObj, index) => (
                  <li key={index} className="bg-red-50 p-3 rounded">
                    <div className="font-medium text-red-700">{topicObj.topic}</div>
                    <div className="text-sm text-gray-600">
                      {topicObj.details.join(', ')}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mb-8">
          <button 
            onClick={() => navigate('/')}
            className="bg-white hover:bg-gray-50 text-blue-600 font-bold py-2 px-6 rounded shadow"
          >
            Return to Dashboard
          </button>
          
          {!passedTest && (
            <button 
              onClick={() => navigate(`/chapters`)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow"
            >
              Study Chapter Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestResults;