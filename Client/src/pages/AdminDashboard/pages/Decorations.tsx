import { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import customFetch from "@/utils/customFetch";
import { BounceLoader } from "react-spinners";
import Modal from "@/components/UI/Modal";
import axios from "axios";

// Decoration interface
interface Decoration {
  _id: string;
  name: string;
  description: string;
  type: string;
  theme: string;
  items: Array<{
    name: string;
    quantity: number;
    description?: string;
  }>;
  pricePerDay: number;
  setupTime: number;
  features: string[];
  images: string[];
  colorScheme: {
    primary: string;
    secondary?: string;
    accent?: string;
  };
  dimensions: {
    minSpace: number;
    maxSpace?: number;
  };
  availability: {
    isAvailable: boolean;
    unavailableDates: Array<{
      startDate: Date;
      endDate: Date;
      reason: string;
    }>;
  };
  specialRequirements: string[];
  rating: number;
}

// event types 
const EVENT_TYPES = [
  "Wedding",
  "Birthday",
  "Corporate",
  "Anniversary",
  "Graduation",
  "Other",
] as const;

const Decorations = () => {
  const [decorations, setDecorations] = useState<Decoration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDecoration, setSelectedDecoration] =
    useState<Decoration | null>(null);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "Wedding" as (typeof EVENT_TYPES)[number],
    theme: "",
    items: [
      {
        name: "",
        quantity: 1,
        description: "",
      },
    ],
    pricePerDay: "",
    setupTime: "",
    features: "",
    colorScheme: {
      primary: "#000000",
      secondary: "",
      accent: "",
    },
    dimensions: {
      minSpace: "0",
      maxSpace: "",
    },
    specialRequirements: "",
    isAvailable: true,
    images: [] as File[],
  });

  // fetch decoration function
  const fetchDecorations = async () => {
    setIsLoading(true);
    try {
      const url =
        selectedType === "all"
          ? "/decorations"
          : `/decorations/type/${selectedType}`;

      const { data } = await customFetch.get(url);
      setDecorations(data.decorations);
    } catch (error) {
      console.error("Error fetching decorations:", error);
      toast.error("Failed to fetch decorations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDecorations();
  }, [selectedType]);

  // add decoration function
  const handleAddDecoration = async () => {
    try {
      const decorationData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        theme: formData.theme.trim(),
        items: formData.items.filter((item) => item.name.trim()),
        pricePerDay: Number(formData.pricePerDay),
        setupTime: Number(formData.setupTime),
        features: formData.features
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),
        colorScheme: formData.colorScheme,
        dimensions: {
          minSpace: formData.dimensions.minSpace,
          maxSpace: formData.dimensions.maxSpace || "0",
        },
        specialRequirements: formData.specialRequirements
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean),
        isAvailable: formData.isAvailable,
      };

      await customFetch.post("/decorations", decorationData);

      if (formData.images.length > 0) {
        const imageFormData = new FormData();
        formData.images.forEach((image) => {
          imageFormData.append("images", image);
        });
      }

      toast.success("Decoration package added successfully");
      setIsAddModalOpen(false);
      resetFormData();
      fetchDecorations();
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.msg;
        if (errorMessage) {
          toast.error(errorMessage);
        } else {
          toast.error("Failed to add decoration package");
        }
      }
    }
  };

  // edit decoration function
  const handleEditDecoration = async () => {
    if (!selectedDecoration) return;

    try {
      const decorationData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        theme: formData.theme.trim(),
        items: formData.items.filter((item) => item.name.trim()),
        pricePerDay: Number(formData.pricePerDay),
        setupTime: Number(formData.setupTime),
        features: formData.features
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),
        colorScheme: {
          primary: formData.colorScheme.primary,
          secondary: formData.colorScheme.secondary || "",
          accent: formData.colorScheme.accent || "",
        },
        dimensions: {
          minSpace: formData.dimensions.minSpace,
          maxSpace: formData.dimensions.maxSpace || "0",
        },
        specialRequirements: formData.specialRequirements
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean),
        isAvailable: formData.isAvailable,
      };

      await customFetch.patch(
        `/decorations/${selectedDecoration._id}`,
        decorationData
      );

      toast.success("Decoration package updated successfully");
      setIsEditModalOpen(false);
      setSelectedDecoration(null);
      resetFormData();
      fetchDecorations();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.msg || "Failed to update decoration package";
        toast.error(errorMessage);
      }
    }
  };

  // delete decoration function
  const handleDeleteDecoration = async () => {
    if (!selectedDecoration) return;

    try {
      await customFetch.delete(`/decorations/${selectedDecoration._id}`);
      toast.success("Decoration package deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedDecoration(null);
      fetchDecorations();
    } catch (error) {
      console.error(error);
      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.msg || "Failed to delete decoration package"
          : "Failed to delete decoration package"
      );
    }
  };

  // reset form
  const resetFormData = () => {
    setFormData({
      name: "",
      description: "",
      type: "Wedding",
      theme: "",
      items: [{ name: "", quantity: 1, description: "" }],
      pricePerDay: "",
      setupTime: "",
      features: "",
      colorScheme: {
        primary: "#000000",
        secondary: "",
        accent: "",
      },
      dimensions: {
        minSpace: "0",
        maxSpace: "",
      },
      specialRequirements: "",
      isAvailable: true,
      images: [],
    });
  };

  // filter decoration function (price range)
  const filteredDecorations = decorations
    .filter((decoration) => {
      if (priceRange.min && decoration.pricePerDay < Number(priceRange.min))
        return false;
      if (priceRange.max && decoration.pricePerDay > Number(priceRange.max))
        return false;
      return true;
    })
    .sort((a, b) => b.rating - a.rating);

  return (
    <div className="p-6">
      <Toaster position="top-center" />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Event Decorations</h1>
        <button
          onClick={() => {
            resetFormData();
            setIsAddModalOpen(true);
          }}
          className="bg-event-red hover:bg-red-700 text-white px-4 py-2 rounded-md"
        >
          Add New Decoration
        </button>
      </div>

      {/* Grid - Filters  */}
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
            <span className="text-sm text-gray-600">
              Price Range (per day):
            </span>
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
        </div>
      </div>

      {/* Grid - Display Decorations */}
      {isLoading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 bg-opacity-20 backdrop-blur-md">
          <BounceLoader size={50} color="#EE1133" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDecorations.map((decoration) => (
            <div
              key={decoration._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative h-48">
                <img
                  src={`http://localhost:5000/${decoration.images[0]}`}
                  alt={decoration.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                    ⭐ {decoration.rating.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {decoration.name}
                  </h3>
                  <span className="text-event-red font-semibold">
                    Rs. {decoration.pricePerDay}
                    <span className="text-xs text-gray-500">/day</span>
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-3">
                  {decoration.description}
                </p>

                <div className="mb-2">
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {decoration.type}
                  </span>
                  <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                    {decoration.theme}
                  </span>
                </div>

                <div className="text-sm text-gray-500 mb-2">
                  <div>Setup Time: {decoration.setupTime} hours</div>
                  <div>Min Space: {decoration.dimensions.minSpace} sq ft</div>
                </div>

                <div className="mt-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      decoration.availability.isAvailable
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {decoration.availability.isAvailable
                      ? "Available"
                      : "Not Available"}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">Colors:</span>
                    <div
                      className="w-6 h-6 rounded-full border"
                      style={{
                        backgroundColor: decoration.colorScheme.primary,
                      }}
                      title="Primary Color"
                    />
                    {decoration.colorScheme.secondary && (
                      <div
                        className="w-6 h-6 rounded-full border ml-1"
                        style={{
                          backgroundColor: decoration.colorScheme.secondary,
                        }}
                        title="Secondary Color"
                      />
                    )}
                    {decoration.colorScheme.accent && (
                      <div
                        className="w-6 h-6 rounded-full border ml-1"
                        style={{
                          backgroundColor: decoration.colorScheme.accent,
                        }}
                        title="Accent Color"
                      />
                    )}
                  </div>
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      console.log("Selected decoration:", decoration);
                      setSelectedDecoration(decoration);
                      setFormData({
                        name: decoration.name,
                        description: decoration.description,
                        type: decoration.type as (typeof EVENT_TYPES)[number],
                        theme: decoration.theme,
                        items: decoration.items.map((item) => ({
                          name: item.name,
                          quantity: item.quantity,
                          description: item.description || "",
                        })),
                        pricePerDay: decoration.pricePerDay.toString(),
                        setupTime: decoration.setupTime.toString(),
                        features: decoration.features.join(", "),
                        colorScheme: {
                          primary: decoration.colorScheme.primary,
                          secondary: decoration.colorScheme.secondary || "",
                          accent: decoration.colorScheme.accent || "",
                        },
                        dimensions: {
                          minSpace: decoration.dimensions.minSpace.toString(),
                          maxSpace:
                            decoration.dimensions.maxSpace?.toString() || "",
                        },
                        specialRequirements:
                          decoration.specialRequirements.join(", "),
                        isAvailable: decoration.availability.isAvailable,
                        images: [],
                      });
                      setIsEditModalOpen(true);
                    }}
                    className="text-sm px-3 py-1 bg-event-red text-white rounded hover:bg-red-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDecoration(decoration);
                      setIsDeleteModalOpen(true);
                    }}
                    className="text-sm px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-700"
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
        title="Add New Decoration"
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
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as (typeof EVENT_TYPES)[number],
                  })
                }
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              >
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <input
                type="text"
                value={formData.theme}
                onChange={(e) =>
                  setFormData({ ...formData, theme: e.target.value })
                }
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              />
            </div>
          </div>

          {/* Items */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Items
            </label>
            {formData.items.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Item name"
                  value={item.name}
                  onChange={(e) => {
                    const newItems = [...formData.items];
                    newItems[index].name = e.target.value;
                    setFormData({ ...formData, items: newItems });
                  }}
                  className="flex-1 px-4 py-2 rounded-md border border-gray-300"
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={item.quantity}
                  onChange={(e) => {
                    const newItems = [...formData.items];
                    newItems[index].quantity = parseInt(e.target.value);
                    setFormData({ ...formData, items: newItems });
                  }}
                  className="w-24 px-4 py-2 rounded-md border border-gray-300"
                />
                <button
                  onClick={() => {
                    const newItems = formData.items.filter(
                      (_, i) => i !== index
                    );
                    setFormData({ ...formData, items: newItems });
                  }}
                  className="px-2 py-1 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                setFormData({
                  ...formData,
                  items: [
                    ...formData.items,
                    { name: "", quantity: 1, description: "" },
                  ],
                });
              }}
              className="text-event-red hover:text-red-700 text-sm"
            >
              + Add Item
            </button>
          </div>

          {/* Pricing & Setup */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price per Day
              </label>
              <input
                type="number"
                value={formData.pricePerDay}
                onChange={(e) =>
                  setFormData({ ...formData, pricePerDay: e.target.value })
                }
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Setup Time (hours)
              </label>
              <input
                type="number"
                value={formData.setupTime}
                onChange={(e) =>
                  setFormData({ ...formData, setupTime: e.target.value })
                }
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              />
            </div>
          </div>

          {/* Features & Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Features (comma-separated)
            </label>
            <input
              type="text"
              value={formData.features}
              onChange={(e) =>
                setFormData({ ...formData, features: e.target.value })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Requirements (comma-separated)
            </label>
            <input
              type="text"
              value={formData.specialRequirements}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  specialRequirements: e.target.value,
                })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
            />
          </div>

          {/* Colors */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <input
                type="color"
                value={formData.colorScheme.primary}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    colorScheme: {
                      ...formData.colorScheme,
                      primary: e.target.value,
                    },
                  })
                }
                className="w-full h-10 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Color
              </label>
              <input
                type="color"
                value={formData.colorScheme.secondary}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    colorScheme: {
                      ...formData.colorScheme,
                      secondary: e.target.value,
                    },
                  })
                }
                className="w-full h-10 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accent Color
              </label>
              <input
                type="color"
                value={formData.colorScheme.accent}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    colorScheme: {
                      ...formData.colorScheme,
                      accent: e.target.value,
                    },
                  })
                }
                className="w-full h-10 rounded-md"
              />
            </div>
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Space (sq ft)
              </label>
              <input
                type="number"
                value={formData.dimensions.minSpace}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dimensions: {
                      ...formData.dimensions,
                      minSpace: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Space (sq ft)
              </label>
              <input
                type="number"
                value={formData.dimensions.maxSpace}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dimensions: {
                      ...formData.dimensions,
                      maxSpace: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              />
            </div>
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
              onClick={handleAddDecoration}
              className="px-4 py-2 bg-event-red text-white rounded-md hover:bg-red-700"
            >
              Add Decoration
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedDecoration(null);
          resetFormData();
        }}
        title="Edit Decoration"
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
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as (typeof EVENT_TYPES)[number],
                  })
                }
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              >
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <input
                type="text"
                value={formData.theme}
                onChange={(e) =>
                  setFormData({ ...formData, theme: e.target.value })
                }
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price per Day
              </label>
              <input
                type="number"
                value={formData.pricePerDay}
                onChange={(e) =>
                  setFormData({ ...formData, pricePerDay: e.target.value })
                }
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Setup Time (hours)
              </label>
              <input
                type="number"
                value={formData.setupTime}
                onChange={(e) =>
                  setFormData({ ...formData, setupTime: e.target.value })
                }
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Features (comma-separated)
            </label>
            <input
              type="text"
              value={formData.features}
              onChange={(e) =>
                setFormData({ ...formData, features: e.target.value })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Requirements (comma-separated)
            </label>
            <input
              type="text"
              value={formData.specialRequirements}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  specialRequirements: e.target.value,
                })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <input
                type="color"
                value={formData.colorScheme.primary}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    colorScheme: {
                      ...formData.colorScheme,
                      primary: e.target.value,
                    },
                  })
                }
                className="w-full h-10 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Color
              </label>
              <input
                type="color"
                value={formData.colorScheme.secondary}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    colorScheme: {
                      ...formData.colorScheme,
                      secondary: e.target.value,
                    },
                  })
                }
                className="w-full h-10 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accent Color
              </label>
              <input
                type="color"
                value={formData.colorScheme.accent}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    colorScheme: {
                      ...formData.colorScheme,
                      accent: e.target.value,
                    },
                  })
                }
                className="w-full h-10 rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Space (sq ft)
              </label>
              <input
                type="number"
                value={formData.dimensions.minSpace}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dimensions: {
                      ...formData.dimensions,
                      minSpace: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Space (sq ft)
              </label>
              <input
                type="number"
                value={formData.dimensions.maxSpace}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dimensions: {
                      ...formData.dimensions,
                      maxSpace: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedDecoration(null);
                resetFormData();
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleEditDecoration}
              className="px-4 py-2 bg-event-red text-white rounded-md hover:bg-red-700"
            >
              Update Decoration
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Decoration"
      >
        <p>Are you sure you want to delete this decoration?</p>
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteDecoration}
            className="px-4 py-2 bg-event-red text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Decorations;
