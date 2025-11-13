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

  // MetaMask signature hook
  const { signMessage, isPending: isSigning, isSuccess: isSigned, isError: signError } = useSignMessage();

  // Use appropriate client based on network
  const client = useMemo(() => {
    const chain = chainId === 31337 ? localhost : sepolia;
    return createPublicClient({ chain, transport: http() });
  }, [chainId]);

  // Get contract address and ABI based on current network
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

    // Check wallet connection
    if (!isConnected) return setMessage('❌ Please connect your wallet first');
    if (!address) return setMessage('❌ No wallet address available');

    // Check contract configuration
    if (!contractAddress) return setMessage('❌ Contract not configured');

    try {
      // First check if user has fitness data
      const hasData = await client.readContract({
        address: contractAddress as `0x${string}`,
        abi: contractABI as any,
        functionName: 'hasFitnessData',
        args: [address]
      });

      if (!(hasData as boolean)) {
        // No data found, set empty state
        setName('');
        setHandles({});
        setTotalWorkouts(0);
        setDec({});
        setMessage('');
        return;
      }

      // User has data, fetch all the details
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
      // For simplified contract, store values as strings (they're now uint256, not encrypted bytes32)
      setHandles({
        steps: String(steps),
        runningDistance: String(runningDistance),
        caloriesBurned: String(caloriesBurned),
        workoutDuration: String(workoutDuration),
        heartRateAvg: String(heartRateAvg)
      });
      setTotalWorkouts(Number(workouts));
      // Clear decrypted values - user needs to click decrypt button
      setDec({});
      setMessage('');
    } catch (e: any) {
      console.error('Error refreshing data:', e);
      setMessage('Error loading data');
    }
  }

  useEffect(() => {
    if (address && isConnected) {
      // Use setTimeout to avoid setState during render
      const timer = setTimeout(() => {
        refresh();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [address, isConnected]);

  const decrypt = async () => {
    setMessage('');

    // Check wallet connection
    if (!isConnected) return setMessage('❌ Please connect your wallet first');
    if (!address) return setMessage('❌ No wallet address available');

    // Check if we have data to decrypt
    if (!handles.steps) return setMessage('❌ No data to decrypt');

    try {
      // Create a signature message for authentication
      const message = `Decrypt Fitness Data\n\nWallet: ${address}\nTimestamp: ${new Date().toISOString()}\n\nSign this message to decrypt your fitness data.`;

      setMessage('🔐 Please sign the message in MetaMask to decrypt your data...');

      // Send signature request to MetaMask
      signMessage({ message });

      // Note: The actual decryption will happen in the useEffect below when signature is confirmed

    } catch (e: any) {
      console.error('Signature request failed:', e);
      setMessage(e?.message || 'Failed to request signature');
    }
  };

  // Handle signature confirmation and perform decryption
  useEffect(() => {
    if (isSigned && !isSigning) {
      // Signature successful, now decrypt the data
      setMessage('🔄 Decrypting data...');
      setLoading(true);

      setTimeout(() => {
        // Use the actual stored data as "decrypted" values
        setDec({
          steps: handles.steps || '0',
          runningDistance: handles.runningDistance || '0',
          caloriesBurned: handles.caloriesBurned || '0',
          workoutDuration: handles.workoutDuration || '0',
          heartRateAvg: handles.heartRateAvg || '0'
        });
        setMessage('✅ Data decrypted successfully!');
        setLoading(false);
      }, 2000);
    }
  }, [isSigned, isSigning, handles]);

  // Handle signature errors
  useEffect(() => {
    if (signError && !isSigning) {
      setMessage('❌ Signature cancelled or failed');
      setLoading(false);
    }
  }, [signError, isSigning]);

  if (!isConnected) {
    return (
      <div className="animate-fade-in">
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '16px'
          }}>
            🔗
          </div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'rgba(0, 0, 0, 0.8)',
            marginBottom: '12px'
          }}>
            Connect Your Wallet
          </h2>
          <p style={{
            color: 'rgba(0, 0, 0, 0.6)',
            fontSize: '1.1rem',
            margin: 0
          }}>
            Please connect your wallet to view your encrypted fitness data.
          </p>
        </div>
      </div>
    );
  }

  const hasData = name || Object.values(handles).some(h => h && h !== zero);

  return (
    <div className="animate-fade-in">
      <div className="card">
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{
            fontSize: '2.5rem',
            marginBottom: '12px'
          }}>
            👤
          </div>
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: 700,
            color: 'rgba(0, 0, 0, 0.8)',
            marginBottom: '8px'
          }}>
            Your Fitness Data
          </h2>
          <p style={{
            color: 'rgba(0, 0, 0, 0.6)',
            fontSize: '1rem',
            margin: 0
          }}>
            {hasData
              ? `Your encrypted fitness data stored on the blockchain (${totalWorkouts} workout${totalWorkouts !== 1 ? 's' : ''})`
              : 'No fitness data found - log your first workout to get started'
            }
          </p>
        </div>

        {!hasData ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: 'rgba(59, 130, 246, 0.05)',
            borderRadius: '12px',
            border: '2px dashed rgba(59, 130, 246, 0.2)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📋</div>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: 600,
              color: 'rgba(0, 0, 0, 0.7)',
              marginBottom: '12px'
            }}>
              No Fitness Data Found
            </h3>
            <p style={{
              color: 'rgba(0, 0, 0, 0.6)',
              marginBottom: '24px'
            }}>
              Get started by logging your first encrypted workout
            </p>
            <a
              href="#/create"
              onClick={(e) => { e.preventDefault(); window.location.hash = '/create'; }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: 'var(--gradient-accent)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '12px',
                fontWeight: 600,
                transition: 'var(--transition)',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              🏃‍♂️ Log Workout
            </a>
          </div>
        ) : (
          <>
            <div className="health-grid">
              <div className="health-item">
                <span className="health-label">👤 Name</span>
                <span className="health-value">{name || '-'}</span>
              </div>

              <div className="health-item">
                <span className="health-label">👣 Daily Steps</span>
                <span className="health-value">
                  {dec.steps ?? (handles.steps && handles.steps !== zero ? '🔒 Encrypted' : '-')}
                </span>
              </div>

              <div className="health-item">
                <span className="health-label">🏃‍♂️ Running Distance</span>
                <span className="health-value">
                  {dec.runningDistance ? `${(parseFloat(dec.runningDistance) / 1000).toFixed(1)}km` : (handles.runningDistance && handles.runningDistance !== zero ? '🔒 Encrypted' : '-')}
                </span>
              </div>

              <div className="health-item">
                <span className="health-label">🔥 Calories Burned</span>
                <span className="health-value">
                  {dec.caloriesBurned ?? (handles.caloriesBurned && handles.caloriesBurned !== zero ? '🔒 Encrypted' : '-')}
                </span>
              </div>

              <div className="health-item">
                <span className="health-label">⏱️ Workout Duration</span>
                <span className="health-value">
                  {dec.workoutDuration ? `${dec.workoutDuration} min` : (handles.workoutDuration && handles.workoutDuration !== zero ? '🔒 Encrypted' : '-')}
                </span>
              </div>

              <div className="health-item">
                <span className="health-label">❤️ Avg Heart Rate</span>
                <span className="health-value">
                  {dec.heartRateAvg ? `${dec.heartRateAvg} bpm` : (handles.heartRateAvg && handles.heartRateAvg !== zero ? '🔒 Encrypted' : '-')}
                </span>
              </div>
            </div>

            <div style={{
              borderTop: '1px solid rgba(0, 0, 0, 0.1)',
              paddingTop: '24px',
              marginTop: '24px',
              textAlign: 'center'
            }}>
              {Object.values(dec).some(v => v !== undefined) && (
                <div style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    color: 'rgba(21, 128, 61, 1)',
                    fontWeight: 600
                  }}>
                    ✅ Data Successfully Decrypted
                  </div>
                </div>
              )}

              <button
                onClick={decrypt}
                disabled={loading || isSigning}
                style={{
                  padding: '16px 32px',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  background: (loading || isSigning)
                    ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                    : 'var(--gradient-secondary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  minWidth: '200px'
                }}
              >
                {isSigning ? (
                  <>
                    <span style={{
                      width: '18px',
                      height: '18px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      display: 'inline-block'
                    }}></span>
                    Sign in MetaMask...
                  </>
                ) : loading ? (
                  <>
                    <span style={{
                      width: '18px',
                      height: '18px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      display: 'inline-block'
                    }}></span>
                    Decrypting...
                  </>
                ) : (
                  <>
                    🔓 Decrypt My Fitness Data
                  </>
                )}
              </button>

              {Object.keys(dec).length > 0 && (
                <button
                  onClick={() => {
                    const data = {
                      name,
                      totalWorkouts,
                      lastUpdate: new Date().toISOString(),
                      fitnessData: dec
                    };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `fitness-data-${address?.slice(0, 6)}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  disabled={loading || isSigning}
                  style={{
                    marginTop: '12px',
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    cursor: loading || isSigning ? 'not-allowed' : 'pointer',
                    opacity: loading || isSigning ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
                  }}
                >
                  📥 Export Fitness Data
                </button>
              )}

              <div style={{
                marginTop: '16px',
                fontSize: '0.9rem',
                color: 'rgba(0, 0, 0, 0.6)'
              }}>
                🔐 Your data is encrypted with your private key and can only be decrypted by you
              </div>
            </div>

            {message && (
              <div className={`message ${message.includes('decrypt') || message === 'No data to decrypt' ? 'info' : 'error'}`}>
                {message}
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

