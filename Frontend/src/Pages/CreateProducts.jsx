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
      alert("Please select a bill image (screenshot of table)!");
      return;
    }

    setProducts([]); // Clear previous
    setLoading(true);
    setStatusMessage("Starting OCR engine... (first time 30-60 sec)");

    let worker;
    try {
      worker = await createWorker("eng");

      setStatusMessage("Reading bill image... Please wait");

      const { data: { text } } = await worker.recognize(image);

      console.log("Raw Text:\n", text);

      const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 10);

      const extracted = [];

      for (let line of lines) {
        // Skip all headers, totals, shop name etc.
        if (
          line.toLowerCase().includes("kalburgi") ||
          line.toLowerCase().includes("gst invoice") ||
          line.toLowerCase().includes("total") ||
          line.toLowerCase().includes("grand total") ||
          line.toLowerCase().includes("sgst") ||
          line.toLowerCase().includes("cgst") ||
          line.toLowerCase().includes("authorised") ||
          line.includes("S. No") ||
          line.includes("Net") ||
          line.includes("Class") ||
          line.includes("Terms")
        ) {
          continue;
        }

        // Regex for KALBURGI format: S.No Qty Mfr Pack ProductName Batch Exp HSN M.R.P Rate ...
        const regex = /^(\d+)\.\s+(\d+)\s+([A-Z]+)\s+([0-9A-Z']+)\s+([A-Z0-9\s'&-]+?)\s+([A-Z0-9]+)\s+(\d{2}\/\d{2})\s+\d+\s+([\d.]+)\s+([\d.]+)/i;
        const match = line.match(regex);

        if (match) {
          const qty = parseInt(match[2]);
          const mfr = match[3].trim();
          const pack = match[4].trim();
          const name = match[5].trim();
          const batch = match[6].trim();
          const expMMYY = match[7].trim();
          const mrp = parseFloat(match[8]);

          // Convert expiry
          const [month, year] = expMMYY.split("/");
          const fullYear = "20" + year; // All years 20xx
          const expiry = `${fullYear}-${month.padStart(2, "0")}-31`;

          extracted.push({
            Name: name,
            Description: `${mfr} ${pack}`,
            Mrp: mrp,
            Quantity: qty,
            Expiry: expiry,
          });
        }
      }

      setProducts(extracted);
      setStatusMessage("");
      alert(`✅ Successfully extracted ${extracted.length} products!\nEdit if needed → Click "Create All Products"`);
    } catch (err) {
      console.error("Error:", err);
      setStatusMessage("");
      alert("Failed. Please upload a clear screenshot of the product table only (avoid headers).");
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
    if (products.length === 0) return alert("No products to save!");

    setLoading(true);
    let success = 0;
    let failed = [];

    for (const p of products) {
      if (!p.Name || p.Mrp <= 0 || p.Quantity <= 0 || !p.Expiry) {
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
      ? `✅ All ${success} products saved to database!`
      : `✅ ${success} saved | Failed: ${failed.length}`
    );
    setProducts([]);
    setLoading(false);
  };

  const createManual = async (e) => {
    e.preventDefault();
    if (!manualName || !manualDescription || !manualMrp || !manualQuantity || !manualExpiry) {
      alert("All fields required!");
      return;
    }
    try {
      await api.post("/products", {
        Name: manualName,
        Description: manualDescription,
        Mrp: Number(manualMrp),
        Quantity: Number(manualQuantity),
        Expiry: manualExpiry,
      });
      alert("Product created!");
      setManualName("");
      setManualDescription("");
      setManualMrp("");
      setManualQuantity("");
      setManualExpiry("");
    } catch (err) {
      alert("Failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <h1 className="text-4xl font-bold text-indigo-400 text-center mb-8">Vishwas Medical</h1>

      {/* AI Upload */}
      <div className="max-w-4xl mx-auto bg-slate-800 rounded-2xl p-8 shadow-xl mb-8">
        <h2 className="text-3xl font-bold text-center mb-6">AI Bill Upload (KALBURGI PHARMA)</h2>
        <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 mb-4" />
        <button onClick={extractWithTesseract} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 py-4 rounded-xl font-bold text-xl disabled:opacity-70">
          {loading ? (statusMessage || "Processing...") : "Extract Products from Image"}
        </button>
      </div>

      {/* Extracted Table */}
      {products.length > 0 && (
        <div className="max-w-5xl mx-auto bg-slate-800 rounded-2xl p-8 shadow-xl mb-8">
          <h3 className="text-2xl text-green-400 text-center mb-6">Extracted {products.length} Products</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
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
          <button onClick={createAllProducts} disabled={loading} className="w-full mt-6 bg-green-600 hover:bg-green-700 py-4 rounded-xl font-bold text-2xl">
            Create All {products.length} Products
          </button>
        </div>
      )}

      {/* Manual Entry */}
      <div className="max-w-4xl mx-auto bg-slate-800 rounded-2xl p-8 shadow-xl">
        <h2 className="text-3xl font-bold text-center mb-6">Manual Entry</h2>
        <form onSubmit={createManual} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input placeholder="Product Name" value={manualName} onChange={e => setManualName(e.target.value)} required className="bg-slate-700 rounded-lg px-4 py-3" />
          <input placeholder="Description (Mfr Pack)" value={manualDescription} onChange={e => setManualDescription(e.target.value)} required className="bg-slate-700 rounded-lg px-4 py-3" />
          <input type="number" step="0.01" placeholder="MRP" value={manualMrp} onChange={e => setManualMrp(e.target.value)} required className="bg-slate-700 rounded-lg px-4 py-3" />
          <input type="number" placeholder="Quantity" value={manualQuantity} onChange={e => setManualQuantity(e.target.value)} required className="bg-slate-700 rounded-lg px-4 py-3" />
          <input type="date" value={manualExpiry} onChange={e => setManualExpiry(e.target.value)} required className="md:col-span-2 bg-slate-700 rounded-lg px-4 py-3" />
          <button type="submit" className="md:col-span-2 bg-indigo-600 hover:bg-indigo-700 py-4 rounded-xl font-bold text-xl">
            Create Product
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProducts;
