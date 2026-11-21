import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { ArrowLeft, User, Mail, Briefcase, Save, Sparkles } from "lucide-react";

const defaultProfile = {
  name: "Gracy Verma",
  email: "",
  role: "AI Engineer",
  bio: "Building intelligent solutions with AI, machine learning, and software development."
};

function Profile() {
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("spec2test-profile");
    return saved ? JSON.parse(saved) : defaultProfile;
  });

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    localStorage.setItem("spec2test-profile", JSON.stringify(profile));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  return (
    <DashboardLayout>
      {showToast && (
        <div className="pointer-events-none fixed right-6 top-6 z-[9999]">
          <div className="flex items-center gap-3 rounded-2xl border border-purple-100 bg-white px-5 py-4 shadow-xl shadow-purple-200/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Save size={20} />
            </div>
            <div>
              <p className="font-semibold text-[#211A4B]">Changes saved!</p>
              <p className="text-sm text-[#81769F]">Your profile has been updated.</p>
            </div>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-[#F8F5FF] p-5 md:p-8">
        <div className="mx-auto max-w-5xl">

          <button
            onClick={() => navigate("/dashboard")}
            className="mb-6 flex items-center gap-2 text-purple-700 hover:text-purple-900"
          >
            <ArrowLeft size={18} /> Back to Dashboard
          </button>

          <div className="mb-7">
            <h1 className="text-3xl font-extrabold text-[#211A4B]">
              My Profile
            </h1>
            <p className="mt-2 text-[#81769F]">
              Manage your personal information and account details.
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-sm">

            <div className="bg-gradient-to-r from-purple-600 via-violet-500 to-fuchsia-500 p-8 text-white">
              <div className="flex items-center gap-5">
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/40 bg-white/20 text-4xl font-bold shadow-lg backdrop-blur">
                  {profile.name.charAt(0).toUpperCase() || "G"}
                </div>

                <div>
                  <h2 className="text-2xl font-bold">{profile.name}</h2>
                  <p className="mt-1 text-purple-100">{profile.role}</p>
                  <div className="mt-3 flex items-center gap-2 text-sm text-purple-100">
                    <Sparkles size={15} />
                    Spec2Test AI Workspace
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-9">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-[#211A4B]">
                  Personal Information
                </h3>
                <p className="mt-1 text-sm text-[#81769F]">
                  Update the information associated with your profile.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#514477]">
                    Full Name
                  </label>
                  <div className="flex items-center gap-3 rounded-xl border border-purple-100 bg-purple-50/40 px-4 py-3">
                    <User size={18} className="text-purple-400" />
                    <input
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                      className="w-full bg-transparent text-sm text-[#211A4B] outline-none"
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#514477]">
                    Email Address
                  </label>
                  <div className="flex items-center gap-3 rounded-xl border border-purple-100 bg-purple-50/40 px-4 py-3">
                    <Mail size={18} className="text-purple-400" />
                    <input
                      name="email"
                      type="email"
                      value={profile.email}
                      onChange={handleChange}
                      className="w-full bg-transparent text-sm text-[#211A4B] outline-none"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#514477]">
                    Job Title
                  </label>
                  <div className="flex items-center gap-3 rounded-xl border border-purple-100 bg-purple-50/40 px-4 py-3">
                    <Briefcase size={18} className="text-purple-400" />
                    <input
                      name="role"
                      value={profile.role}
                      onChange={handleChange}
                      className="w-full bg-transparent text-sm text-[#211A4B] outline-none"
                      placeholder="Your job title"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-[#514477]">
                    About Me
                  </label>
                  <textarea
                    name="bio"
                    value={profile.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full resize-none rounded-xl border border-purple-100 bg-purple-50/40 px-4 py-3 text-sm text-[#211A4B] outline-none transition focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
                    placeholder="Tell us a little about yourself..."
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-purple-50 pt-6">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="rounded-xl border border-purple-200 px-5 py-3 text-sm font-semibold text-purple-700 transition hover:bg-purple-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <Save size={17} />
                  Save Changes
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

export default Profile;


