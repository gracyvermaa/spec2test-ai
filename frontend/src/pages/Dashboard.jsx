import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";

import HeroSection from "../components/HeroSection";
import WorkflowSteps from "../components/WorkflowSteps";
import RecentProjects from "../components/RecentProjects";
import TestingImpact from "../components/TestingImpact";
import DashboardStats from "../components/DashboardStats";
import ProjectStatusDistribution from "../components/ProjectStatusDistribution";

import { Bell, Search, Sparkles, CheckCheck, FolderOpen, X } from "lucide-react";
import "./Dashboard.css";
import { userStorage, getCurrentUser } from "../utils/userStorage";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getProjects() {
  try {
    return JSON.parse(userStorage.getItem("spec2test_projects") || "[]");
  } catch {
    return [];
  }
}

function getReadNotifications() {
  try {
    return JSON.parse(userStorage.getItem("spec2test_read_notifications") || "[]");
  } catch {
    return [];
  }
}

function formatNotificationDate(date) {
  if (!date) return "Recently";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Recently";

  return parsed.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDisplayName() {
  const account = getCurrentUser();
  try {
    const profile = JSON.parse(userStorage.getItem("spec2test-profile") || "null");
    return String(profile?.name || "").trim() || account?.name || "there";
  } catch {
    return account?.name || "there";
  }
}

function Dashboard() {
  const navigate = useNavigate();
  const displayName = getDisplayName();

  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects] = useState(getProjects);
  const [readNotifications, setReadNotifications] = useState(getReadNotifications);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const notificationRef = useRef(null);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    const refreshProjects = () => setProjects(getProjects());

    window.addEventListener("spec2test-projects-updated", refreshProjects);
    window.addEventListener("storage", refreshProjects);

    return () => {
      window.removeEventListener("spec2test-projects-updated", refreshProjects);
      window.removeEventListener("storage", refreshProjects);
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setNotificationsOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const notifications = projects
    .filter((project) => project && project.id)
    .map((project) => {
      const analysisComplete =
        project.analysis ||
        project.test_cases?.length ||
        project.testCases?.length ||
        project.risk_assessment ||
        project.status?.toLowerCase().includes("complete");

      return {
        id: `project-${project.id}`,
        projectId: project.id,
        project,
        title: analysisComplete
          ? "Requirement analysis completed"
          : "New project created",
        message: analysisComplete
          ? `${project.projectName || "Your project"} is ready for review.`
          : `${project.projectName || "Your project"} was added to your workspace.`,
        date: project.completedAt || project.createdAt,
      };
    })
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  const unreadCount = notifications.filter(
    (notification) => !readNotifications.includes(notification.id)
  ).length;

  const searchResults = projects.filter((project) => {
    const query = searchTerm.toLowerCase().trim();

    return (
      project.projectName?.toLowerCase().includes(query) ||
      project.requirementTitle?.toLowerCase().includes(query) ||
      project.description?.toLowerCase().includes(query)
    );
  });

  const markAsRead = (notificationId) => {
    const updated = [...new Set([...readNotifications, notificationId])];

    setReadNotifications(updated);
    userStorage.setItem(
      "spec2test_read_notifications",
      JSON.stringify(updated)
    );
  };

  const markAllAsRead = () => {
    const updated = [...new Set([
      ...readNotifications,
      ...notifications.map((notification) => notification.id),
    ])];

    setReadNotifications(updated);
    userStorage.setItem(
      "spec2test_read_notifications",
      JSON.stringify(updated)
    );
  };

  const openNotification = (notification) => {
    markAsRead(notification.id);
    setNotificationsOpen(false);

    navigate(`/project/${notification.projectId}`, {
      state: { project: notification.project },
    });
  };

  return (
    <DashboardLayout>
      <div className="dash-page">
        <div className="mx-auto max-w-[1600px] p-5 md:p-8">
          {/* Top bar */}
          <header
            className="dash-rise mb-7 flex items-center justify-between relative z-50"
            style={{ "--i": 0 }}
          >
            <div>
              <span className="dash-date">
                <i /> {today}
              </span>

              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#211A4B]">
                {getGreeting()}, <span className="dash-name">{displayName}</span>{" "}
                <span className="dash-wave">{"\u{1F44B}"}</span>
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="dash-search relative hidden items-center gap-2 rounded-xl border border-purple-100 bg-white px-4 py-2.5 md:flex">
                <Search size={17} className="shrink-0 text-purple-400" />

                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-44 bg-transparent text-sm outline-none"
                />

                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    title="Clear search"
                    className="rounded-full p-1 text-gray-400 transition hover:bg-purple-100 hover:text-purple-700"
                  >
                    <X size={15} />
                  </button>
                )}

                {searchTerm.trim() && (
                  <div className="absolute left-0 right-0 top-full z-[100] mt-2 overflow-hidden rounded-xl border border-purple-100 bg-white shadow-xl">
                    <div className="border-b border-purple-50 px-4 py-2">
                      <p className="text-xs font-semibold text-[#82769E]">
                        {searchResults.length} matching project{searchResults.length === 1 ? "" : "s"}
                      </p>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {searchResults.length === 0 ? (
                        <div className="px-4 py-6 text-center">
                          <Search size={22} className="mx-auto mb-2 text-purple-300" />
                          <p className="text-sm font-medium text-[#35265E]">
                            No projects found
                          </p>
                          <p className="mt-1 text-xs text-[#82769E]">
                            Try another project name or keyword.
                          </p>
                        </div>
                      ) : (
                        searchResults.map((project) => (
                          <button
                            key={project.id}
                            onClick={() => {
                              setSearchTerm("");
                              navigate(`/project/${project.id}`, {
                                state: { project },
                              });
                            }}
                            className="flex w-full items-start gap-3 border-b border-purple-50 px-4 py-3 text-left transition hover:bg-purple-50"
                          >
                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                              <FolderOpen size={17} />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-[#35265E]">
                                {project.projectName || "Untitled Project"}
                              </p>
                              <p className="mt-1 truncate text-xs text-[#82769E]">
                                {project.requirementTitle || project.description || "No requirement title"}
                              </p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setNotificationsOpen((open) => !open)}
                  aria-label="Notifications"
                  aria-expanded={notificationsOpen}
                  title="Notifications"
                  className="relative rounded-xl border border-purple-100 bg-white p-3 text-purple-600 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <Bell size={20} />

                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-pink-500 px-1 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 top-full z-50 mt-3 w-[min(380px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-2xl">
                    <div className="flex items-center justify-between border-b border-purple-100 px-4 py-4">
                      <div>
                        <h3 className="font-bold text-[#211A4B]">
                          Notifications
                        </h3>
                        <p className="mt-0.5 text-xs text-[#82769E]">
                          {unreadCount > 0
                            ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
                            : "You're all caught up"}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            title="Mark all as read"
                            className="rounded-lg p-2 text-purple-600 transition hover:bg-purple-50"
                          >
                            <CheckCheck size={18} />
                          </button>
                        )}

                        <button
                          onClick={() => setNotificationsOpen(false)}
                          title="Close notifications"
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-6 py-10 text-center">
                          <Bell
                            size={30}
                            className="mx-auto mb-3 text-purple-300"
                          />
                          <p className="text-sm font-semibold text-[#35265E]">
                            No notifications yet
                          </p>
                          <p className="mt-1 text-xs text-[#82769E]">
                            Create a project to see updates here.
                          </p>
                        </div>
                      ) : (
                        notifications.map((notification) => {
                          const isUnread = !readNotifications.includes(
                            notification.id
                          );

                          return (
                            <button
                              key={notification.id}
                              onClick={() => openNotification(notification)}
                              className={`flex w-full gap-3 border-b border-purple-50 px-4 py-4 text-left transition hover:bg-purple-50 ${
                                isUnread ? "bg-purple-50/60" : "bg-white"
                              }`}
                            >
                              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                                <FolderOpen size={19} />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm font-semibold text-[#35265E]">
                                    {notification.title}
                                  </p>

                                  {isUnread && (
                                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-purple-500" />
                                  )}
                                </div>

                                <p className="mt-1 text-xs leading-5 text-[#756A92]">
                                  {notification.message}
                                </p>

                                <p className="mt-2 text-[11px] text-[#A197B8]">
                                  {formatNotificationDate(notification.date)}
                                </p>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>

                    {notifications.length > 0 && (
                      <div className="border-t border-purple-100 bg-purple-50/50 px-4 py-3 text-center">
                        <button
                          onClick={() => {
                            setNotificationsOpen(false);
                            navigate("/projects");
                          }}
                          className="text-xs font-semibold text-purple-700 hover:text-purple-900"
                        >
                          View all projects
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate("/profile")}
                title="Edit Profile"
                className="dash-avatar flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 font-bold text-white shadow transition hover:scale-105"
              >
                {displayName.charAt(0).toUpperCase() || "U"}
              </button>
            </div>
          </header>

          <div className="dash-rise" style={{ "--i": 1 }}>
            <HeroSection />
          </div>

          <div className="dash-rise mt-7" style={{ "--i": 2 }}>
            <DashboardStats />
          </div>

          <div className="dash-rise mt-7" style={{ "--i": 3 }}>
            <ProjectStatusDistribution />
          </div>

          <div className="dash-rise mt-7" style={{ "--i": 4 }}>
            <WorkflowSteps />
          </div>

          <div
            className="dash-rise mt-7 grid grid-cols-1 gap-6 xl:grid-cols-[1.7fr_1fr]"
            style={{ "--i": 5 }}
          >
            <RecentProjects searchTerm={searchTerm} />
            <TestingImpact />
          </div>

          <footer className="mt-8 flex items-center justify-center gap-2 pb-3 text-xs text-[#958BAC]">
            <Sparkles size={14} />
            Spec2Test AI &middot; Intelligent Testing, Simplified
          </footer>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;


