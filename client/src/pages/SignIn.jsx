import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from '../redux/user/userSlice';
import OAuth from '../components/OAuth';

export default function SignIn() {
  const [formData, setFormData] = useState({});
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
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      console.log(data);
      if (data.success === false) {
        dispatch(signInFailure(data.message));
        return;
      }
      dispatch(signInSuccess(data));
      navigate('/');
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };
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
