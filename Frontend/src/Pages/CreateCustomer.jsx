import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = "https://bill-inventory-backend.onrender.com";

const CreateCustomer = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      setErrorMsg("Name and phone number are required");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      // Debug log - you can remove this after it starts working
      console.log("Sending request to:", `${BACKEND_URL}/create`);

      await axios.post(`${BACKEND_URL}/create`, {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });

      alert("Customer created successfully!");
      setName("");
      setPhone("");
      setAddress("");
      navigate("/sales");
    } catch (error) {
      console.error("Create customer error:", error);

      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to create customer. Please try again later.";

      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden text-gray-900">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <h1 className="text-2xl font-bold">Create New Customer</h1>
          <p className="text-indigo-100 text-sm mt-1">
            Add customer details to start billing immediately
          </p>
        </div>

        <form onSubmit={submit} className="p-6 space-y-6">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Customer Name <span className="text-red-600">*</span>
            </label>
            <input
              required
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Phone Number <span className="text-red-600">*</span>
            </label>
            <input
              required
              type="tel"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Address (optional)
            </label>
            <textarea
              placeholder="Full address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all shadow-md ${
              loading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z" />
                </svg>
                Creating...
              </span>
            ) : (
              "Create Customer & Start Sale"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCustomer;
