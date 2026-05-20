import { useState, useEffect } from "react";
import customFetch from "@/utils/customFetch";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { BounceLoader } from "react-spinners";
import { AxiosError } from "axios";

interface Event {
  _id: string;
  title: string;
  type: string;
  date: string;
  time: { start: string; end: string };
  status: string;
  totalCost: number;
  client: {
    name: string;
    email: string;
  };
  venue: {
    name: string;
  };
}

function EventOrders() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  // fetch events orders
  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const { data } = await customFetch.get("/events");
      console.log("Response data:", data); // Debug log
      setEvents(data.events);
    } catch (error) {
      const err = error as AxiosError<{ msg: string }>;
      console.error("Fetch error:", err.response?.data || err.message);
      toast.error(err.response?.data?.msg || "Failed to fetch events");
    } finally {
      setIsLoading(false);
    }
  };

  // update events orders status
  const updateEventStatus = async (eventId: string, newStatus: string) => {
    try {
      const response = await customFetch.patch(`/events/${eventId}/status`, {
        status: newStatus,
      });
      console.log("Update response:", response.data); // Debug log
      toast.success("Event status updated");
      fetchEvents();
    } catch (error) {
        const err = error as AxiosError<{ msg: string }>;
        console.error("Fetch error:", err.response?.data || err.message);
        toast.error(err.response?.data?.msg || "Failed to fetch events");
    }
  };

  // Add authorization header
  customFetch.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <BounceLoader color="#EE1133" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Event Orders</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {events.map((event) => (
              <tr key={event._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {event.title}
                  </div>
                  <div className="text-sm text-gray-500">{event.type}</div>
                  <div className="text-sm text-gray-500">
                    Venue: {event.venue?.name}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {event.client?.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {event.client?.email}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {format(new Date(event.date), "MMM dd, yyyy")}
                  </div>
                  <div className="text-sm text-gray-500">
                    {event.time.start} - {event.time.end}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      event.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : event.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : event.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {event.status.charAt(0).toUpperCase() +
                      event.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={event.status}
                    onChange={(e) =>
                      updateEventStatus(event._id, e.target.value)
                    }
                    className="text-sm rounded-md border-gray-300 shadow-sm focus:border-event-red focus:ring-event-red"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EventOrders;
