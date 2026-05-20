import { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import customFetch from "@/utils/customFetch";
import { BounceLoader } from "react-spinners";
import Modal from "@/components/UI/Modal";
import axios from "axios";

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  category: string;
  pricePerPlate: number;
  dietaryInfo: string[];
  ingredients: string[];
  image: string;
  isAvailable: boolean;
}

const CATEGORIES = [
  "Appetizers",
  "Main Course",
  "Desserts",
  "Beverages",
  "Snacks",
  "Salads",
] as const;

const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Halal",
  "Kosher",
  "Nut-Free",
] as const;

const MenuItems = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: "",
    description: "",
    category: "Salads",
    pricePerPlate: "",
    dietaryInfo: [] as string[],
    ingredients: "",
    isAvailable: true,
    image: null as File | null,
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    category: "Salads",
    pricePerPlate: "",
    dietaryInfo: [] as string[],
    ingredients: [] as string[],
    isAvailable: true,
    image: null as File | null,
  });
  const [priceFilter, setPriceFilter] = useState({
    min: "",
    max: "",
  });
  const [sortBy, setSortBy] = useState("name"); // 'name', 'priceLowToHigh', 'priceHighToLow'

  const categories = ["all", ...CATEGORIES];

  // Fetch Menu Items
  const fetchMenuItems = async () => {
    setIsLoading(true);
    try {
      const url =
        selectedCategory === "all"
          ? "/menu-items"
          : `/menu-items/category/${selectedCategory}`;

      const { data } = await customFetch.get(url);
      setMenuItems(data.menuItems);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      toast.error("Failed to fetch menu items");
    } finally {
      setIsLoading(false);
    }
  };

  // Add Menu Item
  const handleAddMenuItem = async () => {
    try {
      const formData = new FormData();

      // Add basic fields
      formData.append("name", addFormData.name);
      formData.append("description", addFormData.description);
      formData.append("category", addFormData.category);
      formData.append("pricePerPlate", addFormData.pricePerPlate.toString());
      formData.append("isAvailable", addFormData.isAvailable.toString());

      // Add arrays as individual items
      addFormData.dietaryInfo.forEach((item) => {
        formData.append("dietaryInfo", item);
      });

      formData.append("ingredients", addFormData.ingredients);

      // Add image with original filename if exists
      if (addFormData.image) {
        formData.append("image", addFormData.image, addFormData.image.name);
      }

      await customFetch.post("/menu-items", formData);
      toast.success("Menu item added successfully");
      setIsAddModalOpen(false);
      setAddFormData({
        name: "",
        description: "",
        category: "Salads",
        pricePerPlate: "",
        dietaryInfo: [],
        ingredients: "",
        isAvailable: true,
        image: null,
      });
      fetchMenuItems();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error);
        const errorMessage =
          error.response?.data?.msg || "Failed to add menu item";
        toast.error(errorMessage);
      }
    }
  };

  // Delete Menu Item
  const handleDeleteMenuItem = async () => {
    if (!selectedItem) return;

    try {
      await customFetch.delete(`/menu-items/${selectedItem._id}`);
      toast.success("Menu item deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedItem(null);
      fetchMenuItems();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.msg || "Failed to delete menu item";
        toast.error(errorMessage);
      }
    }
  };

  // Edit Menu Item
  const handleEditMenuItem = async () => {
    if (!selectedItem) return;

    try {
      const formData = new FormData();

      // Add basic fields
      formData.append("name", editFormData.name);
      formData.append("description", editFormData.description);
      formData.append("category", editFormData.category);
      formData.append("pricePerPlate", editFormData.pricePerPlate.toString());
      formData.append("isAvailable", editFormData.isAvailable.toString());

      // Add arrays as individual items
      editFormData.dietaryInfo.forEach((item) => {
        formData.append("dietaryInfo", item);
      });

      editFormData.ingredients.forEach((item) => {
        formData.append("ingredients", item);
      });

      await customFetch.patch(`/menu-items/${selectedItem._id}`, formData);
      toast.success("Menu item updated successfully");
      setIsEditModalOpen(false);
      setSelectedItem(null);
      fetchMenuItems();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.msg || "Failed to update menu item";
        toast.error(errorMessage);
      }
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, [selectedCategory]);

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
        <h2 className="text-2xl font-semibold text-gray-800">Menu Items</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-event-red hover:bg-red-700 text-white px-4 py-2 rounded-md"
        >
          Add New Item
        </button>
      </div>

      {/* Filter Section */}
      <div className="mb-6 space-y-4">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full ${
                selectedCategory === category
                  ? "bg-event-red text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Price Range and Sorting */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Price Range:</span>
            <input
              type="number"
              placeholder="Min"
              value={priceFilter.min}
              onChange={(e) =>
                setPriceFilter({ ...priceFilter, min: e.target.value })
              }
              className="w-24 px-2 py-1 border rounded-md"
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Max"
              value={priceFilter.max}
              onChange={(e) =>
                setPriceFilter({ ...priceFilter, max: e.target.value })
              }
              className="w-24 px-2 py-1 border rounded-md"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2 py-1 border rounded-md"
            >
              <option value="name">Name</option>
              <option value="priceLowToHigh">Price: Low to High</option>
              <option value="priceHighToLow">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems
          .filter((item) => {
            // Category filter
            if (
              selectedCategory !== "all" &&
              item.category !== selectedCategory
            ) {
              return false;
            }

            // Price range filter
            if (
              priceFilter.min &&
              item.pricePerPlate < Number(priceFilter.min)
            ) {
              return false;
            }
            if (
              priceFilter.max &&
              item.pricePerPlate > Number(priceFilter.max)
            ) {
              return false;
            }

            return true;
          })
          .sort((a, b) => {
            switch (sortBy) {
              case "priceLowToHigh":
                return a.pricePerPlate - b.pricePerPlate;
              case "priceHighToLow":
                return b.pricePerPlate - a.pricePerPlate;
              default:
                return a.name.localeCompare(b.name);
            }
          })
          .map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
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
                  <div className="text-right">
                    <span className="text-event-red font-semibold">
                      Rs. {item.pricePerPlate}
                    </span>
                    <div className="text-xs text-gray-500">per plate</div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3">{item.description}</p>

                {/* Dietary Info */}
                {item.dietaryInfo.length > 0 && (
                  <div className="mb-2">
                    <div className="flex flex-wrap gap-1">
                      {item.dietaryInfo.map((info) => (
                        <span
                          key={info}
                          className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full"
                        >
                          {info}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ingredients */}
                {item.ingredients.length > 0 && (
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Ingredients: </span>
                    {item.ingredients.join(", ")}
                  </div>
                )}

                {/* Availability Badge */}
                <div className="mt-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      item.isAvailable
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.isAvailable ? "Available" : "Not Available"}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setEditFormData({
                        name: item.name,
                        description: item.description,
                        category: item.category,
                        pricePerPlate: item.pricePerPlate.toString(),
                        dietaryInfo: item.dietaryInfo,
                        ingredients: item.ingredients,
                        isAvailable: item.isAvailable,
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
                      setSelectedItem(item);
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

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Menu Item"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={addFormData.name}
              onChange={(e) =>
                setAddFormData({ ...addFormData, name: e.target.value })
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
              value={addFormData.description}
              onChange={(e) =>
                setAddFormData({ ...addFormData, description: e.target.value })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={addFormData.category}
              onChange={(e) =>
                setAddFormData({ ...addFormData, category: e.target.value })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Per Plate (Rs.)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                Rs.
              </span>
              <input
                type="number"
                value={addFormData.pricePerPlate}
                onChange={(e) =>
                  setAddFormData({
                    ...addFormData,
                    pricePerPlate: e.target.value,
                  })
                }
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                per plate
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dietary Information
            </label>
            <div className="space-y-2">
              {DIETARY_OPTIONS.map((option) => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={addFormData.dietaryInfo.includes(option)}
                    onChange={(e) => {
                      const updatedInfo = e.target.checked
                        ? [...addFormData.dietaryInfo, option]
                        : addFormData.dietaryInfo.filter(
                            (item) => item !== option
                          );
                      setAddFormData({
                        ...addFormData,
                        dietaryInfo: updatedInfo,
                      });
                    }}
                    className="rounded border-gray-300 text-event-red focus:ring-event-red"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ingredients
            </label>
            <input
              type="text"
              value={addFormData.ingredients}
              onChange={(e) => {
                setAddFormData({
                  ...addFormData,
                  ingredients: e.target.value,
                });
              }}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              placeholder="Enter ingredients separated by commas (e.g., Chicken, Lettuce, Tomato)"
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
                  setAddFormData({ ...addFormData, image: e.target.files[0] });
                }
              }}
              className="w-full"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={addFormData.isAvailable}
              onChange={(e) =>
                setAddFormData({
                  ...addFormData,
                  isAvailable: e.target.checked,
                })
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
              onClick={handleAddMenuItem}
              className="px-4 py-2 bg-event-red text-white rounded-md hover:bg-red-700"
            >
              Add Item
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedItem(null);
        }}
        title="Delete Menu Item"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete "{selectedItem?.name}"? This action
            cannot be undone.
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedItem(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteMenuItem}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedItem(null);
        }}
        title="Edit Menu Item"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={editFormData.name}
              onChange={(e) =>
                setEditFormData({ ...editFormData, name: e.target.value })
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
              value={editFormData.description}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  description: e.target.value,
                })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={editFormData.category}
              onChange={(e) =>
                setEditFormData({ ...editFormData, category: e.target.value })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Per Plate
            </label>
            <input
              type="number"
              value={editFormData.pricePerPlate}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  pricePerPlate: e.target.value,
                })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dietary Information
            </label>
            <div className="space-y-2">
              {DIETARY_OPTIONS.map((option) => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editFormData.dietaryInfo.includes(option)}
                    onChange={(e) => {
                      const updatedInfo = e.target.checked
                        ? [...editFormData.dietaryInfo, option]
                        : editFormData.dietaryInfo.filter(
                            (item) => item !== option
                          );
                      setEditFormData({
                        ...editFormData,
                        dietaryInfo: updatedInfo,
                      });
                    }}
                    className="rounded border-gray-300 text-event-red focus:ring-event-red"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ingredients
            </label>
            <input
              type="text"
              value={editFormData.ingredients.join(", ")}
              onChange={(e) => {
                const ingredientsArray = e.target.value
                  .split(",")
                  .map((item) => item.trim())
                  .filter((item) => item !== "");
                setEditFormData({
                  ...editFormData,
                  ingredients: ingredientsArray,
                });
              }}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              placeholder="Enter ingredients separated by commas (e.g., Chicken, Lettuce, Tomato)"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={editFormData.isAvailable}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  isAvailable: e.target.checked,
                })
              }
              className="rounded border-gray-300 text-event-red focus:ring-event-red"
            />
            <label className="text-sm text-gray-700">Available</label>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedItem(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleEditMenuItem}
              className="px-4 py-2 bg-event-red text-white rounded-md hover:bg-red-700"
            >
              Update Item
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MenuItems;
