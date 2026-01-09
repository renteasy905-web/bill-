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

    // Clear old data immediately
    setProducts([]);
    setLoading(true);
    setStatusMessage("Starting OCR engine... (first time takes 30-60 sec)");

    let worker;
    try {
      worker = await createWorker("eng");

      setStatusMessage("Reading bill image... Please wait");

      const { data: { text } } = await worker.recognize(image);

      console.log("Fresh Extracted Text:\n", text);

      const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 3);

      const extracted = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Skip headers and junk
        if (
          line.toLowerCase().includes("netmeds") ||
          line.toLowerCase().includes("s.n") ||
          line.toLowerCase().includes("description") ||
          line.toLowerCase().includes("hsn") ||
          line.toLowerCase().includes("total") ||
          line.toLowerCase().includes("cgst") ||
          line.toLowerCase().includes("sgst") ||
          line.includes("===") ||
          line.includes("Invoice")
        ) {
          continue;
        }

        // Match product line: S.No + Name + HSN + MRP + Batch + Expiry + Qty + ...
        const productRegex = /^(\d+)\s+([A-Za-z0-9\s~+]+?)\s+(\d{4})\s+([\d.]+)\s+([A-Z0-9]+)\s+(\d{2}\/\d{2})\s+(\d+)\s+/i;
        const match = line.match(productRegex);

        if (match) {
          const productName = match[2].trim().replace("~~", "").replace("+", " Plus");
          const batch = match[5];
          const expiryMMYY = match[6];
          const qty = parseInt(match[7]);

          // Find MRP from this line (after HSN)
          const mrp = parseFloat(match[4]);

          // Next line is pack size (Tablet/Capsule)
          let desc = `Batch: ${batch}`;
          if (i + 1 < lines.length) {
            const nextLine = lines[i + 1];
            if (nextLine.match(/(Tablet|Capsule|tab|cap)[']?[sS]?/i)) {
              desc = nextLine.trim();
              i++; // Skip description line
            }
          }

          // Convert expiry MM/YY to YYYY-MM-DD
          const [month, year] = expiryMMYY.split("/");
          const fullExpiry = `20${year}-${month.padStart(2, "0")}-28`;

          extracted.push({
            Name: productName,
            Description: desc,
            Mrp: mrp,
            Quantity: qty,
            Expiry: fullExpiry,
          });
        }
      }

      setProducts(extracted);
      setStatusMessage("");
      alert(`✅ Successfully extracted ${extracted.length} products!\nYou can now edit and create all.`);
    } catch (err) {
      console.error("OCR Error:", err);
      setStatusMessage("");
      alert("Failed to read bill. Try a clear, straight photo with good lighting.");
    } finally {
      if (worker) await worker.terminate();
      setLoading(false);
      setImage(null);
    }
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
      let success = 0;
      let failed = [];

      for (const p of products) {
        if (!p.Name || !p.Description || p.Mrp <= 0 || !p.Expiry || p.Quantity <= 0) {
          failed.push(p.Name || "Unknown");
          continue;
        }
        try {
          await api.post("/products", p);
          success++;
        } catch (err) {
          console.error("Failed:", p);
          failed.push(p.Name || "Unknown");
        }
      }

      alert(success === products.length
        ? `✅ All ${success} products saved to database!`
        : `✅ ${success} saved, ${failed.length} failed: ${failed.join(", ")}`
      );

      setProducts([]);
      setLoading(false);
    } else {
      // Manual entry
      if (!name || !description || !mrp || !quantity || !expiry) {
        alert("All fields are required!");
        return;
      }
      try {
        await api.post("/products", {
          Name: name,
          Description: description,
          Mrp: Number(mrp),
          Quantity: Number(quantity),
          Expiry: expiry,
        });
        alert("Product created successfully!");
        setName(""); setDescription(""); setMrp(""); setQuantity(""); setExpiry("");
      } catch (err) {
        alert("Failed to create product");
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
        <div className="border border-slate-600 rounded-xl p-6">
          <h3 className="text-xl text-indigo-300 mb-4 font-semibold">Manual Entry (Single Product)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="bg-slate-700 text-white rounded-lg px-4 py-3" />
            <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-slate-700 text-white rounded-lg px-4 py-3" />
            <input type="number" step="0.01" placeholder="MRP" value={mrp} onChange={(e) => setMrp(e.target.value)} className="bg-slate-700 text-white rounded-lg px-4 py-3" />
            <input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="bg-slate-700 text-white rounded-lg px-4 py-3" />
            <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="bg-slate-700 text-white rounded-lg px-4 py-3 md:col-span-2" />
          </div>
        </div>

        {/* AI Bill Upload */}
        <div className="border border-indigo-500 rounded-xl p-6">
          <h3 className="text-xl text-indigo-300 mb-4 font-semibold">AI Bill Upload (Add Multiple Products)</h3>
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
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white py-3 rounded-lg font-bold text-lg"
          >
            {loading ? statusMessage || "Processing..." : "Extract Products from Bill Image"}
          </button>
        </div>

        {/* Preview Table */}
        {products.length > 0 && (
          <div className="overflow-x-auto rounded-xl">
            <h3 className="text-xl text-green-400 mb-4 font-semibold">
              Extracted Products ({products.length}) - Edit if needed
            </h3>
            <table className="w-full text-white border-collapse">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-left">MRP</th>
                  <th className="px-4 py-3 text-left">Quantity</th>
                  <th className="px-4 py-3 text-left">Expiry</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={i} className="bg-slate-600 border-b border-slate-700">
                    <td className="px-4 py-2">
                      <input value={p.Name} onChange={(e) => handleProductChange(i, "Name", e.target.value)} className="w-full bg-slate-500 rounded px-3 py-2" />
                    </td>
                    <td className="px-4 py-2">
                      <input value={p.Description} onChange={(e) => handleProductChange(i, "Description", e.target.value)} className="w-full bg-slate-500 rounded px-3 py-2" />
                    </td>
                    <td className="px-4 py-2">
                      <input type="number" step="0.01" value={p.Mrp} onChange={(e) => handleProductChange(i, "Mrp", e.target.value)} className="w-full bg-slate-500 rounded px-3 py-2" />
                    </td>
                    <td className="px-4 py-2">
                      <input type="number" value={p.Quantity} onChange={(e) => handleProductChange(i, "Quantity", e.target.value)} className="w-full bg-slate-500 rounded px-3 py-2" />
                    </td>
                    <td className="px-4 py-2">
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
          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-70 text-white py-4 rounded-xl font-bold text-xl transition"
        >
          {products.length > 0 ? `Create All ${products.length} Products` : "Create Single Product"}
        </button>
      </form>
    </div>
  );
};

export default CreateProducts;
