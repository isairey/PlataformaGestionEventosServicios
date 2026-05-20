import { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import customFetch from "@/utils/customFetch";
import { BounceLoader } from "react-spinners";
import Modal from "@/components/UI/Modal";
import axios from "axios";

interface Venue {
  _id: string;
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  capacity: {
    min: number;
    max: number;
  };
  pricePerHour: number;
  amenities: string[];
  facilities: string[];
  images: string[];
  availableFor: string[];
  rules: string[];
  isAvailable: boolean;
  rating: number;
}

const EVENT_TYPES = [
  "Wedding",
  "Birthday",
  "Corporate",
  "Anniversary",
  "Graduation",
  "Other",
] as const;

const EventVenues = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [capacityRange, setCapacityRange] = useState({ min: "", max: "" });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: {
      address: "",
      city: "",
      state: "",
      pincode: "",
    },
    capacity: {
      min: "",
      max: "",
    },
    pricePerHour: "",
    amenities: "",
    facilities: "",
    availableFor: [] as string[],
    rules: "",
    isAvailable: true,
    images: [] as File[],
  });

  const fetchVenues = async () => {
    setIsLoading(true);
    try {
      const url =
        selectedType === "all" ? "/venues" : `/venues/type/${selectedType}`;

      const { data } = await customFetch.get(url);
      setVenues(data.venues);
    } catch (error) {
      console.error("Error fetching venues:", error);
      toast.error("Failed to fetch venues");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, [selectedType]);

  const handleAddVenue = async () => {
    try {
      const formDataToSend = new FormData();

      // Add basic fields
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("location[address]", formData.location.address);
      formDataToSend.append("location[city]", formData.location.city);
      formDataToSend.append("location[state]", formData.location.state);
      formDataToSend.append("location[pincode]", formData.location.pincode);
      formDataToSend.append("capacity[min]", formData.capacity.min);
      formDataToSend.append("capacity[max]", formData.capacity.max);
      formDataToSend.append("pricePerHour", formData.pricePerHour);

      // Add arrays
      formData.amenities.split(",").forEach((item) => {
        formDataToSend.append("amenities[]", item.trim());
      });

      formData.facilities.split(",").forEach((item) => {
        formDataToSend.append("facilities[]", item.trim());
      });

      formData.availableFor.forEach((type) => {
        formDataToSend.append("availableFor[]", type);
      });

      formData.rules.split(",").forEach((item) => {
        formDataToSend.append("rules[]", item.trim());
      });

      formDataToSend.append("isAvailable", formData.isAvailable.toString());

      // Add images
      formData.images.forEach((image) => {
        formDataToSend.append("images", image);
      });

      await customFetch.post("/venues", formDataToSend);
      toast.success("Venue added successfully");
      setIsAddModalOpen(false);
      resetFormData();
      fetchVenues();
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.msg || "Failed to add venue";
        toast.error(errorMessage);
      }
    }
  };

  const handleEditVenue = async () => {
    if (!selectedVenue) return;

    try {
      const formDataToSend = new FormData();

      // Add basic fields
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("location[address]", formData.location.address);
      formDataToSend.append("location[city]", formData.location.city);
      formDataToSend.append("location[state]", formData.location.state);
      formDataToSend.append("location[pincode]", formData.location.pincode);
      formDataToSend.append("capacity[min]", formData.capacity.min);
      formDataToSend.append("capacity[max]", formData.capacity.max);
      formDataToSend.append("pricePerHour", formData.pricePerHour);

      // Add arrays
      formData.amenities.split(",").forEach((item) => {
        formDataToSend.append("amenities[]", item.trim());
      });

      formData.facilities.split(",").forEach((item) => {
        formDataToSend.append("facilities[]", item.trim());
      });

      formData.availableFor.forEach((type) => {
        formDataToSend.append("availableFor[]", type);
      });

      formData.rules.split(",").forEach((item) => {
        formDataToSend.append("rules[]", item.trim());
      });

      formDataToSend.append("isAvailable", formData.isAvailable.toString());

      // Add new images if any
      formData.images.forEach((image) => {
        formDataToSend.append("images", image);
      });

      await customFetch.patch(`/venues/${selectedVenue._id}`, formDataToSend);
      toast.success("Venue updated successfully");
      setIsEditModalOpen(false);
      setSelectedVenue(null);
      resetFormData();
      await fetchVenues();
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.msg || "Failed to update venue";
        toast.error(errorMessage);
      }
    }
  };

  const handleDeleteVenue = async () => {
    if (!selectedVenue) return;

    try {
      await customFetch.delete(`/venues/${selectedVenue._id}`);
      toast.success("Venue deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedVenue(null);
      fetchVenues();
    } catch (error) {
      console.error(error);
      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.msg || "Failed to delete venue"
          : "Failed to delete venue"
      );
    }
  };

  const resetFormData = () => {
    setFormData({
      name: "",
      description: "",
      location: {
        address: "",
        city: "",
        state: "",
        pincode: "",
      },
      capacity: {
        min: "",
        max: "",
      },
      pricePerHour: "",
      amenities: "",
      facilities: "",
      availableFor: [],
      rules: "",
      isAvailable: true,
      images: [],
    });
  };

  const filteredVenues = venues
    .filter((venue) => {
      if (priceRange.min && venue.pricePerHour < Number(priceRange.min))
        return false;
      if (priceRange.max && venue.pricePerHour > Number(priceRange.max))
        return false;
      if (capacityRange.min && venue.capacity.max < Number(capacityRange.min))
        return false;
      if (capacityRange.max && venue.capacity.min > Number(capacityRange.max))
        return false;
      return true;
    })
    .sort((a, b) => b.rating - a.rating);

  return (
    <div className="p-6">
      <Toaster position="top-center" />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Event Venues</h1>
        <button
          onClick={() => {
            resetFormData();
            setIsAddModalOpen(true);
          }}
          className="bg-event-red hover:bg-red-700 text-white px-4 py-2 rounded-md"
        >
          Add New Venue
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Filter by Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border rounded-md focus:border-event-red focus:ring-1 focus:ring-event-red"
            >
              <option value="all">All Types</option>
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Price Range:</span>
            <input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) =>
                setPriceRange((prev) => ({ ...prev, min: e.target.value }))
              }
              className="w-24 px-2 py-1 border rounded-md"
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) =>
                setPriceRange((prev) => ({ ...prev, max: e.target.value }))
              }
              className="w-24 px-2 py-1 border rounded-md"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Capacity Range:</span>
            <input
              type="number"
              placeholder="Min"
              value={capacityRange.min}
              onChange={(e) =>
                setCapacityRange((prev) => ({ ...prev, min: e.target.value }))
              }
              className="w-24 px-2 py-1 border rounded-md"
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Max"
              value={capacityRange.max}
              onChange={(e) =>
                setCapacityRange((prev) => ({ ...prev, max: e.target.value }))
              }
              className="w-24 px-2 py-1 border rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Venues Grid */}
      {isLoading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 bg-opacity-20 backdrop-blur-md">
          <BounceLoader size={50} color="#EE1133" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map((venue) => (
            <div
              key={venue._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative h-48">
                <img
                  src={`http://localhost:5000/${venue.images[0]}`}
                  alt={venue.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                    ⭐ {venue.rating.toFixed(1)}
                  </span>
                </div>
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

                <p className="text-gray-600 text-sm mb-3">
                  {venue.description}
                </p>

                <div className="text-sm text-gray-500 mb-2">
                  <div>{venue.location.address}</div>
                  <div>
                    {venue.location.city}, {venue.location.state}
                  </div>
                </div>

                <div className="text-sm text-gray-500 mb-2">
                  <span>
                    Capacity: {venue.capacity.min} - {venue.capacity.max} guests
                  </span>
                </div>

                <div className="mb-2 flex flex-wrap gap-1">
                  {venue.availableFor.map((type) => (
                    <span
                      key={type}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                    >
                      {type}
                    </span>
                  ))}
                </div>

                <div className="mt-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      venue.isAvailable
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {venue.isAvailable ? "Available" : "Not Available"}
                  </span>
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setSelectedVenue(venue);
                      setFormData({
                        name: venue.name,
                        description: venue.description,
                        location: {
                          address: venue.location.address,
                          city: venue.location.city,
                          state: venue.location.state,
                          pincode: venue.location.pincode,
                        },
                        capacity: {
                          min: venue.capacity.min.toString(),
                          max: venue.capacity.max.toString(),
                        },
                        pricePerHour: venue.pricePerHour.toString(),
                        amenities: venue.amenities.join(", "),
                        facilities: venue.facilities.join(", "),
                        availableFor: venue.availableFor,
                        rules: venue.rules.join(", "),
                        isAvailable: venue.isAvailable,
                        images: [],
                      });
                      setIsEditModalOpen(true);
                    }}
                    className="text-event-red hover:text-red-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedVenue(venue);
                      setIsDeleteModalOpen(true);
                    }}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetFormData();
        }}
        title="Add New Venue"
      >
        <div className="space-y-4">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              rows={3}
              required
            />
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                value={formData.location.address}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { ...formData.location, address: e.target.value },
                  })
                }
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={formData.location.city}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { ...formData.location, city: e.target.value },
                  })
                }
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input
                type="text"
                value={formData.location.state}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { ...formData.location, state: e.target.value },
                  })
                }
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pincode
              </label>
              <input
                type="text"
                value={formData.location.pincode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { ...formData.location, pincode: e.target.value },
                  })
                }
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
                required
              />
            </div>
          </div>

          {/* Capacity & Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Capacity
              </label>
              <input
                type="number"
                value={formData.capacity.min}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    capacity: { ...formData.capacity, min: e.target.value },
                  })
                }
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Capacity
              </label>
              <input
                type="number"
                value={formData.capacity.max}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    capacity: { ...formData.capacity, max: e.target.value },
                  })
                }
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price per Hour
              </label>
              <input
                type="number"
                value={formData.pricePerHour}
                onChange={(e) =>
                  setFormData({ ...formData, pricePerHour: e.target.value })
                }
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
                min="0"
                required
              />
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amenities (comma-separated)
            </label>
            <input
              type="text"
              value={formData.amenities}
              onChange={(e) =>
                setFormData({ ...formData, amenities: e.target.value })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              placeholder="e.g., Parking, WiFi, Air Conditioning"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facilities (comma-separated)
            </label>
            <input
              type="text"
              value={formData.facilities}
              onChange={(e) =>
                setFormData({ ...formData, facilities: e.target.value })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              placeholder="e.g., Stage, Sound System, Lighting"
            />
          </div>

          {/* Event Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available For
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {EVENT_TYPES.map((type) => (
                <label key={type} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.availableFor.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          availableFor: [...formData.availableFor, type],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          availableFor: formData.availableFor.filter(
                            (t) => t !== type
                          ),
                        });
                      }
                    }}
                    className="rounded border-gray-300 text-event-red focus:ring-event-red"
                  />
                  <span className="text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rules */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rules (comma-separated)
            </label>
            <input
              type="text"
              value={formData.rules}
              onChange={(e) =>
                setFormData({ ...formData, rules: e.target.value })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              placeholder="e.g., No smoking, No outside food"
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setFormData({ ...formData, images: files });
              }}
              className="w-full"
            />
          </div>

          {/* Availability */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) =>
                  setFormData({ ...formData, isAvailable: e.target.checked })
                }
                className="rounded border-gray-300 text-event-red focus:ring-event-red"
              />
              <span className="text-sm text-gray-700">
                Available for Booking
              </span>
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                resetFormData();
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddVenue}
              className="px-4 py-2 bg-event-red text-white rounded-md hover:bg-red-700"
            >
              Add Venue
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedVenue(null);
          resetFormData();
        }}
        title="Edit Venue"
      >
        <div className="space-y-4">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              rows={3}
              required
            />
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                value={formData.location.address}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { ...formData.location, address: e.target.value },
                  })
                }
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={formData.location.city}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { ...formData.location, city: e.target.value },
                  })
                }
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input
                type="text"
                value={formData.location.state}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { ...formData.location, state: e.target.value },
                  })
                }
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pincode
              </label>
              <input
                type="text"
                value={formData.location.pincode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { ...formData.location, pincode: e.target.value },
                  })
                }
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
                required
              />
            </div>
          </div>

          {/* Capacity & Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Capacity
              </label>
              <input
                type="number"
                value={formData.capacity.min}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    capacity: { ...formData.capacity, min: e.target.value },
                  })
                }
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Capacity
              </label>
              <input
                type="number"
                value={formData.capacity.max}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    capacity: { ...formData.capacity, max: e.target.value },
                  })
                }
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price per Hour
              </label>
              <input
                type="number"
                value={formData.pricePerHour}
                onChange={(e) =>
                  setFormData({ ...formData, pricePerHour: e.target.value })
                }
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
                min="0"
                required
              />
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amenities
            </label>
            <input
              type="text"
              value={formData.amenities}
              onChange={(e) =>
                setFormData({ ...formData, amenities: e.target.value })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              placeholder="e.g., Parking, WiFi, Air Conditioning"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facilities
            </label>
            <input
              type="text"
              value={formData.facilities}
              onChange={(e) =>
                setFormData({ ...formData, facilities: e.target.value })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              placeholder="e.g., Stage, Sound System, Lighting"
            />
          </div>

          {/* Event Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available For
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {EVENT_TYPES.map((type) => (
                <label key={type} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.availableFor.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          availableFor: [...formData.availableFor, type],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          availableFor: formData.availableFor.filter(
                            (t) => t !== type
                          ),
                        });
                      }
                    }}
                    className="rounded border-gray-300 text-event-red focus:ring-event-red"
                  />
                  <span className="text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rules */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rules
            </label>
            <input
              type="text"
              value={formData.rules}
              onChange={(e) =>
                setFormData({ ...formData, rules: e.target.value })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              placeholder="e.g., No smoking, No outside food"
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setFormData({ ...formData, images: files });
              }}
              className="w-full"
            />
          </div>

          {/* Availability */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) =>
                  setFormData({ ...formData, isAvailable: e.target.checked })
                }
                className="rounded border-gray-300 text-event-red focus:ring-event-red"
              />
              <span className="text-sm text-gray-700">
                Available for Booking
              </span>
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedVenue(null);
                resetFormData();
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleEditVenue}
              className="px-4 py-2 bg-event-red text-white rounded-md hover:bg-red-700"
            >
              Update Venue
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedVenue(null);
        }}
        title="Delete Venue"
      >
        <p>Are you sure you want to delete this venue?</p>
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteVenue}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default EventVenues;
