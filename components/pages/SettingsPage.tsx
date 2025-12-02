'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateUserProfile, updateUserPassword } from '@/lib/actions/user.actions.sqlite';
import { getUserPreferences, updateUserPreferences } from '@/lib/actions/preferences.actions';
import { useCurrency } from '@/components/CurrencyProvider';

export default function SettingsPage({ user }: { user: any }) {
  const router = useRouter();
  const { refreshCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    address1: user.address1 || '',
    city: user.city || '',
    postalCode: user.postalCode || '',
    dateOfBirth: user.dateOfBirth || '',
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    currency: 'IDR',
    language: 'id',
    dateFormat: 'DD/MM/YYYY',
    notifications: true,
  });

  // Load preferences from database on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  async function loadPreferences() {
    const result = await getUserPreferences(user.$id);
    if (result.success && result.data) {
      setPreferences({
        currency: result.data.currency,
        language: result.data.language,
        dateFormat: result.data.date_format,
        notifications: result.data.notifications_enabled,
      });
    }
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const result = await updateUserProfile({
      userId: user.$id,
      ...profileData
    });

    if (result.success) {
      setMessage('✅ Profile updated successfully!');
      setTimeout(() => router.refresh(), 1500);
    } else {
      setMessage(`❌ ${result.error}`);
    }

    setLoading(false);
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('❌ New passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage('❌ Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    const result = await updateUserPassword({
      userId: user.$id,
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });

    if (result.success) {
      setMessage('✅ Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setMessage(`❌ ${result.error}`);
    }

    setLoading(false);
  }

  async function handlePreferencesSave() {
    setLoading(true);
    setMessage('');

    const result = await updateUserPreferences({
      userId: user.$id,
      currency: preferences.currency,
      language: preferences.language,
      dateFormat: preferences.dateFormat,
      notificationsEnabled: preferences.notifications,
    });

    if (result.success) {
      setMessage('✅ Preferences saved! Refreshing...');
      // Refresh currency in all components
      await refreshCurrency();
      // Also refresh the page to ensure all components update
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      setMessage(`❌ ${result.error}`);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-36 font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-16 text-gray-600">Manage your account settings and preferences</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <nav className="card space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                👤 Profile
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'preferences'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                ⚙️ Preferences
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'security'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                🔒 Security
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'about'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                ℹ️ About
              </button>
            </nav>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="card">
                <h2 className="text-24 font-bold text-gray-900 mb-6">Profile Information</h2>
                <form onSubmit={handleProfileSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                      <label className="form-label">First Name</label>
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group md:col-span-2">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group md:col-span-2">
                      <label className="form-label">Address</label>
                      <input
                        type="text"
                        value={profileData.address1}
                        onChange={(e) => setProfileData({ ...profileData, address1: e.target.value })}
                        className="form-input"
                        placeholder="Street address"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        value={profileData.city}
                        onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Postal Code</label>
                      <input
                        type="text"
                        value={profileData.postalCode}
                        onChange={(e) => setProfileData({ ...profileData, postalCode: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group md:col-span-2">
                      <label className="form-label">Date of Birth</label>
                      <input
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary mt-6"
                  >
                    {loading ? 'Saving...' : '💾 Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="card">
                <h2 className="text-24 font-bold text-gray-900 mb-6">Preferences</h2>
                <div className="space-y-6">
                  <div className="form-group">
                    <label className="form-label">Currency</label>
                    <select
                      value={preferences.currency}
                      onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                      className="form-select"
                    >
                      <option value="IDR">Indonesian Rupiah (Rp)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                      <option value="GBP">British Pound (£)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Language</label>
                    <select
                      value={preferences.language}
                      onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                      className="form-select"
                    >
                      <option value="id">Bahasa Indonesia</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date Format</label>
                    <select
                      value={preferences.dateFormat}
                      onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                      className="form-select"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="notifications"
                      checked={preferences.notifications}
                      onChange={(e) => setPreferences({ ...preferences, notifications: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label htmlFor="notifications" className="text-14 font-medium text-gray-700 cursor-pointer">
                      Enable email notifications for bills and goals
                    </label>
                  </div>
                </div>
                <button
                  onClick={handlePreferencesSave}
                  className="btn btn-primary mt-6"
                >
                  💾 Save Preferences
                </button>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="card">
                <h2 className="text-24 font-bold text-gray-900 mb-6">Change Password</h2>
                <form onSubmit={handlePasswordSubmit}>
                  <div className="space-y-6">
                    <div className="form-group">
                      <label className="form-label">Current Password</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">New Password</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="form-input"
                        required
                        minLength={8}
                      />
                      <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary mt-6"
                  >
                    {loading ? 'Updating...' : '🔒 Update Password'}
                  </button>
                </form>
              </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="card">
                <h2 className="text-24 font-bold text-gray-900 mb-6">About ManageNow</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-18 font-semibold text-gray-900 mb-2">Version</h3>
                    <p className="text-14 text-gray-600">1.0.0 (December 2025)</p>
                  </div>
                  <div>
                    <h3 className="text-18 font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-14 text-gray-600 leading-relaxed">
                      ManageNow is a comprehensive personal finance management application designed to help you track expenses, 
                      manage budgets, monitor bills, and achieve financial goals. Built with modern technologies for a seamless experience.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-18 font-semibold text-gray-900 mb-2">Features</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-14 text-gray-600">
                        <span className="text-green-600">✓</span> Transaction tracking (income & expenses)
                      </li>
                      <li className="flex items-center gap-2 text-14 text-gray-600">
                        <span className="text-green-600">✓</span> Envelope budgeting system
                      </li>
                      <li className="flex items-center gap-2 text-14 text-gray-600">
                        <span className="text-green-600">✓</span> Recurring bills management
                      </li>
                      <li className="flex items-center gap-2 text-14 text-gray-600">
                        <span className="text-green-600">✓</span> Financial goals tracking
                      </li>
                      <li className="flex items-center gap-2 text-14 text-gray-600">
                        <span className="text-green-600">✓</span> Analytics & reporting
                      </li>
                      <li className="flex items-center gap-2 text-14 text-gray-600">
                        <span className="text-green-600">✓</span> CSV export
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-18 font-semibold text-gray-900 mb-2">Technology Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="badge badge-info">Next.js 16</span>
                      <span className="badge badge-info">React 19</span>
                      <span className="badge badge-info">TypeScript</span>
                      <span className="badge badge-info">Tailwind CSS 4</span>
                      <span className="badge badge-info">SQLite</span>
                      <span className="badge badge-info">Chart.js</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-18 font-semibold text-gray-900 mb-2">Support</h3>
                    <p className="text-14 text-gray-600">
                      For support or feedback, please contact:{' '}
                      <a href="mailto:support@managenow.app" className="text-blue-600 hover:underline">
                        support@managenow.app
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
