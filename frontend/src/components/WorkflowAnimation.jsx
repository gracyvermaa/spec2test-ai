import {
  BrainCircuit,
  FileText,
  ListChecks,
  ShieldCheck,
  Activity,
  Sparkles,
  Check,
} from "lucide-react";

import "./WorkflowAnimation.css";

function WorkflowAnimation() {
  return (
    <div className="animation-stage">

      {/* Background atmosphere */}
      <div className="space-glow glow-purple" />
      <div className="space-glow glow-pink" />
      <div className="space-glow glow-blue" />

      {/* Moving connection network */}
      <svg className="connection-network" viewBox="0 0 700 650">
        <defs>
          <linearGradient id="connectionGradient">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="1" />
            <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path className="network-path path-one" d="M100 190 Q350 60 600 190" />
        <path className="network-path path-two" d="M80 460 Q350 590 620 440" />
        <path className="network-path path-three" d="M100 180 Q100 330 350 325 Q600 320 600 180" />
        <path className="network-path path-four" d="M80 450 Q350 300 620 460" />

        <path className="network-particle-line" d="M100 190 Q350 60 600 190" />
        <path className="network-particle-line" d="M80 460 Q350 590 620 440" />
        <path className="network-particle-line" d="M100 180 Q100 330 350 325 Q600 320 600 180" />
      </svg>

      {/* Orbital rings */}
      <div className="brain-orbit orbit-a">
        <span className="orbit-dot dot-a" />
        <span className="orbit-dot dot-b" />
      </div>

      <div className="brain-orbit orbit-b">
        <span className="orbit-dot dot-c" />
      </div>

      <div className="brain-orbit orbit-c">
        <span className="orbit-dot dot-d" />
        <span className="orbit-dot dot-e" />
      </div>

      {/* Central brain globe */}
      <div className="brain-globe">
        <div className="globe-backlight" />
        <div className="globe-shell">
          <div className="globe-highlight" />
          <div className="globe-grid grid-horizontal" />
          <div className="globe-grid grid-vertical" />
          <div className="globe-grid grid-diagonal" />

          <div className="brain-icon-wrap">
            <BrainCircuit className="brain-icon" />
          </div>

          <div className="globe-scan-line" />
          <div className="globe-shine" />
        </div>

        <div className="globe-base-glow" />
      </div>

      {/* Orbiting requirement card */}
      <div className="card-orbit orbit-card-one">
        <div className="orbit-card">
          <div className="mini-card-heading">
            <div className="mini-icon icon-file">
              <FileText size={17} />
            </div>
            <div>
              <strong>Requirements</strong>
              <span>Document analysis</span>
            </div>
          </div>

          <div className="mini-lines">
            <span />
            <span />
            <span className="short-line" />
          </div>

          <div className="mini-status">
            <Check size={12} />
            Requirements processed
          </div>
        </div>
      </div>

      {/* Orbiting test case card */}
      <div className="card-orbit orbit-card-two">
        <div className="orbit-card">
          <div className="mini-card-heading">
            <div className="mini-icon icon-tests">
              <ListChecks size={17} />
            </div>
            <div>
              <strong>Test Generation</strong>
              <span>AI generated scenarios</span>
            </div>
          </div>

          <div className="test-mini-row">
            <span className="test-check">?</span>
            Login validation
          </div>

          <div className="test-mini-row">
            <span className="test-check">?</span>
            Error handling
          </div>

          <div className="test-mini-row">
            <span className="test-check">?</span>
            Boundary testing
          </div>

          <div className="generated-label">
            <Sparkles size={12} />
            24 tests generated
          </div>
        </div>
      </div>

      {/* Orbiting risk card */}
      <div className="card-orbit orbit-card-three">
        <div className="orbit-card">
          <div className="mini-card-heading">
            <div className="mini-icon icon-risk">
              <ShieldCheck size={17} />
            </div>
            <div>
              <strong>Risk Analysis</strong>
              <span>Intelligent detection</span>
            </div>
          </div>

          <div className="risk-meter">
            <div className="risk-meter-track">
              <div className="risk-meter-fill" />
            </div>
          </div>

          <div className="risk-bottom">
            <strong>Low Risk</strong>
            <span>94% confidence</span>
          </div>
        </div>
      </div>

      {/* Coverage widget */}
      <div className="coverage-widget">
        <div className="coverage-heading">
          <Activity size={15} />
          Test Coverage
        </div>

        <div className="coverage-value">
          <strong>98%</strong>
          <span>+12.4% ?</span>
        </div>

        <div className="coverage-bars">
          {[35, 48, 42, 64, 57, 75, 68, 91, 82, 100, 90, 100].map(
            (height, index) => (
              <span
                key={index}
                style={{ height: `${height}%` }}
              />
            )
          )}
        </div>
      </div>

      {/* Completion toast */}
      <div className="completion-toast">
        <div className="completion-icon">
          <Check size={15} />
        </div>

        <div>
          <strong>Analysis complete</strong>
          <span>All systems operational</span>
        </div>

        <div className="live-indicator" />
      </div>

    </div>
  );
}

export default WorkflowAnimation;
