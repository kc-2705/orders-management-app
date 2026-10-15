import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { OrderProvider } from './components/OrderContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <OrderProvider>
      <App />
    </OrderProvider>
  </React.StrictMode>
);
