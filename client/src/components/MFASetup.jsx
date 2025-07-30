import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { updateUserSuccess } from '../redux/user/userSlice';
import { addCsrfHeader } from '../utils/csrf';

export default function MFASetup() {
  const [step, setStep] = useState('setup'); // setup, verify, enabled
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (currentUser?.mfaEnabled) {
      setStep('enabled');
    }
  }, [currentUser]);

  const handleSetupMFA = async () => {
    try {
      setLoading(true);
      setError('');
      
      const res = await fetch('/api/auth/setup-mfa', {
        method: 'POST',
        headers: addCsrfHeader({
          'Content-Type': 'application/json',
        }),
        credentials: 'include',
      });
      
      const data = await res.json();
      
      if (data.success === false) {
        setError(data.message);
        return;
      }
      
      setSecret(data.secret);
      setQrCode(data.qrCode);
      setBackupCodes(data.backupCodes);
      setStep('verify');
    } catch (error) {
      setError('Failed to setup MFA');
    } finally {
      setLoading(false);
    }
  };

  const handleEnableMFA = async () => {
    try {
      setLoading(true);
      setError('');
      
      const res = await fetch('/api/auth/enable-mfa', {
        method: 'POST',
        headers: addCsrfHeader({
          'Content-Type': 'application/json',
        }),
        credentials: 'include',
        body: JSON.stringify({ token }),
      });
      
      const data = await res.json();
      
      if (data.success === false) {
        setError(data.message);
        return;
      }
      
      setSuccess('MFA enabled successfully!');
      setStep('enabled');
      
      // Update user state
      dispatch(updateUserSuccess({
        ...currentUser,
        mfaEnabled: true,
      }));
    } catch (error) {
      setError('Failed to enable MFA');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableMFA = async () => {
    try {
      setLoading(true);
      setError('');
      
      const res = await fetch('/api/auth/disable-mfa', {
        method: 'POST',
        headers: addCsrfHeader({
          'Content-Type': 'application/json',
        }),
        credentials: 'include',
        body: JSON.stringify({ token }),
      });
      
      const data = await res.json();
      
      if (data.success === false) {
        setError(data.message);
        return;
      }
      
      setSuccess('MFA disabled successfully!');
      setStep('setup');
      
      // Update user state
      dispatch(updateUserSuccess({
        ...currentUser,
        mfaEnabled: false,
      }));
    } catch (error) {
      setError('Failed to disable MFA');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'enabled') {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-emerald-800 mb-4">Two-Factor Authentication</h3>
        <div className="mb-4">
          <p className="text-green-600 mb-2">✅ MFA is currently enabled</p>
          <p className="text-sm text-gray-600">
            Your account is protected with two-factor authentication.
          </p>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter your MFA token to disable:
          </label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter 6-digit code"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500"
          />
        </div>
        
        <button
          onClick={handleDisableMFA}
          disabled={loading || !token}
          className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Disabling...' : 'Disable MFA'}
        </button>
        
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        {success && <p className="text-green-500 text-sm mt-2">{success}</p>}
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-emerald-800 mb-4">Verify MFA Setup</h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-4">
            Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.):
          </p>
          {qrCode && (
            <div className="flex justify-center mb-4">
              <img src={qrCode} alt="QR Code" className="border border-gray-300" />
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Or manually enter this secret key: <code className="bg-gray-100 px-2 py-1 rounded">{secret}</code>
          </p>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter the 6-digit code from your authenticator app:
          </label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter 6-digit code"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500"
          />
        </div>
        
        <button
          onClick={handleEnableMFA}
          disabled={loading || !token}
          className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 disabled:opacity-50 mb-4"
        >
          {loading ? 'Enabling...' : 'Enable MFA'}
        </button>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            <strong>Backup Codes:</strong> Save these codes in a secure location. You can use them to access your account if you lose your authenticator device:
          </p>
          <div className="bg-gray-100 p-3 rounded-md">
            {backupCodes.map((code, index) => (
              <div key={index} className="font-mono text-sm mb-1">{code}</div>
            ))}
          </div>
        </div>
        
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        {success && <p className="text-green-500 text-sm mt-2">{success}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-emerald-800 mb-4">Two-Factor Authentication</h3>
      <p className="text-sm text-gray-600 mb-4">
        Add an extra layer of security to your account by enabling two-factor authentication.
      </p>
      
      <button
        onClick={handleSetupMFA}
        disabled={loading}
        className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 disabled:opacity-50"
      >
        {loading ? 'Setting up...' : 'Setup MFA'}
      </button>
      
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
} 