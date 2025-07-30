import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { app } from '../firebase';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
import { addCsrfHeader } from '../utils/csrf';

export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleGoogleClick = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);

      const result = await signInWithPopup(auth, provider);

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: addCsrfHeader({
          'Content-Type': 'application/json',
        }),
        credentials: 'include',
        body: JSON.stringify({
          name: result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL,
        }),
      });
      const data = await res.json();
      dispatch(signInSuccess(data));
      // Redirect admin users to admin panel, regular users to home
      if (data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.log('could not sign in with google', error);
    }
  };
  return (
    <button
      onClick={handleGoogleClick}
      type='button'
      className='bg-orange-600 text-white p-3 rounded-lg uppercase hover:bg-orange-700 transition-colors'
    >
      Continue with Google
    </button>
  );
}
