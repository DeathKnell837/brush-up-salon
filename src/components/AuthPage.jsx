import React, { useState } from 'react';
import { UserIcon, ShieldIcon, LockIcon } from './Icons';
import BrushUpLogo from './BrushUpLogo';

function AuthPage({ salons = [], onSignup, onLogin, onAdminLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupUser, setSignupUser] = useState('');
  const [signupPass, setSignupPass] = useState('');

  const totalSalons = salons.length;
  const totalServices = salons.reduce((acc, salon) => acc + (salon.services?.length || 0), 0);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!loginUser || !loginPass) { alert('Enter username and password.'); return; }
    if (isAdmin) { onAdminLogin(loginUser, loginPass); }
    else { onLogin(loginUser, loginPass); }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (!signupName || !signupUser || !signupPass) { alert('Please complete all fields.'); return; }
    onSignup(signupName, signupUser, signupPass);
  };

  return (
    <div className="auth-page">
      {/* Animated background */}
      <div className="auth-bg">
        <div className="auth-gradient" />
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
        <div className="auth-grid-overlay" />
      </div>

      {/* Left — Image + branding */}
      <div className="auth-side-text">
        <div className="auth-image-showcase">
          <img src="/images/login-art.png" alt="Luxury Salon" />
          <div className="auth-image-overlay">
            <BrushUpLogo size="default" />
            <h1>Elegance <em>Redefined</em></h1>
            <p>Premium salon experiences, curated just for you.</p>
            <div className="auth-features">
              <div className="auth-feature"><span className="auth-feature-dot" /> {totalSalons} Partner Salons</div>
              <div className="auth-feature"><span className="auth-feature-dot" /> {totalServices} Premium Services</div>
              <div className="auth-feature"><span className="auth-feature-dot" /> Instant Booking</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Card */}
      <div className="auth-card">
        {isLogin ? (
          <>
            <h2 className="auth-card-title">{isAdmin ? 'Admin Access' : 'Welcome Back'}</h2>
            <p className="auth-card-subtitle">{isAdmin ? 'Manage your salon bookings' : 'Sign in to continue'}</p>

            <div className="auth-role-toggle">
              <button className={`role-btn ${!isAdmin ? 'active' : ''}`} onClick={() => setIsAdmin(false)} type="button">
                <UserIcon size={14} /> Customer
              </button>
              <button className={`role-btn ${isAdmin ? 'active' : ''}`} onClick={() => setIsAdmin(true)} type="button">
                <ShieldIcon size={14} /> Admin
              </button>
            </div>

            <form onSubmit={handleLogin}>
              <div className="input-group">
                <label>Username</label>
                <input type="text" placeholder={isAdmin ? "Admin username" : "Enter username"}
                  value={loginUser} onChange={(e) => setLoginUser(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Password</label>
                <input type="password" placeholder="Enter password"
                  value={loginPass} onChange={(e) => setLoginPass(e.target.value)} />
              </div>
              <button type="submit" className="btn"><LockIcon size={15} /> Sign In</button>
              {!isAdmin && (
                <p className="muted-link">Don't have an account? <span onClick={() => setIsLogin(false)}>Create one</span></p>
              )}
            </form>
          </>
        ) : (
          <>
            <h2 className="auth-card-title">Create Account</h2>
            <p className="auth-card-subtitle">Join our exclusive salon community</p>
            <form onSubmit={handleSignup}>
              <div className="input-group">
                <label>Full Name</label>
                <input type="text" placeholder="Your full name" value={signupName} onChange={(e) => setSignupName(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Username</label>
                <input type="text" placeholder="Choose a username" value={signupUser} onChange={(e) => setSignupUser(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Password</label>
                <input type="password" placeholder="Create a password" value={signupPass} onChange={(e) => setSignupPass(e.target.value)} />
              </div>
              <button type="submit" className="btn"><UserIcon size={15} /> Create Account</button>
              <p className="muted-link">Already have an account? <span onClick={() => setIsLogin(true)}>Sign in</span></p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default AuthPage;
