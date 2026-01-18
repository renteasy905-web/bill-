import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { ArrowLeft, RefreshCw } from "lucide-react";

const CreateCustomer = () => {
  const navigate = useNavigate();
  const nameInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Auto-focus name field on mount
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg(""); // Clear error on input
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const { name, phone } = formData;

    if (!name.trim() || !phone.trim()) {
      setErrorMsg("Name and phone number are required");
      return;
    }

    setLoading(true);

    try {
      await api.post("/customers", {
        name: name.trim(),
        phone: phone.trim(),
        address: formData.address.trim() || undefined,
      });

      alert("Customer created successfully!");
      setFormData({ name: "", phone: "", address: "" });
      navigate("/sales"); // Redirect to sales after success
    } catch (error) {
      console.error("Create customer error:", error);

      let message = "Failed to create customer. Please try again.";

      if (error.response) {
        const { status, data } = error.response;
        if (status === 400) {
          message = data?.message || "Invalid data provided";
        } else if (status === 409 || data?.message?.includes("duplicate")) {
          message = "Phone number already exists!";
        } else {
          message = data?.message || `Server error (${status})`;
        }
      } else if (error.request) {
        message = "No response from server. Check your connection.";
      }

      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center px-4 py-8">
      {/* Top Bar */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-700/70 hover:bg-slate-600 rounded-lg text-white transition-all shadow-md"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600/70 hover:bg-indigo-600 rounded-lg text-white transition-all shadow-md"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-md bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-purple-700 p-6 text-white">
          <h1 className="text-2xl md:text-3xl font-bold">Create New Customer</h1>
          <p className="text-indigo-200 mt-1 text-sm">
            Add customer details to start billing
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errorMsg && (
            <div className="bg-red-900/40 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-center text-sm">
              {errorMsg}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Customer Name <span className="text-red-400">*</span>
            </label>
            <input
              ref={nameInputRef}
              required
              type="text"
              name="name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Phone Number <span className="text-red-400">*</span>
            </label>
            <input
              required
              type="tel"
              name="phone"
              placeholder="9876543210"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Address (optional)
            </label>
            <textarea
              name="address"
              placeholder="Full address..."
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 px-6 rounded-lg font-semibold text-white transition-all shadow-lg ${
              loading
                ? "bg-indigo-500/50 cursor-not-allowed"
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
              "Create Customer"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCustomer;
