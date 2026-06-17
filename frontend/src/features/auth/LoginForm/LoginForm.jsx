import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { ROUTES } from '../../../constants/routes';
import { ROLES } from '../../../constants/roles';
import { Eye, EyeOff, LogIn, Heart } from 'lucide-react';
import './LoginForm.css';

export const LoginForm = () => {
  const { login, user, error, setError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) redirectUser(user.role);
  }, [user]);

  const redirectUser = (role) => {
    switch (role) {
      case ROLES.ADMIN:         navigate(ROUTES.ADMIN_DASHBOARD); break;
      case ROLES.DOCTOR:        navigate(ROUTES.DOCTOR_DASHBOARD); break;
      case ROLES.PATIENT:       navigate(ROUTES.PATIENT_DASHBOARD); break;
      case ROLES.INVENTORY_REP: navigate(ROUTES.INVENTORY_DASHBOARD); break;
      default:                  navigate(ROUTES.LOGIN);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setIsSubmitting(true);
    try {
      const loggedInUser = await login(email, password);
      redirectUser(loggedInUser.role);
    } catch (_) {
      // error is handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-container">
        
        {/* Left Side: Professional Illustration */}
        <div className="login-image-section">
          <div className="login-logo-group">
            <div className="login-logo-icon">
              <Heart size={20} className="text-emerald-600" />
            </div>
            <span className="login-logo-text">Homeopathy HMS</span>
          </div>
          
          <img 
            src="/login-hero.png" 
            alt="Homeopathy Clinic Illustration" 
            className="login-hero-img" 
          />
          
          <div className="login-image-text">
            <h3>Holistic Clinic Care</h3>
            <p>Managing remedies, patients, consultations, and scheduling under a unified portal.</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="login-form-section">
          <div className="login-form-header">
            <h2>Welcome Back</h2>
            <p>Access your department portal to continue</p>
          </div>

          {error && (
            <div className="login-error-box">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form-element">
            <div className="login-input-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="name@hospital.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="login-input-group">
              <label htmlFor="password">Password</label>
              <div className="login-password-container">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="login-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="login-loader"></span>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <span>Homeopathy Hospital Management System</span>
          </div>
        </div>

      </div>
    </div>
  );
};
