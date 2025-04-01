import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WelcomePage from './WelcomePage';
import LoginPage from './Login';
import SignupPage from './SignUp';
import ChaptersPage from './chapters';
import TopicPage from './TopicPage';
import TestPage from './test'
import TakeTest from './takeTest'
import TestResults from './results'
import ProfilePage from './profile'

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
        <Route path="/taketest" element={<TakeTest />} />
        <Route path="/test-results" element={<TestResults />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
};

export default App;
