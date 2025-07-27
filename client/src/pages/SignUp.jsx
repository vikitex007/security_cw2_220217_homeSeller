import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
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
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      console.log(data);
      if (data.success === false) {
        setLoading(false);
        setError(data.message);
        return;
      }
      setLoading(false);
      setError(null);
      navigate('/sign-in');
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };
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
        />
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
          {loading ? 'Loading...' : 'Sign Up'}
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
