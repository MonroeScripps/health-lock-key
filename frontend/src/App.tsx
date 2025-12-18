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
    setProfileRefreshKey(prev => prev + 1);
  };

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider locale="en">
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header className="glass" style={{
              position: 'sticky',
              top: 0,
              zIndex: 50,
              borderBottom: '1px solid rgba(0, 245, 212, 0.1)'
            }}>
              <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 24px'
              }}>
                {/* Logo & Nav */}
                <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                  {/* Logo */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, var(--neon-cyan) 0%, var(--neon-purple) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px',
                      boxShadow: '0 0 20px rgba(0, 245, 212, 0.3)',
                      animation: 'glow 3s ease-in-out infinite'
                    }}>
                      💪
                    </div>
                    <div>
                      <div style={{
                        fontWeight: 800,
                        fontSize: '1.3rem',
                        background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.5px'
                      }}>
                        Health Lock
                      </div>
                      <div style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        letterSpacing: '2px',
                        textTransform: 'uppercase'
                      }}>
                        FHE Encrypted
                      </div>
                    </div>
                  </div>

                  {/* Navigation */}
                  <nav style={{ display: 'flex', gap: 8 }}>
                    <a
                      href="#/create"
                      onClick={(e) => { e.preventDefault(); navigate('create'); }}
                      className={`nav-link ${page === 'create' ? 'active' : ''}`}
                    >
                      <span>🏋️</span> Log Workout
                    </a>
                    <a
                      href="#/profile"
                      onClick={(e) => { e.preventDefault(); navigate('profile'); }}
                      className={`nav-link ${page === 'profile' ? 'active' : ''}`}
                    >
                      <span>📊</span> Dashboard
                    </a>
                  </nav>
                </div>

                {/* Wallet Connect */}
                <div style={{
                  borderRadius: '12px',
                  padding: '4px',
                  background: 'rgba(0, 245, 212, 0.05)',
                  border: '1px solid rgba(0, 245, 212, 0.1)'
                }}>
                  <ConnectButton />
                </div>
              </div>
            </header>

            {/* Hero Section */}
            <section style={{
              padding: '60px 24px 50px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative Elements */}
              <div style={{
                position: 'absolute',
                top: '20%',
                left: '10%',
                fontSize: '4rem',
                opacity: 0.1,
                animation: 'float 4s ease-in-out infinite'
              }}>🏃</div>
              <div style={{
                position: 'absolute',
                top: '30%',
                right: '15%',
                fontSize: '3rem',
                opacity: 0.1,
                animation: 'float 5s ease-in-out infinite',
                animationDelay: '1s'
              }}>🔐</div>
              <div style={{
                position: 'absolute',
                bottom: '20%',
                left: '20%',
                fontSize: '2.5rem',
                opacity: 0.1,
                animation: 'float 6s ease-in-out infinite',
                animationDelay: '2s'
              }}>💓</div>

              <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
                {/* Main Title */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 20px',
                  background: 'rgba(0, 245, 212, 0.1)',
                  borderRadius: '50px',
                  marginBottom: '24px',
                  border: '1px solid rgba(0, 245, 212, 0.2)'
                }}>
                  <span style={{ fontSize: '1.2rem' }}>🛡️</span>
                  <span style={{ color: 'var(--neon-cyan)', fontWeight: 600, fontSize: '0.9rem' }}>
                    Powered by Zama FHEVM
                  </span>
                </div>

                <h1 style={{
                  fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
                  fontWeight: 800,
                  marginBottom: '20px',
                  lineHeight: 1.1,
                  letterSpacing: '-1px'
                }}>
                  <span style={{ color: 'var(--text-primary)' }}>Privacy-First </span>
                  <span style={{
                    background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-purple), var(--neon-pink))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    Fitness Tracking
                  </span>
                </h1>

                <p style={{
                  fontSize: '1.15rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '36px',
                  maxWidth: '600px',
                  margin: '0 auto 36px',
                  lineHeight: 1.7
                }}>
                  🔒 Your workout data is <strong style={{ color: 'var(--neon-cyan)' }}>fully encrypted</strong> on-chain. 
                  Only you can decrypt and view your fitness metrics.
                </p>

                {/* Feature Badges */}
                <div style={{
                  display: 'flex',
                  gap: 12,
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  <div className="badge badge-cyan">
                    <span>🏃‍♂️</span> Track Workouts
                  </div>
                  <div className="badge badge-purple">
                    <span>🔐</span> End-to-End Encrypted
                  </div>
                  <div className="badge badge-pink">
                    <span>⛓️</span> On-Chain Storage
                  </div>
                  <div className="badge">
                    <span>🎯</span> Zero Knowledge
                  </div>
                </div>
              </div>
            </section>

            {/* Main Content */}
            <main style={{
              flex: 1,
              maxWidth: '900px',
              width: '100%',
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
              background: 'rgba(0, 0, 0, 0.3)',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              padding: '32px 24px',
              textAlign: 'center'
            }}>
              <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  <span style={{ fontSize: '1.2rem' }}>⚡</span>
                  <span style={{
                    background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 700
                  }}>
                    Health Lock
                  </span>
                </div>
                <p style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  margin: 0
                }}>
                  © 2024 Health Lock · Built with 💜 using Zama FHEVM · Your data, your control
                </p>
              </div>
            </footer>
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
