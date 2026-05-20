import { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import customFetch from "@/utils/customFetch";
import Table from "@/components/Table/Table";
import Modal from "@/components/UI/Modal";
import axios from "axios";
import { BounceLoader } from "react-spinners";
import { generatePDF } from "@/utils/pdfGenerator";

interface Staff {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  experience: number;
  salary: number;
  ratings: number;
  availability: boolean;
}

const Users = () => {
  const [users, setUsers] = useState<{ staffList: Staff[] }>({ staffList: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Staff | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState<Staff>({
    _id: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    experience: 0,
    salary: 0,
    availability: true,
    role: "Other",
    ratings: 0,
  });
  const [editFormData, setEditFormData] = useState({
    _id: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    experience: 0,
    salary: 0,
    availability: true,
    role: "user",
  });
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const columns = [
    { header: "Name", accessor: "fullName" },
    { header: "Email", accessor: "email" },
    { header: "Phone", accessor: "phoneNumber" },
    { header: "Experience", accessor: "experience" },
    { header: "Salary", accessor: "salary" },
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
      header: "Role",
      accessor: "role",
      cell: (value: string) => (
        <span className="capitalize px-2 py-1 text-xs rounded-full bg-gray-100">
          {value}
        </span>
      ),
    },
  ];

  // fetch staff
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data } = await customFetch.get("/admin/staf"); 
      setUsers(data || { staffList: [] });
      console.log(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user: Staff) => {
    setSelectedUser(user);
    setEditFormData(user);
    setIsEditModalOpen(true);
  };

  const handleDelete = (user: Staff) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // edit staff members
  const handleEditSubmit = async () => {
    if (!selectedUser || !editFormData) return;

    try {
      await customFetch.patch(`/admin/staf/${selectedUser._id}`, editFormData);
      toast.success("User updated successfully");
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    }
  };

  // delete staff member
  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    try {
      await customFetch.delete(`/admin/staf/${selectedUser._id}`);
      toast.success("User deleted successfully");
      setIsDeleteModalOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to delete user");
      console.log(error);
    }
  };

  // add staff memebr
  const handleAddUser = async () => {
    console.log("Adding new user with data:", addFormData);

    if (!addFormData.fullName || !addFormData.email || !addFormData.phoneNumber) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = {
      fullName: addFormData.fullName,
      email: addFormData.email,
      phoneNumber: addFormData.phoneNumber,
      role: addFormData.role,
      experience: addFormData.experience,
      salary: addFormData.salary,
      availability: addFormData.availability,
      ratings: addFormData.ratings,
    };

    try {
      const response = await customFetch.post("/admin/staf", payload);
      console.log("Response:", response.data);
      toast.success("User added successfully");
      setIsAddModalOpen(false);
      setAddFormData({
        _id: "",
        fullName: "",
        email: "",
        phoneNumber: "",
        experience: 0,
        salary: 0,
        availability: true,
        role: "Other",
        ratings: 0,
      });
      fetchUsers();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.msg || "Failed to add user";
        console.error("Error details:", error.response.data);
        toast.error(errorMessage);
      } else {
        console.error("Unexpected error:", error);
        toast.error("An unexpected error occurred");
      }
    }
  };

  //handle pdf function
  const handleExportPDF = () => {
    const pdfColumns = [
      { header: "Name", dataKey: "fullName" as const },
      { header: "Email", dataKey: "email" as const },
      { header: "Phone", dataKey: "phoneNumber" as const },
      { header: "Role", dataKey: "role" as const },
      { header: "Experience (Years)", dataKey: "experienceText" as const },
      { header: "Salary", dataKey: "salaryText" as const },
      { header: "Ratings", dataKey: "ratingsText" as const },
      { header: "Availability", dataKey: "availabilityText" as const },
    ];

    const formattedData = filteredStaff.map((staff) => ({
      fullName: staff.fullName,
      email: staff.email,
      phoneNumber: staff.phoneNumber,
      role: staff.role,
      experienceText: `${staff.experience} years`,
      salaryText: `Rs. ${staff.salary.toLocaleString()}`,
      ratingsText: `${staff.ratings.toFixed(1)}/5`,
      availabilityText: staff.availability ? "Available" : "Not Available",
    }));

    generatePDF({
      title: "Staff Report",
      data: formattedData,
      filename: `staff-report-${new Date().toISOString().split("T")[0]}.pdf`,
      columns: pdfColumns,
    });
  };

  const filteredStaff = users.staffList.filter((user) => {
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
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
          + Add Staff Member
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
            <span className="text-sm text-gray-600">Filter by Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border rounded-md focus:border-event-red focus:ring-1 focus:ring-event-red"
            >
              <option value="all">All Roles</option>
              <option value="Event Manager">Event Manager</option>
              <option value="Photography Information Manager">Photography Information Manager</option>
              <option value="Event Organizer">Event Organizer</option>
              <option value="Financial Officer">Financial Officer</option>
              <option value="Entertainment Manager">Entertainment Manager</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredStaff} // Use filteredStaff instead of inline filter
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Staff"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={editFormData?.fullName}
              onChange={(e) =>
                setEditFormData({ ...editFormData!, fullName: e.target.value })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={editFormData?.phoneNumber}
              onChange={(e) =>
                setEditFormData({ ...editFormData!, phoneNumber: e.target.value })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={editFormData?.email}
              onChange={(e) =>
                setEditFormData({ ...editFormData!, email: e.target.value })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Salary
            </label>
            <input
              type="number"
              value={editFormData?.salary}
              onChange={(e) =>
                setEditFormData({ ...editFormData!, salary: Number(e.target.value) })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience
            </label>
            <input
              type="number"
              value={editFormData?.experience}
              onChange={(e) =>
                setEditFormData({ ...editFormData!, experience: Number(e.target.value) })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={editFormData?.role}
              onChange={(e) =>
                setEditFormData({ ...editFormData!, role: e.target.value })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
            >
              <option value="Event Manager">Event Manager</option>
              <option value="Photography Information Manager">Photography Information Manager</option>
              <option value="Event Organizer">Event Organizer</option>
              <option value="Financial Officer">Financial Officer</option>
              <option value="Entertainment Manager">Entertainment Manager</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="availability"
                value="true"
                checked={editFormData?.availability === true}
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
                checked={editFormData?.availability === false}
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
        title="Delete User"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this user? This action cannot be undone.
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

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New User"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={addFormData.fullName}
              onChange={(e) =>
                setAddFormData({ ...addFormData, fullName: e.target.value })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={addFormData.email}
              onChange={(e) =>
                setAddFormData({ ...addFormData, email: e.target.value })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={addFormData.phoneNumber}
              onChange={(e) =>
                setAddFormData({ ...addFormData, phoneNumber: e.target.value })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Salary
            </label>
            <input
              type="number"
              value={addFormData.salary}
              onChange={(e) =>
                setAddFormData({ ...addFormData, salary: Number(e.target.value) })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience
            </label>
            <input
              type="number"
              value={addFormData.experience}
              onChange={(e) =>
                setAddFormData({ ...addFormData, experience: Number(e.target.value) })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ratings
            </label>
            <input
              type="number"
              value={addFormData.ratings}
              onChange={(e) =>
                setAddFormData({ ...addFormData, ratings: Number(e.target.value) })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={addFormData.role}
              onChange={(e) =>
                setAddFormData({ ...addFormData, role: e.target.value })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
            >
              <option value="Event Manager">Event Manager</option>
              <option value="Photography Information Manager">Photography Information Manager</option>
              <option value="Event Organizer">Event Organizer</option>
              <option value="Financial Officer">Financial Officer</option>
              <option value="Entertainment Manager">Entertainment Manager</option>
              <option value="Other">Other</option>
            </select>
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
              onClick={handleAddUser}
              className="px-4 py-2 bg-event-red text-white rounded-md hover:bg-red-700"
            >
              Add User
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Users;