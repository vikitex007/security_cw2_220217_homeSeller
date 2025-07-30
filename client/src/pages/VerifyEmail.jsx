import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const [showResend, setShowResend] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Please check your email for the correct link.');
      return;
    }
    
    verifyEmail(token);
  }, [searchParams]);
  
  const verifyEmail = async (token) => {
    try {
      const res = await fetch(`/api/auth/verify-email/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      
      if (data.success) {
        setStatus('success');
        setMessage(data.message);
        setTimeout(() => navigate('/sign-in'), 3000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Verification failed. The link may be expired or invalid.');
        setShowResend(true);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Verification failed. Please try again or request a new verification email.');
      setShowResend(true);
    }
  };
  
  const handleResendEmail = async () => {
    setStatus('sending');
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: searchParams.get('email') || '',
        }),
      });
      const data = await res.json();
      
      if (data.success) {
        setStatus('resent');
        setMessage('A new verification email has been sent to your inbox.');
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to send verification email. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to send verification email. Please try again.');
    }
  };
  
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl text-center font-semibold my-7 text-emerald-800'>
        Email Verification
      </h1>
      
      <div className='bg-white rounded-lg shadow-md p-6'>
        {status === 'verifying' && (
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4'></div>
            <p className='text-gray-600'>Verifying your email address...</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className='text-center'>
            <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg className='w-8 h-8 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
              </svg>
            </div>
            <h2 className='text-xl font-semibold text-green-600 mb-2'>Email Verified!</h2>
            <p className='text-gray-600 mb-4'>{message}</p>
            <p className='text-sm text-gray-500'>Redirecting to sign in...</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className='text-center'>
            <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg className='w-8 h-8 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </div>
            <h2 className='text-xl font-semibold text-red-600 mb-2'>Verification Failed</h2>
            <p className='text-gray-600 mb-4'>{message}</p>
            
            {showResend && (
              <div className='mt-4'>
                <button
                  onClick={handleResendEmail}
                  className='bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors'
                >
                  Resend Verification Email
                </button>
              </div>
            )}
          </div>
        )}
        
        {status === 'sending' && (
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4'></div>
            <p className='text-gray-600'>Sending verification email...</p>
          </div>
        )}
        
        {status === 'resent' && (
          <div className='text-center'>
            <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg className='w-8 h-8 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
              </svg>
            </div>
            <h2 className='text-xl font-semibold text-blue-600 mb-2'>Email Sent!</h2>
            <p className='text-gray-600 mb-4'>{message}</p>
            <p className='text-sm text-gray-500'>Please check your inbox and spam folder.</p>
          </div>
        )}
        
        <div className='mt-6 text-center'>
          <Link 
            to='/sign-in'
            className='text-emerald-600 hover:text-emerald-700 hover:underline transition-colors'
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}