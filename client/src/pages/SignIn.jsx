import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from '../redux/user/userSlice';
import OAuth from '../components/OAuth';
import { addCsrfHeader } from '../utils/csrf';

export default function SignIn() {
  const [formData, setFormData] = useState({});
  const [mfaToken, setMfaToken] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [requiresMFA, setRequiresMFA] = useState(false);
  const [showBackupCode, setShowBackupCode] = useState(false);
  const { loading, error } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(signInStart());
      
      const requestBody = {
        ...formData,
        ...(mfaToken && { mfaToken }),
        ...(backupCode && { backupCode }),
      };
      
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: addCsrfHeader({
          'Content-Type': 'application/json',
        }),
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });
      
      const data = await res.json();
      
      if (data.requiresMFA) {
        setRequiresMFA(true);
        dispatch(signInFailure(null)); // Clear any previous errors
        return;
      }
      
      if (data.success === false) {
        dispatch(signInFailure(data.message));
        return;
      }
      
      dispatch(signInSuccess(data));
      // Redirect admin users to admin panel, regular users to home
      if (data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  const handleMFAVerification = async (e) => {
    e.preventDefault();
    await handleSubmit(e);
  };

  const handleBackupCode = async (e) => {
    e.preventDefault();
    setShowBackupCode(true);
  };

  if (requiresMFA) {
    return (
      <div className='p-3 max-w-lg mx-auto'>
        <h1 className='text-3xl text-center font-semibold my-7 text-emerald-800'>Two-Factor Authentication</h1>
        <h2 className='text-xl text-center font-medium mb-7 text-emerald-600'>Enter your MFA code</h2>
        
        <form onSubmit={handleMFAVerification} className='flex flex-col gap-4'>
          <input
            type='text'
            placeholder='Enter 6-digit MFA code'
            className='border border-emerald-200 p-3 rounded-lg focus:outline-none focus:border-orange-500 transition-colors'
            value={mfaToken}
            onChange={(e) => setMfaToken(e.target.value)}
            maxLength={6}
          />
          
          <button
            disabled={loading}
            className='bg-emerald-600 text-white p-3 rounded-lg uppercase hover:bg-emerald-700 disabled:opacity-80 transition-colors'
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
          
          <div className='text-center'>
            <button
              type='button'
              onClick={handleBackupCode}
              className='text-orange-600 hover:text-emerald-700 hover:underline transition-colors'
            >
              Use backup code instead
            </button>
          </div>
        </form>
        
        {showBackupCode && (
          <form onSubmit={handleMFAVerification} className='flex flex-col gap-4 mt-4'>
            <input
              type='text'
              placeholder='Enter backup code'
              className='border border-emerald-200 p-3 rounded-lg focus:outline-none focus:border-orange-500 transition-colors'
              value={backupCode}
              onChange={(e) => setBackupCode(e.target.value)}
            />
            
            <button
              disabled={loading}
              className='bg-orange-600 text-white p-3 rounded-lg uppercase hover:bg-orange-700 disabled:opacity-80 transition-colors'
            >
              {loading ? 'Verifying...' : 'Verify with Backup Code'}
            </button>
          </form>
        )}
        
        {error && <p className='text-red-500 mt-5 text-center'>{error}</p>}
        
        <div className='flex gap-2 mt-5 justify-center'>
          <button
            onClick={() => {
              setRequiresMFA(false);
              setMfaToken('');
              setBackupCode('');
              setShowBackupCode(false);
            }}
            className='text-orange-600 hover:text-emerald-700 hover:underline transition-colors'
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl text-center font-semibold my-7 text-emerald-800'>Welcome to HomeSell Pro</h1>
      <h2 className='text-xl text-center font-medium mb-7 text-emerald-600'>Sign In to Your Account</h2>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input
          type='email'
          placeholder='Email'
          className='border border-emerald-200 p-3 rounded-lg focus:outline-none focus:border-orange-500 transition-colors'
          id='email'
          onChange={handleChange}
        />
        <input
          type='password'
          placeholder='Password'
          className='border border-emerald-200 p-3 rounded-lg focus:outline-none focus:border-orange-500 transition-colors'
          id='password'
          onChange={handleChange}
        />

        <button
          disabled={loading}
          className='bg-emerald-600 text-white p-3 rounded-lg uppercase hover:bg-emerald-700 disabled:opacity-80 transition-colors'
        >
          {loading ? 'Loading...' : 'Sign In'}
        </button>
        <OAuth/>
      </form>
      <div className='flex gap-2 mt-5 justify-center'>
        <p className='text-emerald-700'>Don't have an account?</p>
        <Link to={'/sign-up'}>
          <span className='text-orange-600 hover:text-emerald-700 hover:underline transition-colors'>Sign up</span>
        </Link>
      </div>
      {error && <p className='text-red-500 mt-5 text-center'>{error}</p>}
    </div>
  );
}
