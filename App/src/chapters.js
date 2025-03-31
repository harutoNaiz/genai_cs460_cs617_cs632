import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Lock } from 'lucide-react';
import Header from './Header'; // Adjust the path as necessary

const ChaptersPage = () => {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail');

  const [chaptersData, setChaptersData] = useState([]);
  const [expandedChapter, setExpandedChapter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rank, setRank] = useState(0);

  useEffect(() => {
    if (!userEmail) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    fetch('http://localhost:5000/get-chapters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail })
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch chapters');
        }
        return res.json();
      })
      .then((data) => {
        if (data.chapters) {
          setChaptersData(data.chapters);
          setExpandedChapter(null);
          setRank(data.rank);
        } else {
          throw new Error(data.error || 'Unknown error');
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching chapters:', err);
        setError(err.message || 'An error occurred while fetching chapters');
        setIsLoading(false);
      });
  }, [userEmail, navigate]);

  const handleChapterClick = (index) => {
    setExpandedChapter((prev) => (prev === index ? null : index));
  };

  // Function to check if the topic is unlocked
  const isTopicUnlocked = (chapter_) => {
    return rank >= chapter_;
  };

  const handleTopicClick = (chapter_, chapterName, topic) => {
    if (!isTopicUnlocked(chapter_)) {
      alert('Please complete the above topics before proceeding.');
      return;
    }
    
    const encodedChapterName = encodeURIComponent(chapterName);
    const encodedTopic = encodeURIComponent(topic);
    navigate(`/chapters/${encodedChapterName}/${encodedTopic}`);
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
      <div className="mt-16">
        <h2 className="text-4xl font-bold mb-8 text-center">Chapters</h2>
        <div className="max-w-3xl mx-auto">
          {chaptersData.length > 0 ? (
            chaptersData.map((chapter, index) => (
              <div key={index} className="mb-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleChapterClick(index)}
                  className="flex justify-between items-center bg-white bg-opacity-20 p-4 rounded-lg cursor-pointer"
                >
                  <h3 className="text-2xl">{chapter.chapterName}</h3>
                  {expandedChapter === index ? <ChevronUp /> : <ChevronDown />}
                </motion.div>
                {expandedChapter === index && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 ml-4">
                    {chapter.topics.map((topic, idx) => {
                      const unlocked = isTopicUnlocked(chapter.chapter_);
                      return (
                        <motion.div
                          key={idx}
                          whileHover={{ scale: unlocked ? 1.02 : 1 }}
                          onClick={() => handleTopicClick(chapter.chapter_, chapter.chapterName, topic)}
                          className={`p-3 rounded-lg my-1 flex items-center justify-between cursor-pointer
                            ${unlocked ? 'bg-white bg-opacity-20' : 'bg-gray-400 opacity-50 cursor-not-allowed'}
                          `}
                        >
                          <span>{topic}</span>
                          {unlocked ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <Lock className="h-5 w-5" />
                          )}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-xl">No chapters found for this user's course.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChaptersPage;
