import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, ChevronRight, Lock, FileText } from 'lucide-react';
import Header from './Header';

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
      body: JSON.stringify({ email: userEmail }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch chapters');
        return res.json();
      })
      .then((data) => {
        if (data.chapters) {
          setChaptersData(data.chapters);
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

  const isTopicUnlocked = (chapter_) => rank >= chapter_;

  const handleTopicClick = (chapter_, chapterName, topic) => {
    if (!isTopicUnlocked(chapter_)) {
      alert('Please complete the above topics before proceeding.');
      return;
    }
    const encodedChapterName = encodeURIComponent(chapterName);
    const encodedTopic = encodeURIComponent(topic);
    navigate(`/chapters/${encodedChapterName}/${encodedTopic}`);
  };

  const handleTakeTest = (chapter_) => {
    if (!isTopicUnlocked(chapter_)) {
      alert('You need to complete the chapter before taking the test!');
      return;
    }
    localStorage.setItem('currentChapter', chapter_);
    navigate('/test');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-stone-100 font-serif p-6">
        <Header />
        <div className="flex justify-center items-center h-96">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-16 w-16 border-t-2 border-b-2 border-stone-700"
          ></motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-stone-100 font-serif p-6 relative">
    {/* Background pattern - moved to the bottom of the stacking context */}
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

      {/* Header - now clickable */}
      <div className="relative z-50">
        <Header />
      </div>
      <br/>
      <br/>
      <br/>
      {/* Subtle background pattern (same as login) */}
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

      <div className="mt-16 relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-8 text-center text-stone-800"
        >
          Chapters
        </motion.h2>
        
        <div className="max-w-3xl mx-auto">
          {chaptersData.length > 0 ? (
            chaptersData.map((chapter, index) => (
              <div key={index} className="mb-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleChapterClick(index)}
                  className="flex justify-between items-center bg-white bg-opacity-50 p-4 rounded-lg cursor-pointer shadow-md border border-stone-300 backdrop-blur-sm"
                >
                  <h3 className="text-2xl text-stone-800">{chapter.chapterName}</h3>
                  {expandedChapter === index ? 
                    <ChevronUp className="text-stone-700" /> : 
                    <ChevronDown className="text-stone-700" />}
                </motion.div>

                {expandedChapter === index && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 ml-4">
                      {/* Topics List */}
                      {chapter.topics.map((topic, idx) => {
                        const unlocked = isTopicUnlocked(chapter.chapter_);
                        return (
                          <motion.div
                            key={idx}
                            whileHover={{ scale: unlocked ? 1.02 : 1 }}
                            whileTap={{ scale: unlocked ? 0.98 : 1 }}
                            onClick={() => handleTopicClick(chapter.chapter_, chapter.chapterName, topic)}
                            className={`p-3 rounded-lg my-1 flex items-center justify-between cursor-pointer
                              ${unlocked ? 
                                'bg-white bg-opacity-50 hover:bg-opacity-70 text-stone-800' : 
                                'bg-stone-200 opacity-70 cursor-not-allowed'} 
                              shadow-sm border border-stone-300`}
                          >
                            <span>{topic}</span>
                            {unlocked ? 
                              <ChevronRight className="h-5 w-5 text-stone-700" /> : 
                              <Lock className="h-5 w-5 text-stone-500" />}
                          </motion.div>
                        );
                      })}

                      {/* "Take Test" Button */}
                      <div className="flex justify-end mt-3">
                        <motion.button
                          whileHover={{ scale: isTopicUnlocked(chapter.chapter_) ? 1.05 : 1 }}
                          whileTap={{ scale: isTopicUnlocked(chapter.chapter_) ? 0.95 : 1 }}
                          onClick={() => handleTakeTest(chapter.chapter_)}
                          disabled={!isTopicUnlocked(chapter.chapter_)}
                          className={`flex items-center gap-2 py-2 px-4 rounded-full text-lg transition-all 
                            ${isTopicUnlocked(chapter.chapter_) ? 
                              'bg-gradient-to-r from-stone-700 to-stone-600 text-amber-50 shadow-md' : 
                              'bg-stone-300 text-stone-500 cursor-not-allowed'}`}
                        >
                          <FileText className="h-5 w-5" /> Take Test
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-xl text-stone-700">
              No chapters found for this user's course.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChaptersPage;