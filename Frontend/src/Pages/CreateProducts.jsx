import React, { useState } from "react";
import { createWorker } from "tesseract.js";
import api from "../utils/api";

const CreateProducts = () => {
  const [manualName, setManualName] = useState("");
  const [manualDescription, setManualDescription] = useState("");
  const [manualMrp, setManualMrp] = useState("");
  const [manualQuantity, setManualQuantity] = useState("");
  const [manualExpiry, setManualExpiry] = useState("");

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

    setProducts([]); // Clear old data
    setLoading(true);
    setStatusMessage("Starting OCR... First time may take 30-60 seconds");

    let worker;
    try {
      worker = await createWorker("eng");

      setStatusMessage("Reading bill image...");

      const { data: { text } } = await worker.recognize(image);

      console.log("Raw Extracted Text:\n", text);

      const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 10);

      const extracted = [];

      for (let line of lines) {
        // Skip headers and totals
        if (
          line.toLowerCase().includes("kalburgi") ||
          line.toLowerCase().includes("gst invoice") ||
          line.toLowerCase().includes("total") ||
          line.toLowerCase().includes("grand total") ||
          line.toLowerCase().includes("sgst") ||
          line.toLowerCase().includes("cgst") ||
          line.includes("S.No") ||
          line.includes("Net")
        ) {
          continue;
        }

        // Regex for KALBURGI format line
        // Example: "1. 25 SACH 500ML RL 500 ML SACHIN R1SC509 10/28 3004 60.38 21.50 ..."
        const regex = /^(\d+)\.\s+(\d+)\s+([A-Z]+)\s+([0-9A-Z']+)\s+([A-Z0-9\s]+?)\s+([A-Z0-9]+)\s+(\d{2}\/\d{2})\s+\d{4}\s+([\d.]+)\s+([\d.]+)/i;
        const match = line.match(regex);

        if (match) {
          const qty = parseInt(match[2]);
          const mfr = match[3].trim();
          const pack = match[4].trim();
          const name = match[5].trim();
          const batch = match[6].trim();
          const expMMYY = match[7];
          const mrp = parseFloat(match[8]);

          // Format expiry
          const [month, year] = expMMYY.split("/");
          const fullYear = year.length === 2 ? "20" + year : year;
          const expiry = `${fullYear}-${month.padStart(2, "0")}-28`;

          extracted.push({
            Name: name,
            Description: `${mfr} ${pack}`.trim(),
            Mrp: mrp,
            Quantity: qty,
            Expiry: expiry,
          });
        }
      }

      setProducts(extracted);
      setStatusMessage("");
      alert(`✅ Extracted ${extracted.length} products!\nEdit if needed and click "Create All Products"`);
    } catch (err) {
      console.error("OCR Error:", err);
      setStatusMessage("");
      alert("Failed to read image. Please upload a clear screenshot of the product table only.");
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

  const createAllProducts = async () => {
    if (products.length === 0) {
      alert("No products to create!");
      return;
    }

    setLoading(true);
    let success = 0;
    let failed = [];

    for (const p of products) {
      if (!p.Name || !p.Description || p.Mrp <= 0 || !p.Expiry || p.Quantity <= 0) {
        failed.push(p.Name);
        continue;
      }
      try {
        await api.post("/products", p);
        success++;
      } catch (err) {
        failed.push(p.Name);
      }
    }

    alert(success === products.length
      ? `✅ All ${success} products saved successfully!`
      : `✅ ${success} saved, Failed: ${failed.length} (${failed.join(", ")})`
    );

    setProducts([]);
    setLoading(false);
  };

  const createManualProduct = async (e) => {
    e.preventDefault();
    if (!manualName || !manualDescription || !manualMrp || !manualQuantity || !manualExpiry) {
      alert("All fields are required for manual entry!");
      return;
    }

    const payload = {
      Name: manualName,
      Description: manualDescription,
      Mrp: Number(manualMrp),
      Quantity: Number(manualQuantity),
      Expiry: manualExpiry,
    };

    try {
      await api.post("/products", payload);
      alert("Product created successfully!");
      setManualName("");
      setManualDescription("");
      setManualMrp("");
      setManualQuantity("");
      setManualExpiry("");
    } catch (err) {
      alert("Failed to create product");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4 py-12">
      <h1 className="text-4xl font-bold text-indigo-400 mb-8">Vishwas Medical</h1>

      {/* AI Bill Upload Section */}
      <div className="w-full max-w-4xl bg-slate-800 rounded-2xl shadow-2xl p-8 mb-8">
        <h2 className="text-3xl font-bold text-gray-100 text-center mb-6">AI Bill Upload (KALBURGI PHARMA Format)</h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 mb-4"
        />
        <button
          onClick={extractWithTesseract}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white py-4 rounded-xl font-bold text-xl"
        >
          {loading ? statusMessage || "Processing..." : "Extract Products from Bill"}
        </button>
      </div>

      {/* Extracted Products Table */}
      {products.length > 0 && (
        <div className="w-full max-w-4xl bg-slate-800 rounded-2xl shadow-2xl p-8 mb-8 overflow-x-auto">
          <h3 className="text-2xl text-green-400 mb-6 text-center">
            Extracted Products ({products.length}) - Edit & Create
          </h3>
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
                  <td className="px-4 py-2"><input value={p.Name} onChange={(e) => handleProductChange(i, "Name", e.target.value)} className="w-full bg-slate-500 rounded px-3 py-2" /></td>
                  <td className="px-4 py-2"><input value={p.Description} onChange={(e) => handleProductChange(i, "Description", e.target.value)} className="w-full bg-slate-500 rounded px-3 py-2" /></td>
                  <td className="px-4 py-2"><input type="number" step="0.01" value={p.Mrp} onChange={(e) => handleProductChange(i, "Mrp", e.target.value)} className="w-full bg-slate-500 rounded px-3 py-2" /></td>
                  <td className="px-4 py-2"><input type="number" value={p.Quantity} onChange={(e) => handleProductChange(i, "Quantity", e.target.value)} className="w-full bg-slate-500 rounded px-3 py-2" /></td>
                  <td className="px-4 py-2"><input type="date" value={p.Expiry} onChange={(e) => handleProductChange(i, "Expiry", e.target.value)} className="w-full bg-slate-500 rounded px-3 py-2" /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={createAllProducts}
            disabled={loading}
            className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-2xl"
          >
            Create All {products.length} Products
          </button>
        </div>
      )}

      {/* Manual Entry */}
      <div className="w-full max-w-4xl bg-slate-800 rounded-2xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-gray-100 text-center mb-6">Manual Entry (Single Product)</h2>
        <form onSubmit={createManualProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input placeholder="Product Name" value={manualName} onChange={(e) => setManualName(e.target.value)} className="bg-slate-700 text-white rounded-lg px-4 py-3" required />
          <input placeholder="Description (Mfr + Pack)" value={manualDescription} onChange={(e) => setManualDescription(e.target.value)} className="bg-slate-700 text-white rounded-lg px-4 py-3" required />
          <input type="number" step="0.01" placeholder="MRP" value={manualMrp} onChange={(e) => setManualMrp(e.target.value)} className="bg-slate-700 text-white rounded-lg px-4 py-3" required />
          <input type="number" placeholder="Quantity" value={manualQuantity} onChange={(e) => setManualQuantity(e.target.value)} className="bg-slate-700 text-white rounded-lg px-4 py-3" required />
          <input type="date" value={manualExpiry} onChange={(e) => setManualExpiry(e.target.value)} className="bg-slate-700 text-white rounded-lg px-4 py-3 md:col-span-2" required />
          <button type="submit" className="md:col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-xl">
            Create Single Product
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProducts;
