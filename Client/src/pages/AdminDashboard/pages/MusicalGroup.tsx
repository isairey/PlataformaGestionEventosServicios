import { useState, useEffect } from "react"; 
import { toast, Toaster } from "react-hot-toast";
import customFetch from "@/utils/customFetch";
import { BounceLoader } from "react-spinners";
import Modal from "@/components/UI/Modal";
import axios from "axios";
import { generatePDF } from "@/utils/pdfGenerator";

// MusicalGroup interface
interface MusicalGroup {
  _id: string;
  name: string;
  description: string;
  genre: string;
  price: number;
  members: string[];
  contactEmail: string;
  contactPhone: string;
  availableForEvents: boolean;
  rating: number;
  image: string;
  [key: string]: string | number | boolean | null | undefined | string[];
}

const MusicalGroups = () => {
  const [musicalGroups, setMusicalGroups] = useState<MusicalGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: "",
    description: "",
    genre: "Rock",
    price: "",
    members: "",
    contactEmail: "",
    contactPhone: "",
    availableForEvents: true,
    rating: "0",
    image: null as File | null,
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<MusicalGroup | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    genre: "Rock",
    price: "",
    members: [] as string[],
    contactEmail: "",
    contactPhone: "",
    availableForEvents: true,
    rating: "0",
    image: null as File | null,
  });
  const [priceFilter, setPriceFilter] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("name");

  // Fetch Musical Groups
  const fetchMusicalGroups = async () => {
    setIsLoading(true);
    try {
      const { data } = await customFetch.get("/musical-group");
      setMusicalGroups(data.musicalGroups); 
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.msg || "Failed to fetch musical groups";
        toast.error(errorMessage);
        console.error("Fetch error:", error.response?.data);
      } else {
        toast.error("An unexpected error occurred");
        console.error("Fetch error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMusicalGroups();
  }, []); 

  // Add Musical Group
  const handleAddMusicalGroup = async () => {
    try {
      const formData = new FormData();
      formData.append("name", addFormData.name);
      formData.append("description", addFormData.description);
      formData.append("genre", addFormData.genre);
      formData.append("price", addFormData.price.toString());
      formData.append("contactEmail", addFormData.contactEmail);
      formData.append("contactPhone", addFormData.contactPhone);
      formData.append("availableForEvents", addFormData.availableForEvents.toString());
      formData.append("rating", addFormData.rating.toString());

      const membersArray = addFormData.members.split(",").map((m) => m.trim());
      membersArray.forEach((member) => formData.append("members", member));

      if (addFormData.image) {
        formData.append("image", addFormData.image, addFormData.image.name);
      }

      await customFetch.post("/musical-group", formData);
      toast.success("Musical group added successfully");
      setIsAddModalOpen(false);
      setAddFormData({
        name: "",
        description: "",
        genre: "Rock",
        price: "",
        members: "",
        contactEmail: "",
        contactPhone: "",
        availableForEvents: true,
        rating: "0",
        image: null,
      });
      fetchMusicalGroups();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.msg || "Failed to add musical group";
        toast.error(errorMessage);
        console.error("Add error:", error.response?.data);
      } else {
        toast.error("An unexpected error occurred");
        console.error("Add error:", error);
      }
    }
  };

  // Delete Musical Group
  const handleDeleteMusicalGroup = async () => {
    if (!selectedGroup) return;

    try {
      await customFetch.delete(`/musical-group/${selectedGroup._id}`);
      toast.success("Musical group deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedGroup(null);
      fetchMusicalGroups();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.msg || "Failed to delete musical group";
        toast.error(errorMessage);
        console.error("Delete error:", error.response?.data);
      } else {
        toast.error("An unexpected error occurred");
        console.error("Delete error:", error);
      }
    }
  };

  // Edit Musical Group
  const handleEditMusicalGroup = async () => {
    if (!selectedGroup) return;

    try {
      const formData = new FormData();
      formData.append("name", editFormData.name);
      formData.append("description", editFormData.description);
      formData.append("genre", editFormData.genre);
      formData.append("price", editFormData.price.toString());
      formData.append("contactEmail", editFormData.contactEmail);
      formData.append("contactPhone", editFormData.contactPhone);
      formData.append("availableForEvents", editFormData.availableForEvents.toString());
      formData.append("rating", editFormData.rating.toString());

      editFormData.members.forEach((member) => formData.append("members", member));

      if (editFormData.image) {
        formData.append("image", editFormData.image, editFormData.image.name);
      }

      await customFetch.patch(`/musical-group/${selectedGroup._id}`, formData);
      toast.success("Musical group updated successfully");
      setIsEditModalOpen(false);
      setSelectedGroup(null);
      fetchMusicalGroups();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.msg || "Failed to update musical group";
        toast.error(errorMessage);
        console.error("Edit error:", error.response?.data);
      } else {
        toast.error("An unexpected error occurred");
        console.error("Edit error:", error);
      }
    }
  };

  // Export PDF
  const handleExportPDF = () => {
    const pdfColumns = [
      { header: "Name", dataKey: "name" as const },
      { header: "Genre", dataKey: "genre" as const },
      { header: "Price (Rs.)", dataKey: "priceText" as const },
      { header: "Email", dataKey: "contactEmail" as const },
      { header: "Phone", dataKey: "contactPhone" as const },
      { header: "Members", dataKey: "membersText" as const },
    ];

    const formattedData = musicalGroups.map((group) => ({
      name: group.name,
      genre: group.genre,
      priceText: `${group.price.toLocaleString()}`,
      contactEmail: group.contactEmail,
      contactPhone: group.contactPhone,
      membersText: group.members.join(", "),
      ratingText: `${group.rating}/5`,
      availabilityText: group.availableForEvents ? "Available" : "Not Available",
    }));

    generatePDF({
      title: "Musical Groups Report",
      data: formattedData,
      filename: `musical-groups-${new Date().toISOString().split("T")[0]}.pdf`,
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
        <h2 className="text-2xl font-semibold text-gray-800">Musical Groups List</h2>
        <div className="flex gap-4">
          <button
              onClick={handleExportPDF}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
              Export PDF
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-event-red hover:bg-red-700 text-white px-4 py-2 rounded-md"
          >
            Add New Group
          </button>
        </div>
      </div>

      {/* Grid - Filters and Sorting */}
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Price Range:</span>
          <input
            type="number"
            placeholder="Min"
            value={priceFilter.min}
            onChange={(e) => setPriceFilter({ ...priceFilter, min: e.target.value })}
            className="w-24 px-2 py-1 border rounded-md"
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Max"
            value={priceFilter.max}
            onChange={(e) => setPriceFilter({ ...priceFilter, max: e.target.value })}
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

      {/* Musical Groups Grid - Display music group*/}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {musicalGroups.length === 0 ? (
          <p className="text-gray-600">No musical groups found.</p>
        ) : (
          musicalGroups
            .filter((group) => {
              if (priceFilter.min && group.price < Number(priceFilter.min)) {
                return false;
              }
              if (priceFilter.max && group.price > Number(priceFilter.max)) {
                return false;
              }
              return true;
            })
            .sort((a, b) => {
              switch (sortBy) {
                case "priceLowToHigh":
                  return a.price - b.price;
                case "priceHighToLow":
                  return b.price - a.price;
                default:
                  return a.name.localeCompare(b.name);
              }
            })
            .map((group) => (
              <div
                key={group._id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <img
                  src={`http://localhost:5000/${group.image}`}
                  alt={group.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => (e.currentTarget.src = "/default-band-image.png")} 
                />
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{group.name}</h3>
                    <div className="text-right">
                      <span className="text-event-red font-semibold">Rs. {group.price}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{group.description}</p>

                  <div className="text-sm text-gray-500 mb-2">
                    <span className="font-medium">Genre: </span>{group.genre}
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    <span className="font-medium">Members: </span>{group.members.join(", ")}
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    <span className="font-medium">Contact: </span>{group.contactEmail} | {group.contactPhone}
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    <span className="font-medium">Rating: </span>{group.rating}/5
                  </div>

                  <div className="mt-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        group.availableForEvents
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {group.availableForEvents ? "Available" : "Not Available"}
                    </span>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setSelectedGroup(group);
                        setEditFormData({
                          name: group.name,
                          description: group.description,
                          genre: group.genre,
                          price: group.price.toString(),
                          members: group.members,
                          contactEmail: group.contactEmail,
                          contactPhone: group.contactPhone,
                          availableForEvents: group.availableForEvents,
                          rating: group.rating.toString(),
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
                        setSelectedGroup(group);
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Musical Group"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={addFormData.name}
              onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={addFormData.description}
              onChange={(e) => setAddFormData({ ...addFormData, description: e.target.value })}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
            <input
              type="text"
              value={addFormData.genre}
              onChange={(e) => setAddFormData({ ...addFormData, genre: e.target.value })}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price (Rs.)</label>
            <input
              type="number"
              value={addFormData.price}
              onChange={(e) => setAddFormData({ ...addFormData, price: e.target.value })}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Members</label>
            <input
              type="text"
              value={addFormData.members}
              onChange={(e) => setAddFormData({ ...addFormData, members: e.target.value })}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              placeholder="Enter members separated by commas (e.g., John, Jane)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
            <input
              type="email"
              value={addFormData.contactEmail}
              onChange={(e) => setAddFormData({ ...addFormData, contactEmail: e.target.value })}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
            <input
              type="text"
              value={addFormData.contactPhone}
              onChange={(e) => setAddFormData({ ...addFormData, contactPhone: e.target.value })}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              placeholder="1234567890"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating (0-5)</label>
            <input
              type="number"
              value={addFormData.rating}
              onChange={(e) => setAddFormData({ ...addFormData, rating: e.target.value })}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              min="0"
              max="5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
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
              checked={addFormData.availableForEvents}
              onChange={(e) => setAddFormData({ ...addFormData, availableForEvents: e.target.checked })}
              className="rounded border-gray-300 text-event-red focus:ring-event-red"
            />
            <label className="text-sm text-gray-700">Available for Events</label>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddMusicalGroup}
              className="px-4 py-2 bg-event-red text-white rounded-md hover:bg-red-700"
            >
              Add Group
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedGroup(null);
        }}
        title="Delete Musical Group"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete "{selectedGroup?.name}"? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedGroup(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteMusicalGroup}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedGroup(null);
        }}
        title="Edit Musical Group"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={editFormData.description}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
            <input
              type="text"
              value={editFormData.genre}
              onChange={(e) => setEditFormData({ ...editFormData, genre: e.target.value })}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price (Rs.)</label>
            <input
              type="number"
              value={editFormData.price}
              onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Members</label>
            <input
              type="text"
              value={editFormData.members.join(", ")}
              onChange={(e) => {
                const membersArray = e.target.value.split(",").map((m) => m.trim()).filter((m) => m !== "");
                setEditFormData({ ...editFormData, members: membersArray });
              }}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              placeholder="Enter members separated by commas (e.g., John, Jane)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
            <input
              type="email"
              value={editFormData.contactEmail}
              onChange={(e) => setEditFormData({ ...editFormData, contactEmail: e.target.value })}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
            <input
              type="text"
              value={editFormData.contactPhone}
              onChange={(e) => setEditFormData({ ...editFormData, contactPhone: e.target.value })}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              placeholder="1234567890"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating (0-5)</label>
            <input
              type="number"
              value={editFormData.rating}
              onChange={(e) => setEditFormData({ ...editFormData, rating: e.target.value })}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              min="0"
              max="5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setEditFormData({ ...editFormData, image: e.target.files[0] });
                }
              }}
              className="w-full"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={editFormData.availableForEvents}
              onChange={(e) => setEditFormData({ ...editFormData, availableForEvents: e.target.checked })}
              className="rounded border-gray-300 text-event-red focus:ring-event-red"
            />
            <label className="text-sm text-gray-700">Available for Events</label>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedGroup(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleEditMusicalGroup}
              className="px-4 py-2 bg-event-red text-white rounded-md hover:bg-red-700"
            >
              Update Group
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MusicalGroups;