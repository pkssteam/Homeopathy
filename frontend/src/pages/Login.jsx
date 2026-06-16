import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/routes';
import { ROLES } from '../constants/roles';
import { Button } from '../components/ui/Button/Button';
import { Input } from '../components/ui/Input/Input';
import { ShieldCheck, HeartPulse } from 'lucide-react';

export const Login = () => {
  const { login, user, error, setError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in, redirect to correct portal
    if (user) {
      redirectUser(user.role);
    }
  }, [user]);

  const redirectUser = (role) => {
    switch (role) {
      case ROLES.ADMIN:
        navigate(ROUTES.ADMIN_DASHBOARD);
        break;
      case ROLES.DOCTOR:
        navigate(ROUTES.DOCTOR_DASHBOARD);
        break;
      case ROLES.PATIENT:
        navigate(ROUTES.PATIENT_DASHBOARD);
        break;
      case ROLES.INVENTORY_REP:
        navigate(ROUTES.INVENTORY_DASHBOARD);
        break;
      default:
        navigate(ROUTES.LOGIN);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const loggedInUser = await login(email, password);
      redirectUser(loggedInUser.role);
    } catch (err) {
      // Error is already set inside context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg p-8 space-y-6">
        
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center border border-green-200">
            <HeartPulse size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Homeopathy Hospital Management</h1>
          <p className="text-xs text-slate-500 max-w-xs">
            Sign in to access your secure hospital portal, view medical files, or manage clinic inventory.
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded font-medium">
            {error}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isSubmitting}
          />
          
          <div className="pt-2">
            <Button
              type="submit"
              variant="medical"
              className="w-full justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In'}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
};
