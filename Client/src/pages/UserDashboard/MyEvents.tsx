import { useState, useEffect } from "react";
import customFetch from "../../utils/customFetch";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { BounceLoader } from "react-spinners";
import { Link } from "react-router-dom";

interface Event {
  _id: string;
  title: string;
  type: string;
  date: string;
  time: {
    start: string;
    end: string;
  };
  status: string;
  totalCost: number;
  venue: {
    name: string;
    location: { address: string };
  };
  guests: { count: number };
  services: {
    decoration: { _id: string; name: string } | null;
    photographer: { _id: string; fullName: string } | null;
    musicalGroup: { _id: string; name: string } | null;
  };
}

function MyEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await customFetch.get(
          "/events/my-events?populate=services"
        );
        setEvents(data.events);
      } catch (error) {
        toast.error("Failed to fetch events");
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (isLoading) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 bg-opacity-20 backdrop-blur-md">
        <BounceLoader size={50} color="#EE1133" />
      </div>
    );
  }

  const EventDetailsModal = ({
    event,
    onClose,
  }: {
    event: Event;
    onClose: () => void;
  }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            {event.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Event Type</h3>
              <p className="mt-1">{event.type}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
              <p className="mt-1">
                {format(new Date(event.date), "MMM dd, yyyy")}
                <br />
                {event.time.start} - {event.time.end}
              </p>
            </div>
          </div>

          {event.venue && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Venue</h3>
              <p className="mt-1">{event.venue.name}</p>
              {event.venue.location && (
                <p className="text-sm text-gray-500">
                  {event.venue.location.address}
                </p>
              )}
            </div>
          )}

          {event.guests && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Guest Count</h3>
              <p className="mt-1">{event.guests.count} guests</p>
            </div>
          )}

          {event.services && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Services</h3>
              <ul className="mt-1 space-y-1 text-gray-700">
                {event.services.photographer && (
                  <li className="flex items-center space-x-2">
                    <span className="text-gray-500">📸</span>
                    <span>
                      Photographer: {event.services.photographer.fullName}
                    </span>
                  </li>
                )}
                {event.services.musicalGroup && (
                  <li className="flex items-center space-x-2">
                    <span className="text-gray-500">🎵</span>
                    <span>
                      Musical Group: {event.services.musicalGroup.name}
                    </span>
                  </li>
                )}
                {event.services.decoration && (
                  <li className="flex items-center space-x-2">
                    <span className="text-gray-500">🎨</span>
                    <span>Decoration: {event.services.decoration.name}</span>
                  </li>
                )}
                {!event.services.photographer &&
                  !event.services.musicalGroup &&
                  !event.services.decoration && (
                    <li className="text-gray-500 italic">
                      No services selected
                    </li>
                  )}
              </ul>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <span
              className={`mt-1 inline-block px-2 py-1 text-xs rounded-full ${
                event.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : event.status === "confirmed"
                  ? "bg-green-100 text-green-800"
                  : event.status === "cancelled"
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </span>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Cost</h3>
            <p className="mt-1 text-lg font-semibold text-event-red">
              Rs. {event.totalCost.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">My Events</h1>

      {events.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            You haven't planned any events yet.
          </p>
          <Link
            to="/plan-event"
            className="bg-event-red text-white px-6 py-2 rounded-md hover:bg-red-700"
          >
            Plan an Event
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {events.map((event) => (
                <tr key={event._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{event.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{event.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(event.date), "MMM dd, yyyy")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {event.time.start} - {event.time.end}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    Rs. {event.totalCost.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="text-event-red hover:text-red-700"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}

export default MyEvents;
