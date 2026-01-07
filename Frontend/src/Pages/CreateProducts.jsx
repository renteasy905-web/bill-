import React, { useState } from "react";
import api from "../utils/api";

const CreateProducts = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [mrp, setMrp] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expiry, setExpiry] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    const payload = {
      Name: name,
      Description: description,
      Mrp: Number(mrp),
      Quantity: Number(quantity),
      Expiry: expiry,
    };

    try {
      await api.post("/products", payload);
      alert("Product created successfully");

      // Reset form
      setName("");
      setDescription("");
      setMrp("");
      setQuantity("");
      setExpiry("");
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Product creation failed"
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold text-indigo-400 mb-6 tracking-wide">
        Vishwas Medical
      </h1>

      <form
        onSubmit={submit}
        className="w-full max-w-md bg-slate-800 rounded-2xl shadow-xl p-6 space-y-4"
      >
        <h2 className="text-xl font-semibold text-gray-100 text-center">
          Create Product
        </h2>

        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="text"
          placeholder="Name of product"
          className="w-full bg-slate-700 text-white rounded-lg px-3 py-2"
        />

        <input
          required
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-slate-700 text-white rounded-lg px-3 py-2"
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            required
            type="number"
            placeholder="MRP"
            value={mrp}
            onChange={(e) => setMrp(e.target.value)}
            className="bg-slate-700 text-white rounded-lg px-3 py-2"
          />

          <input
            required
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Quantity"
            className="bg-slate-700 text-white rounded-lg px-3 py-2"
          />
        </div>

        <input
          type="date"
          required
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
          className="w-full bg-slate-700 text-white rounded-lg px-3 py-2"
        />

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 transition text-white py-2 rounded-lg font-medium"
        >
          Create Product
        </button>
      </form>
    </div>
  );
};

export default CreateProducts;