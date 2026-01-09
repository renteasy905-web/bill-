import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const CreateCustomer = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (!name || !phone) {
      alert("Name and phone are required");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/create", {
        name,
        phone,
        address,
      });

      alert("Customer created successfully");

      // Reset form
      setName("");
      setPhone("");
      setAddress("");

      // Immediately navigate to New Sale page after success
      navigate("/sales"); // Change "/sales" if your new sale route is different (e.g., "/cart" or "/newsale")

    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
          "Failed to create customer. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
          <h1 className="text-2xl font-bold text-white">Create Customer</h1>
          <p className="text-indigo-100 text-sm mt-1">
            Add new customer and start billing immediately
          </p>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="tel"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address (Optional)
            </label>
            <textarea
              placeholder="Full address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-lg transition shadow-md disabled:cursor-not-allowed"
          >
            {loading ? "Creating Customer..." : "Create & Start New Sale"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCustomer;