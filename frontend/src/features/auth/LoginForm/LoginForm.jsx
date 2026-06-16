import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { ROUTES } from '../../../constants/routes';
import { ROLES } from '../../../constants/roles';
import { Button } from '../../../components/ui/Button/Button';
import { Input } from '../../../components/ui/Input/Input';
import { Form } from '../../../components/ui/Form/Form';
import { HeartPulse } from 'lucide-react';
import './LoginForm.css';

export const LoginForm = () => {
  const { login, user, error, setError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
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
      // Error is set inside the auth hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-card-container">
      <div className="login-card-box">

        {/* Header Branding */}
        <div className="login-branding">
          <div className="login-logo-circle">
            <HeartPulse size={24} />
          </div>
          <h1 className="login-title">Homeopathy Hospital Management</h1>
          <p className="login-subtitle">
            Sign in to access your secure hospital portal, view medical files, or manage clinic inventory.
          </p>
        </div>

        {/* Credentials Form using reusable Form component */}
        <Form onSubmit={handleSubmit} error={error}>
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
        </Form>

      </div>
    </div>
  );
};
