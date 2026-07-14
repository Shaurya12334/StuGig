import React from 'react';

// This page is opened as a popup and looks like real Google account chooser.
// It uses window.opener.postMessage to send credentials back to the parent window.

const MOCK_ACCOUNTS = [
  {
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    initials: 'J',
    color: '#1a73e8',
  },
  {
    name: 'Jane Student',
    email: 'jane.student@gmail.com',
    initials: 'JA',
    color: '#ea4335',
  },
];

const GoogleMockAuth = () => {
  const handleSelect = (account) => {
    if (window.opener) {
      window.opener.postMessage(
        { type: 'GOOGLE_AUTH_SUCCESS', payload: account },
        window.location.origin
      );
    }
    window.close();
  };

  return (
    <html>
      <head>
        <title>Sign in - Google Accounts</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Google Sans', Roboto, Arial, sans-serif; background: #fff; }
        `}</style>
      </head>
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
          {/* Google Header */}
          <div style={{ padding: '20px 24px 0' }}>
            <svg height="24" viewBox="0 0 74 24" width="74">
              <path d="M19.72 12.24c0-.63-.06-1.25-.16-1.84H10v3.49h5.46c-.24 1.28-1.34 3.22-3.85 3.22-2.32 0-4.27-1.92-4.27-4.24 0-2.32 1.95-4.24 4.27-4.24 1.32 0 2.2.56 2.71 1.05l1.85-1.8C14.99 6.63 13.11 6 10.34 6 6.32 6 3 9.32 3 13.34c0 4.02 3.32 7.34 7.34 7.34 4.24 0 7.05-2.98 7.05-7.17 0-.48-.05-.84-.11-1.16h-7.06z" fill="#4285F4"/>
              <path d="M34.6 17.28V7.58h-2.33l-4.38 9.3V7.58h-2.33v12.74h2.33l4.38-9.3v9.3h2.33z" fill="#4285F4"/>
              <text x="28" y="18" fontSize="13" fill="#4285F4" fontFamily="arial">Sign in</text>
            </svg>
          </div>

          {/* Main Card */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{
              border: '1px solid #dadce0',
              borderRadius: '8px',
              padding: '48px 40px 36px',
              width: '360px',
              maxWidth: '100%',
            }}>
              {/* Google Logo */}
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>

              <h1 style={{ fontSize: '24px', fontWeight: '400', color: '#202124', textAlign: 'center', marginBottom: '8px' }}>Sign in</h1>
              <p style={{ fontSize: '16px', color: '#202124', textAlign: 'center', marginBottom: '24px' }}>to continue to StuGig</p>

              {/* Account List */}
              <div style={{ marginBottom: '20px' }}>
                {MOCK_ACCOUNTS.map((account) => (
                  <button
                    key={account.email}
                    onClick={() => handleSelect(account)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '16px',
                      width: '100%', padding: '12px 16px',
                      border: '1px solid #dadce0', borderRadius: '4px',
                      background: '#fff', cursor: 'pointer', marginBottom: '8px',
                      transition: 'background 0.15s',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: account.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: '500', fontSize: '16px',
                      flexShrink: 0,
                    }}>
                      {account.initials}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#202124' }}>{account.name}</div>
                      <div style={{ fontSize: '12px', color: '#5f6368' }}>{account.email}</div>
                    </div>
                    <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M10 6L16 12L10 18" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                ))}

                {/* Use another account */}
                <button
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    width: '100%', padding: '12px 16px',
                    border: '1px solid #dadce0', borderRadius: '4px',
                    background: '#fff', cursor: 'pointer',
                    transition: 'background 0.15s',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                  onClick={() => {
                    const name = prompt('Enter your Google display name:');
                    const email = prompt('Enter your Gmail address:');
                    if (name && email) handleSelect({ name, email, initials: name[0].toUpperCase(), color: '#1a73e8' });
                  }}
                >
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: '#f1f3f4',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#5f6368">
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                    </svg>
                  </div>
                  <div style={{ fontSize: '14px', color: '#202124' }}>Use another account</div>
                </button>
              </div>

              {/* Footer links */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#5f6368' }}>
                <span>English (United States) ▼</span>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <a href="#" style={{ color: '#5f6368', textDecoration: 'none' }}>Help</a>
                  <a href="#" style={{ color: '#5f6368', textDecoration: 'none' }}>Privacy</a>
                  <a href="#" style={{ color: '#5f6368', textDecoration: 'none' }}>Terms</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
};

export default GoogleMockAuth;
