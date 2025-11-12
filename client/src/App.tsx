import './App.css'

function App() {
  return (
    <div className="landing-container">
      <header className="landing-header-shell">
        <div className="landing-header">
          <div className="landing-logo">HOMERUN</div>

          <nav className="landing-nav">
            <a className="landing-nav-link has-dropdown" href="#">
              Product
            </a>
            <a className="landing-nav-link" href="#">
              Pricing
            </a>
            <a className="landing-nav-link has-dropdown" href="#">
              Use cases
            </a>
            <a className="landing-nav-link has-dropdown" href="#">
              Learn
            </a>
          </nav>

          <div className="landing-header-actions">
            <button className="landing-login-button">Log in</button>
            <button className="landing-primary-button">Start for free</button>
          </div>
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
            Log in
          </button>
          <button className="landing-primary-button">Sign up</button>
        </div>
      </main>
    </div>
  )
}

export default App
