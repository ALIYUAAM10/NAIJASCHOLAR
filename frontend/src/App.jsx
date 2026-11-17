import React, { useEffect, useRef, useState } from 'react';
import Navbar from './components/Navbar';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import QuizSession from './components/QuizSession';
import QuizResult from './components/QuizResult';
import { api } from './services/api';
import {
  firebaseConfigError,
  logout,
  subscribeToAuth,
} from './services/firebase';
import { useQuizTimer } from './hooks/useQuizTimer';

function groupBySubject(exams) {
  const grouped = {};
  for (const exam of exams) {
    if (!grouped[exam.subject]) grouped[exam.subject] = [];
    grouped[exam.subject].push(exam);
  }
  return grouped;
}

function DashboardSkeleton({ message }) {
  return (
    <div className="text-center py-20 text-slate-400 font-medium">
      {message}
    </div>
  );
}

export default function App() {
  const [authReady, setAuthReady] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [quizzes, setQuizzes] = useState({});
  const [dashboard, setDashboard] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [sessionId, setSessionId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const submitLock = useRef(false);
  const autoSubmitAttempted = useRef(false);

  const timer = useQuizTimer(selectedQuiz?.durationMinutes || 0);

  useEffect(() => {
    return subscribeToAuth((user) => {
      setFirebaseUser(user);
      setAuthReady(true);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!firebaseUser) {
      setProfile(null);
      setDashboard(null);
      setQuizzes({});
      setSelectedQuiz(null);
      setSessionId('');
      setQuestions([]);
      setAnswers({});
      setResult(null);
      setProfileLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setProfileLoading(true);
    setError('');

    (async () => {
      try {
        const [me, exams] = await Promise.all([api.getMe(), api.getExams()]);
        if (cancelled) return;

        setProfile(me.user);
        setDashboard({
          stats: me.user.stats,
          recentAttempts: me.user.recentAttempts,
        });
        setQuizzes(groupBySubject(exams.items || []));
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load your account.');
        }
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [firebaseUser, reloadKey]);

  useEffect(() => {
    if (
      timer.isExpired &&
      selectedQuiz &&
      sessionId &&
      !result &&
      !loading &&
      !autoSubmitAttempted.current
    ) {
      autoSubmitAttempted.current = true;
      handleSubmitQuiz();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer.isExpired, selectedQuiz, sessionId, result, loading, answers]);

  const loadDashboard = async () => {
    const me = await api.getMe();
    setProfile(me.user);
    setDashboard({
      stats: me.user.stats,
      recentAttempts: me.user.recentAttempts,
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      setError(err.message || 'Failed to sign out.');
    }

    // Remove Phase 1 JWT keys if a user is migrating from the legacy UI.
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch {
      // Ignore storage failures; Firebase owns the active session.
    }

    setProfile(null);
    setDashboard(null);
    setQuizzes({});
    setSelectedQuiz(null);
    setSessionId('');
    setQuestions([]);
    setAnswers({});
    setResult(null);
  };

  const handleStartQuiz = async (quiz) => {
    setError('');
    setLoading(true);
    setSelectedQuiz(null);
    setSessionId('');
    setResult(null);
    setAnswers({});
    setQuestions([]);
    autoSubmitAttempted.current = false;

    try {
      const data = await api.startMock(quiz.id);
      setSelectedQuiz(data.exam);
      setSessionId(data.session.id);
      setQuestions(data.questions);
    } catch (err) {
      setError(err.message || 'Failed to start quiz session.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!sessionId || submitLock.current) return;

    submitLock.current = true;
    setLoading(true);
    setError('');

    try {
      const response = await api.submitMock(sessionId, answers);
      setResult(response);

      try {
        await loadDashboard();
      } catch (dashboardError) {
        console.warn('Score saved, but dashboard refresh failed:', dashboardError);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit quiz.');
    } finally {
      submitLock.current = false;
      setLoading(false);
    }
  };

  const handleReturnDashboard = () => {
    setSelectedQuiz(null);
    setSessionId('');
    setQuestions([]);
    setAnswers({});
    setResult(null);
    setError('');
    autoSubmitAttempted.current = false;
  };

  const renderContent = () => {
    if (!authReady) {
      return <DashboardSkeleton message="Restoring your session..." />;
    }

    if (!firebaseUser) {
      return <AuthScreen configError={firebaseConfigError} />;
    }

    if (profileLoading && !profile) {
      return <DashboardSkeleton message="Loading your dashboard..." />;
    }

    if (!profile) {
      return (
        <div className="mx-auto max-w-md py-20 text-center">
          <p className="text-sm text-slate-400">
            We could not load your profile yet.
          </p>
          <button
            onClick={() => setReloadKey((value) => value + 1)}
            className="mt-4 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-950"
          >
            Retry
          </button>
        </div>
      );
    }

    if (result) {
      return (
        <QuizResult
          result={result}
          quiz={selectedQuiz}
          questions={questions}
          onReturnDashboard={handleReturnDashboard}
        />
      );
    }

    if (selectedQuiz) {
      if (loading) {
        return <DashboardSkeleton message="Loading exam questions..." />;
      }

      return (
        <QuizSession
          quiz={selectedQuiz}
          questions={questions}
          answers={answers}
          setAnswers={setAnswers}
          onSubmit={handleSubmitQuiz}
          timer={timer}
          submitting={loading}
        />
      );
    }

    return (
      <Dashboard
        dashboard={dashboard}
        quizzes={quizzes}
        onStartQuiz={handleStartQuiz}
      />
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-slate-950">
      <Navbar user={profile} onLogout={handleLogout} />

      <main className="mx-auto max-w-6xl px-4 py-6">
        {error && (
          <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm font-semibold text-rose-300 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-xs underline hover:text-white">
              Dismiss
            </button>
          </div>
        )}

        {renderContent()}
      </main>
    </div>
  );
}
