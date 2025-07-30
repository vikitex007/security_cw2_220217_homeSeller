import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import { addCsrfHeader } from '../utils/csrf';

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: addCsrfHeader({
          'Content-Type': 'application/json',
        }),
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (data.success === false) {
        setLoading(false);
        setError(data.message);
        return;
      }
      
      setLoading(false);
      setSuccess(true);
      setError(null);
      
      // Show success message for 3 seconds then redirect
      setTimeout(() => {
        navigate('/sign-in');
      }, 3000);
      
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };
  
  if (success) {
    return (
      <div className='p-3 max-w-lg mx-auto'>
        <div className='bg-white rounded-lg shadow-md p-6 text-center'>
          <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <svg className='w-8 h-8 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
            </svg>
          </div>
          <h1 className='text-2xl font-semibold text-green-600 mb-2'>Account Created!</h1>
          <p className='text-gray-600 mb-4'>
            Please check your email to verify your account before signing in.
          </p>
          <p className='text-sm text-gray-500'>
            Redirecting to sign in page...
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl text-center font-semibold my-7 text-emerald-800'>Join HomeSell Pro</h1>
      <h2 className='text-xl text-center font-medium mb-7 text-emerald-600'>Create Your Account</h2>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input
          type='text'
          placeholder='Username'
          className='border border-emerald-200 p-3 rounded-lg focus:outline-none focus:border-orange-500 transition-colors'
          id='username'
          onChange={handleChange}
          required
        />
        <input
          type='email'
          placeholder='Email'
          className='border border-emerald-200 p-3 rounded-lg focus:outline-none focus:border-orange-500 transition-colors'
          id='email'
          onChange={handleChange}
          required
        />
        <input
          type='password'
          placeholder='Password'
          className='border border-emerald-200 p-3 rounded-lg focus:outline-none focus:border-orange-500 transition-colors'
          id='password'
          onChange={handleChange}
          required
        />
        {/* Password strength meter */}
        <PasswordStrengthMeter password={formData.password || ''} />
        <button
          disabled={loading}
          className='bg-emerald-600 text-white p-3 rounded-lg uppercase hover:bg-emerald-700 disabled:opacity-80 transition-colors'
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
        <OAuth/>
      </form>
      <div className='flex gap-2 mt-5 justify-center'>
        <p className='text-emerald-700'>Have an account?</p>
        <Link to={'/sign-in'}>
          <span className='text-orange-600 hover:text-emerald-700 hover:underline transition-colors'>Sign in</span>
        </Link>
      </div>
      {error && <p className='text-red-500 mt-5 text-center'>{error}</p>}
    </div>
  );
}
