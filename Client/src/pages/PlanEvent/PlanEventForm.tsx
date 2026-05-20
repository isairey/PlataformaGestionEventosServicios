import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import customFetch from "@/utils/customFetch";

interface EventFormData {
  title: string;
  type: string;
  description: string;
  date: string;
  time: {
    start: string;
    end: string;
  };
  venue: string;
  package: string;
  guests: {
    count: number;
    list: GuestInfo[];
  };
  services: {
    decoration?: string;
    photographer?: string;
    musicalGroup?: string;
  };
  budget: number;
  selectedMenuItems: string[];
  selectedVenue: string;
  selectedServices: {
    photographers: string[];
    musicalGroups: string[];
    decorators: string[];
  };
}

interface GuestInfo {
  name: string;
  email: string;
  phone: string;
}

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  image: string;
  pricePerPlate: number;
  category: string;
}

interface Venue {
  _id: string;
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
  };
  capacity: {
    min: number;
    max: number;
  };
  pricePerHour: number;
  images: string[];
  isAvailable: boolean;
}

interface Service {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  experience: number;
  availability: boolean;
  ratings: number;
  image: string;
  price: number;
}

interface Photographer extends Service {
  fullName: string;
  email: string;
  phoneNumber: string;
  experience: number;
  ratings: number;
}

interface MusicalGroup {
  _id: string;
  name: string;
  description: string;
  genre: string;
  price: number;
  contactPhone: string;
  availableForEvents: boolean;
  rating: number;
  image: string;
}

interface Decoration {
  _id: string;
  name: string;
  description: string;
  type: string;
  theme: string;
  pricePerDay: number;
  images: string[];
  rating: number;
  availability: {
    isAvailable: boolean;
  };
}

const PlanEventForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    type: "",
    description: "",
    date: "",
    time: { start: "09:00", end: "17:00" },
    venue: "",
    package: "",
    guests: { count: 1, list: [] },
    services: {},
    budget: 0,
    selectedMenuItems: [],
    selectedVenue: "",
    selectedServices: {
      photographers: [],
      musicalGroups: [],
      decorators: [],
    },
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [services, setServices] = useState<{
    photographers: Photographer[];
    musicalGroups: MusicalGroup[];
    decorators: Decoration[];
  }>({
    photographers: [],
    musicalGroups: [],
    decorators: [],
  });

  useEffect(() => {
    const fetchEventData = async () => {
      setIsLoading(true);
      try {
        const [
          menuResponse,
          venuesResponse,
          photographersResponse,
          musicalGroupsResponse,
          decorationsResponse,
        ] = await Promise.all([
          customFetch.get("/menu-items"),
          customFetch.get("/venues"),
          customFetch.get("/photographers"),
          customFetch.get("/musical-group"),
          customFetch.get("/decorations"),
        ]);

        console.log("Venues Response:", venuesResponse.data); // Debug log

        console.log("Menu Response:", menuResponse.data); // Debug log
        console.log("Photographers Response:", photographersResponse.data); // Debug log
        console.log("Musical Groups Response:", musicalGroupsResponse.data); // Debug log
        console.log("Decorations Response:", decorationsResponse.data); // Debug log

        setMenuItems(menuResponse.data.menuItems || []);
        setVenues(venuesResponse.data.venues || []);
        setServices({
          photographers: photographersResponse.data.photographers || [],
          musicalGroups: musicalGroupsResponse.data.musicalGroups || [],
          decorators: decorationsResponse.data.decorations || [],
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Error details:", error);
          toast.error(error.message || "Failed to load event options");
        } else {
          console.error("Unknown error:", error);
          toast.error("Failed to load event options");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof EventFormData] as object),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleMultipleSelect = (name: string, value: string) => {
    setFormData((prev) => {
      if (name === "selectedMenuItems") {
        return {
          ...prev,
          selectedMenuItems: prev.selectedMenuItems.includes(value)
            ? prev.selectedMenuItems.filter((item) => item !== value)
            : [...prev.selectedMenuItems, value],
        };
      }

      const [, serviceType] = name.split(".") as [
        string,
        keyof EventFormData["selectedServices"]
      ];
      return {
        ...prev,
        selectedServices: {
          ...prev.selectedServices,
          [serviceType]: prev.selectedServices[serviceType].includes(value)
            ? prev.selectedServices[serviceType].filter(
                (item) => item !== value
              )
            : [...prev.selectedServices[serviceType], value],
        },
      };
    });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // First get current user
      const { data: userData } = await customFetch.get("/users/current-user");

      const eventData = {
        title: formData.title,
        type: formData.type,
        description: formData.description || "No description provided",
        date: formData.date,
        time: {
          start: formData.time.start,
          end: formData.time.end,
        },
        venue: formData.selectedVenue,
        guests: {
          count: formData.guests.count,
          list: formData.guests.list,
        },
        services: {
          decoration: formData.selectedServices.decorators[0] || null,
          photographer: formData.selectedServices.photographers[0] || null,
          musicalGroup: formData.selectedServices.musicalGroups[0] || null,
        },
        totalCost: calculateTotalCost(),
        status: "pending",
        client: userData.user._id, // Use the current user's ID
      };

      await customFetch.post("/events", eventData);
      toast.success("Event planned successfully!");
      navigate(`/user-dashboard/my-events`);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to plan event");
        console.error("Event planning error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgress = () => {
    const totalSteps = 5;
    return (currentStep / totalSteps) * 100;
  };

  const calculateTotalCost = () => {
    let total = 0;

    // Add venue cost
    const selectedVenue = venues.find((v) => v._id === formData.selectedVenue);
    if (selectedVenue) {
      total += selectedVenue.pricePerHour;
    }

    // Add menu items cost
    formData.selectedMenuItems.forEach((itemId) => {
      const item = menuItems.find((m) => m._id === itemId);
      if (item) {
        total += item.pricePerPlate;
      }
    });

    // Add services cost
    Object.entries(formData.selectedServices).forEach(
      ([serviceType, selectedIds]) => {
        selectedIds.forEach((serviceId) => {
          const service = services[serviceType as keyof typeof services].find(
            (s) => s._id === serviceId
          );
          if (service) {
            if ("price" in service) {
              total += service.price;
            } else if ("pricePerDay" in service) {
              total += service.pricePerDay;
            }
          }
        });
      }
    );

    return total;
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.title &&
          formData.type &&
          formData.date &&
          formData.time.start &&
          formData.time.end &&
          formData.guests.count >= 1
        );
      case 2:
        return formData.selectedVenue !== "";
      case 3:
        return formData.selectedMenuItems.length > 0;
      case 4:
        return Object.values(formData.selectedServices).some(
          (arr) => arr.length > 0
        );
      case 5:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Basic Event Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              >
                <option value="">Select Type</option>
                <option value="Wedding">Wedding</option>
                <option value="Birthday">Birthday</option>
                <option value="Corporate">Corporate</option>
                <option value="Anniversary">Anniversary</option>
                <option value="Graduation">Graduation</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Guests
              </label>
              <input
                type="number"
                name="guests.count"
                min="1"
                value={formData.guests.count}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                min={new Date().toISOString().split("T")[0]}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  name="time.start"
                  value={formData.time.start}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  name="time.end"
                  value={formData.time.end}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Select Venue</h2>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-event-red"></div>
              </div>
            ) : venues.length === 0 ? (
              <div className="text-center text-gray-500">
                No venues available
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {venues.map((venue) => (
                  <div
                    key={venue._id}
                    className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all ${
                      formData.selectedVenue === venue._id
                        ? "ring-2 ring-event-red"
                        : "hover:shadow-lg"
                    }`}
                    onClick={() =>
                      handleInputChange({
                        target: { name: "selectedVenue", value: venue._id },
                      } as React.ChangeEvent<HTMLInputElement>)
                    }
                  >
                    <div className="relative h-48">
                      <img
                        src={`http://localhost:5000/${venue.images[0]}`}
                        alt={venue.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {venue.name}
                        </h3>
                        <span className="text-event-red font-semibold">
                          Rs. {venue.pricePerHour}
                          <span className="text-xs text-gray-500">/hour</span>
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Capacity: {venue.capacity.min} - {venue.capacity.max}{" "}
                        guests
                      </p>
                      <p className="text-sm text-gray-600">
                        {venue.location.address}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Select Menu Items</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <div
                  key={item._id}
                  className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all ${
                    formData.selectedMenuItems.includes(item._id)
                      ? "ring-2 ring-event-red"
                      : "hover:shadow-lg"
                  }`}
                  onClick={() =>
                    handleMultipleSelect("selectedMenuItems", item._id)
                  }
                >
                  <img
                    src={`http://localhost:5000/${item.image}`}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {item.name}
                      </h3>
                      <span className="text-event-red font-semibold">
                        Rs. {item.pricePerPlate}
                        <span className="text-xs text-gray-500">/plate</span>
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Select Services</h2>

            {/* Photographers Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Photographers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.photographers.map((photographer) => (
                  <div
                    key={photographer._id}
                    className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all ${
                      formData.selectedServices.photographers.includes(
                        photographer._id
                      )
                        ? "ring-2 ring-event-red"
                        : "hover:shadow-lg"
                    }`}
                    onClick={() =>
                      handleMultipleSelect(
                        "selectedServices.photographers",
                        photographer._id
                      )
                    }
                  >
                    {/* Photographer card content */}
                    <div className="relative h-48">
                      <img
                        src={`http://localhost:5000/${photographer.image}`}
                        alt={photographer.fullName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/150";
                        }}
                      />
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          ⭐ {photographer.ratings.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {photographer.fullName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {photographer.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        {photographer.phoneNumber}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Experience: {photographer.experience} years
                      </p>
                      <div className="mt-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            photographer.availability
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {photographer.availability
                            ? "Available"
                            : "Unavailable"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Musical Groups Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Musical Groups</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.musicalGroups.map((group) => (
                  <div
                    key={group._id}
                    className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all ${
                      formData.selectedServices.musicalGroups.includes(
                        group._id
                      )
                        ? "ring-2 ring-event-red"
                        : "hover:shadow-lg"
                    }`}
                    onClick={() =>
                      handleMultipleSelect(
                        "selectedServices.musicalGroups",
                        group._id
                      )
                    }
                  >
                    <div className="relative h-48">
                      <img
                        src={`http://localhost:5000/${group.image}`}
                        alt={group.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/150";
                        }}
                      />
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          ⭐ {group.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {group.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {group.description}
                      </p>
                      <p className="text-sm text-gray-600">
                        Genre: {group.genre}
                      </p>
                      <p className="text-sm text-gray-600">
                        Contact: {group.contactPhone}
                      </p>
                      <div className="mt-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            group.availableForEvents
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {group.availableForEvents
                            ? "Available"
                            : "Unavailable"}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="text-event-red font-semibold">
                          Rs. {group.price}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Decorators Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Decorations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.decorators.map((decoration) => (
                  <div
                    key={decoration._id}
                    className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all ${
                      formData.selectedServices.decorators.includes(
                        decoration._id
                      )
                        ? "ring-2 ring-event-red"
                        : "hover:shadow-lg"
                    }`}
                    onClick={() =>
                      handleMultipleSelect(
                        "selectedServices.decorators",
                        decoration._id
                      )
                    }
                  >
                    <div className="relative h-48">
                      <img
                        src={`http://localhost:5000/${decoration.images[0]}`}
                        alt={decoration.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/150";
                        }}
                      />
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          ⭐ {decoration.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {decoration.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {decoration.description}
                      </p>
                      <p className="text-sm text-gray-600">
                        Type: {decoration.type}
                      </p>
                      <p className="text-sm text-gray-600">
                        Theme: {decoration.theme}
                      </p>
                      <div className="mt-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            decoration.availability.isAvailable
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {decoration.availability.isAvailable
                            ? "Available"
                            : "Unavailable"}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="text-event-red font-semibold">
                          Rs. {decoration.pricePerDay}/day
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Review & Confirm</h2>
            {/* Existing review content */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-medium mb-2">Total Cost</h4>
              <div className="text-xl font-semibold text-event-red">
                Rs. {calculateTotalCost()}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <h2 className="text-4xl font-bold text-gray-800 text-center ">
        Plan Your  Event
      </h2>
      <div className="w-[95vw] p-4 bg-white rounded-lg  font-Mainfront mt-2 mb-10">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-event-red bg-red-200">
                  Step {currentStep} of 5
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-event-red">
                  {calculateProgress()}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-red-200">
              <div
                style={{ width: `${calculateProgress()}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-event-red transition-all duration-500"
              ></div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md font-semibold hover:bg-gray-50"
            >
              Previous
            </button>
          )}
          {currentStep < 5 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed()}
              className={`bg-event-red text-white px-6 py-2 rounded-md font-semibold ${
                !canProceed()
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-red-700"
              }`}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-event-red hover:bg-red-700 text-white px-6 py-2 rounded-md font-semibold"
            >
              {isLoading ? "Planning..." : "Plan Event"}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default PlanEventForm;
