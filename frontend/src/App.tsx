import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { useEffect, useState } from 'react';

import { config } from './config/wagmi';
import { CreateProfile } from './components/CreateProfile';
import { Profile } from './components/Profile';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const queryClient = new QueryClient();

type Page = 'create' | 'profile';



function useHashRoute(): [Page, (p: Page) => void] {
  const [page, setPage] = useState<Page>(() => (location.hash === '#/create' ? 'create' : 'profile'));
  useEffect(() => {
    const onHash = () => setPage(location.hash === '#/create' ? 'create' : 'profile');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const navigate = (p: Page) => {
    location.hash = p === 'create' ? '/create' : '/profile';
    setPage(p);
  };
  return [page, navigate];
}

function App() {
  const [page, navigate] = useHashRoute();
  const [profileRefreshKey, setProfileRefreshKey] = useState(0);

  const handleWorkoutSubmitted = () => {
    // Trigger Profile component to refresh its data
    setProfileRefreshKey(prev => prev + 1);
  };

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider locale="en">
          <div style={{ minHeight: '100vh' }}>
          {/* Header with glassmorphism effect */}
          <header className="glass" style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{
              maxWidth: '1200px',
              margin: '0 auto',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px'
              }}>
                <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)'
                    }}>
                      🏃‍♂️
                    </div>
                    <div style={{
                      fontWeight: 700,
                      fontSize: '1.5rem',
                      color: 'white',
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}>
                      Health Lock
                    </div>
                  </div>
                  <nav style={{ display: 'flex', gap: 8 }}>
                    <a
                      href="#/create"
                      onClick={(e) => { e.preventDefault(); navigate('create'); }}
                      className={`nav-link ${page === 'create' ? 'active' : ''}`}
                    >
                      📊 Log Workout
                    </a>
                    <a
                      href="#/profile"
                      onClick={(e) => { e.preventDefault(); navigate('profile'); }}
                      className={`nav-link ${page === 'profile' ? 'active' : ''}`}
                    >
                      📈 My Fitness Data
                    </a>
                  </nav>
                </div>
                <div style={{
                  borderRadius: '12px',
                  padding: '4px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <ConnectButton />
                </div>
              </div>
            </header>

            {/* Hero section */}
            <section style={{
              padding: '60px 24px 40px',
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)'
            }}>
              <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{
                  fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                  fontWeight: 800,
                  color: 'white',
                  marginBottom: '16px',
                  textShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                  lineHeight: 1.2
                }}>
                  Privacy-Preserving Fitness Tracking
                </h1>
                <p style={{
                  fontSize: '1.25rem',
                  color: 'rgba(255, 255, 255, 0.9)',
                  marginBottom: '32px',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  maxWidth: '600px',
                  margin: '0 auto 32px'
                }}>
                  Track your fitness journey with end-to-end encrypted data. Share insights with third parties without compromising your privacy.
                </p>
                <div style={{
                  display: 'flex',
                  gap: 16,
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  <div style={{
                    padding: '12px 24px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: 500
                  }}>
                    🏃‍♂️ Fitness Tracking
                  </div>
                  <div style={{
                    padding: '12px 24px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: 500
                  }}>
                    🔒 FHE Encrypted
                  </div>
                  <div style={{
                    padding: '12px 24px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: 500
                  }}>
                    📊 Privacy Analytics
                  </div>
                </div>
              </div>
            </section>

            {/* Main content */}
            <main style={{
              maxWidth: '900px',
              margin: '0 auto',
              padding: '0 24px 60px',
            }}>
              <div className="animate-fade-in">
                {page === 'create' ?
                  <CreateProfile onWorkoutSubmitted={handleWorkoutSubmitted} /> :
                  <Profile key={profileRefreshKey} />
                }
              </div>
            </main>

            {/* Footer */}
            <footer style={{
              background: 'rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(10px)',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '32px 24px',
              textAlign: 'center'
            }}>
              <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.9rem',
                  margin: 0
                }}>
                  © 2024 Health Lock. Built with privacy and fitness in mind.
                </p>
              </div>
            </footer>
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App
