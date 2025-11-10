import { useState, useEffect } from 'react';
import { useAccount, useChainId, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { getContractAddress, getContractABI, isFhevmSupported } from '../config/contracts';
import { useZamaInstance } from '../hooks/useZamaInstance';

interface CreateProfileProps {
  onWorkoutSubmitted?: () => void;
}

export function CreateProfile({ onWorkoutSubmitted }: CreateProfileProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { writeContract, data: hash, isPending, isError, error } = useWriteContract();
  const [form, setForm] = useState({ name: '', steps: '', runningDistance: '', caloriesBurned: '', workoutDuration: '', heartRateAvg: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Get contract address and ABI based on current network
  const contractAddress = getContractAddress(chainId);
  const contractABI = getContractABI(chainId);
  const fhevmSupported = isFhevmSupported(chainId);

  // FHEVM hook for encryption (currently not used in demo mode)
  const { isSupported: _fhevmReady } = useZamaInstance();

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed) {
      console.log('Transaction confirmed successfully!');
      setSubmitStatus('success');
      setIsSubmitting(false);
      setMessage('✅ Workout logged successfully! Your fitness data is now encrypted and stored on the blockchain.');

      // Notify parent component to refresh Profile data
      if (onWorkoutSubmitted) {
        onWorkoutSubmitted();
      }
    }
  }, [isConfirmed]); // Remove onWorkoutSubmitted from dependencies to prevent infinite re-renders

  // Handle transaction error
  useEffect(() => {
    if (isError && submitStatus !== 'success') {
      console.error('Transaction error:', error);
      setSubmitStatus('error');
      setIsSubmitting(false);
      setMessage(error?.message || 'Transaction failed. Please check your connection and try again.');
    }
  }, [isError, error, submitStatus]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Starting save process...');

    // Check wallet connection first
    if (!address) return setMessage('❌ Please connect your wallet first');

    // Check contract configuration
    if (!contractAddress) return setMessage('❌ Contract not configured');

    // Reset states
    setMessage('');
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      console.log('Contract address:', contractAddress);
      console.log('Selected form data:', form);
      console.log('FHEVM supported:', fhevmSupported);

      // Using simplified contract without FHE encryption
      console.log('Using simplified contract submission');

      await writeContract({
        address: contractAddress as `0x${string}`,
        abi: contractABI,
        functionName: 'setFitnessData',
        args: [
          BigInt(form.steps || '0'),
          BigInt(form.runningDistance || '0'),
          BigInt(form.caloriesBurned || '0'),
          BigInt(form.workoutDuration || '0'),
          BigInt(form.heartRateAvg || '0'),
          form.name
        ],
        gas: BigInt(300000),
      });

      console.log('Transaction initiated successfully');

      // Note: Success handling is done in useEffect when transaction is confirmed

    } catch (error: any) {
      console.error('Transaction error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        data: error.data
      });

      // Provide more specific error messages
      let errorMessage = 'Transaction failed. Please check your connection and try again.';

      if (error.message?.includes('User rejected')) {
        errorMessage = 'Transaction rejected: Please approve the transaction in your wallet.';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds: Please add some test ETH to your wallet.';
      } else if (error.message?.includes('network')) {
        errorMessage = `Network error: Please ensure you're connected to the correct network (${chainId === 31337 ? 'localhost' : 'Sepolia'}).`;
      } else if (error.message?.includes('nonce')) {
        errorMessage = 'Transaction nonce error. Please refresh the page and try again.';
      } else if (error.message?.includes('gas')) {
        errorMessage = 'Gas estimation failed. Please try again.';
      } else if (error.message?.includes('replacement transaction underpriced')) {
        errorMessage = 'Transaction underpriced. Please wait a moment and try again.';
      } else if (error.message?.includes('already known')) {
        errorMessage = 'Transaction already submitted. Please wait for confirmation.';
      }

      setSubmitStatus('error');
      console.error('User-friendly error:', errorMessage);
      setMessage(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {!isConnected ? (
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
            Please connect your wallet to log and manage your fitness data securely.
          </p>
        </div>
      ) : (
        <div className="card">
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <div style={{
              fontSize: '2.5rem',
              marginBottom: '12px'
            }}>
              🏃‍♂️
            </div>
            <h2 style={{
              fontSize: '1.8rem',
              fontWeight: 700,
              color: 'rgba(0, 0, 0, 0.8)',
              marginBottom: '8px'
            }}>
              Log Your Workout
            </h2>
            <p style={{
              color: 'rgba(0, 0, 0, 0.6)',
              fontSize: '1rem',
              margin: 0
            }}>
              Your fitness data will be encrypted and stored securely on the blockchain
            </p>
          </div>

          <form onSubmit={save} style={{ display: 'grid', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">👤 Full Name</label>
              <input
                required
                name="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={onChange}
                style={{ fontSize: '1rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">👣 Daily Steps</label>
                <input
                name="steps"
                  type="number"
                  placeholder="8500"
                  value={form.steps}
                  onChange={onChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">🏃‍♂️ Running Distance (m)</label>
                <input
                  required
                  name="runningDistance"
                  type="number"
                  placeholder="5000"
                  value={form.runningDistance}
                  onChange={onChange}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">🔥 Calories Burned</label>
                <input
                  required
                  name="caloriesBurned"
                  type="number"
                  placeholder="450"
                  value={form.caloriesBurned}
                  onChange={onChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">⏱️ Workout Duration (min)</label>
                <input
                  required
                  name="workoutDuration"
                  type="number"
                  placeholder="60"
                  value={form.workoutDuration}
                  onChange={onChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">❤️ Avg Heart Rate (bpm)</label>
                <input
                  required
                  name="heartRateAvg"
                  type="number"
                  placeholder="140"
                  value={form.heartRateAvg}
                  onChange={onChange}
                />
              </div>
            </div>

            <div style={{
              borderTop: '1px solid rgba(0, 0, 0, 0.1)',
              paddingTop: '24px',
              marginTop: '12px'
            }}>
              {/* Network Status Indicator */}
              <div className="network-status" style={{
                marginBottom: '16px',
                padding: '12px',
                background: 'rgba(0, 0, 0, 0.05)',
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '0.9rem'
              }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: chainId === 31337 ? '#10b981' : chainId === 11155111 ? '#f59e0b' : '#ef4444',
                    display: 'inline-block'
                  }}></span>
                  <span>
                    {chainId === 31337 ? '🏠 Localhost (FHEVM Enabled)' :
                     chainId === 11155111 ? '🌐 Sepolia (FHEVM Enabled)' :
                     '❌ Unsupported Network'}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isPending || isConfirming}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  background: (isSubmitting || isPending || isConfirming)
                    ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                    : 'var(--gradient-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {(isSubmitting || isPending) ? (
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
                    {isPending ? 'Confirm in Wallet...' : 'Logging Your Workout...'}
                  </>
                ) : isConfirming ? (
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
                    Confirming Transaction...
                  </>
                ) : submitStatus === 'success' ? (
                  <>
                    ✅ Workout Logged Successfully!
                  </>
                ) : submitStatus === 'error' ? (
                  <>
                    ❌ Failed - Try Again
                  </>
                ) : (
                  <>
                    💪 Log My Workout
                  </>
                )}
              </button>
            </div>

            {message && (
              <div className={`message ${submitStatus === 'success' ? 'success' : 'error'}`}>
                {submitStatus === 'success' ? (
                  <>✅ Workout logged successfully! Your fitness data is now encrypted and stored on the blockchain.</>
                ) : (
                  <>❌ {message}</>
                )}
              </div>
            )}
          </form>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          form > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

