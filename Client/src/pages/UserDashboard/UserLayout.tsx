import { Link, Outlet, useLocation } from "react-router-dom";
import {
  FiUser,
  FiCalendar,
  FiBookmark,
  FiMessageSquare,
  FiClock,
  FiSettings,
  FiStar,
} from "react-icons/fi";
import NavBar from "@/components/UI/NavBar";

const menuItems = [
  { path: "profile", title: "My Profile", icon: <FiUser /> },
  { path: "my-events", title: "My Events", icon: <FiCalendar /> },
  { path: "my-review", title: "My Review", icon: <FiStar /> },
  { path: "bookings", title: "My Bookings", icon: <FiBookmark /> },
  { path: "notifications", title: "Notifications", icon: <FiMessageSquare /> },
  { path: "schedule", title: "Schedule", icon: <FiClock /> },
  { path: "settings", title: "Settings", icon: <FiSettings /> },
];

const UserLayout = () => {
  const location = useLocation();
  const currentPath = location.pathname.split("/").pop();

  return (
    <div className="flex flex-col h-screen">
      <NavBar />
      <div className="flex flex-1 bg-gray-100">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md">
          <div className="p-4 border-b">
            <h1 className="text-xl font-semibold">User Dashboard</h1>
          </div>
          <nav className="mt-4">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center w-full px-4 py-3 hover:bg-gray-50 ${
                  currentPath === item.path
                    ? "bg-gray-50 text-event-red"
                    : "text-gray-700"
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <header className="bg-white shadow-sm">
            <div className="px-6 py-4">
              <h2 className="text-xl font-semibold">
                {menuItems.find((item) => item.path === currentPath)?.title}
              </h2>
            </div>
          </header>

          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserLayout;
