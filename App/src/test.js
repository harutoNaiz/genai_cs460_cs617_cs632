import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ListOrdered, ShieldAlert, Loader2 } from 'lucide-react';
import Header from './Header';

const TestPage = () => {
  const navigate = useNavigate();
  const chapter = localStorage.getItem('currentChapter');

  const [emojiIndex, setEmojiIndex] = useState(0);
  const emojis = ["⏳", "🔄", "📝", "⚡", "✅"];

  useEffect(() => {
    const interval = setInterval(() => {
      setEmojiIndex((prev) => (prev + 1) % emojis.length);
    }, 1000); // Change emoji every second

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6">
      <Header />
      <div className="mt-16 max-w-3xl mx-auto bg-white bg-opacity-10 rounded-lg p-6">
        <h2 className="text-3xl font-bold mb-4 text-center">Test Instructions</h2>
        
        <p className="mb-4 flex items-center">
          <ListOrdered className="h-5 w-5 mr-2 text-yellow-300" /> The test consists of <b>25 questions</b>.
        </p>
        <p className="mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2 text-blue-300" /> You have <b>1 hour</b> to complete the test.
        </p>
        <p className="mb-6 flex items-center">
          <ShieldAlert className="h-5 w-5 mr-2 text-red-400" /> The test is <b>proctored</b>. Please do not cheat! 🚫
        </p>

        <div className="flex justify-center">
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded flex items-center space-x-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Preparing Test... {emojis[emojiIndex]}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
