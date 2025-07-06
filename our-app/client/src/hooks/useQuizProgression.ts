import { useState, useEffect } from 'react';
import axios from 'axios';

export interface QuizProgressionOptions {
  userId: string;
  language: string;
  topic: string;
  difficulties: { name: string; key: string }[];
}

export interface QuizProgressionResult {
  completed: string[];
  lockedUntil: Record<string, number>;
  loading: boolean;
  refresh: () => void;
}

// Usage: const { completed, lockedUntil, loading, refresh } = useQuizProgression({ userId, language, topic, difficulties });
export function useQuizProgression({ userId, language, topic, difficulties }: QuizProgressionOptions): QuizProgressionResult {
  const [completed, setCompleted] = useState<string[]>([]);
  const [lockedUntil, setLockedUntil] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(0);

  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true);
      try {
        const userRes = await axios.get(`/api/users/${userId}`);
        const userData = userRes.data;
        const quizInfos = userData.quizzes || [];
        const completedLevels: string[] = [];
        const lockedLevels: Record<string, number> = {};
        const userUpdatedAt = userData.updatedAt || userData.createdAt || new Date().toISOString();
        // --- NEW: Merge courseQuizLockouts from backend if present ---
        const courseQuizLockouts = userData.courseQuizLockouts || {};
        for (const diff of difficulties) {
          try {
            const quizRes = await axios.get(`/api/quizzes/lang/${language}/level/${diff.key}/topic/${topic}`);
            const quiz = quizRes.data;
            const quizId = Array.isArray(quiz) ? (quiz[0]?._id || quiz[0]?.id) : (quiz?._id || quiz?.id);
            if (!quizId) continue;
            const attempts = quizInfos.filter((q: any) => {
              if (typeof q.quizId === 'string') return q.quizId === quizId;
              if (q.quizId && typeof q.quizId === 'object' && q.quizId.$oid) return q.quizId.$oid === quizId;
              return false;
            }).filter((a: any) => typeof a.userScore === 'number' && Array.isArray(a.userAnswers) && a.userAnswers.length > 0);
            // BASIC QUIZ LOGIC: Different progression rules for basic vs topic quizzes
            if (topic === 'basic') {
              if (attempts.length > 0) {
                // For basic quizzes, mark as completed after any attempt (no passing requirement)
                completedLevels.push(diff.key);
                // Don't add to lockedLevels - allow unlimited retakes
              }
              continue;
            }
            
            // TOPIC QUIZ LOGIC: 2 attempts, lockout if both ≤50%
            // Sort attempts by most recent first
            const sortedAttempts = attempts.sort((a: any, b: any) => {
              const aTime = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
              const bTime = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
              return bTime - aTime;
            });
            // --- Lockout logic: Only consider attempts after last lockout period ---
            // Find the last lockout end time for this level (if any)
            let lastLockoutEnd = 0;
            if (courseQuizLockouts[topic] && courseQuizLockouts[topic][diff.key]) {
              lastLockoutEnd = courseQuizLockouts[topic][diff.key];
            }
            // Only consider attempts after the last lockout end time
            const postLockoutAttempts = sortedAttempts.filter((a: any) => {
              const t = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
              return t > lastLockoutEnd;
            });
            // Check if any passing attempt exists after lockout
            const passingAttempt = postLockoutAttempts.find((a: any) => {
              const score = typeof a.userScore === 'number' ? a.userScore : 0;
              const total = Array.isArray(a.userAnswers) ? a.userAnswers.length : 10;
              return total > 0 && (score / total) > 0.5;
            });
            if (passingAttempt) {
              completedLevels.push(diff.key);
              continue;
            }
            // Lockout after a single failed attempt (≤50%) after last lockout
            if (postLockoutAttempts.length >= 1) {
              const mostRecent = postLockoutAttempts[0];
              const score = typeof mostRecent.userScore === 'number' ? mostRecent.userScore : 0;
              const total = Array.isArray(mostRecent.userAnswers) ? mostRecent.userAnswers.length : 10;
              if (total > 0 && (score / total) <= 0.5) {
                const lastTime = mostRecent.submittedAt 
                  ? new Date(mostRecent.submittedAt).getTime()
                  : new Date(userUpdatedAt).getTime();
                const now = Date.now();
                if (now - lastTime < 24 * 60 * 60 * 1000) {
                  lockedLevels[diff.key] = lastTime + 24 * 60 * 60 * 1000;
                }
              }
            }
          } catch (e) {
            continue;
          }
          // --- Merge violation lockout if present ---
          if (
            courseQuizLockouts[topic] &&
            courseQuizLockouts[topic][diff.key]
          ) {
            const violationLockout = courseQuizLockouts[topic][diff.key];
            if (!lockedLevels[diff.key] || violationLockout > lockedLevels[diff.key]) {
              lockedLevels[diff.key] = violationLockout;
            }
          }
        }
        setCompleted(completedLevels);
        setLockedUntil(lockedLevels);
      } catch (e) {
        setCompleted([]);
        setLockedUntil({});
      }
      setLoading(false);
    };
    fetchStatus();
    // eslint-disable-next-line
  }, [userId, language, topic, refreshFlag]);

  return {
    completed,
    lockedUntil,
    loading,
    refresh: () => setRefreshFlag(f => f + 1)
  };
}
