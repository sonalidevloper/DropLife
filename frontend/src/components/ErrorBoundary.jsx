import React from 'react';
import { Container, Alert, Button } from 'react-bootstrap';

/**
 * ErrorBoundary — catches unhandled React render errors so the entire
 * app does not go blank. In development it shows the error; in
 * production it shows a friendly fallback with a "Return to Home" button.
 *
 * Usage (already wired in index.js):
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <Container className="py-5" style={{ minHeight: '60vh' }}>
        <Alert variant="danger">
          <Alert.Heading>⚠️ Something went wrong</Alert.Heading>
          <p>
            The application ran into an unexpected error. You can try
            returning to the home page.
          </p>

          {/* Show stack trace only in development */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ marginTop: '16px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                Error details (development only)
              </summary>
              <pre
                style={{
                  marginTop: '12px',
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.8rem',
                  background: '#f8d7da',
                  padding: '12px',
                  borderRadius: '6px'
                }}
              >
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}

          <hr />
          <div className="d-flex justify-content-end">
            <Button onClick={this.handleReset} variant="danger">
              Return to Home
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }
}

export default ErrorBoundary;