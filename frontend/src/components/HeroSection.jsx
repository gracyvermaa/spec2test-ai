import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, FileText, ListChecks, ShieldAlert, Play, FolderOpen } from "lucide-react";

const chips = [
  { Icon: FileText, cls: "c1" },
  { Icon: ListChecks, cls: "c2" },
  { Icon: ShieldAlert, cls: "c3" },
  { Icon: Play, cls: "c4" },
];

function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="dash-hero">
      <div>
        <span className="dash-badge">
          <Sparkles size={15} /> AI-POWERED TESTING ASSISTANT
        </span>

        <h2 className="dash-title">
          Turn Your Requirements into <em>Reliable</em> Test Cases
        </h2>

        <p className="dash-sub">
          Analyze, generate, and execute test cases with the power of AI.
        </p>

        <div className="dash-cta">
          <button className="dash-btn solid" onClick={() => navigate("/new-project")}>
            <Sparkles size={18} /> Start New Project <ArrowRight size={18} />
          </button>
          <button className="dash-btn glass" onClick={() => navigate("/projects")}>
            <FolderOpen size={18} /> View Projects
          </button>
        </div>
      </div>

      <div className="dash-visual" aria-hidden="true">
        <div className="dash-ring b" />
        <div className="dash-ring">
          {chips.map(({ Icon, cls }) => (
            <span key={cls} className={`dash-chip ${cls}`}>
              <Icon size={20} />
            </span>
          ))}
        </div>
        <div className="dash-core">
          <Sparkles size={44} />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
