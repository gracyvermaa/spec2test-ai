import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { Search, LifeBuoy, BookOpen, MessageCircle, ChevronDown, Send, Sparkles } from "lucide-react";

const faqs = [
  {
    q: "How do I create a new project?",
    a: "Go to the Dashboard and click Start New Project. Enter your project details and requirements, then create your project."
  },
  {
    q: "How are test cases generated?",
    a: "Open a project and use the analysis feature to process your requirements. Spec2Test generates structured test cases based on the project input. This portfolio version uses simulated AI behavior."
  },
  {
    q: "Where can I view generated test cases?",
    a: "Use Test Cases from the sidebar to explore your test cases. You can also open an individual project to review its associated testing information."
  },
  {
    q: "How do I run test execution?",
    a: "Navigate to Execution Results to review simulated execution results, test statuses, and defect information."
  },
  {
    q: "Where can I find reports?",
    a: "Open Reports from the sidebar to view testing summaries, project insights, and reporting information."
  },
  {
    q: "How do I update my profile?",
    a: "Click your profile avatar on the Dashboard and edit your name, email, job title, or About Me information. Click Save Changes to save."
  },
  {
    q: "Are the AI features connected to a live AI API?",
    a: "No. This is a practice and portfolio project. AI behavior is simulated, so it does not consume external AI API tokens."
  }
];

function HelpSupport() {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState(null);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const filteredFaqs = faqs.filter((faq) =>
    faq.q.toLowerCase().includes(search.toLowerCase()) ||
    faq.a.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    const requests = JSON.parse(localStorage.getItem("spec2test-support") || "[]");
    requests.push({
      email,
      message,
      date: new Date().toISOString()
    });
    localStorage.setItem("spec2test-support", JSON.stringify(requests));
    setMessage("");
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#F8F5FF] p-5 md:p-8">
        <div className="mx-auto max-w-6xl">

          <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-violet-500 to-fuchsia-500 p-8 text-white shadow-lg shadow-purple-200/50 md:p-10">
            <div className="flex items-center gap-3 text-purple-100">
              <LifeBuoy size={22} />
              <span className="text-sm font-semibold">HELP CENTER</span>
            </div>
            <h1 className="mt-4 text-3xl font-extrabold md:text-4xl">
              How can we help you?
            </h1>
            <p className="mt-3 max-w-xl text-purple-100">
              Find answers, learn how to use Spec2Test, or send us a support request.
            </p>
            <div className="mt-6 flex max-w-xl items-center gap-3 rounded-2xl bg-white px-4 py-3 text-purple-500 shadow-md">
              <Search size={20} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search help articles..."
                className="w-full bg-transparent text-sm text-[#211A4B] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_0.7fr]">

            <section className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
                  <BookOpen size={21} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#211A4B]">Frequently Asked Questions</h2>
                  <p className="text-sm text-[#81769F]">Quick answers to common questions</p>
                </div>
              </div>

              <div className="space-y-3">
                {filteredFaqs.map((faq, index) => (
                  <div key={faq.q} className="overflow-hidden rounded-2xl border border-purple-100">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="flex w-full items-center justify-between gap-4 p-4 text-left transition hover:bg-purple-50/70"
                    >
                      <span className="text-sm font-semibold text-[#30245D]">{faq.q}</span>
                      <ChevronDown
                        size={18}
                        className={`shrink-0 text-purple-500 transition-transform ${openFaq === index ? "rotate-180" : ""}`}
                      />
                    </button>
                    {openFaq === index && (
                      <div className="border-t border-purple-50 bg-purple-50/40 px-4 py-4 text-sm leading-6 text-[#71658F]">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}

                {filteredFaqs.length === 0 && (
                  <div className="rounded-2xl bg-purple-50 p-6 text-center text-sm text-[#81769F]">
                    No articles found. Try another search term.
                  </div>
                )}
              </div>
            </section>

            <div className="space-y-6">
              <section className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-xl bg-fuchsia-100 p-3 text-fuchsia-600">
                    <MessageCircle size={21} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#211A4B]">Contact Support</h2>
                    <p className="text-sm text-[#81769F]">Send us your question</p>
                  </div>
                </div>

                {sent && (
                  <div className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
                    Your support request has been saved!
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#514477]">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email address"
                      className="w-full rounded-xl border border-purple-100 bg-purple-50/40 px-4 py-3 text-sm outline-none focus:border-purple-300"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#514477]">Message</label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe your issue or question..."
                      className="w-full resize-none rounded-xl border border-purple-100 bg-purple-50/40 px-4 py-3 text-sm outline-none focus:border-purple-300"
                    />
                  </div>

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-5 py-3 font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <Send size={17} /> Submit Request
                  </button>
                </form>
              </section>

              <div className="rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50 to-fuchsia-50 p-6">
                <Sparkles size={22} className="text-purple-500" />
                <h3 className="mt-3 font-bold text-[#30245D]">Spec2Test AI</h3>
                <p className="mt-2 text-sm leading-6 text-[#81769F]">
                  Intelligent testing, simplified. Explore the workspace and discover the features.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default HelpSupport;
