// chapters.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Header from './Header'; // Adjust the path as necessary

const ChaptersPage = () => {
  const navigate = useNavigate();
  
  // Assume the user's email is stored in localStorage after login.
  const userEmail = localStorage.getItem('userEmail');
  
  // Data structure for chapters
  const [chaptersData, setChaptersData] = useState([]);
  const [expandedChapter, setExpandedChapter] = useState(null);

  useEffect(() => {
    // On component mount, fetch the chapters from the Flask backend
    fetch('http://localhost:5000/get-chapters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.chapters) {
          setChaptersData(data.chapters);
        } else {
          console.error('Error:', data.error || 'Unknown error');
        }
      })
      .catch((err) => {
        console.error('Error fetching chapters:', err);
      });
  }, [userEmail]);

  const handleChapterClick = (index) => {
    setExpandedChapter(expandedChapter === index ? null : index);
  };

  const handleTopicClick = (chapterName, topic) => {
    // Navigate to a topic page (to be implemented).
    navigate(`/topic/${chapterName}/${topic}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6">
      {/* Using the separated Header component */}
      <Header />
      <div className="mt-16">
        <h2 className="text-4xl font-bold mb-8 text-center">
          Chapters
        </h2>
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
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 ml-4"
                  >
                    {chapter.topics.map((topic, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleTopicClick(chapter.chapterName, topic)}
                        className="bg-white bg-opacity-20 p-3 rounded-lg my-1 cursor-pointer"
                      >
                        {topic}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            ))
          ) : (
            <p>No chapters found for this user’s course.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChaptersPage;
