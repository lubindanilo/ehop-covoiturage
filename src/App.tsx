import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Feed } from './pages/Feed';
import { Search } from './pages/Search';
import { Dashboard } from './pages/Dashboard';
import { Messages } from './pages/Messages';
import { Pricing } from './pages/Pricing';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { Auth } from './pages/Auth';
import { BottomNav } from './components/BottomNav';
import { ProtectedRoute } from './components/ProtectedRoute';
import { getValidUrl } from './lib/firebase';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <main className="pb-16">
          <Routes>
            <Route path={getValidUrl('/auth')} element={<Auth />} />
            <Route
              path={getValidUrl('/')}
              element={
                <ProtectedRoute>
                  <Feed />
                </ProtectedRoute>
              }
            />
            <Route
              path={getValidUrl('/search')}
              element={
                <ProtectedRoute>
                  <Search />
                </ProtectedRoute>
              }
            />
            <Route
              path={getValidUrl('/dashboard')}
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path={getValidUrl('/messages')}
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />
            <Route
              path={getValidUrl('/pricing')}
              element={
                <ProtectedRoute>
                  <Pricing />
                </ProtectedRoute>
              }
            />
            <Route
              path={getValidUrl('/profile')}
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path={getValidUrl('/settings')}
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to={getValidUrl('/')} replace />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;