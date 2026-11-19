
import {
  FileText,
  BrainCircuit,
  ShieldCheck,
  Check,
  ListChecks,
  Activity,
} from "lucide-react";

import "./WorkflowAnimation.css";

function WorkflowAnimation() {
  return (
    <div className="animation-stage">

      {/* Ambient glow */}
      <div className="stage-glow" />

      {/* Orbit paths */}
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="orbit orbit-three" />

      {/* SVG connection paths and moving particles */}
      <svg className="flow-svg" viewBox="0 0 600 500">

        <path
          className="flow-path"
          id="path-input"
          d="M120 125 C210 125 220 220 290 250"
        />

        <path
          className="flow-path"
          id="path-tests"
          d="M310 250 C390 250 410 125 480 125"
        />

        <path
          className="flow-path"
          id="path-risks"
          d="M310 250 C390 250 410 375 480 375"
        />

        <circle r="4" className="flow-particle">
          <animateMotion dur="3s" repeatCount="indefinite">
            <mpath href="#path-input" />
          </animateMotion>
        </circle>

        <circle r="4" className="flow-particle particle-second">
          <animateMotion dur="3.5s" repeatCount="indefinite">
            <mpath href="#path-tests" />
          </animateMotion>
        </circle>

        <circle r="4" className="flow-particle particle-third">
          <animateMotion dur="4s" repeatCount="indefinite">
            <mpath href="#path-risks" />
          </animateMotion>
        </circle>

      </svg>

      {/* Input requirement */}
      <div className="anim-card input-card">
        <div className="anim-card-header">
          <div className="anim-icon purple-icon">
            <FileText size={17} />
          </div>
          <span className="anim-label">REQUIREMENT</span>
        </div>

        <h4>User Authentication</h4>
        <p>Login & access control</p>

        <div className="skeleton-line long-line" />
        <div className="skeleton-line medium-line" />
        <div className="skeleton-line short-line" />

        <span className="mini-check">
          <Check size={12} />
        </span>
      </div>

      {/* Central AI engine */}
      <div className="engine-wrapper">

        <div className="engine-pulse" />
        <div className="engine-orbit-ring" />

        <div className="engine-core">
          <BrainCircuit size={36} />
        </div>

        <div className="engine-bottom">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="engine-label">
          <span className="engine-live-dot" />
          AI ENGINE
        </div>

      </div>

      {/* Test case output */}
      <div className="anim-card tests-card">
        <div className="anim-card-header">
          <div className="anim-icon blue-icon">
            <ListChecks size={17} />
          </div>
          <span className="anim-label">TEST GENERATION</span>
        </div>

        <h4>Test Scenarios</h4>

        <div className="animated-test-row">
          <span className="test-checkbox"><Check size={11} /></span>
          <span>Valid credentials</span>
        </div>

        <div className="animated-test-row">
          <span className="test-checkbox"><Check size={11} /></span>
          <span>Invalid password</span>
        </div>

        <div className="animated-test-row">
          <span className="test-checkbox"><Check size={11} /></span>
          <span>Edge cases</span>
        </div>

        <div className="generated-badge">
          <span className="generated-dot" />
          Generated
        </div>
      </div>

      {/* Risk assessment */}
      <div className="anim-card risk-card">
        <div className="anim-card-header">
          <div className="anim-icon pink-icon">
            <ShieldCheck size={17} />
          </div>
          <span className="anim-label">RISK ANALYSIS</span>
        </div>

        <h4>Risk Assessment</h4>

        <div className="risk-chart">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="risk-card-footer">
          <span>Risk level</span>
          <strong>Low</strong>
        </div>
      </div>

      {/* Coverage floating card */}
      <div className="coverage-card">
        <div className="coverage-header">
          <Activity size={15} />
          <span>Test Coverage</span>
        </div>

        <div className="coverage-content">
          <div className="coverage-ring">
            <div className="coverage-ring-inner">
              <strong>98%</strong>
            </div>
          </div>

          <div className="coverage-info">
            <strong>Excellent</strong>
            <span>Requirements mapped</span>
            <span className="coverage-trend">↗ +12.4%</span>
          </div>
        </div>
      </div>

      {/* Completion toast */}
      <div className="workflow-toast">
        <div className="toast-icon">
          <Check size={15} />
        </div>

        <div className="toast-text">
          <strong>Workflow completed</strong>
          <span>All agents finished successfully</span>
        </div>

        <div className="toast-dots">
          <span />
          <span />
          <span />
        </div>
      </div>

    </div>
  );
}

export default WorkflowAnimation;
