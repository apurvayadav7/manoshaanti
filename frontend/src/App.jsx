import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import AssessmentPage from './pages/AssessmentPage';
import BreathingPage from './pages/BreathingPage';
import ChatbotPage from './pages/ChatbotPage';
import DashboardPage from './pages/DashboardPage';
import EntryPage from './pages/EntryPage';
import GamesPage from './pages/GamesPage';
import GroundingPage from './pages/GroundingPage';
import HabitBuilderPage from './pages/HabitBuilderPage';
import JournalPage from './pages/JournalPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import RewardsPage from './pages/RewardsPage';
import SettingsPage from './pages/SettingsPage';
import SignupPage from './pages/SignupPage';
import SleepPage from './pages/SleepPage';
import SolutionPage from './pages/SolutionPage';
import StatisticsPage from './pages/StatisticsPage';
import UpgradePage from './pages/UpgradePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<LandingPage />} />
        <Route path="entry" element={<EntryPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="chatbot" element={<ChatbotPage />} />
        <Route path="assessment" element={<AssessmentPage />} />
        <Route path="solution" element={<SolutionPage />} />
        <Route path="journal" element={<JournalPage />} />
        <Route path="games" element={<GamesPage />} />
        <Route path="games/matching" element={<GamesPage selectedGame="matching" />} />
        <Route path="games/wordle" element={<GamesPage selectedGame="wordle" />} />
        <Route path="games/maze" element={<GamesPage selectedGame="maze" />} />
        <Route path="games/bubble" element={<GamesPage selectedGame="bubble" />} />
        <Route path="breathing" element={<BreathingPage />} />
        <Route path="grounding" element={<GroundingPage />} />
        <Route path="sleep" element={<SleepPage />} />
        <Route path="habit-builder" element={<HabitBuilderPage />} />
        <Route path="statistics" element={<StatisticsPage />} />
        <Route path="rewards" element={<RewardsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="upgrade" element={<UpgradePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="home" element={<Navigate to="/entry" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
