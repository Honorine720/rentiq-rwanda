import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import KigaliBackground from './components/KigaliBackground';
import Home from './pages/Home';
import Predict from './pages/Predict';
import History from './pages/History';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';

function AppShell() {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  return (
    <div className={`relative min-h-screen ${isDark ? 'dark' : ''}`}>
      {/* Global Kigali cityscape background */}
      <KigaliBackground variant={isDark ? 'dark' : 'light'} />
      {/* All content sits above the background */}
      <div className="relative z-10">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/predict" element={<Predict />} />
          <Route path="/history" element={<History />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppShell />
      </Router>
    </AppProvider>
  );
}
