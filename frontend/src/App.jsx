import React, { useEffect, useRef, useState } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import StudentDashboard from './components/StudentDashboard';
import Dashboard from './components/Dashboard';
import StudyHub from './components/StudyHub';
import JambHub, { JambSubject } from './components/JambHub';
import UniversityHub, {
  UniversityCourse,
  UniversityFaculty,
  UniversityGst,
  UniversityLevel,
} from './components/UniversityHub';
import Library from './components/Library';
import { Contribute, Cgpa, Planner, Streak } from './components/StudentTools';
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

  const [view, setView] = useState('home');
  const [viewData, setViewData] = useState({});
  const [exams, setExams] = useState([]);
  const [quizzes, setQuizzes] = useState({});
  const [dashboard, setDashboard] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [sessionId, setSessionId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const quizOrigin = useRef({ view: 'home', data: {} });

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
      setExams([]);
      setQuizzes({});
      setView('home');
      setViewData({});
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
        const [me, examData] = await Promise.all([api.getMe(), api.getExams()]);
        if (cancelled) return;

        setProfile(me.user);
        setDashboard({
          stats: me.user.stats,
          recentAttempts: me.user.recentAttempts,
          progress: me.user.progress,
        });
        setExams(examData.items || []);
        setQuizzes(groupBySubject(examData.items || []));
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

  const navigate = (nextView, nextData = {}) => {
    if (view === 'quiz' && nextView !== 'quiz') {
      setSelectedQuiz(null);
      setSessionId('');
      setQuestions([]);
      setAnswers({});
      setResult(null);
    }
    setView(nextView);
    setViewData(nextData);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadDashboard = async () => {
    const me = await api.getMe();
    setProfile(me.user);
    setDashboard({
      stats: me.user.stats,
      recentAttempts: me.user.recentAttempts,
      progress: me.user.progress,
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      setError(err.message || 'Failed to sign out.');
    }

    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch {
      // Ignore storage failures; Firebase owns the active session.
    }

    setProfile(null);
    setDashboard(null);
    setExams([]);
    setQuizzes({});
    setView('home');
    setViewData({});
    setSelectedQuiz(null);
    setSessionId('');
    setQuestions([]);
    setAnswers({});
    setResult(null);
  };

  const handleStartQuiz = async (quiz) => {
    quizOrigin.current = { view, viewData };
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
      navigate('quiz');
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

  const handleReturnFromQuiz = () => {
    const origin = quizOrigin.current || { view: 'home', data: {} };
    const dataViews = [
      'jamb-subject',
      'university-faculty',
      'university-course',
      'university-level',
    ];
    let targetView = origin.view;
    let targetData = origin.data || {};

    if (dataViews.includes(targetView) && !Object.keys(targetData).length) {
      targetView = selectedQuiz?.examType === 'University' ? 'university' : 'jamb';
      targetData = {};
    }

    setSelectedQuiz(null);
    setSessionId('');
    setQuestions([]);
    setAnswers({});
    setResult(null);
    setView(targetView);
    setViewData(targetData);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    if (!authReady) {
      return <DashboardSkeleton message="Restoring your session..." />;
    }

    if (!firebaseUser) {
      return <LandingPage configError={firebaseConfigError} />;
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
          onReturnDashboard={handleReturnFromQuiz}
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

    if (loading) {
      return <DashboardSkeleton message="Starting your session..." />;
    }

    const pageProps = {
      data: viewData,
      exams,
      onNavigate: navigate,
      onStartExam: handleStartQuiz,
    };

    switch (view) {
      case 'jamb':
        return <JambHub {...pageProps} />;
      case 'jamb-subject':
        return <JambSubject {...pageProps} />;
      case 'university':
        return <UniversityHub {...pageProps} />;
      case 'university-faculty':
        return <UniversityFaculty {...pageProps} />;
      case 'university-course':
        return <UniversityCourse {...pageProps} />;
      case 'university-level':
        return <UniversityLevel {...pageProps} />;
      case 'university-gst':
        return <UniversityGst {...pageProps} />;
      case 'library':
        return <Library key="library" {...pageProps} />;
      case 'past-questions':
        return <Library key="past-questions" {...pageProps} data={{ ...viewData, type: 'past-questions' }} />;
      case 'planner':
        return <Planner onBack={() => navigate('home')} />;
      case 'streak':
        return <Streak onBack={() => navigate('home')} />;
      case 'cgpa':
        return <Cgpa onBack={() => navigate('home')} />;
      case 'contribute':
        return <Contribute onBack={() => navigate('home')} />;
      case 'practice':
        return (
          <Dashboard
            dashboard={dashboard}
            quizzes={quizzes}
            onStartQuiz={handleStartQuiz}
          />
        );
      case 'explore':
        return (
          <StudyHub
            profile={profile}
            dashboard={dashboard}
            onNavigate={navigate}
          />
        );
      case 'home':
      default:
        return (
          <StudentDashboard
            profile={profile}
            dashboard={dashboard}
            exams={exams}
            onNavigate={navigate}
            onStartExam={handleStartQuiz}
          />
        );
    }
  };

  return (
    <div className="app-shell theme-glass min-h-screen font-sans antialiased selection:bg-violet-300 selection:text-slate-900">
      <div className="glass-orb glass-orb-one" aria-hidden="true" />
      <div className="glass-orb glass-orb-two" aria-hidden="true" />
      <div className="glass-orb glass-orb-three" aria-hidden="true" />

      {firebaseUser && profile && (
        <Navbar user={profile} onLogout={handleLogout} onNavigate={navigate} view={view} />
      )}

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {error && (
          <div className="glass-card mb-6 flex items-center justify-between rounded-2xl border-rose-300/70 bg-rose-50/70 p-4 text-sm font-semibold text-rose-700">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-xs underline hover:text-rose-900">
              Dismiss
            </button>
          </div>
        )}

        {renderContent()}
      </main>
    </div>
  );
}
