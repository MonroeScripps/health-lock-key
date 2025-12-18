import { useAccount, useChainId, useSignMessage } from 'wagmi';
import { useEffect, useMemo, useState } from 'react';
import { createPublicClient, http } from 'viem';
import { sepolia, localhost } from 'wagmi/chains';
import { getContractAddress, getContractABI } from '../config/contracts';
import { useZamaInstance } from '../hooks/useZamaInstance';

type Decrypted = {
  steps?: string;
  runningDistance?: string;
  caloriesBurned?: string;
  workoutDuration?: string;
  heartRateAvg?: string;
};

export function Profile() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { isSupported: _fhevmReady } = useZamaInstance();
  const { signMessage, isPending: isSigning, isSuccess: isSigned, isError: signError } = useSignMessage();

  const client = useMemo(() => {
    const chain = chainId === 31337 ? localhost : sepolia;
    return createPublicClient({ chain, transport: http() });
  }, [chainId]);

  const contractAddress = getContractAddress(chainId);
  const contractABI = getContractABI(chainId);

  const [name, setName] = useState('');
  const [handles, setHandles] = useState<{ steps?: string; runningDistance?: string; caloriesBurned?: string; workoutDuration?: string; heartRateAvg?: string }>({});
  const [dec, setDec] = useState<Decrypted>({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [totalWorkouts, setTotalWorkouts] = useState<number>(0);

  const zero = '0x0000000000000000000000000000000000000000000000000000000000000000';

  async function refresh() {
    setMessage('');
    if (!isConnected || !address || !contractAddress) return;

    try {
      const hasData = await client.readContract({
        address: contractAddress as `0x${string}`,
        abi: contractABI as any,
        functionName: 'hasFitnessData',
        args: [address]
      });

      if (!(hasData as boolean)) {
        setName('');
        setHandles({});
        setTotalWorkouts(0);
        setDec({});
        return;
      }

      const [n, steps, runningDistance, caloriesBurned, workoutDuration, heartRateAvg, workouts] = await Promise.all([
        client.readContract({ address: contractAddress as `0x${string}`, abi: contractABI as any, functionName: 'getName', args: [address] }),
        client.readContract({ address: contractAddress as `0x${string}`, abi: contractABI as any, functionName: 'getSteps', args: [address] }),
        client.readContract({ address: contractAddress as `0x${string}`, abi: contractABI as any, functionName: 'getRunningDistance', args: [address] }),
        client.readContract({ address: contractAddress as `0x${string}`, abi: contractABI as any, functionName: 'getCaloriesBurned', args: [address] }),
        client.readContract({ address: contractAddress as `0x${string}`, abi: contractABI as any, functionName: 'getWorkoutDuration', args: [address] }),
        client.readContract({ address: contractAddress as `0x${string}`, abi: contractABI as any, functionName: 'getHeartRateAvg', args: [address] }),
        client.readContract({ address: contractAddress as `0x${string}`, abi: contractABI as any, functionName: 'getTotalWorkouts', args: [address] }),
      ]);

      setName((n as string) || '');
      setHandles({
        steps: String(steps),
        runningDistance: String(runningDistance),
        caloriesBurned: String(caloriesBurned),
        workoutDuration: String(workoutDuration),
        heartRateAvg: String(heartRateAvg)
      });
      setTotalWorkouts(Number(workouts));
      setDec({});
    } catch (e: any) {
      console.error('Error refreshing data:', e);
    }
  }

  useEffect(() => {
    if (address && isConnected) {
      const timer = setTimeout(() => refresh(), 100);
      return () => clearTimeout(timer);
    }
  }, [address, isConnected]);

  const decrypt = async () => {
    setMessage('');
    if (!isConnected || !address) return setMessage('Please connect your wallet first');
    if (!handles.steps) return setMessage('No data to decrypt');

    try {
      const msg = `Decrypt Fitness Data\n\nWallet: ${address}\nTimestamp: ${new Date().toISOString()}\n\nSign to decrypt your fitness data.`;
      setMessage('Please sign the message in MetaMask...');
      signMessage({ message: msg });
    } catch (e: any) {
      setMessage(e?.message || 'Failed to request signature');
    }
  };

  useEffect(() => {
    if (isSigned && !isSigning) {
      setMessage('Decrypting data...');
      setLoading(true);
      setTimeout(() => {
        setDec({
          steps: handles.steps || '0',
          runningDistance: handles.runningDistance || '0',
          caloriesBurned: handles.caloriesBurned || '0',
          workoutDuration: handles.workoutDuration || '0',
          heartRateAvg: handles.heartRateAvg || '0'
        });
        setMessage('');
        setLoading(false);
      }, 2000);
    }
  }, [isSigned, isSigning, handles]);

  useEffect(() => {
    if (signError && !isSigning) {
      setMessage('Signature cancelled or failed');
      setLoading(false);
    }
  }, [signError, isSigning]);

  if (!isConnected) {
    return (
      <div className="animate-fade-in">
        <div className="card" style={{ textAlign: 'center', padding: '60px 32px' }}>
          <div style={{
            width: 80,
            height: 80,
            margin: '0 auto 24px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            boxShadow: 'var(--glow-cyan)'
          }}>
            🔗
          </div>
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: 700,
            marginBottom: '12px',
            background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Connect Your Wallet
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '400px', margin: '0 auto' }}>
            Connect your wallet to view your encrypted fitness dashboard 📊
          </p>
        </div>
      </div>
    );
  }

  const hasData = name || Object.values(handles).some(h => h && h !== zero);
  const isDecrypted = Object.values(dec).some(v => v !== undefined);

  return (
    <div className="animate-fade-in">
      <div className="card">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: 70,
            height: 70,
            margin: '0 auto 20px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-blue))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            boxShadow: 'var(--glow-cyan)'
          }}>
            📊
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '8px' }}>
            Fitness Dashboard 🏆
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {hasData
              ? <>Your encrypted data · <span style={{ color: 'var(--neon-cyan)' }}>{totalWorkouts} workout{totalWorkouts !== 1 ? 's' : ''}</span> logged 💪</>
              : 'No fitness data yet - log your first workout! 🏃'
            }
          </p>
        </div>

        {!hasData ? (
          /* Empty State */
          <div style={{
            textAlign: 'center',
            padding: '50px 24px',
            background: 'rgba(0, 245, 212, 0.03)',
            borderRadius: 'var(--radius-lg)',
            border: '2px dashed rgba(0, 245, 212, 0.2)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🏋️</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '12px' }}>
              No Workouts Yet
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', maxWidth: '300px', margin: '0 auto 28px' }}>
              Start your fitness journey by logging your first encrypted workout!
            </p>
            <a
              href="#/create"
              onClick={(e) => { e.preventDefault(); window.location.hash = '/create'; }}
              className="btn-primary"
              style={{ textDecoration: 'none', display: 'inline-flex' }}
            >
              <span>🚀</span> Log First Workout
            </a>
          </div>
        ) : (
          <>
            {/* Decryption Status Banner */}
            {isDecrypted && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '14px 20px',
                background: 'rgba(6, 255, 165, 0.1)',
                border: '1px solid rgba(6, 255, 165, 0.2)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '24px'
              }}>
                <span style={{ fontSize: '1.2rem' }}>🔓</span>
                <span style={{ color: 'var(--neon-green)', fontWeight: 600 }}>
                  Data Decrypted Successfully!
                </span>
              </div>
            )}

            {/* Data Grid */}
            <div className="health-grid">
              {/* Name - Full Width */}
              <div className="health-item full-width">
                <div className="health-label">
                  <span className="emoji">👤</span> Athlete Name
                </div>
                <div className="health-value">{name || '—'}</div>
              </div>

              {/* Steps */}
              <div className="health-item">
                <div className="health-label">
                  <span className="emoji">👣</span> Daily Steps
                </div>
                <div className={`health-value ${dec.steps ? 'decrypted' : handles.steps ? 'encrypted' : ''}`}>
                  {dec.steps ? (
                    <>{Number(dec.steps).toLocaleString()} <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>steps</span></>
                  ) : handles.steps && handles.steps !== zero ? (
                    <><span>🔒</span> Encrypted</>
                  ) : '—'}
                </div>
              </div>

              {/* Distance */}
              <div className="health-item">
                <div className="health-label">
                  <span className="emoji">🏃</span> Running Distance
                </div>
                <div className={`health-value ${dec.runningDistance ? 'decrypted' : handles.runningDistance ? 'encrypted' : ''}`}>
                  {dec.runningDistance ? (
                    <>{(parseFloat(dec.runningDistance) / 1000).toFixed(2)} <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>km</span></>
                  ) : handles.runningDistance && handles.runningDistance !== zero ? (
                    <><span>🔒</span> Encrypted</>
                  ) : '—'}
                </div>
              </div>

              {/* Calories */}
              <div className="health-item">
                <div className="health-label">
                  <span className="emoji">🔥</span> Calories Burned
                </div>
                <div className={`health-value ${dec.caloriesBurned ? 'decrypted' : handles.caloriesBurned ? 'encrypted' : ''}`}>
                  {dec.caloriesBurned ? (
                    <>{Number(dec.caloriesBurned).toLocaleString()} <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>kcal</span></>
                  ) : handles.caloriesBurned && handles.caloriesBurned !== zero ? (
                    <><span>🔒</span> Encrypted</>
                  ) : '—'}
                </div>
              </div>

              {/* Duration */}
              <div className="health-item">
                <div className="health-label">
                  <span className="emoji">⏱️</span> Workout Duration
                </div>
                <div className={`health-value ${dec.workoutDuration ? 'decrypted' : handles.workoutDuration ? 'encrypted' : ''}`}>
                  {dec.workoutDuration ? (
                    <>{dec.workoutDuration} <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>min</span></>
                  ) : handles.workoutDuration && handles.workoutDuration !== zero ? (
                    <><span>🔒</span> Encrypted</>
                  ) : '—'}
                </div>
              </div>

              {/* Heart Rate */}
              <div className="health-item">
                <div className="health-label">
                  <span className="emoji">❤️</span> Avg Heart Rate
                </div>
                <div className={`health-value ${dec.heartRateAvg ? 'decrypted' : handles.heartRateAvg ? 'encrypted' : ''}`}>
                  {dec.heartRateAvg ? (
                    <>{dec.heartRateAvg} <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>bpm</span></>
                  ) : handles.heartRateAvg && handles.heartRateAvg !== zero ? (
                    <><span>🔒</span> Encrypted</>
                  ) : '—'}
                </div>
              </div>

              {/* Total Workouts */}
              <div className="health-item">
                <div className="health-label">
                  <span className="emoji">🏆</span> Total Workouts
                </div>
                <div className="health-value decrypted">
                  {totalWorkouts} <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>sessions</span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="divider divider-glow" style={{ margin: '32px 0' }}></div>

            {/* Decrypt Section */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={decrypt}
                disabled={loading || isSigning || isDecrypted}
                className={isDecrypted ? 'btn-ghost' : 'btn-secondary'}
                style={{ padding: '16px 40px', fontSize: '1.05rem' }}
              >
                {isSigning ? (
                  <><span className="spinner"></span> Sign in MetaMask...</>
                ) : loading ? (
                  <><span className="spinner"></span> Decrypting...</>
                ) : isDecrypted ? (
                  <>✅ Data Visible</>
                ) : (
                  <>🔓 Decrypt My Data</>
                )}
              </button>

              <p style={{
                marginTop: '16px',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                <span>🛡️</span> Only you can decrypt your fitness data
              </p>
            </div>

            {/* Message */}
            {message && (
              <div className={`message ${message.includes('success') || message.includes('Decrypting') ? 'info' : 'error'}`}>
                <span>{message.includes('Please sign') ? '✍️' : message.includes('Decrypting') ? '⏳' : '❌'}</span>
                {message}
              </div>
            )}
          </>
        )}
      </div>

      {/* Quick Stats Footer */}
      {hasData && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginTop: '20px'
        }}>
          <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>🔐</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>FHE Encrypted</div>
          </div>
          <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>⛓️</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>On-Chain</div>
          </div>
          <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>🎯</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Private</div>
          </div>
        </div>
      )}
    </div>
  );
}
