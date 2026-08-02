import React, { useEffect, useState } from 'react';
import { Activity, Users, Settings, Image as ImageIcon, Home, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import './Sidebar.css';

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard', roles: ['doctor', 'patient'] },
  { icon: Users, label: 'Patients', path: '/patients', roles: ['doctor'] },
  { icon: ImageIcon, label: 'Scans', path: '/analysis', roles: ['doctor', 'patient'] },
  { icon: Activity, label: 'Reports', path: '/reports', roles: ['doctor', 'patient'] },
  { icon: Settings, label: 'Settings', path: '/settings', roles: ['doctor', 'patient'] }
];

const getInitialProfile = () => {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('auth-token')) {
        const item = JSON.parse(localStorage.getItem(key));
        const user = item?.user || item?.currentSession?.user;
        if (user) {
          const role = user.user_metadata?.role || 'doctor';
          return {
            name: user.user_metadata?.full_name || 'User',
            role: role,
            displayRole: role === 'patient' ? 'Patient' : 'Dentist',
            avatar: user.user_metadata?.avatar || null
          };
        }
      }
    }
  } catch (e) {}
  return { name: 'User', role: null, displayRole: '' };
};

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(getInitialProfile);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const role = user.user_metadata?.role || 'doctor';
        setProfile({
          name: user.user_metadata?.full_name || 'User',
          role: role,
          displayRole: role === 'patient' ? 'Patient' : 'Dentist',
          avatar: user.user_metadata?.avatar || null
        });
      }
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/welcome');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <img src="./logo.png" alt="ProphyDent AI" className="logo-img" />
          <h2 className="logo-text">ProphyDent</h2>
        </div>
        <span className="ai-badge">AI</span>
      </div>
      <nav className="sidebar-nav">
        {navItems
          .filter(item => item.roles.includes(profile.role))
          .map((item, index) => {
            let label = item.label;
            if (profile.role === 'patient') {
              if (item.label === 'Scans') label = 'My Scans';
              if (item.label === 'Reports') label = 'My Reports';
            }
            
            return (
              <button 
                key={index} 
                className={`nav-item ${item.path && location.pathname.startsWith(item.path) ? 'active' : ''}`}
                onClick={() => item.action === 'logout' ? handleSignOut() : navigate(item.path)}
              >
                <item.icon size={20} />
                <span>{label}</span>
              </button>
            )
          })}
      </nav>
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar">
            {profile.avatar ? (
              <img src={profile.avatar} alt="Profile" className="avatar-img" />
            ) : (
              profile.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="user-info">
            <span className="user-name">{profile.name}</span>
            <span className="user-role">{profile.displayRole}</span>
          </div>
          <button className="sign-out-btn" onClick={handleSignOut} title="Sign Out">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
