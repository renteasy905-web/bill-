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
      alert("Please select a bill screenshot!");
      return;
    }

    setProducts([]);
    setLoading(true);
    setStatusMessage("Starting OCR... (30-60 sec first time)");

    let worker;
    try {
      worker = await createWorker("eng");

      setStatusMessage("Reading bill...");

      const { data: { text } } = await worker.recognize(image);

      console.log("Raw Text:\n", text);

      const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 10);

      const extracted = [];

      for (let line of lines) {
        if (
          line.toLowerCase().includes("kalburgi") ||
          line.toLowerCase().includes("gst invoice") ||
          line.toLowerCase().includes("total") ||
          line.toLowerCase().includes("grand total") ||
          line.toLowerCase().includes("sgst") ||
          line.toLowerCase().includes("cgst") ||
          line.toLowerCase().includes("authorised") ||
          line.includes("S.No") ||
          line.includes("Terms")
        ) {
          continue;
        }

        // Super flexible regex for noisy OCR
        const regex = /^[\da.]*\s*(\d+)\s+\|\s*([A-Z]+)\s*\|\s*([0-9A-Z']+)\s*\|\s*([A-Z0-9\s'&()-]+?)\s+\|\s*([A-Z0-9]+)\s+\|\s*(\d{2}\/\d{2})\]?\s*\|\s*\d+\s+([\d.]+)\s+([\d.]+)/i;
        const match = line.match(regex);

        if (match) {
          const qty = parseInt(match[1]);
          const mfr = match[2];
          const pack = match[3];
          const name = match[4].trim();
          const batch = match[5];
          const expMMYY = match[6];
          const mrp = parseFloat(match[7]);

          const [month, year] = expMMYY.split("/");
          const expiry = `20${year.padStart(2, "0")}-${month.padStart(2, "0")}-31`;

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
      alert(`✅ Extracted ${extracted.length} products! Edit Quantity/MRP/Expiry if needed, then Create All.`);
    } catch (err) {
      console.error(err);
      setStatusMessage("");
      alert("OCR failed. Take a clear screenshot of the product table only (crop out header/footer).");
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
    if (products.length === 0) return alert("No products!");

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

    alert(success === products.length ? `✅ All ${success} saved!` : `✅ ${success} saved, ${failed.length} failed`);
    setProducts([]);
    setLoading(false);
  };

  const createManual = async (e) => {
    e.preventDefault();
    if (!manualName || !manualDescription || !manualMrp || !manualQuantity || !manualExpiry) return alert("Fill all fields!");

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
        <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full mb-4" />
        <button onClick={extractWithTesseract} disabled={loading} className="w-full bg-indigo-600 py-4 rounded-xl font-bold text-xl">
          {loading ? "Processing..." : "Extract Products"}
        </button>
      </div>

      {/* Table */}
      {products.length > 0 && (
        <div className="max-w-5xl mx-auto bg-slate-800 rounded-2xl p-8 shadow-xl mb-8">
          <h3 className="text-2xl text-green-400 text-center mb-6">Extracted {products.length} Products</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
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
                  <tr key={i} className="bg-slate-600">
                    <td className="px-4 py-2"><input value={p.Name} onChange={e => handleProductChange(i, "Name", e.target.value)} className="w-full bg-slate-500 rounded px-3 py-2" /></td>
                    <td className="px-4 py-2"><input value={p.Description} onChange={e => handleProductChange(i, "Description", e.target.value)} className="w-full bg-slate-500 rounded px-3 py-2" /></td>
                    <td className="px-4 py-2"><input type="number" value={p.Mrp} onChange={e => handleProductChange(i, "Mrp", e.target.value)} className="w-full bg-slate-500 rounded px-3 py-2" /></td>
                    <td className="px-4 py-2"><input type="number" value={p.Quantity} onChange={e => handleProductChange(i, "Quantity", e.target.value)} className="w-full bg-slate-500 rounded px-3 py-2" /></td>
                    <td className="px-4 py-2"><input type="date" value={p.Expiry} onChange={e => handleProductChange(i, "Expiry", e.target.value)} className="w-full bg-slate-500 rounded px-3 py-2" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={createAllProducts} className="w-full mt-6 bg-green-600 py-4 rounded-xl font-bold text-2xl">
            Create All {products.length} Products
          </button>
        </div>
      )}

      {/* Manual */}
      <div className="max-w-4xl mx-auto bg-slate-800 rounded-2xl p-8 shadow-xl">
        <h2 className="text-3xl font-bold text-center mb-6">Manual Entry</h2>
        <form onSubmit={createManual}>
          <input placeholder="Name" value={manualName} onChange={e => setManualName(e.target.value)} required className="w-full mb-4 bg-slate-700 rounded px-4 py-3" />
          <input placeholder="Description" value={manualDescription} onChange={e => setManualDescription(e.target.value)} required className="w-full mb-4 bg-slate-700 rounded px-4 py-3" />
          <input type="number" placeholder="MRP" value={manualMrp} onChange={e => setManualMrp(e.target.value)} required className="w-full mb-4 bg-slate-700 rounded px-4 py-3" />
          <input type="number" placeholder="Quantity" value={manualQuantity} onChange={e => setManualQuantity(e.target.value)} required className="w-full mb-4 bg-slate-700 rounded px-4 py-3" />
          <input type="date" value={manualExpiry} onChange={e => setManualExpiry(e.target.value)} required className="w-full mb-4 bg-slate-700 rounded px-4 py-3" />
          <button type="submit" className="w-full bg-indigo-600 py-4 rounded-xl font-bold text-xl">
            Create Product
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProducts;
