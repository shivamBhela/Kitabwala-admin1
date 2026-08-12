'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, KeyRound, BookOpen } from 'lucide-react';
import { login as loginRequest, verify2FALogin } from '@/services/authService';
import { ApiError } from '@/types/api';
import { AUTH_COOKIE_NAME } from '@/constants/app';
import type { AuthUser } from '@/types/auth';

interface LoginPageProps {
  onLogin: (user: AuthUser) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Set once credentials pass and the account has 2FA enabled — the panel
  // flips to the verification form below instead of a second page/route.
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const verifyMode = pendingToken !== null;

  const finishLogin = (accessToken: string, user: AuthUser) => {
    localStorage.setItem(AUTH_COOKIE_NAME, accessToken);
    onLogin(user);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Please enter your phone/email and password.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const result = await loginRequest(identifier.trim(), password);
      if (result.requires2FA) {
        setPendingToken(result.pendingToken);
      } else {
        finishLogin(result.accessToken, result.user);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingToken || !twoFactorCode.trim()) return;
    setError('');
    setIsLoading(true);
    try {
      const result = await verify2FALogin(pendingToken, twoFactorCode.trim());
      if (!result.requires2FA) {
        finishLogin(result.accessToken, result.user);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Invalid code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const backToPassword = () => {
    setPendingToken(null);
    setTwoFactorCode('');
    setError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, submit: (e: React.FormEvent) => void) => {
    if (e.key === 'Enter') submit(e as unknown as React.FormEvent);
  };

  return (
    <>
      <style>{`
        .kw-auth-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: linear-gradient(160deg, #FFC107 0%, #FFD54F 35%, #ffffff 65%);
        }
        .kw-auth-container {
          position: relative;
          width: 100%;
          max-width: 900px;
          height: 550px;
          background: white;
          border-radius: 24px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.18);
          overflow: hidden;
        }
        .kw-auth-forms-container { position: absolute; width: 100%; height: 100%; top: 0; left: 0; }
        .kw-auth-signin-signup {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          left: 75%;
          width: 50%;
          transition: 1s 0.7s ease-in-out;
          display: grid;
          grid-template-columns: 1fr;
          z-index: 5;
        }
        .kw-auth-form {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 4rem;
          transition: all 0.2s 0.7s;
          overflow: hidden;
          grid-column: 1 / 2;
          grid-row: 1 / 2;
        }
        .kw-auth-form.verify-form { opacity: 0; z-index: 1; }
        .kw-auth-form.password-form { z-index: 2; }
        .kw-auth-title { font-size: 1.9rem; color: #111827; margin-bottom: 6px; font-weight: 800; }
        .kw-auth-subtitle { font-size: 0.85rem; color: #64748b; margin-bottom: 20px; }
        .kw-auth-field {
          max-width: 340px;
          width: 100%;
          background-color: #f8fafc;
          margin: 8px 0;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 0 1rem;
          transition: 0.2s;
        }
        .kw-auth-field:focus-within { border-color: #FFC107; box-shadow: 0 0 0 3px rgba(255,193,7,0.25); }
        .kw-auth-field input {
          background: none; outline: none; border: none; width: 100%;
          height: 50px; font-size: 0.9rem; font-weight: 500; color: #111827;
        }
        .kw-auth-field .toggle-visibility { cursor: pointer; color: #94a3b8; background:none; border:none; padding:0; }
        .kw-auth-btn {
          width: 100%;
          max-width: 340px;
          background: linear-gradient(135deg, #FFC107, #FFD54F);
          border: none;
          height: 48px;
          border-radius: 48px;
          color: #111827;
          font-weight: 700;
          font-size: 0.85rem;
          margin: 14px 0 4px;
          cursor: pointer;
          transition: 0.2s;
          box-shadow: 0 4px 16px rgba(255,193,7,0.4);
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .kw-auth-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .kw-auth-btn:not(:disabled):hover { transform: translateY(-1px); }
        .kw-auth-back { background: none; border: none; font-size: 0.75rem; font-weight: 600; color: #64748b; margin-top: 4px; cursor: pointer; }
        .kw-auth-error {
          width: 100%; max-width: 340px; font-size: 0.75rem; font-weight: 500; color: #e11d48;
          background: #fff1f2; padding: 8px 12px; border-radius: 10px; border: 1px solid #fecdd3; margin: 4px 0;
        }
        .kw-auth-panels-container {
          position: absolute; height: 100%; width: 100%; top: 0; left: 0;
          display: grid; grid-template-columns: repeat(2, 1fr);
        }
        .kw-auth-panel {
          display: flex; flex-direction: column; align-items: flex-end; justify-content: space-around;
          text-align: center; z-index: 6;
        }
        /* pointer-events is the load-bearing part here: both decorative panels sit in a
           layer above the forms (z-index 6), so the inactive one MUST ignore clicks or
           it blocks the real form controls underneath it. */
        .kw-auth-panel.left-panel { padding: 3rem 17% 2rem 12%; pointer-events: all; }
        .kw-auth-panel.right-panel { padding: 3rem 12% 2rem 17%; pointer-events: none; }
        .kw-auth-panel .content { color: #111827; transition: transform 0.9s ease-in-out; transition-delay: 0.6s; }
        .kw-auth-panel h3 { font-weight: 800; line-height: 1.1; font-size: 1.4rem; margin-bottom: 10px; }
        .kw-auth-panel p { font-size: 0.85rem; padding: 0.5rem 0; opacity: 0.85; }
        .kw-auth-panel.right-panel .content { transform: translateX(800px); }
        .kw-auth-container.verify-mode:before { transform: translate(100%, -50%); right: 52%; }
        .kw-auth-container.verify-mode .kw-auth-panel.left-panel .content { transform: translateX(-800px); }
        .kw-auth-container.verify-mode .kw-auth-panel.left-panel { pointer-events: none; }
        .kw-auth-container.verify-mode .kw-auth-panel.right-panel { pointer-events: all; }
        .kw-auth-container.verify-mode .kw-auth-signin-signup { left: 25%; }
        .kw-auth-container.verify-mode .kw-auth-form.verify-form { opacity: 1; z-index: 2; }
        .kw-auth-container.verify-mode .kw-auth-form.password-form { opacity: 0; z-index: 1; }
        .kw-auth-container.verify-mode .kw-auth-panel.right-panel .content { transform: translateX(0%); }
        .kw-auth-container:before {
          content: "";
          position: absolute;
          height: 2000px; width: 2000px;
          top: -10%; right: 48%;
          transform: translateY(-50%);
          background: linear-gradient(-45deg, #FFC107 0%, #D68C00 100%);
          transition: 1.8s ease-in-out;
          border-radius: 50%;
          z-index: 6;
        }
        @media (max-width: 870px) {
          .kw-auth-container { min-height: 780px; height: 100vh; }
          .kw-auth-signin-signup, .kw-auth-container.verify-mode .kw-auth-signin-signup {
            width: 100%; left: 50%; top: 95%; transform: translate(-50%, -100%); transition: 1s 0.8s ease-in-out;
          }
          .kw-auth-panels-container { grid-template-columns: 1fr; grid-template-rows: 1fr 2fr 1fr; }
          .kw-auth-panel { flex-direction: row; justify-content: space-around; align-items: center; padding: 2rem 8%; grid-column: 1 / 2; }
          .kw-auth-panel.left-panel { grid-row: 1 / 2; }
          .kw-auth-panel.right-panel { grid-row: 3 / 4; }
          .kw-auth-panel .content { padding-right: 10%; }
          .kw-auth-container:before {
            width: 1500px; height: 1500px; transform: translateX(-50%); left: 30%; bottom: 68%; right: initial; top: initial; transition: 2s ease-in-out;
          }
          .kw-auth-container.verify-mode:before { transform: translate(-50%, 100%); bottom: 32%; right: initial; }
          .kw-auth-container.verify-mode .kw-auth-panel.left-panel .content { transform: translateY(-300px); }
          .kw-auth-container.verify-mode .kw-auth-panel.right-panel .content { transform: translateY(0px); }
          .kw-auth-panel.right-panel .content { transform: translateY(300px); }
          .kw-auth-container.verify-mode .kw-auth-signin-signup { top: 5%; transform: translate(-50%, 0); }
        }
        @media (max-width: 570px) { .kw-auth-form { padding: 0 1.5rem; } }
      `}</style>

      <div className="kw-auth-page">
        <div className={`kw-auth-container ${verifyMode ? 'verify-mode' : ''}`}>
          <div className="kw-auth-forms-container">
            <div className="kw-auth-signin-signup">
              {/* Password form */}
              <form className="kw-auth-form password-form" onSubmit={handleLogin}>
                <h2 className="kw-auth-title">Welcome back</h2>
                <p className="kw-auth-subtitle">Sign in to your admin account</p>

                <div className="kw-auth-field">
                  <input
                    type="text"
                    autoComplete="username"
                    autoFocus={!verifyMode}
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      setError('');
                    }}
                    onKeyDown={(e) => handleKeyDown(e, handleLogin)}
                    placeholder="Phone or email"
                  />
                </div>

                <div className="kw-auth-field" style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, handleLogin)}
                    placeholder="Password"
                  />
                  <button type="button" className="toggle-visibility" onClick={() => setShowPassword((v) => !v)}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {!verifyMode && error && <div className="kw-auth-error">{error}</div>}

                <button type="submit" className="kw-auth-btn" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              {/* 2FA verify form */}
              <form className="kw-auth-form verify-form" onSubmit={handleVerify2FA}>
                <h2 className="kw-auth-title">Verify it&apos;s you</h2>
                <p className="kw-auth-subtitle">Enter the 6-digit code from your authenticator app (or a backup code)</p>

                <div className="kw-auth-field" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', alignItems: 'center', gap: '6px' }}>
                  <KeyRound className="w-4 h-4" style={{ color: '#94a3b8' }} />
                  <input
                    type="text"
                    inputMode="numeric"
                    autoFocus={verifyMode}
                    value={twoFactorCode}
                    onChange={(e) => {
                      setTwoFactorCode(e.target.value);
                      setError('');
                    }}
                    onKeyDown={(e) => handleKeyDown(e, handleVerify2FA)}
                    placeholder="123456"
                  />
                </div>

                {verifyMode && error && <div className="kw-auth-error">{error}</div>}

                <button type="submit" className="kw-auth-btn" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                    </>
                  ) : (
                    'Verify & Continue'
                  )}
                </button>
                <button type="button" className="kw-auth-back" onClick={backToPassword}>
                  ← Back to password
                </button>
              </form>
            </div>
          </div>

          <div className="kw-auth-panels-container">
            <div className="kw-auth-panel left-panel">
              <div className="content">
                <BookOpen className="w-8 h-8 mx-auto mb-2" />
                <h3>Kitabwalah</h3>
                <p>Enterprise operations portal — real-time orders, delivery, and analytics for the team.</p>
              </div>
            </div>
            <div className="kw-auth-panel right-panel">
              <div className="content">
                <h3>Almost there</h3>
                <p>Two-factor authentication is enabled on this account — finish verifying to continue.</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6 font-medium">
          © {new Date().getFullYear()} Kitabwalah — All rights reserved
        </p>
      </div>
    </>
  );
}
