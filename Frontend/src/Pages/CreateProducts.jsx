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
    setStatusMessage("Starting OCR... First time may take 30-60 seconds (downloading English data)");

    try {
      // Latest tesseract.js v7 style: language directly in createWorker
      const worker = await createWorker("eng");

      setStatusMessage("Processing image... Please wait");

      const {
        data: { text },
      } = await worker.recognize(image);
      await worker.terminate();

      console.log("Extracted Raw Text:", text);

      // Parser for Indian pharmacy bills
      const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 2);

      const extracted = [];
      let current = null;

      const expiryRegex = /(?:EXP|Expiry|Exp\.?|Use before|Mfg)[\s:]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\w{3}\s*\d{4}|\d{2}\/\d{4})/i;
      const qtyRegex = /(?:Qty|Quantity|x|X|\*)[\s:]*(\d+)/i;
      const mrpRegex = /(?:MRP|Rate|Price)[\s:]*₹?[\s]*(\d+(?:\.\d{2})?)/i;
      const priceAtEndRegex = /(\d+(?:\.\d{2})?)\s*$/;

      for (let line of lines) {
        const lower = line.toLowerCase();

        if (
          lower.includes("total") ||
          lower.includes("bill no") ||
          lower.includes("date") ||
          lower.includes("cash") ||
          lower.includes("thank") ||
          lower.includes("gst") ||
          lower.includes("invoice") ||
          lower.includes("vishwas medical")
        ) {
          continue;
        }

        let mrpMatch = line.match(mrpRegex) || line.match(priceAtEndRegex);
        let mrpVal = mrpMatch ? parseFloat(mrpMatch[1] || mrpMatch[0]) : 0;

        let qtyMatch = line.match(qtyRegex);
        let qtyVal = qtyMatch ? parseInt(qtyMatch[1]) : 1;

        let expMatch = line.match(expiryRegex);
        let expVal = expMatch ? formatDate(expMatch[1] || expMatch[2]) : "";

        if (/^[A-Za-z0-9]/.test(line) && line.length > 4 && (mrpVal > 0 || qtyVal > 1 || expVal)) {
          if (current) extracted.push(current);

          let name = line
            .replace(mrpRegex, "")
            .replace(qtyRegex, "")
            .replace(expiryRegex, "")
            .replace(priceAtEndRegex, "")
            .trim();

          current = {
            Name: name || "Unknown Medicine",
            Description: "",
            Mrp: mrpVal || 0,
            Quantity: qtyVal,
            Expiry: expVal,
          };
        } else if (current) {
          current.Description += (current.Description ? " | " : "") + line;
          if (mrpVal > 0) current.Mrp = mrpVal;
          if (qtyVal > 1) current.Quantity = qtyVal;
          if (expVal) current.Expiry = expVal;
        }
      }

      if (current) extracted.push(current);

      const validProducts = extracted.filter((p) => p.Name && p.Mrp > 0 && p.Quantity > 0);

      setProducts(validProducts);
      setStatusMessage("");
      alert(`✅ Extracted ${validProducts.length} products! Review and edit below.`);
    } catch (err) {
      console.error(err);
      setStatusMessage("");
      alert("OCR failed. Try a clearer, straight photo of the bill.");
    } finally {
      setLoading(false);
      setImage(null);
    }
  };

  const formatDate = (str) => {
    if (!str) return "";
    const parts = str.replace(/[\.\/\-]/g, "/").split("/");
    if (parts.length >= 2) {
      let [d, m, y] = parts;
      if (y && y.length === 2) y = "20" + y;
      if (m && m.length === 1) m = "0" + m;
      if (d && d.length === 1) d = "0" + d;
      return y && m && d ? `${y}-${m}-${d}` : "";
    }
    return "";
  };

  const handleProductChange = (index, field, value) => {
    const updated = [...products];
    updated[index][field] = field === "Mrp" || field === "Quantity" ? Number(value) || 0 : value;
    setProducts(updated);
  };

  const submit = async (e) => {
    e.preventDefault();

    if (products.length > 0) {
      setLoading(true);
      let successCount = 0;
      for (const p of products) {
        try {
          await api.post("/products", p);
          successCount++;
        } catch (err) {
          console.error("Failed to create:", p);
        }
      }
      alert(`✅ ${successCount}/${products.length} products created successfully!`);
      setProducts([]);
      setLoading(false);
    } else {
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
        setName("");
        setDescription("");
        setMrp("");
        setQuantity("");
        setExpiry("");
      } catch (error) {
        alert("Product creation failed");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4 py-8">
      <h1 className="text-4xl font-bold text-indigo-400 mb-8 tracking-wide">
        Vishwas Medical
      </h1>

      <form onSubmit={submit} className="w-full max-w-4xl bg-slate-800 rounded-2xl shadow-2xl p-8 space-y-8">
        <h2 className="text-3xl font-bold text-gray-100 text-center">Create Products</h2>

        {/* Manual Entry */}
        <div className="bg-slate-750 border border-slate-600 rounded-xl p-6">
          <h3 className="text-xl text-indigo-300 mb-4 font-semibold">Manual Entry (Single Product)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              placeholder="Product Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-700 text-white rounded-lg px-4 py-3"
            />
            <input
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-slate-700 text-white rounded-lg px-4 py-3"
            />
            <input
              type="number"
              placeholder="MRP"
              value={mrp}
              onChange={(e) => setMrp(e.target.value)}
              className="bg-slate-700 text-white rounded-lg px-4 py-3"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="bg-slate-700 text-white rounded-lg px-4 py-3"
            />
            <input
              type="date"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="bg-slate-700 text-white rounded-lg px-4 py-3 md:col-span-2"
            />
          </div>
        </div>

        {/* AI Bill Upload */}
        <div className="bg-slate-750 border border-indigo-500 rounded-xl p-6">
          <h3 className="text-xl text-indigo-300 mb-4 font-semibold">AI Bill Upload (Multiple Products)</h3>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 mb-4 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-indigo-600 file:text-white"
          />
          <button
            type="button"
            onClick={extractWithTesseract}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white py-3 rounded-lg font-bold text-lg transition"
          >
            {loading ? statusMessage || "Extracting..." : "Extract Products from Bill Image"}
          </button>
        </div>

        {/* Preview Table */}
        {products.length > 0 && (
          <div className="overflow-x-auto rounded-xl">
            <h3 className="text-xl text-green-400 mb-4 font-semibold">
              Preview & Edit ({products.length} products)
            </h3>
            <table className="w-full text-left text-white border-collapse">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">MRP</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Expiry</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={i} className="bg-slate-600 border-b border-slate-700">
                    <td className="px-3 py-2">
                      <input
                        value={p.Name}
                        onChange={(e) => handleProductChange(i, "Name", e.target.value)}
                        className="w-full bg-slate-500 rounded px-3 py-2"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={p.Description}
                        onChange={(e) => handleProductChange(i, "Description", e.target.value)}
                        className="w-full bg-slate-500 rounded px-3 py-2"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={p.Mrp}
                        onChange={(e) => handleProductChange(i, "Mrp", e.target.value)}
                        className="w-full bg-slate-500 rounded px-3 py-2"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={p.Quantity}
                        onChange={(e) => handleProductChange(i, "Quantity", e.target.value)}
                        className="w-full bg-slate-500 rounded px-3 py-2"
                      />
                    </td>
                    <td className="px-3 py-2">
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
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-4 rounded-xl font-bold text-xl transition"
        >
          {products.length > 0 ? `Create All ${products.length} Products` : "Create Single Product"}
        </button>
      </form>
    </div>
  );
};

export default CreateProducts;
