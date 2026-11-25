import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  Settings as SettingsIcon,
  Bell,
  Save,
  UserRound,
  RotateCcw,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { userStorage } from "../utils/userStorage";

const defaultSettings = {
  notifications: true,
  projectUpdates: true,
  testAlerts: true,
  autosave: true,
  compactView: false
};

function Settings() {
  const navigate = useNavigate();

  const [settings, setSettings] = useState(() => {
    const saved = userStorage.getItem("spec2test-settings");
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  const [savedMessage, setSavedMessage] = useState(false);

  const toggleSetting = (key) => {
    setSettings((previous) => ({
      ...previous,
      [key]: !previous[key]
    }));
    setSavedMessage(false);
  };

  const saveSettings = () => {
    userStorage.setItem("spec2test-settings", JSON.stringify(settings));
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3500);
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    userStorage.setItem("spec2test-settings", JSON.stringify(defaultSettings));
    setSavedMessage(false);
  };

  const Toggle = ({ checked, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`relative h-7 w-12 rounded-full transition-colors ${
        checked ? "bg-purple-600" : "bg-gray-300"
      }`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );

  const SettingRow = ({ title, description, checked, onClick }) => (
    <div className="flex items-center justify-between gap-4 py-5">
      <div>
        <p className="font-semibold text-[#30245D]">{title}</p>
        <p className="mt-1 text-sm text-[#81769F]">{description}</p>
      </div>
      <Toggle checked={checked} onClick={onClick} />
    </div>
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#F8F5FF] p-5 md:p-8">
        <div className="mx-auto max-w-5xl">

          <div className="mb-8">
            <div className="settings-heading-row flex items-center gap-3">
              <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
                <SettingsIcon size={23} />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-[#211A4B]">Settings</h1>
                <p className="mt-1 text-[#81769F]">Customize your workspace preferences.</p>
              </div>
            </div>
          </div>

          {savedMessage && (
            <div className="pointer-events-none fixed right-6 top-6 z-[9999] rounded-2xl border border-purple-100 bg-white px-5 py-4 shadow-xl">
              <p className="font-semibold text-[#211A4B]">Settings saved!</p>
              <p className="text-sm text-[#81769F]">Your preferences have been updated.</p>
            </div>
          )}

          <div className="space-y-6">

            <section className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
                  <Bell size={21} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#211A4B]">Notifications</h2>
                  <p className="text-sm text-[#81769F]">Manage workspace notification preferences</p>
                </div>
              </div>

              <div className="divide-y divide-purple-50">
                <SettingRow
                  title="Enable Notifications"
                  description="Turn workspace notifications on or off"
                  checked={settings.notifications}
                  onClick={() => toggleSetting("notifications")}
                />
                <SettingRow
                  title="Project Updates"
                  description="Receive notifications about project changes"
                  checked={settings.projectUpdates}
                  onClick={() => toggleSetting("projectUpdates")}
                />
                <SettingRow
                  title="Test Execution Alerts"
                  description="Notify me about test execution results"
                  checked={settings.testAlerts}
                  onClick={() => toggleSetting("testAlerts")}
                />
              </div>
            </section>

            <section className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-xl bg-fuchsia-100 p-3 text-fuchsia-600">
                  <Sparkles size={21} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#211A4B]">Workspace Preferences</h2>
                  <p className="text-sm text-[#81769F]">Customize how you work</p>
                </div>
              </div>

              <div className="divide-y divide-purple-50">
                <SettingRow
                  title="Autosave"
                  description="Automatically save your workspace preferences"
                  checked={settings.autosave}
                  onClick={() => toggleSetting("autosave")}
                />
                <SettingRow
                  title="Compact View"
                  description="Prefer a more compact workspace layout"
                  checked={settings.compactView}
                  onClick={() => toggleSetting("compactView")}
                />
              </div>
            </section>

            <section className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                  <UserRound size={21} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#211A4B]">Account</h2>
                  <p className="text-sm text-[#81769F]">Manage your profile information</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="flex w-full items-center justify-between rounded-2xl border border-purple-100 p-4 text-left transition hover:border-purple-300 hover:bg-purple-50"
              >
                <div>
                  <p className="font-semibold text-[#30245D]">Edit Profile</p>
                  <p className="mt-1 text-sm text-[#81769F]">Update your name, email, and personal details</p>
                </div>
                <UserRound size={19} className="text-purple-500" />
              </button>

              <div className="mt-4 flex items-start gap-3 rounded-2xl bg-purple-50 p-4">
                <ShieldCheck size={20} className="mt-0.5 shrink-0 text-purple-500" />
                <div>
                  <p className="font-semibold text-[#30245D]">Local Demo Workspace</p>
                  <p className="mt-1 text-sm leading-5 text-[#81769F]">
                    Your profile and preferences are stored locally in this browser for this practice project.
                  </p>
                </div>
              </div>
            </section>

            <div className="flex flex-wrap justify-end gap-3 rounded-3xl border border-purple-100 bg-white p-5 shadow-sm">
              <button
                type="button"
                onClick={resetSettings}
                className="flex items-center gap-2 rounded-xl border border-purple-200 px-5 py-3 text-sm font-semibold text-purple-700 transition hover:bg-purple-50"
              >
                <RotateCcw size={16} /> Reset Defaults
              </button>
              <button
                type="button"
                onClick={saveSettings}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <Save size={17} /> Save Preferences
              </button>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Settings;


