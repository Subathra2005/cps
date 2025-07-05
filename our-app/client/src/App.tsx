import React, { useState } from 'react'
import './App.css'
import ChatbotPage from './components/ChatbotPage'
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Home from "./components/Home";
import InitialSetup from "./pages/InitialSetup";
import BasicQuiz from "./components/BasicQuiz";
import CustomQuiz from "./components/CustomQuiz";
import CourseQuiz from "./components/CourseQuiz";
import DashboardWrapper from "./components/DashboardWrapper";
import ProtectedRoute from "./components/ProtectedRoute";


const App: React.FC = () => {
  const [showChatbot, setShowChatbot] = useState(false);

  React.useEffect(() => {
    const handler = () => setShowChatbot((prev) => !prev);
    window.addEventListener('toggleChatbot', handler);
    return () => window.removeEventListener('toggleChatbot', handler);
  }, []);

  return (
    <>
      <Navbar />
      {/* Floating Chatbot */}
      {showChatbot && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1050,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          borderRadius: 20,
          background: 'transparent',
        }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowChatbot(false)}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 1100,
                background: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                fontWeight: 700,
                fontSize: 18,
                boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                cursor: 'pointer',
              }}
              aria-label="Close chatbot"
            >×</button>
            <ChatbotPage />
          </div>
        </div>
      )}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        
        {/* Protected Routes */}
        <Route path="/initial-setup" element={
          <ProtectedRoute>
            <InitialSetup />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardWrapper />
          </ProtectedRoute>
        } />
        <Route path="/quizzes/lang/:lang/level/:level/topic/:topic" element={
          <ProtectedRoute>
            <BasicQuiz />
          </ProtectedRoute>
        } />
        <Route path="/users/:id/:lang/:level/:topic/quiz" element={
          <ProtectedRoute>
            <BasicQuiz />
          </ProtectedRoute>
        } />
        <Route path="/users/:userId/quiz" element={
          <ProtectedRoute>
            <CustomQuiz />
          </ProtectedRoute>
        } />
        <Route path="/users/:userId/:lang/course/:topic" element={
          <ProtectedRoute>
            <CourseQuiz />
          </ProtectedRoute>
        } />
        
        {/* Catch old route format and redirect */}
        <Route path="/users/:userId/course/:topic/quiz" element={
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h3>Redirecting...</h3>
            <p>Old route detected. Please refresh the page or go back to dashboard.</p>
            <button onClick={() => window.location.href = '/dashboard'}>Go to Dashboard</button>
          </div>
        } />
      </Routes>
    </>
  );
};

export default App;