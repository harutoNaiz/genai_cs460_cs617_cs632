import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, BookOpen, Calendar, Award, CheckCircle, XCircle, ChevronLeft, ChevronDown, ChevronUp, Shield } from 'lucide-react';

const AdminPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/admin/get-users');
        const data = await response.json();
        
        if (response.ok) {
          setUsers(data.users);
        } else {
          console.error('Error fetching users:', data.error);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    let initials = names[0].substring(0, 1).toUpperCase();
    
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    
    return initials;
  };

  const toggleUser = (email) => {
    setExpandedUser(expandedUser === email ? null : email);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-stone-100 font-serif flex items-center justify-center">
        <div className="text-stone-800 text-xl">Loading users...</div>
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 rounded-xl shadow-lg p-6 border border-stone-300/50 backdrop-blur-sm"
        >
          <div className="flex items-center mb-6">
            <Shield className="h-8 w-8 mr-3 text-stone-700" />
            <h2 className="text-2xl font-bold text-stone-800">Admin Dashboard</h2>
          </div>
          
          <div className="space-y-4">
            {users.length > 0 ? (
              users.map((user) => (
                <div key={user.email} className="border-b border-stone-200/50 pb-4 last:border-0 last:pb-0">
                  <motion.button
                    whileHover={{ backgroundColor: 'rgba(245, 245, 244, 0.5)' }}
                    className="w-full flex justify-between items-center p-4 rounded-lg bg-stone-700/10"
                    onClick={() => toggleUser(user.email)}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-stone-700 text-amber-50 flex items-center justify-center mr-4">
                        {getInitials(user.name)}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-stone-800">{user.name}</div>
                        <div className="text-sm text-stone-600">{user.email}</div>
                      </div>
                    </div>
                    {expandedUser === user.email ? (
                      <ChevronUp className="h-5 w-5 text-stone-700" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-stone-700" />
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {expandedUser === user.email && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 px-4">
                          {/* User Info */}
                          <div className="space-y-4">
                            <div className="flex items-start">
                              <BookOpen className="h-5 w-5 mr-3 mt-1 text-stone-700" />
                              <div>
                                <div className="text-sm text-stone-600">Course</div>
                                <div className="text-lg font-medium text-stone-800">
                                  {user.course || 'Not specified'}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start">
                              <Calendar className="h-5 w-5 mr-3 mt-1 text-stone-700" />
                              <div>
                                <div className="text-sm text-stone-600">Date of Birth</div>
                                <div className="text-lg font-medium text-stone-800">
                                  {user.dob || 'Not specified'}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center">
                              <Award className="h-5 w-5 mr-3 text-stone-700" />
                              <div>
                                <div className="text-sm text-stone-600">Rank</div>
                                <div className="text-lg font-medium text-stone-800">
                                  {user.rank || 1}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Performance Data */}
                          <div>
                            <h3 className="font-bold text-lg mb-3 text-stone-800">Performance Data</h3>
                            {[1, 2, 3].map((chapter) => (
                              <div key={chapter} className="mb-4">
                                <h4 className="font-medium text-stone-700 mb-2">Chapter {chapter}</h4>
                                {user.performance_data?.[chapter] ? (
                                  <div className="space-y-3">
                                    <div className="bg-green-50/50 rounded p-2 border border-green-200/50">
                                      <div className="flex items-center text-green-700">
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        <span className="text-sm font-medium">Score: {user.performance_data[chapter].score}</span>
                                      </div>
                                    </div>
                                    <div className="flex space-x-2">
                                      <div className="bg-green-50/50 rounded p-2 border border-green-200/50 flex-1">
                                        <div className="text-sm text-green-700 font-medium">Strong Topics</div>
                                        {user.performance_data[chapter].strong_topics?.length > 0 ? (
                                          <ul className="text-xs text-stone-600 mt-1">
                                            {user.performance_data[chapter].strong_topics.map((topic, i) => (
                                              <li key={i}>• {topic.topic || topic}</li>
                                            ))}
                                          </ul>
                                        ) : (
                                          <div className="text-xs text-stone-500 italic">None</div>
                                        )}
                                      </div>
                                      <div className="bg-red-50/50 rounded p-2 border border-red-200/50 flex-1">
                                        <div className="text-sm text-red-700 font-medium">Weak Topics</div>
                                        {user.performance_data[chapter].weak_topics?.length > 0 ? (
                                          <ul className="text-xs text-stone-600 mt-1">
                                            {user.performance_data[chapter].weak_topics.map((topic, i) => (
                                              <li key={i}>• {topic.topic || topic}</li>
                                            ))}
                                          </ul>
                                        ) : (
                                          <div className="text-xs text-stone-500 italic">None</div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-sm text-stone-500 italic">No data available</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-stone-600">
                No users found
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPage;