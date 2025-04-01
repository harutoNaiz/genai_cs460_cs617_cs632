import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, BookOpen, Calendar, Award, CheckCircle, XCircle, ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react';
import Header from './Header';

const ProfilePage = () => {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedChapter, setExpandedChapter] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/get-user-data?email=${userEmail}`);
        const data = await response.json();
        
        if (response.ok) {
          setUserData(data);
        } else {
          console.error('Error fetching user data:', data.error);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userEmail]);

  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    let initials = names[0].substring(0, 1).toUpperCase();
    
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    
    return initials;
  };

  const toggleChapter = (chapter) => {
    setExpandedChapter(expandedChapter === chapter ? null : chapter);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-stone-100 font-serif flex items-center justify-center">
        <div className="text-stone-800 text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-stone-100 font-serif flex items-center justify-center">
        <div className="text-stone-800 text-xl">Error loading profile data</div>
      </div>
    );
  }

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
      
      <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mb-8 flex items-center text-stone-800"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
          Back
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Profile Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 rounded-xl shadow-lg p-6 border border-stone-300/50 backdrop-blur-sm lg:col-span-1 h-fit sticky top-28"
          >
            <div className="flex flex-col items-center mb-6">
              {/* Profile Initials */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-32 h-32 rounded-full bg-stone-700 flex items-center justify-center text-4xl text-amber-50 font-bold mb-4"
              >
                {getInitials(userData.name)}
              </motion.div>

              <h2 className="text-xl font-bold text-stone-800 mb-2">{userData.name}</h2>
              <div className="text-stone-600 mb-4">{userData.email}</div>
              
              <div className="flex items-center bg-stone-700/10 px-4 py-2 rounded-full border border-stone-700/30">
                <Award className="h-5 w-5 mr-2 text-stone-700" />
                <span className="font-medium">Rank {userData.rank || 1}</span>
              </div>
            </div>

            {/* User Info */}
            <div className="space-y-4">
              <div className="flex items-start">
                <BookOpen className="h-5 w-5 mr-3 mt-1 text-stone-700" />
                <div>
                  <div className="text-sm text-stone-600">Course</div>
                  <div className="text-lg font-medium text-stone-800">
                    {userData.course || 'Not specified'}
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <Calendar className="h-5 w-5 mr-3 mt-1 text-stone-700" />
                <div>
                  <div className="text-sm text-stone-600">Date of Birth</div>
                  <div className="text-lg font-medium text-stone-800">
                    {userData.dob || 'Not specified'}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Chapters */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/70 rounded-xl shadow-lg p-6 border border-stone-300/50 backdrop-blur-sm mb-8"
            >
              <h2 className="text-2xl font-bold mb-6 text-stone-800">
                Your Chapters
              </h2>
              
              <div className="space-y-4">
                {[1, 2, 3].map((chapter) => (
                  <div key={chapter} className="border-b border-stone-200/50 pb-4 last:border-0 last:pb-0">
                    <motion.button
                      whileHover={{ backgroundColor: 'rgba(245, 245, 244, 0.5)' }}
                      className={`w-full flex justify-between items-center p-4 rounded-lg ${
                        userData.rank >= chapter
                          ? 'bg-stone-700/10'
                          : 'bg-stone-100/50 opacity-70'
                      }`}
                      onClick={() => userData.rank >= chapter && toggleChapter(chapter)}
                      disabled={userData.rank < chapter}
                    >
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                          userData.rank >= chapter 
                            ? 'bg-stone-700 text-amber-50' 
                            : 'bg-stone-300 text-stone-500'
                        }`}>
                          {chapter}
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-stone-800">Chapter {chapter}</div>
                          <div className="text-sm text-stone-600">
                            {userData.rank >= chapter ? 'Unlocked' : `Unlocks at rank ${chapter}`}
                          </div>
                        </div>
                      </div>
                      {userData.rank >= chapter && (
                        expandedChapter === chapter ? (
                          <ChevronUp className="h-5 w-5 text-stone-700" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-stone-700" />
                        )
                      )}
                    </motion.button>

                    <AnimatePresence>
                      {expandedChapter === chapter && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 px-4">
                            {/* Strong Topics */}
                            <div className="bg-green-50/50 rounded-lg p-4 border border-green-200/50">
                              <h3 className="font-bold text-lg mb-3 flex items-center text-green-700">
                                <CheckCircle className="h-5 w-5 mr-2" />
                                Strong Topics
                              </h3>
                              {userData.performance_data && 
                              userData.performance_data[chapter]?.strong_topics?.length > 0 ? (
                                <ul className="space-y-2">
                                  {userData.performance_data[chapter].strong_topics.map((topic, index) => (
                                    <motion.li
                                      key={index}
                                      whileHover={{ x: 3 }}
                                      className="bg-white/70 p-2 rounded border border-green-200/30"
                                    >
                                      <div className="font-medium text-green-700">{topic.topic}</div>
                                      {topic.details?.length > 0 && (
                                        <div className="text-sm text-stone-600 mt-1">
                                          {topic.details.join(', ')}
                                        </div>
                                      )}
                                    </motion.li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-stone-500 italic">No strong topics identified</p>
                              )}
                            </div>

                            {/* Weak Topics */}
                            <div className="bg-red-50/50 rounded-lg p-4 border border-red-200/50">
                              <h3 className="font-bold text-lg mb-3 flex items-center text-red-700">
                                <XCircle className="h-5 w-5 mr-2" />
                                Areas to Improve
                              </h3>
                              {userData.performance_data && 
                              userData.performance_data[chapter]?.weak_topics?.length > 0 ? (
                                <ul className="space-y-2">
                                  {userData.performance_data[chapter].weak_topics.map((topic, index) => (
                                    <motion.li
                                      key={index}
                                      whileHover={{ x: 3 }}
                                      className="bg-white/70 p-2 rounded border border-red-200/30"
                                    >
                                      <div className="font-medium text-red-700">{topic.topic}</div>
                                      {topic.details?.length > 0 && (
                                        <div className="text-sm text-stone-600 mt-1">
                                          {topic.details.join(', ')}
                                        </div>
                                      )}
                                    </motion.li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-stone-500 italic">No weak topics identified</p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;