import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Predict from './pages/Predict';
import History from './pages/History';
import About from './pages/About';

function AppShell() {
  const { theme } = useApp();
  return (
    <div className={`page-bg ${theme === 'dark' ? 'dark' : ''}`}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/predict" element={<Predict />} />
        <Route path="/history" element={<History />} />
        <Route path="/about" element={<About />} />
      </Routes>
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
