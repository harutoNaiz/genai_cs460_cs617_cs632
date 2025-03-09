// TopicPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './Header';

const TopicPage = () => {
  const { chapterName, topic } = useParams();
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topicData, setTopicData] = useState({
    topicContent: '',
    enhancedContent: '',
    courseTitle: '',
    chapterTitle: '',
    topicTitle: ''
  });

  useEffect(() => {
    if (!userEmail) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    
    fetch('http://localhost:5000/get-topic-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: userEmail,
        chapterName: chapterName,
        topicName: topic
      })
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch topic content');
        }
        return res.json();
      })
      .then((data) => {
        setTopicData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching topic content:', err);
        setError(err.message || 'An error occurred while fetching the topic content');
        setIsLoading(false);
      });
  }, [userEmail, chapterName, topic, navigate]);

  //remove the .txt from the topic name
  var strippedTopic = topicData.topicTitle.replace('.txt','');

  const renderContent = (content) => {
    // Split content by newlines and map to paragraphs
    return content.split('\n\n').map((paragraph, index) => {
      if (paragraph.trim().startsWith('#')) {
        // Handle headers
        const level = paragraph.match(/^#+/)[0].length;
        const text = paragraph.replace(/^#+\s*/, '');
        const HeaderTag = `h${Math.min(level + 1, 6)}`;
        return <HeaderTag key={index} className="font-bold mt-4 mb-2">{text}</HeaderTag>;
      } else if (paragraph.trim().startsWith('- ') || paragraph.trim().startsWith('* ')) {
        // Handle bullet points
        const items = paragraph.split('\n').map(item => item.replace(/^[*-]\s*/, ''));
        return (
          <ul key={index} className="list-disc ml-6 my-2">
            {items.map((item, idx) => (
              <li key={idx} className="my-1">{item}</li>
            ))}
          </ul>
        );
      } else if (paragraph.trim().startsWith('1. ')) {
        // Handle numbered lists
        const items = paragraph.split('\n').map(item => item.replace(/^\d+\.\s*/, ''));
        return (
          <ol key={index} className="list-decimal ml-6 my-2">
            {items.map((item, idx) => (
              <li key={idx} className="my-1">{item}</li>
            ))}
          </ol>
        );
      } else if (paragraph.trim().startsWith('```')) {
        // Handle code blocks
        const code = paragraph.replace(/```[\w]*\n/, '').replace(/```$/, '');
        return (
          <pre key={index} className="bg-gray-800 p-4 rounded-lg my-4 overflow-x-auto text-sm">
            <code>{code}</code>
          </pre>
        );
      } else {
        // Regular paragraph
        return <p key={index} className="my-3">{paragraph}</p>;
      }
    });
  };

  const handleBackClick = () => {
    navigate('/chapters');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6">
        <Header />
        <div className="mt-16 max-w-3xl mx-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="mb-6 flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-lg"
            onClick={handleBackClick}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Chapters
          </motion.button>
          <div className="bg-white bg-opacity-10 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Error</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6">
      <Header />
      <div className="mt-16 max-w-7xl mx-auto px-10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="mb-6 flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-lg"
          onClick={handleBackClick}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Chapters
        </motion.button>

        <div className="mb-6">
          <div className="text-sm opacity-80 mb-1">{topicData.courseTitle}</div>
          <div className="flex items-center">
            <div className="text-lg opacity-90">{topicData.chapterTitle}</div>
            <div className="mx-2">›</div>
            <div className="text-xl font-bold">{strippedTopic}</div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white bg-opacity-10 rounded-lg p-6 mb-8"
        >
          <div className="prose prose-invert max-w-none">
            {topicData.enhancedContent ? renderContent(topicData.enhancedContent) : <p>No enhanced content available.</p>}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TopicPage;