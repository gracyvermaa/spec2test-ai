import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

const MSGS = ["Testing workflow in progress…", "Analyzing requirements…", "Generating test cases…", "Detecting risks…", "Calculating coverage…"];

export default function Hero({ onStart, onDemo }) {
  const [msg, setMsg] = useState(0);
  const [z, setZ] = useState(1);
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
        <nav className="nav-links">
          <Link className="active" to="/dashboard">
            <Ico size={18}><path d="m3 11 9-8 9 8M5 10v10h5v-6h4v6h5V10" /></Ico> Dashboard
          </Link>
          <Link to="/projects">Projects</Link>
          <Link to="/reports">Analytics</Link>
          <a href="#about">About</a>
        </nav>
        <div className="nav-right">
          <button className="bell" aria-label="Notifications">
            <Ico><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 20a2 2 0 0 0 4 0" /></Ico>
            <i />
          </button>
          <button className="avatar">G <Ico size={14}><path d="m6 9 6 6 6-6" /></Ico></button>
        </div>
      </header>

      <div className="hero-grid">
        {/* LEFT */}
        <div className="copy">
          <span className="badge"><Spark size={18} /> AI-Powered Testing Platform <small>›</small></span>
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
    </section>
  );
}
