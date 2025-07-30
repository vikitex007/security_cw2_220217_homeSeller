import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import About from './pages/About';
import Profile from './pages/Profile';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import CreateListing from './pages/CreateListing';
import UpdateListing from './pages/UpdateListing';
import Listing from './pages/Listing';
import Search from './pages/Search';
import AdminPanel from './pages/AdminPanel';
import AdminRoute from './components/AdminRoute';
import SessionWarning from './components/SessionWarning';
import VerifyEmail from './pages/VerifyEmail';
import CSRFTest from './pages/CSRFTest';
import { useSelector } from 'react-redux';
import { initializeCsrf } from './utils/csrf';

function AppContent() {
  const location = useLocation();
  const { currentUser } = useSelector((state) => state.user);
  const isAdmin = currentUser && currentUser.role === 'admin';
  const isAdminPanel = location.pathname === '/admin';

  // If admin is logged in and not on admin panel, redirect to admin panel
  if (isAdmin && !isAdminPanel) {
    return <Navigate to="/admin" replace />;
  }

  // If admin is on admin panel, show only admin panel
  if (isAdmin && isAdminPanel) {
    return (
      <>
        <AdminPanel />
        <SessionWarning />
      </>
    );
  }

  // Regular user routes
  return (
    <>
      <Header />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/sign-in' element={<SignIn />} />
        <Route path='/sign-up' element={<SignUp />} />
        <Route path='/verify-email' element={<VerifyEmail />} />
        <Route path='/about' element={<About />} />
        <Route path='/search' element={<Search />} />
        <Route path='/listing/:listingId' element={<Listing />} />
        <Route path='/csrf-test' element={<CSRFTest />} />

        <Route element={<PrivateRoute />}>
          <Route path='/profile' element={<Profile />} />
          <Route path='/create-listing' element={<CreateListing />} />
          <Route
            path='/update-listing/:listingId'
            element={<UpdateListing />}
          />
        </Route>
      </Routes>
      <SessionWarning />
    </>
  );
}

export default function App() {
  useEffect(() => {
    // Initialize CSRF protection on app startup
    initializeCsrf();
  }, []);

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
