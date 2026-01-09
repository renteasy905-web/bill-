import React, { useState } from "react";
import api from "../utils/api";

const CreateProducts = () => {
  const [products, setProducts] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const extractBill = async () => {
    if (!image) {
      alert("Please select a bill image first!");
      return;
    }

    setLoading(true);
    setProducts([]);

    const formData = new FormData();
    formData.append("billImage", image);

    try {
      const response = await api.post("/extract-bill", formData);
      const extracted = response.data.products || [];
      setProducts(extracted);
      alert(`Extracted ${extracted.length} products! Edit if needed and click Create All`);
    } catch (err) {
      console.error(err);
      alert("Failed. Try a clearer cropped screenshot of the product table.");
    } finally {
      setLoading(false);
      setImage(null);
    }
  };

  const handleProductChange = (index, field, value) => {
    const updated = [...products];
    updated[index][field] = field === "Mrp" || field === "Quantity" ? Number(value) || 0 : value;
    setProducts(updated);
  };

  const createAllProducts = async () => {
    if (products.length === 0) return alert("No products!");

    setLoading(true);
    let success = 0;
    let failed = [];

    for (const p of products) {
      if (!p.Name || p.Mrp <= 0 || p.Quantity <= 0 || !p.Expiry) {
        failed.push(p.Name || "Unknown");
        continue;
      }
      try {
        await api.post("/products", p);
        success++;
      } catch (err) {
        failed.push(p.Name || "Unknown");
      }
    }

    alert(success === products.length ? `All ${success} saved!` : `${success} saved, ${failed.length} failed`);
    setProducts([]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-4xl font-bold text-indigo-400 text-center mb-10">Vishwas Medical</h1>

      <div className="max-w-4xl mx-auto bg-slate-800 rounded-2xl p-10 shadow-2xl">
        <h2 className="text-3xl font-bold text-center mb-8">AI Bill Extraction</h2>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="block w-full text-lg mb-8 file:mr-6 file:py-3 file:px-8 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
        />

        <button
          onClick={extractBill}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 py-5 rounded-xl font-bold text-2xl"
        >
          {loading ? "Extracting..." : "Extract Products from Bill"}
        </button>
      </div>

      {products.length > 0 && (
        <div className="max-w-6xl mx-auto bg-slate-800 rounded-2xl p-10 shadow-2xl mt-12">
          <h3 className="text-3xl text-green-400 text-center mb-8">
            Extracted {products.length} Products
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">MRP</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4">Expiry</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={i} className="bg-slate-600 border-b border-slate-700">
                    <td className="px-6 py-4">
                      <input
                        value={p.Name}
                        onChange={(e) => handleProductChange(i, "Name", e.target.value)}
                        className="w-full bg-slate-500 rounded px-4 py-2"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        value={p.Description}
                        onChange={(e) => handleProductChange(i, "Description", e.target.value)}
                        className="w-full bg-slate-500 rounded px-4 py-2"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        step="0.01"
                        value={p.Mrp}
                        onChange={(e) => handleProductChange(i, "Mrp", e.target.value)}
                        className="w-full bg-slate-500 rounded px-4 py-2"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={p.Quantity}
                        onChange={(e) => handleProductChange(i, "Quantity", e.target.value)}
                        className="w-full bg-slate-500 rounded px-4 py-2"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="date"
                        value={p.Expiry}
                        onChange={(e) => handleProductChange(i, "Expiry", e.target.value)}
                        className="w-full bg-slate-500 rounded px-4 py-2"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={createAllProducts}
            disabled={loading}
            className="w-full mt-12 bg-green-600 hover:bg-green-700 py-6 rounded-xl font-bold text-3xl"
          >
            {loading ? "Saving..." : `Create All ${products.length} Products`}
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateProducts;