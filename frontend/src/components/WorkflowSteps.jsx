
import {
  FileText,
  ListChecks,
  ShieldCheck,
  Play,
  Image,
  ArrowRight,
  Sparkles
} from "lucide-react";

const steps = [
  {
    title: "Analyze Requirements",
    description: "Let AI understand your requirements",
    icon: FileText,
    color: "purple",
    number: 1
  },
  {
    title: "Generate Test Cases",
    description: "Get comprehensive test cases",
    icon: ListChecks,
    color: "violet",
    number: 2
  },
  {
    title: "Assess Risks",
    description: "Identify potential risks & coverage gaps",
    icon: ShieldCheck,
    color: "pink",
    number: 3
  },
  {
    title: "Execute Tests",
    description: "Run automated tests",
    icon: Play,
    color: "teal",
    number: 4
  },
  {
    title: "View Reports",
    description: "Get detailed insights",
    icon: Image,
    color: "orange",
    number: 5
  }
];

const colorStyles = {
  purple: "border-purple-200 bg-purple-50 text-purple-600",
  violet: "border-violet-200 bg-violet-50 text-violet-600",
  pink: "border-pink-200 bg-pink-50 text-pink-600",
  teal: "border-teal-200 bg-teal-50 text-teal-600",
  orange: "border-orange-200 bg-orange-50 text-orange-600"
};

function WorkflowSteps() {
  return (
    <section className="rounded-2xl border border-purple-100 bg-white/80 p-6 shadow-sm">

      <div className="mb-7 flex items-center gap-3">
        <Sparkles className="text-purple-500" size={23} />
        <h2 className="text-xl font-bold text-[#211A4B]">
          Your Testing Workflow
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">

        {steps.map((step, index) => {
          const Icon = step.icon;

          return (
            <div key={step.number} className="relative">

              <div className={`relative flex min-h-[155px] flex-col items-center justify-center rounded-xl border p-4 text-center transition hover:-translate-y-1 hover:shadow-md ${colorStyles[step.color]}`}>

                <span className="absolute -top-3 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#9171E5] text-xs font-bold text-white shadow">
                  {step.number}
                </span>

                <Icon size={31} strokeWidth={2.2} />

                <h3 className="mt-3 text-sm font-bold text-[#211A4B]">
                  {step.title}
                </h3>

                <p className="mt-2 max-w-[160px] text-xs leading-relaxed text-[#62588A]">
                  {step.description}
                </p>

              </div>

              {index !== steps.length - 1 && (
                <ArrowRight
                  size={21}
                  className="absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 text-[#7950D7] xl:block"
                />
              )}

            </div>
          );
        })}

      </div>
    </section>
  );
}

export default WorkflowSteps;
