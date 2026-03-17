import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import router from './router';
import './index.css';

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0d2040',
            color: '#e8f4fd',
            border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: '10px',
            fontSize: '13px',
          },
        }}
      />
    </AuthProvider>
  );
}
