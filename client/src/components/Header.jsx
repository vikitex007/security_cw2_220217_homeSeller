import { FaSearch } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('searchTerm', searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [location.search]);
  return (
    <header className='bg-emerald-50 shadow-md border-b border-emerald-200'>
      <div className='flex justify-between items-center max-w-6xl mx-auto p-3'>
        <Link to='/'>
          <h1 className='font-bold text-sm sm:text-xl flex flex-wrap'>
            <span className='text-emerald-600'>HomeSell</span>
            <span className='text-orange-600'>Pro</span>
          </h1>
        </Link>
        <form
          onSubmit={handleSubmit}
          className='bg-white p-3 rounded-lg flex items-center border border-emerald-200 shadow-sm'
        >
          <input
            type='text'
            placeholder='Search homes...'
            className='bg-transparent focus:outline-none w-24 sm:w-64 text-emerald-700'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button>
            <FaSearch className='text-emerald-600' />
          </button>
        </form>
        <ul className='flex gap-4 items-center'>
          <Link to='/'>
            <li className='hidden sm:inline text-emerald-700 hover:text-orange-600 hover:underline transition-colors'>
              Home
            </li>
          </Link>
          <Link to='/about'>
            <li className='hidden sm:inline text-emerald-700 hover:text-orange-600 hover:underline transition-colors'>
              About
            </li>
          </Link>
          {currentUser && (
            <Link to='/create-listing'>
              <li className='hidden sm:inline text-emerald-700 hover:text-orange-600 hover:underline transition-colors'>
                Add Listing
              </li>
            </Link>
          )}
          <Link to='/profile'>
            {currentUser ? (
              <img
                className='rounded-full h-7 w-7 object-cover border-2 border-emerald-200'
                src={currentUser.avatar}
                alt='profile'
              />
            ) : (
              <li className=' text-emerald-700 hover:text-orange-600 hover:underline transition-colors'> Sign in</li>
            )}
          </Link>
        </ul>
      </div>
    </header>
  );
}
