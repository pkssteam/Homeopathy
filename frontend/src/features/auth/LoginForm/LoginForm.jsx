import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { ROUTES } from '../../../constants/routes';
import { ROLES } from '../../../constants/roles';
import { Eye, EyeOff, LogIn, Leaf } from 'lucide-react';
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
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setIsSubmitting(true);
    try {
      const loggedInUser = await login(email, password);
      redirectUser(loggedInUser.role);
    } catch (_) {
      // error set inside hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-root">

      {/* ── Left panel: branding / illustration ── */}
      <div className="login-left-panel">
        <div className="login-left-inner">
          {/* Logo */}
          <div className="login-brand">
            <div className="login-brand-icon">
              <Leaf size={22} strokeWidth={2} />
            </div>
            <span className="login-brand-name">Homeopathy HMS</span>
          </div>

          {/* Illustration */}
          <div className="login-illustration-wrapper">
            <img
              src="/login-hero.png"
              alt="Homeopathy healthcare illustration"
              className="login-illustration"
            />
          </div>

          {/* Tagline */}
          <div className="login-left-copy">
            <h2 className="login-left-heading">Natural Care,<br />Modern Management</h2>
            <p className="login-left-sub">
              A unified portal for admins, doctors, patients, and inventory teams —
              built for holistic healthcare delivery.
            </p>
          </div>

          {/* Decorative blobs */}
          <div className="login-blob login-blob-1"></div>
          <div className="login-blob login-blob-2"></div>
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="login-right-panel">
        <div className="login-form-card">

          {/* Form header */}
          <div className="login-form-header">
            <h1 className="login-form-title">Welcome back</h1>
            <p className="login-form-subtitle">Sign in to access your portal</p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="login-error-banner" role="alert">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form" noValidate>

            {/* Email */}
            <div className="login-field">
              <label htmlFor="login-email" className="login-label">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                className="login-input"
                placeholder="you@hospital.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                required
                disabled={isSubmitting}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="login-field">
              <label htmlFor="login-password" className="login-label">
                Password
              </label>
              <div className="login-password-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="login-input login-input-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
                  required
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="login-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="login-spinner"></span>
                  Authenticating…
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <p className="login-footer-note">
            Secure access · Role-based portal · JWT protected
          </p>
        </div>
      </div>

    </div>
  );
};
