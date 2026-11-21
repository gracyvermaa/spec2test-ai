import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Play,
  Sparkles,
  Zap,
  Layers,
  Infinity as InfinityIcon,
} from "lucide-react";

import WorkflowAnimation from "../components/WorkflowAnimation";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <main className="home-page">
      <nav className="home-nav">
        <div className="home-brand">
          <Sparkles size={30} />
          <span>Spec2Test AI</span>
        </div>

        <div className="home-nav-links">
          <button className="nav-active" onClick={() => navigate("/")}>
            Home
          </button>
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={() => navigate("/dashboard")}>Projects</button>
          <button onClick={() => navigate("/dashboard")}>Analytics</button>
        </div>

        <button
          className="home-profile"
          onClick={() => navigate("/dashboard")}
        >
          G
        </button>
      </nav>

      <section className="home-hero">
        <div className="home-hero-copy">
          <div className="home-eyebrow">
            <Sparkles size={15} />
            AI-POWERED TESTING PLATFORM
          </div>

          <h1>
            Testing, made
            <br />
            <span>intelligent.</span>
          </h1>

          <p className="home-description">
            From requirements to reliable test cases.
            Let AI analyze, generate and uncover risks
            throughout your testing workflow.
          </p>

          <div className="home-buttons">
            <button
              className="home-start-btn"
              onClick={() => navigate("/dashboard")}
            >
              Start Testing
              <ArrowRight size={19} />
            </button>

            <button
              className="home-demo-btn"
              onClick={() => navigate("/dashboard")}
            >
              <span className="demo-play">
                <Play size={17} />
              </span>
              Watch Demo
            </button>
          </div>

          <div className="home-stats">
            <div className="home-stat">
              <Zap size={22} />
              <div>
                <strong>03</strong>
                <span>AI Agents</span>
              </div>
            </div>

            <div className="home-stat">
              <Layers size={22} />
              <div>
                <strong>01</strong>
                <span>Unified Workflow</span>
              </div>
            </div>

            <div className="home-stat">
              <InfinityIcon size={24} />
              <div>
                <strong>∞</strong>
                <span>Test Possibilities</span>
              </div>
            </div>
          </div>
        </div>

        <div className="home-hero-visual">
          <WorkflowAnimation />
        </div>
      </section>
    </main>
  );
}

export default Home;
