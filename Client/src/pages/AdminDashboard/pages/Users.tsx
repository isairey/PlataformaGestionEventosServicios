import { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import customFetch from "@/utils/customFetch";
import Table from "@/components/Table/Table";
import Modal from "@/components/UI/Modal";
import axios from "axios";
import { BounceLoader } from "react-spinners";
import { generatePDF } from "@/utils/pdfGenerator";

interface User {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  location: string;
  role: string;
  [key: string]: string | number | boolean | null | undefined;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    phoneNumber: "",
    location: "",
    role: "",
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    location: "",
    role: "user",
  });
  const [roleFilter, setRoleFilter] = useState("all");

  const columns = [
    { header: "Name", accessor: "fullName" },
    { header: "Email", accessor: "email" },
    { header: "Phone", accessor: "phoneNumber" },
    { header: "Location", accessor: "location" },
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

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data } = await customFetch.get("/users/admin/all-users");
      setUsers(data.users);
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

  const handleEdit = (user: User) => {
    // Check if user is trying to edit their own account
    if (user._id === localStorage.getItem("userId")) {
      toast.error("You cannot modify your own account from this page");
      return;
    }

    setSelectedUser(user);
    setEditFormData({
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      location: user.location,
      role: user.role,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (user: User) => {
    // Log IDs to debug
    console.log("User ID:", user._id);
    console.log("Local Storage ID:", localStorage.getItem("userId"));

    // Ensure both IDs are strings and compare
    const currentUserId = localStorage.getItem("userId");
    if (user._id.toString() === currentUserId?.toString()) {
      toast.error("You cannot delete your own account");
      return;
    }

    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedUser) return;

    try {
      await customFetch.patch(
        `/users/admin/update-user/${selectedUser._id}`,
        editFormData
      );
      toast.success("User updated successfully");
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.msg || "Failed to update user";
        toast.error(errorMessage);
      } else {
        toast.error("Failed to update user");
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    try {
      await customFetch.delete(`/users/admin/user/${selectedUser._id}`);
      toast.success("User deleted successfully");
      setIsDeleteModalOpen(false);
      fetchUsers();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.msg || "Failed to delete user";
        toast.error(errorMessage);
      } else {
        toast.error("Failed to delete user");
      }
    }
  };

  const handleAddUser = async () => {
    try {
      await customFetch.post("/users/admin/add-user", addFormData);
      toast.success("User added successfully");
      setIsAddModalOpen(false);
      setAddFormData({
        fullName: "",
        email: "",
        password: "",
        phoneNumber: "",
        location: "",
        role: "user",
      });
      fetchUsers(); // Refresh the users list
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.msg || "Failed to add user";
        toast.error(errorMessage);
      } else {
        toast.error("Failed to add user");
      }
    }
  };

  const handleExportPDF = () => {
    // Get filtered users based on current roleFilter
    const filteredUsers = users.filter(
      (user) => roleFilter === "all" || user.role === roleFilter
    );

    const pdfColumns = [
      { header: "Name", dataKey: "fullName" },
      { header: "Email", dataKey: "email" },
      { header: "Phone", dataKey: "phoneNumber" },
      { header: "Location", dataKey: "location" },
      { header: "Role", dataKey: "role" },
    ];

    generatePDF<User>({
      title: `Users Report - ${
        roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)
      }`,
      data: filteredUsers,
      filename: `users-${roleFilter}-${
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Users</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-event-red hover:bg-red-700 text-white px-4 py-2 rounded-md"
        >
          Add User
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Filter by Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border rounded-md focus:border-event-red focus:ring-1 focus:ring-event-red"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="organizer">Organizer</option>
              <option value="user">User</option>
            </select>
          </div>
          <button
            onClick={handleExportPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <span>Export PDF</span>
            {roleFilter !== "all" && <span>({roleFilter})</span>}
          </button>
        </div>
      </div>

      <Table
        columns={columns}
        data={users.filter(
          (user) => roleFilter === "all" || user.role === roleFilter
        )}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={editFormData.fullName}
              onChange={(e) =>
                setEditFormData({ ...editFormData, fullName: e.target.value })
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
              value={editFormData.phoneNumber}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  phoneNumber: e.target.value,
                })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={editFormData.location}
              onChange={(e) =>
                setEditFormData({ ...editFormData, location: e.target.value })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={editFormData.role}
              onChange={(e) =>
                setEditFormData({ ...editFormData, role: e.target.value })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="organizer">Organizer</option>
            </select>
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
            Are you sure you want to delete this user? This action cannot be
            undone.
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
              Password
            </label>
            <input
              type="password"
              value={addFormData.password}
              onChange={(e) =>
                setAddFormData({ ...addFormData, password: e.target.value })
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
              Location
            </label>
            <input
              type="text"
              value={addFormData.location}
              onChange={(e) =>
                setAddFormData({ ...addFormData, location: e.target.value })
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
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="organizer">Organizer</option>
            </select>
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
