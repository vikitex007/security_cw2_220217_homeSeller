import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Contact({ listing }) {
  const [landlord, setLandlord] = useState(null);
  const [message, setMessage] = useState('');
  const onChange = (e) => {
    setMessage(e.target.value);
  };

  useEffect(() => {
    const fetchLandlord = async () => {
      try {
        const res = await fetch(`/api/user/${listing.userRef}`);
        const data = await res.json();
        setLandlord(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchLandlord();
  }, [listing.userRef]);
  return (
    <>
      {landlord && (
        <div className='flex flex-col gap-2'>
          <p className='text-emerald-700'>
            Contact <span className='font-semibold text-emerald-800'>{landlord.username}</span>{' '}
            about{' '}
            <span className='font-semibold text-emerald-800'>{listing.name.toLowerCase()}</span>
          </p>
          <textarea
            name='message'
            id='message'
            rows='2'
            value={message}
            onChange={onChange}
            placeholder='Enter your message here...'
            className='w-full border border-emerald-200 p-3 rounded-lg focus:outline-none focus:border-orange-500 transition-colors'
          ></textarea>

          <Link
          to={`mailto:${landlord.email}?subject=Regarding ${listing.name}&body=${message}`}
          className='bg-emerald-600 text-white text-center p-3 uppercase rounded-lg hover:bg-emerald-700 transition-colors'
          >
            Send Message          
          </Link>
        </div>
      )}
    </>
  );
}
