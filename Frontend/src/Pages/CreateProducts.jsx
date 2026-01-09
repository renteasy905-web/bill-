import React, { useState } from "react";
import { createWorker } from "tesseract.js";
import api from "../utils/api";

const CreateProducts = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [mrp, setMrp] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expiry, setExpiry] = useState("");
  const [products, setProducts] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };
  const extractWithTesseract = async () => {
    if (!image) {
      alert("Please select a bill image first!");
      return;
    }
    setLoading(true);
    setStatusMessage("Starting OCR... First time may take 30-60 seconds (downloading engine)");
    try {
      const worker = await createWorker("eng");
      setStatusMessage("Processing image... Please wait");
      const { data: { text } } = await worker.recognize(image);
      await worker.terminate();
      console.log("Extracted Raw Text: ", text); // For debugging
      // Split text into lines and clean
      const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 5 && l.match(/\d+\./)); // Filter lines that look like product rows

      const extractedProducts = [];

      lines.forEach((line) => {
        // Updated regex for KALBURGI PHARMA invoice format
        const productRegex = /(\d+)\.\s*(\d+)\s*([A-Z]+)\s*([0-9A-Z]+)\s*([A-Z0-9\s]+)\s*([A-Z0-9]+)\s*(\d{2}\/\d{2})\s*(\d{4})\s*([\d.]+)\s*([\d.]+)\s*([\d.]+)\s*([\d.]+)\s*([\d.]+)\s*([\d.]+)\s*([\d.]+)/i;
        const match = line.match(productRegex);

        if (match) {
          const [, , quantity, mfr, pack, name, batch, expMMYY, , mrp, ] = match; // Extract relevant groups

          // Format expiry (assume 20YY if YY < 50, else 19YY)
          const [month, year] = expMMYY.split("/");
          const fullYear = parseInt(year) < 50 ? `20${year}` : `19${year}`;
          const expiryDate = `${fullYear}-${month.padStart(2, "0")}-28`; // Last day of month for safety

          extractedProducts.push({
            Name: name.trim(),
            Description: `${mfr} ${pack}`.trim(),
            Mrp: parseFloat(mrp),
            Quantity: parseInt(quantity),
            Expiry: expiryDate,
          });
        }
      });

      setProducts(extractedProducts);
      alert(`Extracted ${extractedProducts.length} products successfully. Review and edit in the table.`);
    } catch (error) {
      console.error(error);
      alert("Extraction failed. Please try a clearer image.");
    } finally {
      setLoading(false);
      setStatusMessage("");
      setImage(null);
    }
  };
  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...products];
    updatedProducts[index][field] = field === "Mrp" || field === "Quantity" ? Number(value) : value;
    setProducts(updatedProducts);
  };
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
      <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-xl p-6 space-y-4 mt-6">
        <h2 className="text-xl font-semibold text-gray-100 text-center">
          AI Bill Upload
        </h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full bg-slate-700 text-white rounded-lg px-3 py-2"
        />
        <button
          onClick={extractWithTesseract}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 transition text-white py-2 rounded-lg font-medium"
        >
          {loading ? statusMessage : "Extract Products"}
        </button>
        {products.length > 0 && (
          <table className="w-full mt-4 text-white">
            <thead>
              <tr className="bg-slate-700">
                <th className="p-2">Name</th>
                <th className="p-2">Description</th>
                <th className="p-2">MRP</th>
                <th className="p-2">Quantity</th>
                <th className="p-2">Expiry</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod, index) => (
                <tr key={index} className="bg-slate-600">
                  <td className="p-1">
                    <input
                      type="text"
                      value={prod.Name}
                      onChange={(e) => handleProductChange(index, "Name", e.target.value)}
                      className="w-full bg-slate-500 text-white rounded px-1 py-1"
                    />
                  </td>
                  <td className="p-1">
                    <input
                      type="text"
                      value={prod.Description}
                      onChange={(e) => handleProductChange(index, "Description", e.target.value)}
                      className="w-full bg-slate-500 text-white rounded px-1 py-1"
                    />
                  </td>
                  <td className="p-1">
                    <input
                      type="number"
                      value={prod.Mrp}
                      onChange={(e) => handleProductChange(index, "Mrp", e.target.value)}
                      className="w-full bg-slate-500 text-white rounded px-1 py-1"
                    />
                  </td>
                  <td className="p-1">
                    <input
                      type="number"
                      value={prod.Quantity}
                      onChange={(e) => handleProductChange(index, "Quantity", e.target.value)}
                      className="w-full bg-slate-500 text-white rounded px-1 py-1"
                    />
                  </td>
                  <td className="p-1">
                    <input
                      type="date"
                      value={prod.Expiry}
                      onChange={(e) => handleProductChange(index, "Expiry", e.target.value)}
                      className="w-full bg-slate-500 text-white rounded px-1 py-1"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
export default CreateProducts;
