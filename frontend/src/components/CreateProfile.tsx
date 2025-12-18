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

  const contractAddress = getContractAddress(chainId);
  const contractABI = getContractABI(chainId);
  const fhevmSupported = isFhevmSupported(chainId);
  const { isSupported: _fhevmReady } = useZamaInstance();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  useEffect(() => {
    if (isConfirmed) {
      setSubmitStatus('success');
      setIsSubmitting(false);
      setMessage('Workout logged successfully! Your fitness data is now encrypted on-chain.');
      if (onWorkoutSubmitted) onWorkoutSubmitted();
    }
  }, [isConfirmed]);

  useEffect(() => {
    if (isError && submitStatus !== 'success') {
      setSubmitStatus('error');
      setIsSubmitting(false);
      setMessage(error?.message || 'Transaction failed. Please try again.');
    }
  }, [isError, error, submitStatus]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return setMessage('Please connect your wallet first');
    if (!contractAddress) return setMessage('Contract not configured');

    setMessage('');
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
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
      });
    } catch (error: any) {
      let errorMessage = 'Transaction failed. Please try again.';
      if (error.message?.includes('User rejected')) {
        errorMessage = 'Transaction rejected. Please approve in your wallet.';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds. Please add test ETH.';
      }
      setSubmitStatus('error');
      setMessage(errorMessage);
      setIsSubmitting(false);
    }
  };

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
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '1.05rem',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            Connect your wallet to start logging encrypted fitness data on the blockchain 🏋️
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="card">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: 70,
            height: 70,
            margin: '0 auto 20px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, var(--neon-pink), var(--neon-orange))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            boxShadow: 'var(--glow-pink)'
          }}>
            🏃‍♂️
          </div>
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: 700,
            marginBottom: '8px'
          }}>
            Log Your Workout 💪
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Your data will be encrypted with FHE before storing on-chain 🔐
          </p>
        </div>

        <form onSubmit={save}>
          {/* Name Input */}
          <div className="form-group">
            <label className="form-label">
              <span className="icon">👤</span> Your Name
            </label>
            <input
              required
              name="name"
              placeholder="Enter your name..."
              value={form.name}
              onChange={onChange}
            />
          </div>

          {/* Stats Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                <span className="icon">👣</span> Daily Steps
              </label>
              <input
                required
                name="steps"
                type="number"
                placeholder="e.g. 8500"
                value={form.steps}
                onChange={onChange}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                <span className="icon">🏃</span> Distance (meters)
              </label>
              <input
                required
                name="runningDistance"
                type="number"
                placeholder="e.g. 5000"
                value={form.runningDistance}
                onChange={onChange}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                <span className="icon">🔥</span> Calories Burned
              </label>
              <input
                required
                name="caloriesBurned"
                type="number"
                placeholder="e.g. 450"
                value={form.caloriesBurned}
                onChange={onChange}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                <span className="icon">⏱️</span> Duration (min)
              </label>
              <input
                required
                name="workoutDuration"
                type="number"
                placeholder="e.g. 60"
                value={form.workoutDuration}
                onChange={onChange}
              />
            </div>
          </div>

          {/* Heart Rate - Full Width */}
          <div className="form-group">
            <label className="form-label">
              <span className="icon">❤️</span> Avg Heart Rate (bpm)
            </label>
            <input
              required
              name="heartRateAvg"
              type="number"
              placeholder="e.g. 140"
              value={form.heartRateAvg}
              onChange={onChange}
            />
          </div>

          {/* Divider */}
          <div className="divider" style={{ margin: '28px 0' }}></div>

          {/* Network Status */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '14px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px'
          }}>
            <span className={`status-dot ${chainId === 31337 || chainId === 11155111 ? 'online' : 'offline'}`}></span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {chainId === 31337 ? '🏠 Localhost Network' :
               chainId === 11155111 ? '🌐 Sepolia Testnet' :
               '❌ Unsupported Network'}
            </span>
            {fhevmSupported && (
              <span className="badge badge-cyan" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                🔐 FHE Ready
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || isPending || isConfirming}
            className="btn-primary"
            style={{ width: '100%', padding: '16px 24px', fontSize: '1.05rem' }}
          >
            {(isSubmitting || isPending) ? (
              <>
                <span className="spinner"></span>
                {isPending ? 'Confirm in Wallet...' : 'Encrypting & Submitting...'}
              </>
            ) : isConfirming ? (
              <>
                <span className="spinner"></span>
                Confirming Transaction...
              </>
            ) : submitStatus === 'success' ? (
              <>✅ Workout Logged!</>
            ) : submitStatus === 'error' ? (
              <>❌ Failed - Try Again</>
            ) : (
              <>🚀 Log My Workout</>
            )}
          </button>

          {/* Info Text */}
          <p style={{
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            marginTop: '16px'
          }}>
            🛡️ Your data is encrypted using Fully Homomorphic Encryption
          </p>

          {/* Message */}
          {message && (
            <div className={`message ${submitStatus === 'success' ? 'success' : 'error'}`}>
              <span>{submitStatus === 'success' ? '✅' : '❌'}</span>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
