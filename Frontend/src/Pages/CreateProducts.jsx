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
    setStatusMessage("Starting OCR engine... (first time 30-60 sec)");

    try {
      const worker = await createWorker("eng");

      setStatusMessage("Reading bill text...");

      const { data: { text } } = await worker.recognize(image);
      await worker.terminate();

      console.log("Raw Text:\n", text);

      const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 3);

      const extracted = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Skip junk and headers
        if (
          line.toLowerCase().includes("netmeds") ||
          line.includes("====") ||
          line.includes("Description of") ||
          line.includes("Total Taxable") ||
          line.includes("CGST") ||
          line.includes("SGST")
        ) {
          continue;
        }

        // Match product line: starts with number, has name, HSN, rate, batch, expiry
        const productRegex = /^(\d+)\s+([A-Za-z0-9\s~]+?)\s+\|\s*\d{4}\s*\|\s*[\d.]+\s+([A-Z0-9]+)\s+(\d{2}\/\d{2})\s+/i;
        const match = line.match(productRegex);

        if (match) {
          const serial = match[1];
          let productName = match[2].trim().replace("~~", ""); // Clean name
          const batch = match[3];
          const expiryMMYY = match[4];

          // Find MRP - last number on this line
          const mrpMatch = line.match(/(\d+\.\d{2})\s*$/);
          const mrp = mrpMatch ? parseFloat(mrpMatch[1]) : 0;

          // Next line is usually pack size (description)
          let desc = "";
          if (i + 1 < lines.length) {
            const nextLine = lines[i + 1];
            if (nextLine.includes("Tablet") || nextLine.includes("Capsule") || nextLine.includes("'S") || nextLine.includes("'s")) {
              desc = nextLine.trim();
              i++; // Skip next line
            }
          }

          // Format expiry
          const [month, year] = expiryMMYY.split("/");
          const fullExpiry = `20${year}-${month.padStart(2, "0")}-28`;

          extracted.push({
            Name: productName,
            Description: desc || `Batch: ${batch}`,
            Mrp: mrp,
            Quantity: 1,
            Expiry: fullExpiry,
          });
        }
      }

      setProducts(extracted);
      setStatusMessage("");
      alert(`✅ Extracted ${extracted.length} products!\nNow edit Quantity if needed and click Create All.`);
    } catch (err) {
      console.error(err);
      setStatusMessage("");
      alert("Failed to read bill. Try a clearer photo (no blur, good light, straight angle).");
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
          failed.push(p.Name || "Unknown");
        }
      }

      alert(success === products.length
        ? `✅ All ${success} products created!`
        : `✅ ${success} created, ${failed.length} failed: ${failed.join(", ")}`
      );

      setProducts([]);
      setLoading(false);
    } else {
      // Manual entry
      if (!name || !description || !mrp || !quantity || !expiry) {
        alert("All fields required!");
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
        alert("Product created!");
        setName(""); setDescription(""); setMrp(""); setQuantity(""); setExpiry("");
      } catch (err) {
        alert("Failed to create product");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4 py-8">
      <h1 className="text-4xl font-bold text-indigo-400 mb-8">Vishwas Medical</h1>

      <form onSubmit={submit} className="w-full max-w-4xl bg-slate-800 rounded-2xl shadow-2xl p-8 space-y-8">
        <h2 className="text-3xl font-bold text-gray-100 text-center">Create Products</h2>

        {/* Manual Entry */}
        <div className="border border-slate-600 rounded-xl p-6">
          <h3 className="text-xl text-indigo-300 mb-4">Manual Entry</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="bg-slate-700 text-white rounded-lg px-4 py-3" />
            <input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="bg-slate-700 text-white rounded-lg px-4 py-3" />
            <input type="number" placeholder="MRP" value={mrp} onChange={e => setMrp(e.target.value)} className="bg-slate-700 text-white rounded-lg px-4 py-3" />
            <input type="number" placeholder="Quantity" value={quantity} onChange={e => setQuantity(e.target.value)} className="bg-slate-700 text-white rounded-lg px-4 py-3" />
            <input type="date" value={expiry} onChange={e => setExpiry(e.target.value)} className="bg-slate-700 text-white rounded-lg px-4 py-3 md:col-span-2" />
          </div>
        </div>

        {/* AI Upload */}
        <div className="border border-indigo-500 rounded-xl p-6">
          <h3 className="text-xl text-indigo-300 mb-4">AI Bill Upload (Multiple Products)</h3>
          <input type="file" accept="image/*" onChange={handleImageChange} className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 mb-4" />
          <button type="button" onClick={extractWithTesseract} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white py-3 rounded-lg font-bold">
            {loading ? statusMessage || "Processing..." : "Extract from Bill Image"}
          </button>
        </div>

        {/* Table */}
        {products.length > 0 && (
          <div className="overflow-x-auto">
            <h3 className="text-xl text-green-400 mb-4">Extracted Products ({products.length}) - Edit & Create</h3>
            <table className="w-full text-white">
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
                    <td className="px-4 py-2"><input value={p.Name} onChange={e => handleProductChange(i, "Name", e.target.value)} className="w-full bg-slate-500 rounded px-3 py-2" /></td>
                    <td className="px-4 py-2"><input value={p.Description} onChange={e => handleProductChange(i, "Description", e.target.value)} className="w-full bg-slate-500 rounded px-3 py-2" /></td>
                    <td className="px-4 py-2"><input type="number" step="0.01" value={p.Mrp} onChange={e => handleProductChange(i, "Mrp", e.target.value)} className="w-full bg-slate-500 rounded px-3 py-2" /></td>
                    <td className="px-4 py-2"><input type="number" value={p.Quantity} onChange={e => handleProductChange(i, "Quantity", e.target.value)} className="w-full bg-slate-500 rounded px-3 py-2" /></td>
                    <td className="px-4 py-2"><input type="date" value={p.Expiry} onChange={e => handleProductChange(i, "Expiry", e.target.value)} className="w-full bg-slate-500 rounded px-3 py-2" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-xl">
          {products.length > 0 ? `Create All ${products.length} Products` : "Create Product"}
        </button>
      </form>
    </div>
  );
};

export default CreateProducts;
