import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { persistor, store } from './redux/store.js';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51Rq7HZLttlbUkUyMrgUcsenRVoq7MhNrKtzR09F1aw0y8GDLxvt3X9A4QQOcUIKpg8KNjmCGi7YrPnS92ZquYWV000PrtBJsUx');

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <Elements stripe={stripePromise}>
        <App />
      </Elements>
    </PersistGate>
  </Provider>
);
