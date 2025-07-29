import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import { useSelector } from 'react-redux';
import { Navigation } from 'swiper/modules';
import 'swiper/css/bundle';
import {
  FaBath,
  FaBed,
  FaChair,
  FaMapMarkedAlt,
  FaMapMarkerAlt,
  FaParking,
  FaShare,
  FaCreditCard,
} from 'react-icons/fa';
import Contact from '../components/Contact';
import PaymentForm from '../components/PaymentForm';

// https://sabe.io/blog/javascript-format-numbers-commas#:~:text=The%20best%20way%20to%20format,format%20the%20number%20with%20commas.

export default function Listing() {
  SwiperCore.use([Navigation]);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const params = useParams();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/listing/get/${params.listingId}`);
        const data = await res.json();
        if (data.success === false) {
          setError(true);
          setLoading(false);
          return;
        }
        setListing(data);
        setLoading(false);
        setError(false);
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchListing();
  }, [params.listingId]);

  const handlePaymentSuccess = (data) => {
    setShowPayment(false);
    // You can add success notification here
    alert('Payment completed successfully!');
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  return (
    <main>
      {loading && <p className='text-center my-7 text-2xl text-emerald-700'>Loading...</p>}
      {error && (
        <p className='text-center my-7 text-2xl text-red-600'>Something went wrong!</p>
      )}
      {listing && !loading && !error && (
        <div>
          <Swiper navigation>
            {listing.imageUrls.map((url) => (
              <SwiperSlide key={url}>
                <div
                  className='h-[550px]'
                  style={{
                    background: `url(${url}) center no-repeat`,
                    backgroundSize: 'cover',
                  }}
                  role="img"
                  aria-label={`Property image: ${listing.name}`}
                ></div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className='fixed top-[13%] right-[3%] z-10 border border-emerald-200 rounded-full w-12 h-12 flex justify-center items-center bg-emerald-50 cursor-pointer hover:bg-emerald-100 transition-colors'>
            <FaShare
              className='text-emerald-600'
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => {
                  setCopied(false);
                }, 2000);
              }}
              role="button"
              aria-label="Share listing"
            />
          </div>
          {copied && (
            <p className='fixed top-[23%] right-[5%] z-10 rounded-md bg-emerald-100 p-2 text-emerald-700 border border-emerald-200'>
              Link copied!
            </p>
          )}
          <div className='flex flex-col max-w-4xl mx-auto p-3 my-7 gap-4'>
            <p className='text-2xl font-semibold text-emerald-800'>
              {listing.name} - ${' '}
              {listing.offer
                ? listing.discountPrice.toLocaleString('en-US')
                : listing.regularPrice.toLocaleString('en-US')}
              {listing.type === 'rent' && ' / month'}
            </p>
            <p className='flex items-center mt-6 gap-2 text-emerald-600 text-sm'>
              <FaMapMarkerAlt className='text-orange-600' />
              {listing.address}
            </p>
            <div className='flex gap-4'>
              <p className='bg-red-900 text-white max-w-[200px] rounded-md p-1 text-center'>
                {listing.type === 'rent' ? 'RENT' : 'SALE'}
              </p>
              {listing.offer && (
                <p className='bg-emerald-900 text-white max-w-[200px] rounded-md p-1 text-center'>
                  ${(+listing.regularPrice - +listing.discountPrice).toLocaleString('en-US')} OFF
                </p>
              )}
            </div>
            <p className='text-emerald-800'>
              <span className='font-semibold text-black'>Description - </span>
              {listing.description}
            </p>
            <ul className='text-emerald-900 font-semibold text-sm flex flex-wrap items-center gap-4 sm:gap-6'>
              <li className='flex items-center gap-1 whitespace-nowrap'>
                <FaBed className='text-lg' />
                <span>{listing.bedrooms > 1 ? `${listing.bedrooms} beds` : '1 bed'}</span>
              </li>
              <li className='flex items-center gap-1 whitespace-nowrap'>
                <FaBath className='text-lg' />
                <span>{listing.bathrooms > 1 ? `${listing.bathrooms} baths` : '1 bath'}</span>
              </li>
              <li className='flex items-center gap-1 whitespace-nowrap'>
                <FaParking className='text-lg' />
                <span>{listing.parking ? 'Parking spot' : 'No parking'}</span>
              </li>
              <li className='flex items-center gap-1 whitespace-nowrap'>
                <FaChair className='text-lg' />
                <span>{listing.furnished ? 'Furnished' : 'Unfurnished'}</span>
              </li>
            </ul>
            {currentUser && listing.userRef !== currentUser._id && !contact && (
              <div className='flex gap-4'>
                <button
                  onClick={() => setContact(true)}
                  className='bg-emerald-600 text-white rounded-lg uppercase hover:opacity-95 p-3'
                >
                  Contact landlord
                </button>
                <button
                  onClick={() => setShowPayment(true)}
                  className='bg-orange-600 text-white rounded-lg uppercase hover:opacity-95 p-3 flex items-center gap-2'
                >
                  <FaCreditCard />
                  Make Payment
                </button>
              </div>
            )}
            {contact && <Contact listing={listing} />}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg max-w-md w-full mx-4'>
            <PaymentForm
              listing={listing}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          </div>
        </div>
      )}
    </main>
  );
}
