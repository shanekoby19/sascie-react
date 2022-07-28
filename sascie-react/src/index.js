import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';
import { PersistGate } from 'redux-persist/integration/react'


import App from './App';
import { store, persistor } from './app/store';

import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
      <Provider store={store} >
        <PersistGate loading={null} persistor={persistor}>
          <CookiesProvider>
            <Router>
              <Routes>
                <Route path="/*" element={<App />} />
              </Routes>
            </Router>
          </CookiesProvider>
        </PersistGate>
      </Provider>
);
