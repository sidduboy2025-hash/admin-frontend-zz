import { Link, useLocation } from "react-router-dom";
import { DashboardIcon, CreateTestIcon, ManageTestIcon, LeaderboardIcon } from "../Elements/Icons";
import { useAuth } from "../../contexts/AuthContext";

const navItems = [
  { label: "Dashboard", to: "/" },
  { label: "Create Test", to: "/create-test" },
  { label: "Manage Tests", to: "/manage-tests" },
  { label: "Manage Questions", to: "/manage-questions" },
  { label: "Leaderboard", to: "/leaderboard" },
];

const iconMap = {
  Dashboard: <DashboardIcon className="w-5 h-5 shrink-0" />,
  "Create Test": <CreateTestIcon className="w-5 h-5 shrink-0" />,
  "Manage Tests": <ManageTestIcon className="w-5 h-5 shrink-0" />,
  "Manage Questions": <ManageTestIcon className="w-5 h-5 shrink-0" />,
  Leaderboard: <LeaderboardIcon className="w-5 h-5 shrink-0" />,
};

function NavItem({ label, to, external = false, isActive, isCollapsed }) {
  const baseClasses = `flex items-center pl-[0.9rem] gap-3 p-3 rounded font-medium text-sm transition-all duration-200 ${isActive
      ? "bg-[#062B5B] text-white"
      : "bg-[#0A4CA4] text-gray-300 hover:bg-[#062B5B] hover:text-white"
    }`;

  const content = (
    <>
      {iconMap[label]}
      {!isCollapsed && <span className="truncate">{label}</span>}
    </>
  );

  return external ? (
    <a
      href={to}
      target="_blank"
      rel="noopener noreferrer"
      className={baseClasses}
    >
      {content}
    </a>
  ) : (
    <Link to={to} className={baseClasses}>
      {content}
    </Link>
  );
}

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <aside
      className={`${isCollapsed ? "w-20" : "w-64"
        } h-screen bg-[#08387F] text-white px-4 py-6 shadow-xl fixed top-0 left-0 flex flex-col transition-all duration-300`}
    >
      <div
        className={`flex ${isCollapsed ? "justify-center items-center" : "justify-end items-end"}`}
      >
        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="self-end mb-6 focus:outline-none cursor-pointer"
          aria-label="Toggle Sidebar"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            width={30}
            height={30}
          >
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-3 mb-8 px-1">
        <img
          src="/assets/images/vignan-logo.png"
          alt="Logo"
          className="w-10 h-10 bg-white border border-white rounded-full shadow"
        />
        {!isCollapsed && (
          <span className="text-xl font-bold text-gray-200 whitespace-nowrap font-mono uppercase tracking-wide">
            Admin Panel
          </span>
        )}
      </div>

      {/* Welcome message for logged-in user */}
      {user && !isCollapsed && (
        <div className="bg-[#062B5B] rounded-lg p-3 mb-4 border border-[#0A4CA4]">
          <div className="text-xs text-gray-300 mb-1">Welcome back,</div>
          <div className="font-semibold text-white text-sm truncate">
            {user.username}
          </div>
        </div>
      )}

      <nav className="w-full">
        <ul className="space-y-3">
          {navItems.map((item) => {
            const isActive = !item.external && location.pathname === item.to;
            return (
              <li key={item.label}>
                <NavItem
                  {...item}
                  isActive={isActive}
                  isCollapsed={isCollapsed}
                />
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto pt-6 text-xs text-gray-400 text-center">
        &copy; {new Date().getFullYear()} {isCollapsed ? "" : "Vignan Admin"}
      </div>
    </aside>
  );
}
