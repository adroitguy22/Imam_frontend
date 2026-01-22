import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ToastProvider, useToast } from './components/Toast.tsx';
import { setToastCallback } from './lib/api';

const ToastInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { showToast } = useToast();
    React.useEffect(() => {
        setToastCallback(showToast);
    }, [showToast]);
    return <>{children}</>;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <ToastInitializer>
        <App />
      </ToastInitializer>
    </ToastProvider>
  </React.StrictMode>,
);
