import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WelcomePage from './WelcomePage';
import LoginPage from './Login';
import SignupPage from './SignUp';
import ChaptersPage from './chapters';
import TopicPage from './TopicPage';
import TestPage from './test'
import './index.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/chapters" element={<ChaptersPage />} />
        <Route path="/chapters/:chapterName/:topic" element={<TopicPage />} />
        <Route path="/test" element={<TestPage />} />
      </Routes>
    </Router>
  );
};

export default App;
