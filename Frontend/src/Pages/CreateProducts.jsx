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
    setStatusMessage("Starting OCR... First time may take 30-60 seconds");

    try {
      const worker = await createWorker("eng");

      setStatusMessage("Reading bill image... Please wait");

      const { data: { text } } = await worker.recognize(image);
      await worker.terminate();

      console.log("Raw Extracted Text:\n", text);

      const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 3);

      const extracted = [];
      let currentName = "";
      let currentDesc = "";

      // Regex patterns for your bill format
      const productLineRegex = /^(\d+)\s+(.+?)\s+\|\s*\d{4}\s*\|\s*[\d.]+\s+([A-Z0-9]+)\s+(\d{2}\/\d{2})/i;
      const mrpEndRegex = /(\d+\.\d{2})\s*$/; // MRP at end of line

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lower = line.toLowerCase();

        // Skip irrelevant lines
        if (
          lower.includes("total") ||
          lower.includes("taxable") ||
          lower.includes("cgst") ||
          lower.includes("sgst") ||
          lower.includes("goods amt") ||
          lower.includes("bill") ||
          lower.includes("description")
        ) {
          continue;
        }

        // Detect main product line (has serial no, name, batch, expiry)
        const productMatch = line.match(productLineRegex);
        if (productMatch) {
          // Save previous product if exists
          if (currentName) {
            const mrpLine = lines[i - 1] || line;
            const mrpMatch = mrpLine.match(mrpEndRegex);
            extracted.push({
              Name: currentName.trim(),
              Description: currentDesc.trim(),
              Mrp: mrpMatch ? parseFloat(mrpMatch[1]) : 0,
              Quantity: 1,
              Expiry: formatExpiry(productMatch[4]),
            });
          }

          currentName = productMatch[2].trim(); // e.g. "Medrol 16mg"
          currentDesc = "";
        } 
        // Next line is usually pack size (description)
        else if (currentName && (line.includes("Tablet") || line.includes("Capsule") || line.includes("'S") || line.includes("'s"))) {
          currentDesc = line.trim();
        }
      }

      // Add the last product
      if (currentName) {
        const lastFewLines = lines.slice(-3).join(" ");
        const mrpMatch = lastFewLines.match(mrpEndRegex);
        extracted.push({
          Name: currentName.trim(),
          Description: currentDesc.trim(),
          Mrp: mrpMatch ? parseFloat(mrpMatch[1]) : 0,
          Quantity: 1,
          Expiry: "", // Will be auto-filled from previous if available
        });
      }

      const validProducts = extracted.filter((p) => p.Name && p.Mrp > 0);

      setProducts(validProducts);
      setStatusMessage("");
      alert(`✅ Successfully extracted ${validProducts.length} products!\nEdit Name, Quantity & Expiry if needed before creating.`);
    } catch (err) {
      console.error(err);
      setStatusMessage("");
      alert("OCR failed. Please take a clear, straight photo with good lighting.");
    } finally {
      setLoading(false);
      setImage(null);
    }
  };

  // Convert MM/YY to YYYY-MM-DD (last day of month)
  const formatExpiry = (mmyy) => {
    if (!mmyy || mmyy.length !== 5) return "";
    const [month, year] = mmyy.split("/");
    const fullYear = "20" + year;
    return `${fullYear}-${month.padStart(2, "0")}-28`; // Safe day
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
      let failed = [];

      for (const p of products) {
        // Basic validation
        if (!p.Name || !p.Description || p.Mrp <= 0 || !p.Expiry || p.Quantity <= 0) {
          failed.push(p.Name);
          continue;
        }

        try {
          await api.post("/products", p);
          successCount++;
        } catch (err) {
          console.error("Failed to create:", p);
          failed.push(p.Name);
        }
      }

      if (failed.length > 0) {
        alert(`✅ ${successCount} created successfully.\n❌ Failed: ${failed.join(", ")}\nFix and try again.`);
      } else {
        alert(`✅ All ${successCount} products created successfully!`);
      }

      setProducts([]);
      setLoading(false);
    } else {
      // Manual single entry
      if (!name || !description || !mrp || !quantity || !expiry) {
        alert("All fields are required for manual entry!");
        return;
      }

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
            <input placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} className="bg-slate-700 text-white rounded-lg px-4 py-3" />
            <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-slate-700 text-white rounded-lg px-4 py-3" />
            <input type="number" placeholder="MRP" value={mrp} onChange={(e) => setMrp(e.target.value)} className="bg-slate-700 text-white rounded-lg px-4 py-3" />
            <input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="bg-slate-700 text-white rounded-lg px-4 py-3" />
            <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="bg-slate-700 text-white rounded-lg px-4 py-3 md:col-span-2" />
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

        {/* Editable Table */}
        {products.length > 0 && (
          <div className="overflow-x-auto rounded-xl">
            <h3 className="text-xl text-green-400 mb-4 font-semibold">
              Preview & Edit ({products.length} products extracted)
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
                      <input value={p.Name} onChange={(e) => handleProductChange(i, "Name", e.target.value)} className="w-full bg-slate-500 rounded px-3 py-2" />
                    </td>
                    <td className="px-3 py-2">
                      <input value={p.Description} onChange={(e) => handleProductChange(i, "Description", e.target.value)} className="w-full bg-slate-500 rounded px-3 py-2" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" step="0.01" value={p.Mrp} onChange={(e) => handleProductChange(i, "Mrp", e.target.value)} className="w-full bg-slate-500 rounded px-3 py-2" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" value={p.Quantity} onChange={(e) => handleProductChange(i, "Quantity", e.target.value)} className="w-full bg-slate-500 rounded px-3 py-2" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="date" value={p.Expiry} onChange={(e) => handleProductChange(i, "Expiry", e.target.value)} className="w-full bg-slate-500 rounded px-3 py-2" />
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
