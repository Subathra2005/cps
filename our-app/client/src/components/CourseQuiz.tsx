import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useQuizProgression } from '../hooks/useQuizProgression';
import axios from 'axios';
interface CourseQuizProps {
  onQuizStart: () => void;
  onQuizEnd: () => void;
}

const CourseQuiz: React.FC<CourseQuizProps> = ({ onQuizStart, onQuizEnd }) => {
  const { userId, lang, topic } = useParams<{ userId: string; lang: string; topic: string }>();
  const navigate = useNavigate();

  const [currentLevel, setCurrentLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [loading, setLoading] = useState(true);
  const [courseId, setCourseId] = useState<string | null>(null);

  const levels = [
    { name: 'Easy', key: 'beginner', description: 'Basic concepts and simple problems', color: 'text-success' },
    { name: 'Medium', key: 'intermediate', description: 'Moderate complexity problems', color: 'text-warning' },
    { name: 'Hard', key: 'advanced', description: 'Advanced and challenging problems', color: 'text-danger' }
  ];

  // Use the quiz progression hook to get completion status and lockout info
  const { completed: completedLevels, lockedUntil, loading: progressLoading, refresh } = useQuizProgression({
    userId: userId || '',
    language: lang || '',
    topic: topic || '',
    difficulties: levels
  });

  // Set loading state based on hook
  useEffect(() => {
    setLoading(progressLoading);
  }, [progressLoading]);

  // Fetch the courseId for this topic/lang
  useEffect(() => {
    const fetchCourseId = async () => {
      if (!lang || !topic) return;
      try {
        const res = await axios.get(`/api/courses?lang=${encodeURIComponent(lang)}&topic=${encodeURIComponent(topic)}`);
        // Assume backend returns an array of courses, pick the first match
        if (Array.isArray(res.data) && res.data.length > 0) {
          setCourseId(res.data[0]._id);
        } else if (res.data && res.data._id) {
          setCourseId(res.data._id);
        } else {
          setCourseId(null);
        }
      } catch (err) {
        setCourseId(null);
        console.error('Error fetching courseId:', err);
      }
    };
    fetchCourseId();
  }, [lang, topic]);

  // Check if all levels are completed and update course progress
  const checkAndUpdateCourseCompletion = useCallback(async () => {
    const allLevels = ['beginner', 'intermediate', 'advanced'];
    const allCompleted = allLevels.every(level => completedLevels.includes(level));

    if (allCompleted) {
      try {
        // Calculate average score from all levels using the review endpoint
        let totalScore = 0;
        let scoreCount = 0;
        let totalPercentage = 0;
        let bestLevelPercentage = 0;

        console.log('=== CALCULATING FINAL SCORE ===');

        for (const level of allLevels) {
          try {
            const reviewRes = await api.get(`/api/users/${userId}/${lang}/${level}/${encodeURIComponent(topic || '')}/review`);
            if (reviewRes.data && reviewRes.data.statistics) {
              const stats = reviewRes.data.statistics;
              const bestScore = stats.bestScore || 0;
              const bestPercentage = stats.bestPercentage || 0;

              console.log(`Level ${level}: bestScore=${bestScore}, bestPercentage=${bestPercentage}`);

              totalScore += bestScore;
              totalPercentage += bestPercentage;
              bestLevelPercentage = Math.max(bestLevelPercentage, bestPercentage);
              scoreCount++;
            }
          } catch (error) {
            console.error(`Error getting score for ${level}:`, error);
          }
        }

        const averageScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
        const averagePercentage = scoreCount > 0 ? Math.round(totalPercentage / scoreCount) : 0;

        // Make sure the course name matches exactly what's in the database (first letter capitalized)
        const formattedTopic = topic ?
          topic.charAt(0).toUpperCase() + topic.slice(1).toLowerCase() : '';

        console.log('=== COURSE COMPLETION DEBUGGING ===');
        console.log(`Completing course with formatted name: "${formattedTopic}" (original: "${topic}")`);
        console.log('Completed levels:', completedLevels);
        console.log('Average score:', averageScore);
        console.log('Average percentage:', averagePercentage);
        console.log('Best level percentage:', bestLevelPercentage);

        // Log normalized name
        console.log(`Normalized course name: ${formattedTopic.toLowerCase()}`);

        // Calculate the actual result to send
        // We'll send the best of: average percentage, best level percentage, or at least 70 if completed
        const actualScore = Math.max(
          averagePercentage,
          bestLevelPercentage
        );
        
        // For official completion, we ensure a minimum passing score of 60
        const resultToSend = Math.max(
          actualScore,
          60 // Minimum passing score changed from 70 to 60
        );
        
        // Update course quiz itself as completed using the user course complete endpoint if avg >= 60
        if (!courseId) {
          alert('Could not find course for this topic/language.');
          return;
        }
        if (resultToSend >= 60) {
          // Use the user course complete endpoint
          const userCourseRes = await axios.put(
            `/api/users/${userId}/courses/${encodeURIComponent(formattedTopic)}/complete`,
            { result: resultToSend }
          );
          console.log('User course completion response:', userCourseRes.data);
          if (userCourseRes.status === 200) {
            console.log(`Course ${formattedTopic} marked as completed with result ${resultToSend}`);
            console.log('Response:', userCourseRes.data);
            // Force refresh the dashboard immediately and when returning to it
            localStorage.setItem('dashboardNeedsRefresh', 'true');
            // Add additional debugging info
            console.log('Dashboard refresh flag set:', localStorage.getItem('dashboardNeedsRefresh'));
            // Show confirmation to the user with a clearer message about the score
            let completionMessage = `Congratulations! You've completed all levels of "${formattedTopic}"!`;
            if (actualScore > resultToSend) {
              completionMessage += `\n\nYour actual average score was ${actualScore}%, but the system records at least 70% for completed courses.`;
            } else {
              completionMessage += `\n\nYour score: ${resultToSend}%`;
            }
            completionMessage += '\n\nThe dashboard will update to reflect your progress and unlock the next concept.';
            alert(completionMessage);
            // Force a navigation to dashboard to see updates
            setTimeout(() => {
              navigate('/dashboard');
            }, 1500);
          } else {
            console.error('Failed to update course completion status');
            alert('There was an issue updating your course completion. Please try again or contact support.');
          }
        }
      } catch (error: any) {
        console.error('Error updating course completion:', error);
        if (error.response) {
          console.error('Server response:', error.response.data);
        }
      }
    }
  }, [completedLevels, userId, lang, topic, navigate, courseId]);

  // Call this when completed levels change
  useEffect(() => {
    if (completedLevels.length === 3) {
      console.log(`All levels completed! completedLevels:`, completedLevels);
      console.log(`Attempting to update course completion for: ${topic}`);
      checkAndUpdateCourseCompletion();
    } else if (completedLevels.length > 0) {
      console.log(`Partial completion: ${completedLevels.length}/3 levels. completedLevels:`, completedLevels);
    }
  }, [completedLevels.length, checkAndUpdateCourseCompletion]); // Only trigger when the count changes, not the array itself

  const handleStartLevel = async (levelKey: string) => {
    // Check if level is locked due to 24-hour cooldown
    if (isLevelLocked(levelKey)) {
      alert(getLockoutMessage(levelKey));
      return;
    }

    const levelIndex = levels.findIndex(l => l.key === levelKey);

    // Check if previous levels are completed (sequential unlock)
    for (let i = 0; i < levelIndex; i++) {
      if (!completedLevels.includes(levels[i].key)) {
        alert(`Please complete ${levels[i].name} level first before attempting ${levels.find(l => l.key === levelKey)?.name} level.`);
        return;
      }
    }

    try {
      // Check if this level is available by trying to fetch questions (backend will handle locking)
      const questionsRes = await api.get(`/api/users/${userId}/${lang}/${levelKey}/${encodeURIComponent(topic!)}/questions`);

      if (questionsRes.data && questionsRes.data.questions) {
        // Questions fetched successfully, navigate to quiz
        navigate(`/users/${userId}/${lang}/${levelKey}/${encodeURIComponent(topic!)}/quiz`);
        onQuizEnd(); // Call onQuizEnd when navigating to quiz
      }
    } catch (error: any) {
      console.error('Error starting quiz:', error);

      if (error.response?.status === 400) {
        if (error.response?.data?.canRetake === false) {
          alert(error.response.data.message);
          return;
        }

        // Handle 24-hour lockout
        if (error.response?.data?.locked) {
          const unlockTime = error.response.data.unlockTime;
          const unlockDate = new Date(unlockTime);
          alert(`You have failed this level twice. You can retry after ${unlockDate.toLocaleDateString()} at ${unlockDate.toLocaleTimeString()}.`);
          return;
        }

        // Handle other 400 errors
        alert(error.response.data.message || 'Cannot start quiz at this time.');
        return;
      }

      alert('Failed to start quiz. Please try again.');
    }
  };

  const isLevelAvailable = (levelKey: string) => {
    // Check if level is locked due to 24-hour cooldown
    if (lockedUntil[levelKey] && Date.now() < lockedUntil[levelKey]) {
      return false;
    }

    const levelIndex = levels.findIndex(l => l.key === levelKey);

    // First level (beginner) is always available (unless locked)
    if (levelIndex === 0) return true;

    // For subsequent levels, check if ALL previous levels are completed
    for (let i = 0; i < levelIndex; i++) {
      if (!completedLevels.includes(levels[i].key)) return false;
    }

    return true;
  };

  const isLevelLocked = (levelKey: string) => {
    return lockedUntil[levelKey] && Date.now() < lockedUntil[levelKey];
  };

  const getLockoutMessage = (levelKey: string) => {
    if (isLevelLocked(levelKey)) {
      const unlockTime = new Date(lockedUntil[levelKey]);

      // Check if the most recent attempt was a violation by examining user data
      // We'll make this more specific in a future update
      return `Locked until ${unlockTime.toLocaleDateString()} at ${unlockTime.toLocaleTimeString()}`;
    }
    return '';
  };

  useEffect(() => {
    onQuizStart();
    return () => onQuizEnd();
  }, [onQuizStart, onQuizEnd]);

  useEffect(() => {
    if (completedLevels.length > 0) {
      onQuizEnd(); // Ensure chatbot is enabled during review
    }
  }, [completedLevels, onQuizEnd]);

  const handleQuizEnd = () => {
    onQuizEnd();
    console.log('Quiz ended');
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Checking your progress...</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold text-primary mb-3">{topic}</h1>
        <p className="lead text-muted">Complete all three difficulty levels to master this concept</p>
      </div>

      <div className="row g-4">
        {levels.map((level, index) => {
          const isCompleted = completedLevels.includes(level.key);
          const isAvailable = isLevelAvailable(level.key);
          const isLocked = isLevelLocked(level.key);

          // Debug logging
          console.log(`Level ${level.key}:`, { isCompleted, isAvailable, isLocked, completedLevels, lockedUntil });

          return (
            <div key={level.key} className="col-lg-4 col-md-6">
              <div
                className={`card h-100 border-0 shadow-sm ${isCompleted ? 'border-success border-2' :
                  !isAvailable ? 'opacity-50' : ''
                  }`}
                style={{
                  cursor: isAvailable ? 'pointer' : 'not-allowed'
                }}
              >
                <div className="card-body p-4 text-center">
                  <div className="mb-3">
                    {isCompleted ? (
                      <i className="fas fa-check-circle fa-3x text-success"></i>
                    ) : isLocked ? (
                      <i className="fas fa-clock fa-3x text-warning"></i>
                    ) : !isAvailable ? (
                      <i className="fas fa-lock fa-3x text-muted"></i>
                    ) : (
                      <i className="fas fa-play-circle fa-3x text-primary"></i>
                    )}
                  </div>

                  <h4 className={`fw-bold mb-2 ${level.color}`}>{level.name}</h4>
                  <p className="text-muted mb-3">{level.description}</p>

                  {isLocked && (
                    <div className="mb-3">
                      <small className="text-warning">
                        <i className="fas fa-clock me-1"></i>
                        {getLockoutMessage(level.key)}
                      </small>
                    </div>
                  )}

                  <div className="mb-3">
                    <span className={`badge ${isCompleted ? 'bg-success' :
                      isLocked ? 'bg-warning' :
                        !isAvailable ? 'bg-secondary' : 'bg-primary'
                      }`}>
                      {isCompleted ? 'Completed' :
                        isLocked ? 'Locked (24h)' :
                          !isAvailable ? 'Locked' : 'Available'}
                    </span>
                  </div>

                  <button
                    className={`btn ${isCompleted ? 'btn-outline-success' :
                      isAvailable ? 'btn-primary' : 'btn-secondary'
                      } px-4`}
                    disabled={!isAvailable}
                    onClick={() => handleStartLevel(level.key)}
                  >
                    {isCompleted ? 'Retake' : 'Start Level'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-5">
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate('/dashboard')}
        >
          <i className="fas fa-arrow-left me-2"></i>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default CourseQuiz;
