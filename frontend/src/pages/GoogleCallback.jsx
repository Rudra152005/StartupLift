import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkAuthStatus } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (token) {
      console.log('✅ Google Login Successful. Saving token...');
      sessionStorage.setItem('token', token);
      
      // Update auth state immediately
      checkAuthStatus().then(() => {
          navigate('/dashboard');
      });
    } else {
      console.error('❌ Google Login Failed:', error);
      navigate('/login?error=' + (error || 'auth_failed'));
    }
  }, [searchParams, navigate, checkAuthStatus]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
        <p className="text-[var(--text-secondary)]">Authenticating with Google...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
