import './App.css'

function App() {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="landing-logo">QUIZLY</div>

        <nav className="landing-nav">
          <a className="landing-nav-link">Features ▾</a>
          <a className="landing-nav-link">Categories</a>
          <a className="landing-nav-link">Leaderboard ▾</a>
          <a className="landing-nav-link">About ▾</a>
        </nav>

        <div className="landing-header-actions">
          <button className="landing-login-button">Log in</button>
          <button className="landing-primary-button">Start quiz for free</button>
        </div>
      </header>

      <main className="landing-hero">
        <h1 className="landing-headline">
        Make every <br />
       question count
        </h1>

        <p className="landing-subheadline">
          Don't let your brain fall asleep from boredom. Challenge yourself daily with engaging quizzes and track your progress in minutes with Quizly.
        </p>

        <div className="landing-cta-buttons">
          <button className="landing-secondary-button">
            <svg className="landing-play-icon" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
            </svg>
            Demo video
          </button>
          <button className="landing-primary-button">Start quiz for free</button>
        </div>
      </main>
    </div>
  )
}

export default App
