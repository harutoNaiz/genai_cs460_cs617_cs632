import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
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
  
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

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

  var strippedTopic = topicData.topicTitle.replace('.txt','');

  const renderContent = (content) => {
    return content.split('\n\n').map((paragraph, index) => {
      if (paragraph.trim().startsWith('#')) {
        const level = paragraph.match(/^#+/)[0].length;
        const text = paragraph.replace(/^#+\s*/, '');
        const HeaderTag = `h${Math.min(level + 1, 6)}`;
        return <HeaderTag key={index} className={`font-bold mt-6 mb-3 ${level === 1 ? 'text-3xl' : level === 2 ? 'text-2xl' : 'text-xl'}`}>{text}</HeaderTag>;
      } else if (paragraph.trim().startsWith('- ') || paragraph.trim().startsWith('* ')) {
        const items = paragraph.split('\n').map(item => item.replace(/^[*-]\s*/, ''));
        return (
          <ul key={index} className="list-disc ml-8 my-4 space-y-2">
            {items.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        );
      } else if (paragraph.trim().startsWith('1. ')) {
        const items = paragraph.split('\n').map(item => item.replace(/^\d+\.\s*/, ''));
        return (
          <ol key={index} className="list-decimal ml-8 my-4 space-y-2">
            {items.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ol>
        );
      } else if (paragraph.trim().startsWith('```')) {
        const code = paragraph.replace(/```[\w]*\n/, '').replace(/```$/, '');
        return (
          <pre key={index} className="bg-stone-800/50 p-4 rounded-lg my-6 overflow-x-auto text-sm font-mono border border-stone-700">
            <code>{code}</code>
          </pre>
        );
      } else {
        return <p key={index} className="my-4 leading-relaxed">{paragraph}</p>;
      }
    });
  };

  const handleBackClick = () => {
    navigate('/chapters');
  };
  
  const handleSummarize = () => {
    if (summary) {
      setShowSummary(!showSummary);
      return;
    }
    
    setIsSummarizing(true);
    
    fetch('http://localhost:5000/summarize-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        content: topicData.enhancedContent 
      })
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to generate summary');
        }
        return res.json();
      })
      .then((data) => {
        setSummary(data.summary);
        setShowSummary(true);
        setIsSummarizing(false);
      })
      .catch((err) => {
        console.error('Error generating summary:', err);
        setError('Failed to generate summary. Please try again.');
        setIsSummarizing(false);
      });
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-stone-100 font-serif p-6">
        <Header />
        <div className="mt-24 max-w-7xl mx-auto px-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mb-6 flex items-center px-4 py-2 bg-stone-700/20 rounded-lg text-stone-800 border border-stone-700/30"
            onClick={handleBackClick}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Chapters
          </motion.button>
          <div className="bg-white/50 rounded-lg p-6 shadow-md border border-stone-300">
            <h2 className="text-2xl font-bold mb-4 text-stone-800">Error</h2>
            <p className="text-stone-700">{error}</p>
          </div>
        </div>
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
      <br/>
      
      <div className="pt-24 pb-12 px-8 max-w-7xl mx-auto">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mb-8 flex items-center px-4 py-2 bg-stone-700/20 rounded-lg text-stone-800 border border-stone-700/30"
          onClick={handleBackClick}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Chapters
        </motion.button>

        <div className="mb-8">
          <div className="text-sm text-stone-600 mb-1">{topicData.courseTitle}</div>
          <div className="flex items-center text-stone-800">
            <div className="text-lg">{topicData.chapterTitle}</div>
            <ChevronRight className="mx-2 h-5 w-5" />
            <div className="text-2xl font-bold">{strippedTopic}</div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/50 rounded-xl p-8 mb-8 shadow-lg border border-stone-300/50 backdrop-blur-sm"
        >
          <div className="prose prose-lg max-w-none text-stone-800">
            {topicData.enhancedContent ? renderContent(topicData.enhancedContent) : (
              <p className="text-stone-600">No enhanced content available.</p>
            )}
          </div>

          {showSummary && summary && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="mt-8 p-6 bg-stone-700/10 rounded-lg border border-stone-700/20"
            >
              <h3 className="text-xl font-bold mb-4 text-stone-800 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Summary
              </h3>
              <div className="prose prose-lg max-w-none text-stone-700">
                {renderContent(summary)}
              </div>
            </motion.div>
          )}
        </motion.div>
        
        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSummarize}
            disabled={isSummarizing}
            className="px-6 py-3 bg-gradient-to-r from-stone-700 to-stone-600 text-amber-50 rounded-full shadow-md flex items-center"
          >
            {isSummarizing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-amber-50 mr-2"></div>
                Summarizing...
              </>
            ) : summary ? (
              showSummary ? (
                <>
                  <ChevronUp className="h-5 w-5 mr-2" />
                  Hide Summary
                </>
              ) : (
                <>
                  <ChevronDown className="h-5 w-5 mr-2" />
                  Show Summary
                </>
              )
            ) : (
              <>
                <FileText className="h-5 w-5 mr-2" />
                Summarize Content
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default TopicPage;