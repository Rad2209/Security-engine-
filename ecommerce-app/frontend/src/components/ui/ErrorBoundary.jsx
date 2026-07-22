import { Component } from 'react';

/**
 * ErrorBoundary
 *
 * React error boundaries MUST be class components — hooks have no
 * equivalent lifecycle for catching render-time errors in children.
 * Without this, ANY uncaught exception thrown while rendering (e.g. a
 * response shape mismatch causing `.map is not a function`) unmounts the
 * entire React tree and leaves a blank white page with no diagnostic info
 * visible — which is what an unhandled render crash looks like without
 * this in place.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Logged to the console so the ACTUAL error and component stack are
    // visible for debugging, instead of just a blank page.
    console.error('Render error caught by ErrorBoundary:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto max-w-lg px-6 py-24 text-center">
          <p className="font-mono text-xs uppercase tracking-wider text-tick-red">
            Something went wrong
          </p>
          <h1 className="mt-2 font-display text-xl text-mist-100">
            This page hit an unexpected error
          </h1>
          <p className="mt-3 font-mono text-xs text-mist-100/50">{this.state.error.message}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-sm bg-brass-400 px-4 py-2 font-body text-sm font-medium text-ink-950"
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;