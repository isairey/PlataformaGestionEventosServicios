import { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import customFetch from "@/utils/customFetch";
import { BounceLoader } from "react-spinners";
import Modal from "@/components/UI/Modal";
import axios from "axios";
import { generatePDF } from "@/utils/pdfGenerator";

interface EventPackage {
  _id: string;
  name: string;
  description: string;
  type: string;
  pricePerPerson: number;
  minimumGuests: number;
  maximumGuests: number;
  menuItems: string[];
  services: string[];
  features: string[];
  image: string;
  isAvailable: boolean;
}

interface MenuItem {
  _id: string;
  name: string;
  pricePerPlate: number;
}
const EVENT_TYPES = [
  "Wedding",
  "Birthday",
  "Corporate",
  "Anniversary",
  "Graduation",
  "Other",
] as const;

const EventPackages = () => {
  const [packages, setPackages] = useState<EventPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<EventPackage | null>(
    null
  );

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "Wedding",
    pricePerPerson: "",
    minimumGuests: "",
    maximumGuests: "",
    menuItems: [] as string[],
    services: [] as string[],
    features: [] as string[],
    isAvailable: true,
    image: null as File | null,
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      const url =
        selectedType === "all"
          ? "/event-packages"
          : `/event-packages/type/${selectedType}`;

      const { data } = await customFetch.get(url);
      setPackages(data.eventPackages);
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast.error("Failed to fetch packages");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const { data } = await customFetch.get("/menu-items");
      setMenuItems(data.menuItems);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      toast.error("Failed to fetch menu items");
    }
  };

  useEffect(() => {
    fetchPackages();
    fetchMenuItems();
  }, [selectedType]);

  // Add Package
  const handleAddPackage = async () => {
    try {
      const formDataToSend = new FormData();

      // Add basic fields
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("type", formData.type);
      formDataToSend.append("pricePerPerson", formData.pricePerPerson);
      formDataToSend.append("minimumGuests", formData.minimumGuests);
      formDataToSend.append("maximumGuests", formData.maximumGuests);

      // Add arrays properly
      formData.menuItems.forEach((item) => {
        formDataToSend.append("menuItems[]", item);
      });

      formData.services.forEach((service) => {
        formDataToSend.append("services[]", service);
      });

      formData.features.forEach((feature) => {
        formDataToSend.append("features[]", feature);
      });

      formDataToSend.append("isAvailable", formData.isAvailable.toString());

      if (formData.image) {
        const formattedName = formData.name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");
        const fileExtension = formData.image.name.split(".").pop();
        const newFileName = `${formattedName}.${fileExtension}`;
        formDataToSend.append("image", formData.image, newFileName);
      }

      // Validate required menu items
      if (formData.menuItems.length === 0) {
        toast.error("At least one menu item is required");
        return;
      }

      await customFetch.post("/event-packages", formDataToSend);
      toast.success("Package added successfully");
      setIsAddModalOpen(false);
      resetFormData();
      fetchPackages();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.msg || "Failed to add package";
        toast.error(errorMessage);
      }
    }
  };

  // Edit Package
  const handleEditPackage = async () => {
    if (!selectedPackage) return;

    try {
      const updateData = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        pricePerPerson: Number(formData.pricePerPerson),
        minimumGuests: Number(formData.minimumGuests),
        maximumGuests: Number(formData.maximumGuests),
        menuItems: formData.menuItems,
        services: Array.isArray(formData.services)
          ? formData.services
          : (formData.services as string)
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
        features: Array.isArray(formData.features)
          ? formData.features
          : (formData.features as string)
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
        isAvailable: formData.isAvailable,
      };

      // Validate required menu items
      if (updateData.menuItems.length === 0) {
        toast.error("At least one menu item is required");
        return;
      }

      // Handle image separately if there's a new one
      if (formData.image) {
        const imageFormData = new FormData();
        imageFormData.append("image", formData.image);
        await customFetch.patch(
          `/event-packages/${selectedPackage._id}/image`,
          imageFormData
        );
      }

      await customFetch.patch(
        `/event-packages/${selectedPackage._id}`,
        updateData
      );

      toast.success("Package updated successfully");
      setIsEditModalOpen(false);
      setSelectedPackage(null);
      resetFormData();
      await fetchPackages();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update package");
    }
  };

  // Delete Package
  const handleDeletePackage = async () => {
    if (!selectedPackage) return;

    try {
      await customFetch.delete(`/event-packages/${selectedPackage._id}`);
      toast.success("Package deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedPackage(null);
      fetchPackages();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.msg || "Failed to delete package";
        toast.error(errorMessage);
      }
    }
  };

  // Reset Form Data
  const resetFormData = () => {
    setFormData({
      name: "",
      description: "",
      type: "Wedding",
      pricePerPerson: "",
      minimumGuests: "",
      maximumGuests: "",
      menuItems: [],
      services: [],
      features: [],
      isAvailable: true,
      image: null,
    });
  };

  const handleExportPDF = () => {
    const pdfColumns = [
      { header: "Name", dataKey: "name" as const },
      { header: "Type", dataKey: "type" as const },
      { header: "Price/Person", dataKey: "pricePerPerson" as const },
      { header: "Min Guests", dataKey: "minimumGuests" as const },
      { header: "Max Guests", dataKey: "maximumGuests" as const },
      { header: "Services", dataKey: "servicesText" as const },
      { header: "Features", dataKey: "featuresText" as const },
      { header: "Status", dataKey: "isAvailable" as const },
    ];

    const formattedData = packages.map((pkg) => ({
      name: pkg.name,
      type: pkg.type,
      pricePerPerson: `Rs. ${pkg.pricePerPerson}`,
      minimumGuests: pkg.minimumGuests,
      maximumGuests: pkg.maximumGuests, 
      servicesText: pkg.services.join(", "),
      featuresText: pkg.features.join(", "),
      isAvailable: pkg.isAvailable ? "Available" : "Not Available",
    }));

    generatePDF({
      title: `Event Packages Report - ${
        selectedType.charAt(0).toUpperCase() + selectedType.slice(1)
      }`,
      data: formattedData,
      filename: `event-packages-${selectedType}-${
        new Date().toISOString().split("T")[0]
      }.pdf`,
      columns: pdfColumns,
    });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 bg-opacity-20 backdrop-blur-md">
        <BounceLoader size={50} color="#EE1133" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Event Packages</h2>
        <div className="flex gap-4">
          <button
            onClick={handleExportPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Export PDF
          </button>
          <button
            onClick={() => {
              resetFormData();
              setIsAddModalOpen(true);
            }}
            className="bg-event-red hover:bg-red-700 text-white px-4 py-2 rounded-md"
          >
            Add New Package
          </button>
        </div>
      </div>

      {/* Type Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedType("all")}
            className={`px-4 py-2 rounded-full ${
              selectedType === "all"
                ? "bg-event-red text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {EVENT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-full ${
                selectedType === type
                  ? "bg-event-red text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg._id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <img
              src={`http://localhost:5000/${pkg.image}`}
              alt={pkg.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  {pkg.name}
                </h3>
                <span className="text-event-red font-semibold">
                  Rs. {pkg.pricePerPerson}
                  <div className="text-xs text-gray-500">per person</div>
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-3">{pkg.description}</p>

              <div className="mb-2">
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {pkg.type}
                </span>
              </div>

              <div className="text-sm text-gray-500 mb-2">
                <span>
                  {pkg.minimumGuests} - {pkg.maximumGuests} guests
                </span>
              </div>

              {/* Menu Items Section */}
              <div className="mb-3">
                <span className="text-sm font-medium text-gray-700">
                  Menu Items:
                </span>
                <div className="mt-1 space-y-1">
                  {pkg.menuItems.map((item: string | MenuItem) => (
                    <div
                      key={typeof item === "string" ? item : item._id}
                      className="text-sm text-gray-600 flex justify-between items-center"
                    >
                      <span>{typeof item === "string" ? item : item.name}</span>
                      <span className="text-event-red">
                        Rs. {typeof item === "string" ? "" : item.pricePerPlate}
                        /plate
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {pkg.services && pkg.services.length > 0 && (
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Services:
                  </span>
                  <p className="text-sm text-gray-600">
                    {pkg.services.join(", ")}
                  </p>
                </div>
              )}

              {pkg.features && pkg.features.length > 0 && (
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Features:
                  </span>
                  <p className="text-sm text-gray-600">
                    {pkg.features.join(", ")}
                  </p>
                </div>
              )}

              <div className="mt-3">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    pkg.isAvailable
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {pkg.isAvailable ? "Available" : "Not Available"}
                </span>
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setSelectedPackage(pkg);
                    setFormData({
                      name: pkg.name,
                      description: pkg.description,
                      type: pkg.type,
                      pricePerPerson: pkg.pricePerPerson.toString(),
                      minimumGuests: pkg.minimumGuests.toString(),
                      maximumGuests: pkg.maximumGuests.toString(),
                      menuItems: pkg.menuItems.map((item) =>
                        typeof item === "object" && item !== null
                          ? (item as MenuItem)._id
                          : item
                      ),

                      services: Array.isArray(pkg.services)
                        ? pkg.services
                        : (pkg.services as string)
                            .split(",")
                            .map((item) => item.trim())
                            .filter(Boolean),
                      features: Array.isArray(pkg.features)
                        ? pkg.features
                        : (pkg.features as string)
                            .split(",")
                            .map((item) => item.trim())
                            .filter(Boolean),
                      isAvailable: pkg.isAvailable,
                      image: null,
                    });
                    setIsEditModalOpen(true);
                  }}
                  className="text-event-red hover:text-red-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setSelectedPackage(pkg);
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

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetFormData();
        }}
        title="Add New Package"
      >
        <div className="space-y-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Type
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
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
              Price Per Person (Rs.)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                Rs.
              </span>
              <input
                type="number"
                value={formData.pricePerPerson}
                onChange={(e) =>
                  setFormData({ ...formData, pricePerPerson: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
                min="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Guests
              </label>
              <input
                type="number"
                value={formData.minimumGuests}
                onChange={(e) =>
                  setFormData({ ...formData, minimumGuests: e.target.value })
                }
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Guests
              </label>
              <input
                type="number"
                value={formData.maximumGuests}
                onChange={(e) =>
                  setFormData({ ...formData, maximumGuests: e.target.value })
                }
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
                min="1"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Menu Items (Required)
            </label>
            <select
              multiple
              value={formData.menuItems}
              onChange={(e) => {
                const selectedOptions = Array.from(
                  e.target.selectedOptions,
                  (option) => option.value
                );
                setFormData({ ...formData, menuItems: selectedOptions });
              }}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red min-h-[100px]"
              required
            >
              {menuItems.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name} - Rs. {item.pricePerPlate} per plate
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Hold Ctrl (Windows) or Command (Mac) to select multiple items
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Services
            </label>
            <input
              type="text"
              value={formData.services.join(", ")}
              onChange={(e) => {
                const servicesArray = e.target.value
                  .split(",")
                  .map((item) => item.trim())
                  .filter((item) => item !== "");
                setFormData({ ...formData, services: servicesArray });
              }}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              placeholder="e.g., Decoration, Music, Photography"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Features
            </label>
            <input
              type="text"
              value={formData.features.join(", ")}
              onChange={(e) => {
                const featuresArray = e.target.value
                  .split(",")
                  .map((item) => item.trim())
                  .filter((item) => item !== "");
                setFormData({ ...formData, features: featuresArray });
              }}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              placeholder="e.g., Free Parking, WiFi, Air Conditioning"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setFormData({ ...formData, image: e.target.files[0] });
                }
              }}
              className="w-full"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.isAvailable}
              onChange={(e) =>
                setFormData({ ...formData, isAvailable: e.target.checked })
              }
              className="rounded border-gray-300 text-event-red focus:ring-event-red"
            />
            <label className="text-sm text-gray-700">Available</label>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddPackage}
              className="px-4 py-2 bg-event-red text-white rounded-md hover:bg-red-700"
            >
              Add Package
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPackage(null);
          resetFormData();
        }}
        title="Edit Package"
      >
        <div className="space-y-4">
          {/* Basic Fields */}
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

          {/* Description */}
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

          {/* Menu Items Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Menu Items (Required)
            </label>
            <select
              multiple
              value={formData.menuItems}
              onChange={(e) => {
                const selectedOptions = Array.from(
                  e.target.selectedOptions,
                  (option) => option.value
                );
                setFormData({ ...formData, menuItems: selectedOptions });
              }}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red min-h-[100px]"
              required
            >
              {menuItems.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name} - Rs. {item.pricePerPlate} per plate
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Hold Ctrl (Windows) or Command (Mac) to select multiple items
            </p>
          </div>

          {/* Other fields... */}

          {/* Services */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Services (comma-separated)
            </label>
            <input
              type="text"
              value={formData.services.join(", ")}
              onChange={(e) => {
                const servicesArray = e.target.value
                  .split(",")
                  .map((item) => item.trim())
                  .filter((item) => item !== "");
                setFormData({ ...formData, services: servicesArray });
              }}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              placeholder="e.g., Decoration, Music, Photography"
            />
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Features (comma-separated)
            </label>
            <input
              type="text"
              value={formData.features.join(", ")}
              onChange={(e) => {
                const featuresArray = e.target.value
                  .split(",")
                  .map((item) => item.trim())
                  .filter((item) => item !== "");
                setFormData({ ...formData, features: featuresArray });
              }}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              placeholder="e.g., Free Parking, WiFi, Air Conditioning"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedPackage(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleEditPackage}
              className="px-4 py-2 bg-event-red text-white rounded-md hover:bg-red-700"
            >
              Update Package
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedPackage(null);
        }}
        title="Delete Package"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete "{selectedPackage?.name}"? This
            action cannot be undone.
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedPackage(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeletePackage}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EventPackages;
