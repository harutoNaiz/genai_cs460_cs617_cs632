import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, Brain, Zap, ArrowRight, Book, BarChart, Star } from 'lucide-react';

const WelcomePage = () => {
  const navigate = useNavigate();
  
  // CSS for custom font (Garamond-like)
  const fontStyle = `
    @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700&display=swap');
  `;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-stone-100 font-serif">
      <style>{fontStyle}</style>
      
      {/* Subtle background pattern */}
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
      
      {/* Main content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-16 min-h-screen flex flex-col justify-center">
        {/* Header section */}
        <header className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex items-center justify-center mb-6">
            <h1
              className="text-6xl md:text-7xl text-stone-600 leading-[1.2] scale-y-150 font-light"
              style={{ fontFamily: "'EB Garamond', serif" }}
            >
              LearnAI
            </h1>

            </div>
            
            <motion.p 
              className="text-xl md:text-2xl text-stone-600 max-w-2xl mx-auto font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              style={{ fontFamily: "'EB Garamond', serif" }}
            >
              Master artificial intelligence through personalized, 
              interactive learning experiences designed for your pace.
            </motion.p>
          </motion.div>
        </header>

        {/* Features section */}
        <motion.section 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <FeatureCard 
            icon={<Book size={32} />}
            title="Personalized Curriculum"
            description="AI-powered topics and materials tailored to your learning style and goals"
            delay={0.2}
          />
          <FeatureCard 
            icon={<BarChart size={32} />}
            title="Real-time Assessment"
            description="Continuous feedback and performance tracking to identify your strengths"
            delay={0.4}
          />
          <FeatureCard 
            icon={<Star size={32} />}
            title="Adaptive Challenges"
            description="Difficulty levels that adjust automatically based on your progress"
            delay={0.6}
          />
        </motion.section>

        {/* Testimonial section */}
        <motion.section
          className="mb-16 bg-stone-100 bg-opacity-60 rounded-xl p-6 backdrop-blur-sm border border-stone-300"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(255,253,240,0.8) 0%, rgba(255,253,240,0.8) 100%), 
                            repeating-linear-gradient(to bottom, transparent, transparent 24px, rgba(120, 113, 108, 0.05) 24px, rgba(120, 113, 108, 0.05) 25px)`,
            fontFamily: "'EB Garamond', serif"
          }}
        >
          <div className="text-center">
            <p className="text-lg italic text-stone-700 mb-4">
              "LearnAI transformed my understanding of machine learning concepts. 
              The personalized approach helped me progress twice as fast as traditional courses."
            </p>
            <p className="text-sm font-medium text-stone-600">— Sarah Chen, Data Scientist</p>
          </div>
        </motion.section>

        {/* CTA section */}
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(120, 113, 108, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-stone-700 to-stone-600 text-amber-50 font-bold py-4 px-8 rounded-full text-xl shadow-lg flex items-center mb-6 hover:from-stone-800 hover:to-stone-700 transition-all"
            onClick={() => navigate('/login')}
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            Begin Your Journey
            <ArrowRight className="ml-3" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, delay }) => (
  <motion.div
    whileHover={{ y: -8, boxShadow: "0 10px 25px -5px rgba(120, 113, 108, 0.3)" }}
    className="bg-gradient-to-b from-stone-200 to-stone-300 p-8 rounded-xl shadow-md border border-stone-300 flex flex-col items-center text-center transition-all duration-300"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay + 0.6, duration: 0.5 }}
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23a8a29e' fill-opacity='0.16' fill-rule='evenodd'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z'/%3E%3C/g%3E%3C/svg%3E")`,
      backgroundSize: '100px 100px'
    }}
  >
    <div className="text-stone-800 mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-3 text-stone-800">{title}</h3>
    <p className="text-stone-700">{description}</p>
  </motion.div>
);


export default WelcomePage;