import React, { useState, useEffect } from 'react';
import { auth, onAuthStateChanged } from './lib/firebase';
import { AppProvider } from './context/AppContext';
import AuthScreen from './components/AuthScreen';
import TopBar from './components/TopBar';
import FormBuilder from './components/FormBuilder';
import PreviewPane from './components/PreviewPane';
import RecordsModal from './components/RecordsModal';
import { Loader2 } from 'lucide-react';
import './styles/main.css';

function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  if (initializing) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0f1115' }}>
        <Loader2 className="spinner" size={32} color="#ffffff" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onSignIn={(u) => setUser(u)} />;
  }

  return (
    <AppProvider>
      <div className="app-container">
        <TopBar user={user} />
        <div className="main-layout">
          <div className="left-panel">
            <FormBuilder />
          </div>
          <div className="right-panel">
            <div className="preview-scroll">
              <PreviewPane user={user} />
            </div>
          </div>
        </div>
        <RecordsModal user={user} />
      </div>
    </AppProvider>
  );
}

export default App;
