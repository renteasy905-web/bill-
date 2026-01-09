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
    setProducts([]); // Clear old

    const formData = new FormData();
    formData.append("billImage", image);

    try {
      const response = await api.post("/extract-bill", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 120000, // 2 minutes
      });

      const extractedProducts = response.data.products || [];
      setProducts(extractedProducts);

      if (extractedProducts.length === 0) {
        alert("No products detected. Try a clearer screenshot of the product table only.");
      } else {
        alert(`✅ Successfully extracted ${extractedProducts.length} products!\nEdit if needed and click Create All`);
      }
    } catch (err) {
      console.error(err);
      alert("Extraction failed. Check image quality or backend logs.");
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
    if (products.length === 0) return alert("No products to save!");

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

    alert(success === products.length
      ? `✅ All ${success} products saved successfully!`
      : `✅ ${success} saved | Failed: ${failed.length} (${failed.join(", ")})`
    );

    setProducts([]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4 py-8">
      <h1 className="text-4xl font-bold text-indigo-400 mb-8 tracking-wide">
        Vishwas Medical
      </h1>

      <div className="w-full max-w-4xl bg-slate-800 rounded-2xl shadow-2xl p-8 space-y-8">
        <h2 className="text-3xl font-bold text-gray-100 text-center">
          AI Bill Extraction (Free OCR.space)
        </h2>

        <div className="border border-indigo-500 rounded-xl p-6">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 mb-4"
          />
          <button
            onClick={extractBill}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white py-4 rounded-xl font-bold text-xl"
          >
            {loading ? "Extracting products..." : "Extract Products from Bill"}
          </button>
        </div>

        {products.length > 0 && (
          <div className="overflow-x-auto rounded-xl">
            <h3 className="text-2xl text-green-400 mb-6 text-center">
              Extracted {products.length} Products - Edit & Save
            </h3>
            <table className="w-full text-white border-collapse">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left">Product Name</th>
                  <th className="px-6 py-4 text-left">Description</th>
                  <th className="px-6 py-4 text-left">MRP</th>
                  <th className="px-6 py-4 text-left">Quantity</th>
                  <th className="px-6 py-4 text-left">Expiry</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={i} className="bg-slate-600 border-b border-slate-700">
                    <td className="px-4 py-3">
                      <input
                        value={p.Name}
                        onChange={(e) => handleProductChange(i, "Name", e.target.value)}
                        className="w-full bg-slate-500 rounded px-3 py-2"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={p.Description}
                        onChange={(e) => handleProductChange(i, "Description", e.target.value)}
                        className="w-full bg-slate-500 rounded px-3 py-2"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        value={p.Mrp}
                        onChange={(e) => handleProductChange(i, "Mrp", e.target.value)}
                        className="w-full bg-slate-500 rounded px-3 py-2"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={p.Quantity}
                        onChange={(e) => handleProductChange(i, "Quantity", e.target.value)}
                        className="w-full bg-slate-500 rounded px-3 py-2"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="date"
                        value={p.Expiry}
                        onChange={(e) => handleProductChange(i, "Expiry", e.target.value)}
                        className="w-full bg-slate-500 rounded px-3 py-2"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              onClick={createAllProducts}
              disabled={loading}
              className="w-full mt-8 bg-green-600 hover:bg-green-700 disabled:opacity-70 text-white py-4 rounded-xl font-bold text-2xl"
            >
              {loading ? "Saving..." : `Create All ${products.length} Products`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateProducts;