import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error tracking service (Sentry) if available
    if (window.Sentry) {
      window.Sentry.captureException(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
          backgroundColor: '#f5f5f5',
          padding: '20px',
        }}>
          <div style={{
            maxWidth: '500px',
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}>
            <h1 style={{ color: '#d32f2f', marginBottom: '10px' }}>⚠️ Something went wrong</h1>
            <p style={{ color: '#666', marginBottom: '20px', fontSize: '16px' }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button 
              onClick={() => window.location.href = '/'}
              style={{
                padding: '10px 24px',
                fontSize: '16px',
                backgroundColor: '#6c63ff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
              onMouseover={(e) => e.target.style.backgroundColor = '#563fc7'}
              onMouseout={(e) => e.target.style.backgroundColor = '#6c63ff'}
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
