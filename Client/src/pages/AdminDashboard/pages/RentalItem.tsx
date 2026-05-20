import { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import customFetch from "@/utils/customFetch";
import Table from "@/components/Table/Table";
import Modal from "@/components/UI/Modal";
import axios from "axios";
import { BounceLoader } from "react-spinners";
import { generatePDF } from "@/utils/pdfGenerator";

interface RentalItem {
  _id: string;
  name: string;
  description: string;
  category: string;
  rentalPrice: number;
  duration: number;
  rentalStartDate: string;
  availability: boolean;
  isExpired: boolean;
  [key: string]: string | number | boolean | null | undefined;
}

const RentalItems = () => {
  const [rentalItems, setRentalItems] = useState<RentalItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RentalItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: "",
    description: "",
    category: "Equipment",
    rentalPrice: 0,
    duration: 1,
    rentalStartDate: "",
    availability: true,
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    category: "Equipment",
    rentalPrice: 0,
    duration: 1,
    rentalStartDate: "",
    availability: true,
  });
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Description", accessor: "description" },
    { header: "Category", accessor: "category" },
    {
      header: "Price",
      accessor: "rentalPrice",
      cell: (value: number) => <span>Rs. {value.toLocaleString()}</span>,
    },
    {
      header: "Duration (Days)",
      accessor: "duration",
      cell: (value: number) => <span>{value.toLocaleString()} Day{value !== 1 ? "s" : ""}</span>,
    },
    {
      header: "Start Date",
      accessor: "rentalStartDate",
      cell: (value: string) => <span>{new Date(value).toLocaleDateString()}</span>,
    },
    {
      header: "Availability",
      accessor: "availability",
      cell: (value: boolean) => (
        <span className={value ? "text-green-600" : "text-red-600"}>
          {value ? "Available" : "Unavailable"}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "isExpired",
      cell: (value: boolean) => (
        <span className={value ? "text-red-600" : "text-green-600"}>
          {value ? "Expired" : "Active"}
        </span>
      ),
    },
  ];

  // Fetch rental items
  const fetchRentalItems = async () => {
    setIsLoading(true);
    try {
      const { data } = await customFetch.get("/rent");
      setRentalItems(data.rentalItems || []);
    } catch (error) {
      console.error("Error fetching rental items:", error);
      toast.error("Failed to fetch rental items");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRentalItems();
  }, []);

  const handleEdit = (item: RentalItem) => {
    setSelectedItem(item);
    setEditFormData({
      name: item.name,
      description: item.description || "",
      category: item.category,
      rentalPrice: item.rentalPrice,
      duration: item.duration,
      rentalStartDate: item.rentalStartDate.split("T")[0], // Format for input[type="date"]
      availability: item.availability,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (item: RentalItem) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  // Edit rental item
  const handleEditSubmit = async () => {
    if (!selectedItem || !editFormData) return;

    try {
      await customFetch.patch(`/rent/${selectedItem._id}`, editFormData);
      toast.success("Rental item updated successfully");
      setIsEditModalOpen(false);
      fetchRentalItems();
    } catch (error) {
      console.error("Error updating rental item:", error);
      toast.error("Failed to update rental item");
    }
  };

  // Delete rental item
  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;

    try {
      await customFetch.delete(`/rent/${selectedItem._id}`);
      toast.success("Rental item deleted successfully");
      setIsDeleteModalOpen(false);
      fetchRentalItems();
    } catch (error) {
      toast.error("Failed to delete rental item");
      console.log(error);
    }
  };

  // Add rental item
  const handleAddRentalItem = async () => {
    if (!addFormData.name || !addFormData.rentalPrice || !addFormData.duration || !addFormData.rentalStartDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const response = await customFetch.post("/rent", addFormData);
      console.log("Response:", response.data);
      toast.success("Rental item added successfully");
      setIsAddModalOpen(false);
      setAddFormData({
        name: "",
        description: "",
        category: "Equipment",
        rentalPrice: 0,
        duration: 1,
        rentalStartDate: "",
        availability: true,
      });
      fetchRentalItems();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.msg || "Failed to add rental item";
        console.error("Error details:", error.response.data);
        toast.error(errorMessage);
      } else {
        console.error("Unexpected error:", error);
        toast.error("An unexpected error occurred");
      }
    }
  };

  // Handle PDF export
  const handleExportPDF = () => {
    const pdfColumns = [
      { header: "Name", dataKey: "name" as const },
      { header: "Description", dataKey: "description" as const },
      { header: "Category", dataKey: "category" as const },
      { header: "Price", dataKey: "rentalPriceText" as const },
      { header: "Duration (Days)", dataKey: "duration" as const },
      { header: "Start Date", dataKey: "rentalStartDateText" as const },
      { header: "Availability", dataKey: "availabilityText" as const },
      { header: "Status", dataKey: "statusText" as const },
    ];

    const formattedData = filteredItems.map((item) => ({
      name: item.name,
      description: item.description || "N/A",
      category: item.category,
      rentalPriceText: `Rs. ${item.rentalPrice.toLocaleString()}`,
      duration: item.duration,
      rentalStartDateText: new Date(item.rentalStartDate).toLocaleDateString(),
      availabilityText: item.availability ? "Available" : "Not Available",
      statusText: item.isExpired ? "Expired" : "Active",
    }));

    generatePDF({
      title: "Rental Items Report",
      data: formattedData,
      filename: `rental-items-report-${new Date().toISOString().split("T")[0]}.pdf`,
      columns: pdfColumns,
    });
  };

  // Filter rental items by category and search term
  const filteredItems = rentalItems.filter((item) => {
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-event-red hover:bg-red-700 text-white px-4 py-2 rounded-md"
        >
          + Add Rental Item
        </button>
        <button
          onClick={handleExportPDF}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Export PDF
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Search:</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter name..."
              className="px-4 py-2 border rounded-md focus:border-event-red focus:ring-1 focus:ring-event-red"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Filter by Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border rounded-md focus:border-event-red focus:ring-1 focus:ring-event-red"
            >
              <option value="all">All Categories</option>
              <option value="Equipment">Equipment</option>
              <option value="Furniture">Furniture</option>
              <option value="Decor">Decor</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredItems}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Rental Item"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={editFormData.description}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              maxLength={200}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={editFormData.category}
              onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
            >
              <option value="Equipment">Equipment</option>
              <option value="Furniture">Furniture</option>
              <option value="Decor">Decor</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rental Price (Rs.)</label>
            <input
              type="number"
              value={editFormData.rentalPrice}
              onChange={(e) => setEditFormData({ ...editFormData, rentalPrice: Number(e.target.value) })}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Days)</label>
            <input
              type="number"
              value={editFormData.duration}
              onChange={(e) => setEditFormData({ ...editFormData, duration: Number(e.target.value) })}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={editFormData.rentalStartDate}
              onChange={(e) => setEditFormData({ ...editFormData, rentalStartDate: e.target.value })}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
            />
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="availability"
                value="true"
                checked={editFormData.availability === true}
                onChange={() => setEditFormData({ ...editFormData, availability: true })}
                className="h-4 w-4 text-blue-600"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Available</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="availability"
                value="false"
                checked={editFormData.availability === false}
                onChange={() => setEditFormData({ ...editFormData, availability: false })}
                className="h-4 w-4 text-red-600"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Unavailable</span>
            </label>
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleEditSubmit}
              className="px-4 py-2 bg-event-red text-white rounded-md hover:bg-red-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Rental Item"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this rental item? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Rental Item Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Rental Item"
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
              maxLength={200}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={addFormData.category}
              onChange={(e) => setAddFormData({ ...addFormData, category: e.target.value })}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
            >
              <option value="Equipment">Equipment</option>
              <option value="Furniture">Furniture</option>
              <option value="Decor">Decor</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rental Price (Rs.)</label>
            <input
              type="number"
              value={addFormData.rentalPrice}
              onChange={(e) => setAddFormData({ ...addFormData, rentalPrice: Number(e.target.value) })}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              min="0"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Days)</label>
            <input
              type="number"
              value={addFormData.duration}
              onChange={(e) => setAddFormData({ ...addFormData, duration: Number(e.target.value) })}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              min="1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={addFormData.rentalStartDate}
              onChange={(e) => setAddFormData({ ...addFormData, rentalStartDate: e.target.value })}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              required
            />
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="availability"
                value="true"
                checked={addFormData.availability === true}
                onChange={() => setAddFormData({ ...addFormData, availability: true })}
                className="h-4 w-4 text-blue-600"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Available</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="availability"
                value="false"
                checked={addFormData.availability === false}
                onChange={() => setAddFormData({ ...addFormData, availability: false })}
                className="h-4 w-4 text-red-600"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Unavailable</span>
            </label>
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddRentalItem}
              className="px-4 py-2 bg-event-red text-white rounded-md hover:bg-red-700"
            >
              Add Rental Item
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RentalItems;