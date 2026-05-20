import { useState, useEffect } from "react";
import customFetch from "../../../utils/customFetch";
import { FiUsers, FiPackage, FiCamera, FiHome, FiCoffee, FiMusic, FiUserCheck, FiAperture, FiSunset  } from "react-icons/fi";
import { BounceLoader } from "react-spinners";

interface Stats {
  users: number;
  packages: number;
  menuItems: number;
  photographers: number;
  venues: number;
  musicalGroup: number;
  staff: number;
  decorations: number;
  orders: number;
}

function Overview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await customFetch.get("/users/admin/stats");
        setStats(data.stats);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: "Total Users", value: stats?.users, icon: FiUsers },
    { title: "Total Packages", value: stats?.packages, icon: FiPackage },
    { title: "Menu Items", value: stats?.menuItems, icon: FiCoffee },
    { title: "Photographers", value: stats?.photographers, icon: FiCamera },
    { title: "Venues", value: stats?.venues, icon: FiHome },
    { title: "Music Group", value: stats?.musicalGroup, icon: FiMusic },
    { title: "Staff Members", value: stats?.staff, icon: FiUserCheck },
    { title: "Decoration Types", value: stats?.decorations, icon: FiAperture },
    { title: "Event Orders", value: stats?.orders, icon: FiSunset  },
  ];

  if (isLoading)
    return (
      <div>
        {" "}
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 bg-opacity-20 backdrop-blur-md">
          <BounceLoader size={50} color="#EE1133" />
        </div>
      </div>
    );

  return (
    <div className="p-6">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 
                     hover:shadow-md transition-all duration-300 hover:border-event-navy
                     transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{stat.title}</p>
                <p className="text-3xl font-bold text-event-navy mt-2">
                  {stat.value || 0}
                </p>
              </div>
              <stat.icon className="w-8 h-8 text-event-navy opacity-80" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Overview;
