import React, { useState, useRef } from 'react';
import { db, auth } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { getUsers, setUsers, hashPassword } from '../utils/storage';
import { LockIcon, CloseIcon, LogoutIcon } from './Icons';

function ProfileModal({ currentUser, onClose, onShowToast, onUpdateUser, onLogout }) {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editAvatarBase64, setEditAvatarBase64] = useState(currentUser?.avatar || '');
  
  const fileInputRef = useRef(null);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPass || !newPass || !confirmPass) { onShowToast('Please fill in all password fields.'); return; }
    if (newPass !== confirmPass) { onShowToast('New passwords do not match.'); return; }
    if (newPass.length < 6) { onShowToast('Password must be at least 6 characters.'); return; }

    try {
      // Re-authenticate with Firebase Auth first
      const user = auth.currentUser;
      if (!user) { onShowToast('Session expired. Please log in again.'); return; }
      const credential = EmailAuthProvider.credential(user.email, currentPass);
      await reauthenticateWithCredential(user, credential);

      // Update Firebase Auth password
      await updatePassword(user, newPass);

      // Also update localStorage for consistency
      const users = getUsers();
      const hashedCurrentPass = await hashPassword(currentPass);
      const userIndex = users.findIndex(u => u.user === currentUser.user && u.pass === hashedCurrentPass);
      if (userIndex !== -1) {
        users[userIndex].pass = await hashPassword(newPass);
        setUsers(users);
      }

      setCurrentPass(''); setNewPass(''); setConfirmPass('');
      setIsChangingPassword(false);
      onShowToast('Password changed successfully!');
    } catch (err) {
      console.error('Password change error:', err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        onShowToast('Current password is incorrect.');
      } else if (err.code === 'auth/weak-password') {
        onShowToast('New password is too weak. Use at least 6 characters.');
      } else {
        onShowToast('Failed to change password: ' + err.message);
      }
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2048576) { // 2MB limit
        onShowToast('Image too large. Please select an image under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatarBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      onShowToast('Name cannot be empty.');
      return;
    }

    try {
      const uid = currentUser.uid || currentUser.user;
      await setDoc(doc(db, 'users', uid), {
        name: editName.trim(),
        phone: editPhone.trim(),
        avatar: editAvatarBase64
      }, { merge: true });

      if (onUpdateUser) {
        onUpdateUser({ name: editName.trim(), phone: editPhone.trim(), avatar: editAvatarBase64 });
      }
      
      onShowToast('Profile updated successfully!');
      setIsEditingProfile(false);
    } catch (err) {
      console.error('Profile update error:', err);
      onShowToast('Failed to update profile.');
    }
  };

  const displayAvatar = isEditingProfile ? editAvatarBase64 : currentUser?.avatar;
  const initial = (currentUser?.name || 'U')[0].toUpperCase();

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content profile-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '32px 28px' }}>
          {/* Close */}
          <button className="close-btn" onClick={onClose} style={{ position: 'absolute', top: 16, right: 16 }}>
            <CloseIcon size={16} />
          </button>

          {/* Avatar header */}
          <div className="profile-header">
            <div 
              className="profile-avatar" 
              style={displayAvatar ? { backgroundImage: `url(${displayAvatar})`, backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent' } : {}}
              onClick={() => {
                if (isEditingProfile) fileInputRef.current.click();
              }}
            >
              {displayAvatar ? '' : initial}
              {isEditingProfile && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '10px', textAlign: 'center', padding: '2px 0', cursor: 'pointer' }}>
                  Upload
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleAvatarChange} />
            
            <h2 className="profile-name">{currentUser?.name}</h2>
            <span className="profile-role-badge">{currentUser?.role || 'customer'}</span>
          </div>

          {!isEditingProfile && !isChangingPassword && (
            <div style={{ textAlign: 'center', marginTop: -10, marginBottom: 20 }}>
              <button 
                onClick={() => setIsEditingProfile(true)} 
                style={{ 
                  background: 'transparent',
                  border: '1px solid rgba(201, 168, 76, 0.4)',
                  color: 'var(--gold)',
                  padding: '6px 16px', 
                  fontSize: '12px', 
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontFamily: 'var(--font-body)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(201, 168, 76, 0.08)';
                  e.currentTarget.style.borderColor = 'var(--gold)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.4)';
                }}
              >
                Edit Profile
              </button>
            </div>
          )}

          {isEditingProfile ? (
            <form onSubmit={handleSaveProfile} className="profile-info">
              <div className="input-group">
                <label>Full Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Phone Number</label>
                <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="e.g. 123-456-7890" />
              </div>
              
              <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                <button 
                  type="submit" 
                  className="btn"
                  style={{
                    background: 'linear-gradient(135deg, var(--gold) 0%, #b3924e 100%)',
                    border: 'none',
                    color: '#0e1118',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(201, 168, 76, 0.15)',
                    flex: 1
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(201, 168, 76, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(201, 168, 76, 0.15)';
                  }}
                >
                  Save Changes
                </button>
                <button 
                  type="button" 
                  className="btn secondary" 
                  onClick={() => { setIsEditingProfile(false); setEditName(currentUser?.name || ''); setEditPhone(currentUser?.phone || ''); setEditAvatarBase64(currentUser?.avatar || ''); }}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: 'var(--text-dim)',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    transition: 'all 0.3s ease',
                    flex: 1
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.color = 'var(--text-white)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-dim)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info">
              <div className="profile-row">
                <span className="profile-label">Full Name</span>
                <span className="profile-value">{currentUser?.name || '—'}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">Username</span>
                <span className="profile-value">@{currentUser?.user || '—'}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">Phone</span>
                <span className="profile-value">{currentUser?.phone || '—'}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">Account Type</span>
                <span className="profile-value" style={{ textTransform: 'capitalize' }}>{currentUser?.role || 'customer'}</span>
              </div>
            </div>
          )}

          <div className="divider" />

          {!isChangingPassword && !isEditingProfile && (
            <>
              <button 
                className="btn outline" 
                onClick={() => setIsChangingPassword(true)} 
                style={{ 
                  marginTop: 12,
                  width: '100%',
                  background: 'transparent',
                  border: '1px solid rgba(201, 168, 76, 0.4)',
                  color: 'var(--gold)',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  transition: 'all 0.3s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(201, 168, 76, 0.08)';
                  e.currentTarget.style.borderColor = 'var(--gold)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.4)';
                }}
              >
                <LockIcon size={15} /> Change Password
              </button>

              {onLogout && (
                <button 
                  className="btn danger outline" 
                  onClick={onLogout}
                  style={{ 
                    marginTop: 12,
                    width: '100%',
                    background: 'transparent',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#ef4444',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    transition: 'all 0.3s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                    e.currentTarget.style.borderColor = '#ef4444';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                  }}
                >
                  <LogoutIcon size={15} /> Logout
                </button>
              )}
            </>
          )}

          {isChangingPassword && (
            <form onSubmit={handleChangePassword} style={{ marginTop: 12 }}>
              <div className="input-group">
                <label>Current Password</label>
                <input type="password" placeholder="Enter current password" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} />
              </div>
              <div className="input-group">
                <label>New Password</label>
                <input type="password" placeholder="Enter new password" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Confirm New Password</label>
                <input type="password" placeholder="Confirm new password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                <button 
                  type="submit" 
                  className="btn"
                  style={{
                    background: 'linear-gradient(135deg, var(--gold) 0%, #b3924e 100%)',
                    border: 'none',
                    color: '#0e1118',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(201, 168, 76, 0.15)',
                    flex: 1
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(201, 168, 76, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(201, 168, 76, 0.15)';
                  }}
                >
                  Save Password
                </button>
                <button 
                  type="button" 
                  className="btn secondary" 
                  onClick={() => { setIsChangingPassword(false); setCurrentPass(''); setNewPass(''); setConfirmPass(''); }}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: 'var(--text-dim)',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    transition: 'all 0.3s ease',
                    flex: 1
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.color = 'var(--text-white)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-dim)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileModal;
