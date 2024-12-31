// src/pages/ProfilePage.tsx
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/providers/auth-provider';
import { useNats } from '@/lib/providers/nats-provider';
import type React from 'react';
import { useState } from 'react';
// import { useUser } from '../hooks/useUser';
// import { useAuth } from '../auth/AuthProvider';
// import { useNats } from '../nats/NatsProvider';

const ProfilePage: React.FC = () => {
  const { logout, refreshAccessToken, user } = useAuth();
  const { request } = useNats();

  const [newPassword, setNewPassword] = useState('');

  const handleChangePassword = async () => {
    if (newPassword) {
      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          alert('You are not authenticated.');
          return;
        }

        const data = { access_token: accessToken, new_password: newPassword };
        const response = await request(
          'auth.change_password',
          JSON.stringify(data),
        );
        const result = JSON.parse(response);
        if (result.status === 'success') {
          alert('Password updated successfully.');
          setNewPassword('');
        } else if (result.message === 'Access token expired.') {
          // Try to refresh token
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            await refreshAccessToken(refreshToken);
            // Retry password change
            await handleChangePassword();
          } else {
            alert('Session expired. Please log in again.');
            logout();
          }
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error('Password change error:', error);
        alert('Failed to change password.');
      }
    } else {
      alert('Please enter a new password.');
    }
  };

  return (
    <div>
      <h2>User Profile</h2>
      {user && (
        <div>
          <p>Username: {user.user_name}</p>
          <div>
            {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
            <label>New Password:</label>
            <input
              value={newPassword}
              type="password"
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <Button onClick={handleChangePassword}>Change Password</Button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
