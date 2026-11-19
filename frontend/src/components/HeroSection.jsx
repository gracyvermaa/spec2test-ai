
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative flex min-h-[305px] overflow-hidden rounded-[24px] border border-purple-200/70 bg-gradient-to-r from-[#E7D9FF] via-[#F5DFFF] to-[#FCE5F7] shadow-sm">

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,rgba(255,255,255,0.8),transparent_35%)]" />

      <div className="relative z-10 flex w-full flex-col justify-center p-9 md:w-[58%]">

        <div className="mb-5 flex w-fit items-center gap-2 rounded-full border border-white/70 bg-white/60 px-4 py-2 text-xs font-semibold text-[#49367C] shadow-sm">
          AI-Powered Testing Assistant
          <Sparkles size={15} className="text-purple-500" />
        </div>

        <h1 className="max-w-[620px] text-3xl font-bold leading-tight tracking-tight text-[#17143E] md:text-[42px]">
          Turn Your Requirements into{" "}
          <span className="font-serif italic text-[#7950D7]">
            Reliable
          </span>{" "}
          Test Cases
        </h1>

        <p className="mt-4 text-base text-[#35265E] md:text-lg">
          Analyze, generate, and execute test cases with the power of AI.
        </p>

        <button
          onClick={() => navigate("/new-project")}
          className="mt-6 flex w-fit items-center gap-3 rounded-full bg-gradient-to-r from-[#7950D7] to-[#9863D9] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-300/60 transition hover:-translate-y-1 hover:shadow-xl"
        >
          <Sparkles size={17} />
          Start New Project
          <ArrowRight size={18} />
        </button>

      </div>

      <div className="absolute bottom-0 right-0 hidden h-full w-[43%] items-center justify-center md:flex">
        <div className="text-center text-purple-400">
          <Sparkles size={65} strokeWidth={1} />
          <p className="mt-2 text-sm font-medium">
            Magical AI Testing
          </p>
        </div>
      </div>

    </section>
  );
}

export default HeroSection;
