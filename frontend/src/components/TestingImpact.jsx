
import {
  Sparkles,
  ChartNoAxesColumnIncreasing
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  ResponsiveContainer,
  Tooltip,
  Area,
  AreaChart
} from "recharts";

const chartData = [
  { month: "Jan", coverage: 35 },
  { month: "Feb", coverage: 48 },
  { month: "Mar", coverage: 44 },
  { month: "Apr", coverage: 62 },
  { month: "May", coverage: 55 },
  { month: "Jun", coverage: 78 }
];

function TestingImpact() {
  return (
    <section className="overflow-hidden rounded-2xl border border-purple-200 bg-gradient-to-br from-[#F0E7FF] to-[#FCEAFF] shadow-sm">

      <div className="flex items-center justify-between border-b border-purple-200/60 px-5 py-4">
        <h2 className="flex items-center gap-3 text-lg font-bold text-[#211A4B]">
          <ChartNoAxesColumnIncreasing size={23} className="text-purple-600" />
          Your Testing Impact
        </h2>

        <Sparkles size={22} className="text-orange-400" />
      </div>

      <div className="grid grid-cols-3 divide-x divide-purple-200/70 px-3 py-5">

        <div className="px-3">
          <h3 className="text-3xl font-bold text-[#17143E]">12+</h3>
          <p className="mt-1 text-sm text-[#62588A]">
            Test Cases
            <br />
            Generated
          </p>
        </div>

        <div className="px-3">
          <h3 className="text-3xl font-bold text-[#17143E]">3</h3>
          <p className="mt-1 text-sm text-[#62588A]">
            Projects
            <br />
            Completed
          </p>
        </div>

        <div className="px-3">
          <h3 className="text-3xl font-bold text-[#17143E]">95%</h3>
          <p className="mt-1 text-sm text-[#62588A]">
            Coverage
            <br />
            Achieved
          </p>
        </div>

      </div>

      <div className="h-[115px] px-3 pb-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="coverageGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8655E8" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#8655E8" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <XAxis dataKey="month" hide />
            <Tooltip />

            <Area
              type="monotone"
              dataKey="coverage"
              stroke="#8655E8"
              strokeWidth={2.5}
              fill="url(#coverageGradient)"
              dot={{ fill: "#8655E8", stroke: "#fff", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </section>
  );
}

export default TestingImpact;
