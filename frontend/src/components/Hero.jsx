import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Hero.css";

const Spark = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 1c.8 6 3.800 9.200 11 11-7.200 1.800-10.200 5-11 11-.8-6-3.800-9.200-11-11 7.200-1.800 10.200-5 11-11z" />
  </svg>
);

const Ico = ({ children, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);

const Check = () => (
  <span className="chk"><Ico size={12}><path d="m5 12 5 5 9-10" /></Ico></span>
);

const MSGS = ["Testing workflow in progress\u2026", "Analyzing requirements\u2026", "Generating test cases\u2026", "Detecting risks\u2026", "Calculating coverage\u2026"];

export default function Hero({ onStart, onDemo }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [authUser, setAuthUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("spec2test-auth-user") || "null");
    } catch {
      return null;
    }
  });

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(
    () => Boolean(location.state?.requireLogin) && !authUser
  );
  const [authMode, setAuthMode] = useState("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authConfirmPassword, setAuthConfirmPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError("");

    const email = authEmail.trim().toLowerCase();

    let users = [];
    try {
      users = JSON.parse(localStorage.getItem("spec2test-users") || "[]");
    } catch {
      users = [];
    }

    if (authMode === "signup") {
      if (authPassword !== authConfirmPassword) {
        setAuthError("Passwords do not match.");
        return;
      }

      if (users.some((user) => user.email === email)) {
        setAuthError("An account with this email already exists.");
        return;
      }

      const newUser = {
        name: authName.trim(),
        email,
        password: authPassword
      };

      users.push(newUser);
      localStorage.setItem("spec2test-users", JSON.stringify(users));

      const loggedInUser = { name: newUser.name, email: newUser.email };
      localStorage.setItem("spec2test-auth-user", JSON.stringify(loggedInUser));
      localStorage.setItem("spec2test-auth-token", "demo-token");

      setAuthUser(loggedInUser);
      setAuthModalOpen(false);
      setUserMenuOpen(false);
      window.dispatchEvent(new Event("spec2test-auth-updated"));
      if (location.state?.from) navigate(location.state.from, { replace: true });
      return;
    }

    const matchedUser = users.find(
      (user) => user.email === email && user.password === authPassword
    );

    if (!matchedUser) {
      setAuthError("Invalid email or password.");
      return;
    }

    const loggedInUser = { name: matchedUser.name, email: matchedUser.email };
    localStorage.setItem("spec2test-auth-user", JSON.stringify(loggedInUser));
    localStorage.setItem("spec2test-auth-token", "demo-token");

    setAuthUser(loggedInUser);
    setAuthModalOpen(false);
    setUserMenuOpen(false);
    window.dispatchEvent(new Event("spec2test-auth-updated"));
    if (location.state?.from) navigate(location.state.from, { replace: true });
  };
  useEffect(() => {
    if (!authModalOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") setAuthModalOpen(false);
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [authModalOpen]);
  const [msg, setMsg] = useState(0);
  const [z, setZ] = useState(1);

  const handleLogout = () => {
    localStorage.removeItem("spec2test-auth-user");
    localStorage.removeItem("spec2test-auth-token");
    setAuthUser(null);
    setUserMenuOpen(false);
    window.dispatchEvent(new Event("spec2test-auth-updated"));
    navigate("/");
  };
  useEffect(() => {
    const fit = () => setZ(Math.max(0.6, Math.min(1, (window.innerHeight - 190) / 660)));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  useEffect(() => {
    const t = setInterval(() => setMsg((n) => (n + 1) % MSGS.length), 2200);
    return () => clearInterval(t);
  }, []);
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    e.currentTarget.style.setProperty("--my", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  };
  return (
    <section className="hero" style={{ "--z": z }} onMouseMove={onMove}>
      <header className="nav">
        <Link className="brand" to="/"><Spark size={34} /> Spec2Test AI</Link>

        <div className="nav-right">
          {!authUser ? (
            <>
              <button type="button" className="auth-btn login-btn" onClick={() => { setAuthMode("login"); setAuthModalOpen(true); }}>Login</button>
              <button type="button" className="auth-btn signup-btn" onClick={() => { setAuthMode("signup"); setAuthModalOpen(true); }}>Sign Up</button>
            </>
          ) : (
            <div className="user-area">
              <button
                className="user-button"
                onClick={() => setUserMenuOpen((open) => !open)}
                aria-expanded={userMenuOpen}
              >
                <span className="user-initial">
                  {(authUser.name || "U").trim().charAt(0).toUpperCase()}
                </span>
                <span className="user-name">
                  {(authUser.name || "User").split(" ")[0]}
                </span>
                <Ico size={14}><path d="m6 9 6 6 6-6" /></Ico>
              </button>

              {userMenuOpen && (
                <div className="user-menu">
                  <div className="user-menu-heading">
                    <strong>{authUser.name || "User"}</strong>
                    <small>{authUser.email || ""}</small>
                  </div>
                  <Link to="/dashboard" onClick={() => setUserMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="hero-grid">
        {/* LEFT */}
        <div className="copy">
          <span className="badge"><Spark size={18} /> AI-Powered Testing Platform <small>{"\u203A"}</small></span>
          <h1>
            Testing, made
            <span className="accent">intelligent.<Spark size={34} /></span>
            <svg className="swoosh" viewBox="0 0 480 20" preserveAspectRatio="none">
              <path d="M2 14C120 2 360 2 478 14" fill="none" stroke="url(#g)" strokeWidth="2.500" strokeLinecap="round" />
              <defs><linearGradient id="g"><stop offset="0" stopColor="#c4a4ff" /><stop offset="1" stopColor="#a78bfa" stopOpacity=".2" /></linearGradient></defs>
            </svg>
          </h1>
          <p>From requirements to reliable test cases. Let AI analyze, generate and uncover risks throughout your testing workflow.</p>

          <div className="cta">
            <button className="btn-primary" onClick={onStart}>Start Testing
              <Ico size={20}><path d="M5 12h14m-6-6 6 6-6 6" /></Ico>
            </button>
            <button className="btn-ghost" onClick={onDemo}>
              <span className="play"><Ico size={18}><path d="m8 5 11 7-11 7z" /></Ico></span> Watch Demo
            </button>
          </div>

          <ul className="stats">
            <li><Ico size={28}><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></Ico><b>03</b><span>AI Agents</span></li>
            <li><Ico size={28}><path d="m12 3 9 5-9 5-9-5zM3 13l9 5 9-5M3 17.500l9 5 9-5" /></Ico><b>01</b><span>Unified Workflow</span></li>
            <li><Ico size={28}><path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z" /></Ico><span>Endless<br />Possibilities</span></li>
          </ul>
        </div>

        {/* RIGHT */}
        <div className="stage" aria-hidden="true">
          <div className="orbit o1"><i /></div><div className="orbit o2"><i /></div><div className="orbit o3"><i /></div>
          {[1, 2, 3, 4, 5, 6, 7].map((n) => <b key={n} className={`mote m${n}`} />)}
          <div className="platform"><span className="ripple" /><span className="ripple r2" /><div className="glow" /></div>
          <div className="ai-core">
            <span className="ai-beam" />
            <span className="ai-ring" /><span className="ai-ring b" />
            <div className="ai-orbit">
              <span className="otile t1"><Ico size={16}><path d="M6 3h9l4 4v14H6zM9 12h7M9 16h7" /></Ico></span>
              <span className="otile t2"><Ico size={16}><path d="m8 8-4 4 4 4M16 8l4 4-4 4" /></Ico></span>
              <span className="otile t3"><Ico size={16}><path d="m5 12 5 5 9-10" /></Ico></span>
              <span className="otile t4"><Ico size={16}><path d="M12 3 4 6v6c0 5 3.500 8 8 9 4.500-1 8-4 8-9V6z" /></Ico></span>
            </div>
            <div className="ai-chip"><div className="ai-face"><b>AI</b></div></div>
          </div>
          <span className="cube c1" /><span className="cube c2" /><span className="cube c3" /><span className="cube c4" /><span className="cube c5" />

          <div className="glass card req">
            <div className="card-head"><span className="tile"><Ico size={20}><path d="M6 3h9l4 4v14H6zM9 12h7M9 16h7M9 8h3" /></Ico></span><b>Requirements</b></div>
            <i className="line w80" /><i className="line w55" /><i className="scan" />
          </div>

          <div className="glass card suite">
            <b className="label">Test Suite</b>
            {[70, 55, 62].map((w, i) => (
              <div className="row" key={i}><Check /><i className="line" style={{ width: `${w}%` }} /></div>
            ))}
            <span className="big-check"><Ico size={34}><path d="m5 12 5 5 9-10" /></Ico></span>
          </div>

          <div className="glass card cases">
            <div className="card-head"><span className="tile code">{"</>"}</span><b>Test Cases</b></div>
            <i className="line w60" />
            <span className="passed"><Ico size={14}><path d="m5 12 5 5 9-10" /></Ico> Passed</span>
          </div>

          <div className="glass card risk">
            <div className="card-head"><Ico size={22}><path d="M5 20V10M12 20V4M19 20v-7" /></Ico><b>Risk Analysis</b></div>
            <svg viewBox="0 0 200 50" className="wave"><path d="M0 30C20 5 35 5 55 28s40 25 60 0 35-25 55-2 20 8 30 4" fill="none" stroke="#8b5cf6" strokeWidth="2.500" /></svg>
          </div>

          <div className="glass card cov">
            <div className="card-head"><Ico size={20}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Ico><b>Coverage</b></div>
            <div className="cov-body">
              <div className="donut"><span>98%</span></div>
              <svg viewBox="0 0 60 40" width="64"><path d="M4 34 24 18l10 8 22-18M44 8h12v12" fill="none" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="status"><span className="dot" />
        <Ico size={18}><path d="M3 12h3l2-6 4 12 3-9 2 3h4" /></Ico>
        <span key={msg} className="msg">{MSGS[msg]}</span><em><u /><u /><u /></em>
      </div>
    
      {authModalOpen && (
        <div className="auth-overlay" onClick={() => setAuthModalOpen(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="auth-close" onClick={() => setAuthModalOpen(false)}>×</button>

            <div className="auth-modal-logo">
              <Spark size={30} />
            </div>

            <h2>{authMode === "login" ? "Welcome back!" : "Create your account"}</h2>

            <p className="auth-modal-subtitle">
              {authMode === "login"
                ? "Sign in to continue to Spec2Test AI"
                : "Join Spec2Test AI and start testing smarter"}
            </p>

            <form onSubmit={handleAuthSubmit}>
              {authMode === "signup" && (
                <div className="auth-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="auth-field">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  required
                />
              </div>

              <div className="auth-field">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>

              {authMode === "signup" && (
                <div className="auth-field">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Confirm your password"
                    value={authConfirmPassword}
                    onChange={(e) => setAuthConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              )}

              {authError && (
                <p className="auth-error">{authError}</p>
              )}

              {authMode === "login" && (
                <button type="button" className="forgot-password">Forgot password?</button>
              )}

              <button type="submit" className="auth-submit">
                {authMode === "login" ? "Login" : "Create Account"}
              </button>
            </form>

            <p className="auth-switch">
              {authMode === "login" ? "Don't have an account? " : "Already have an account? "}
              <button type="button" onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}>
                {authMode === "login" ? "Sign Up" : "Login"}
              </button>
            </p>
          </div>
        </div>
      )}
</section>
  );
}




