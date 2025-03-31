import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ListOrdered, ShieldAlert, Loader2 } from 'lucide-react';
import Header from './Header';

const TestPage = () => {
  const navigate = useNavigate();
  const chapter_ = localStorage.getItem('currentChapter');
  const userEmail = localStorage.getItem('userEmail');

  const [emojiIndex, setEmojiIndex] = useState(0);
  const [testReady, setTestReady] = useState(false);
  const emojis = ["⏳", "🔄", "📝", "⚡", "✅"];

  useEffect(() => {
    const interval = setInterval(() => {
      setEmojiIndex((prev) => (prev + 1) % emojis.length);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check for required data first
    if (!chapter_ || !userEmail) {
      alert('Missing chapter or email information. Please try again.');
      navigate('/'); // Redirect to appropriate page
      return;
    }

    const startTest = async () => {
      try {
        const response = await fetch('http://localhost:5000/start_test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chapter_: chapter_, email: userEmail }),
        });

        // Handle HTTP errors
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to start test');
        }

        const data = await response.json();
        if (data.success) {
          setTestReady(true);
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('Error starting test:', error);
        alert(error.message || 'Failed to start test.');
      }
    };

    startTest();
  }, [chapter_, userEmail, navigate]); // Added dependencies

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6">
      <Header />
      <div className="mt-16 max-w-3xl mx-auto bg-white bg-opacity-10 rounded-lg p-6">
        <h2 className="text-3xl font-bold mb-4 text-center">Test Instructions</h2>

        <p className="mb-4 flex items-center">
          <ListOrdered className="h-5 w-5 mr-2 text-yellow-300" /> The test consists of 25 multiple choice questions.
        </p>
        <p className="mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2 text-blue-300" /> You have 60 mins to complete the test.
        </p>
        <p className="mb-6 flex items-center">
          <ShieldAlert className="h-5 w-5 mr-2 text-red-400" /> The test is proctored. Please do not cheat! 🚫
        </p>

        <div className="flex justify-center">
          {testReady ? (
            <button
              onClick={() => navigate('/taketest')}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
            >
              Take Test
            </button>
          ) : (
            <button
              disabled
              className="bg-gray-500 text-white font-bold py-2 px-6 rounded flex items-center space-x-3"
            >
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Preparing Test... {emojis[emojiIndex]}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestPage;