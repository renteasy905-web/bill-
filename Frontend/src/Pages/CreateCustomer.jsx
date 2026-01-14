import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { ArrowLeft, RefreshCw } from "lucide-react";

const CreateCustomer = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim() || !phone.trim()) {
      setErrorMsg("Name and phone number are required");
      return;
    }

    setLoading(true);

    try {
      await api.post("/customers", {  // ← correct endpoint
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim() || undefined,
      });

      alert("Customer created successfully!");
      setName("");
      setPhone("");
      setAddress("");
      navigate("/sales"); // or wherever you want after creation
    } catch (error) {
      console.error("Create customer error:", error);

      let message = "Failed to create customer. Please try again.";

      if (error.response) {
        if (error.response.status === 400) {
          message = error.response.data?.message || "Invalid data";
        } else if (error.response.status === 409 || error.response.data?.message?.includes("duplicate")) {
          message = "Phone number already exists";
        } else {
          message = error.response.data?.message || `Error ${error.response.status}`;
        }
      } else if (error.request) {
        message = "No response from server. Check internet or backend.";
      }

      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center px-4 py-8">
      {/* Top Bar with Back + Refresh */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-700/70 hover:bg-slate-600 rounded-lg text-white transition-all"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {/* Refresh Button */}
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600/70 hover:bg-indigo-600 rounded-lg text-white transition-all"
        >
          <RefreshCw size={18} />
          Refresh Page
        </button>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden text-gray-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <h1 className="text-2xl font-bold">Create New Customer</h1>
          <p className="text-indigo-100 text-sm mt-1">
            Add customer details to start billing immediately
          </p>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="p-6 space-y-6">
          {/* Error */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {errorMsg}
            </div>
          )}

          {/* Name */}
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

          {/* Phone */}
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

          {/* Address */}
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

          {/* Submit */}
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
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
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