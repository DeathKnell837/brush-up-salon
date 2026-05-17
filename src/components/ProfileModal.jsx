import React, { useState } from 'react';
import { getUsers, setUsers, hashPassword } from '../utils/storage';
import { LockIcon, CloseIcon } from './Icons';

function ProfileModal({ currentUser, onClose, onShowToast }) {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPass || !newPass || !confirmPass) { onShowToast('Please fill in all password fields.'); return; }
    if (newPass !== confirmPass) { onShowToast('New passwords do not match.'); return; }
    if (newPass.length < 4) { onShowToast('Password must be at least 4 characters.'); return; }

    const users = getUsers();
    const hashedCurrentPass = await hashPassword(currentPass);
    const userIndex = users.findIndex(u => u.user === currentUser.user && u.pass === hashedCurrentPass);
    if (userIndex === -1) { onShowToast('Current password is incorrect.'); return; }

    users[userIndex].pass = await hashPassword(newPass);
    setUsers(users);
    setCurrentPass(''); setNewPass(''); setConfirmPass('');
    setIsChangingPassword(false);
    onShowToast('Password changed successfully!');
  };

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
            <div className="profile-avatar">{initial}</div>
            <h2 className="profile-name">{currentUser?.name}</h2>
            <span className="profile-role-badge">{currentUser?.role || 'customer'}</span>
          </div>

          {/* Info rows */}
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
              <span className="profile-label">Account Type</span>
              <span className="profile-value" style={{ textTransform: 'capitalize' }}>{currentUser?.role || 'customer'}</span>
            </div>
          </div>

          <div className="divider" />

          {!isChangingPassword ? (
            <button className="btn outline" onClick={() => setIsChangingPassword(true)} style={{ marginTop: 12 }}>
              <LockIcon size={15} /> Change Password
            </button>
          ) : (
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
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn">Save Password</button>
                <button type="button" className="btn secondary" onClick={() => { setIsChangingPassword(false); setCurrentPass(''); setNewPass(''); setConfirmPass(''); }}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileModal;
