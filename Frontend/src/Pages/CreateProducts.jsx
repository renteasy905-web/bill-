import React, { useState } from "react";
import { createWorker } from "tesseract.js";
import api from "../utils/api";

const CreateProducts = () => {
  // Manual single product states (kept as fallback)
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [mrp, setMrp] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expiry, setExpiry] = useState("");

  // AI extracted products
  const [products, setProducts] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const extractWithTesseract = async () => {
    if (!image) {
      alert("Please select a bill image!");
      return;
    }

    setLoading(true);
    setProgress("Starting OCR engine... (first time may take 20-40 seconds)");

    const worker = await createWorker({
      logger: (m) => {
        if (m.status === "recognizing text") {
          setProgress(`Recognizing text... ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    try {
      await worker.load();
      await worker.loadLanguage("eng");
      await worker.initialize("eng");

      const { data: { text } } = await worker.recognize(image);
      await worker.terminate();

      console.log("Full extracted text:", text); // Open console to see raw text

      // === Improved Parser for Indian Pharmacy Bills ===
      const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 2);

      const extracted = [];
      let current = null;

      // Common patterns in Indian medical bills
      const expiryRegex = /(?:EXP|Expiry|Exp\.?|Mfg|Use before)[\s:]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\w{3}\s*\d{4}|\d{2}\/\d{4})/i;
      const batchRegex = /(?:Batch|B\.No\.?|Lot)[\s:]*([A-Z0-9]+)/i;
      const qtyRegex = /(?:Qty|Quantity|x|X|\*)[\s:]*(\d+)/i;
      const mrpRegex = /(?:MRP|Rate|Price)[\s:]*₹?[\s]*(\d+(?:\.\d{2})?)/i;
      const priceAtEndRegex = /(\d+(?:\.\d{2})?)\s*$/; // Price often at line end

      for (let line of lines) {
        const lower = line.toLowerCase();

        // Skip irrelevant lines
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

        let hasData = false;

        // Try to find MRP/Price
        let mrpMatch = line.match(mrpRegex) || line.match(priceAtEndRegex);
        let mrpVal = mrpMatch ? parseFloat(mrpMatch[1] || mrpMatch[0]) : 0;

        // Quantity
        let qtyMatch = line.match(qtyRegex);
        let qtyVal = qtyMatch ? parseInt(qtyMatch[1]) : 1;

        // Expiry
        let expMatch = line.match(expiryRegex);
        let expVal = expMatch ? formatDate(expMatch[1] || expMatch[2]) : "";

        // Batch (can be part of description)
        let batchMatch = line.match(batchRegex);

        // If line looks like a medicine (starts with letter or number, has decent length)
        if (/^[A-Za-z0-9]/.test(line) && line.length > 4 && (mrpVal > 0 || qtyVal > 1 || expVal)) {
          if (current) extracted.push(current);

          let name = line
            .replace(mrpRegex, "")
            .replace(qtyRegex, "")
            .replace(expiryRegex, "")
            .replace(batchRegex, "")
            .replace(priceAtEndRegex, "")
            .trim();

          current = {
            Name: name || "Unknown Medicine",
            Description: batchMatch ? `Batch: ${batchMatch[1]}` : "",
            Mrp: mrpVal || 0,
            Quantity: qtyVal,
            Expiry: expVal,
          };
          hasData = true;
        } else if (current && line.length > 2) {
          // Additional line for current product (e.g. strength, pack size)
          current.Description += (current.Description ? " | " : "") + line;
          // Update if new data found
          if (mrpVal > 0) current.Mrp = mrpVal;
          if (qtyVal > 1) current.Quantity = qtyVal;
          if (expVal) current.Expiry = expVal;
          if (batchMatch) current.Description += ` Batch: ${batchMatch[1]}`;
        }
      }

      if (current) extracted.push(current);

      // Filter valid products
      const validProducts = extracted.filter(p => p.Name && p.Mrp > 0 && p.Quantity > 0);

      setProducts(validProducts);
      setProgress("");
      alert(`✅ Extracted ${validProducts.length} products!\nReview and edit in the table below.`);
    } catch (err) {
      console.error(err);
      alert("OCR failed. Try a clearer, well-lit photo of the bill.");
    } finally {
      setLoading(false);
      setImage(null); // Reset input
    }
  };

  // Helper to convert various expiry formats to YYYY-MM-DD
  const formatDate = (str) => {
    if (!str) return "";
    const parts = str.replace(/[\.\/\-]/g, "/").split("/");
    if (parts.length === 3) {
      let [d, m, y] = parts;
      if (y.length === 2) y = "20" + y;
      if (m.length === 1) m = "0" + m;
      if (d.length === 1) d = "0" + d;
      return `${y}-${m}-${d}`;
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
      // Submit all extracted products
      setLoading(true);
      let successCount = 0;
      for (const p of products) {
        try {
          await api.post("/products", p);
          successCount++;
        } catch (err) {
          console.error("Failed for:", p);
        }
      }
      alert(`✅ ${successCount}/${products.length} products created successfully!`);
      setProducts([]);
      setLoading(false);
    } else {
      // Manual single product
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
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold text-indigo-400 mb-6 tracking-wide">
        Vishwas Medical
      </h1>

      <form onSubmit={submit} className="w-full max-w-2xl bg-slate-800 rounded-2xl shadow-xl p-6 space-y-6">
        <h2 className="text-2xl font-semibold text-gray-100 text-center">
          Create Products
        </h2>

        {/* Manual Entry Section */}
        <div className="border border-slate-600 rounded-lg p-4 bg-slate-750">
          <h3 className="text-lg text-indigo-300 mb-3">Manual Entry (Single Product)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="bg-slate-700 text-white rounded-lg px-3 py-2" />
            <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-slate-700 text-white rounded-lg px-3 py-2" />
            <input type="number" placeholder="MRP" value={mrp} onChange={(e) => setMrp(e.target.value)} className="bg-slate-700 text-white rounded-lg px-3 py-2" />
            <input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="bg-slate-700 text-white rounded-lg px-3 py-2" />
            <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="bg-slate-700 text-white rounded-lg px-3 py-2 md:col-span-2" />
          </div>
        </div>

        {/* AI Bill Upload Section */}
        <div className="border border-indigo-600 rounded-lg p-4 bg-slate-750">
          <h3 className="text-lg text-indigo-300 mb-3">AI Bill Upload (Multiple Products)</h3>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 mb-3"
          />
          <button
            type="button"
            onClick={extractWithTesseract}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white py-2 rounded-lg font-medium"
          >
            {loading ? progress || "Extracting..." : "Extract Products from Bill Image"}
          </button>
        </div>

        {/* Editable Preview Table */}
        {products.length > 0 && (
          <div className="overflow-x-auto">
            <h3 className="text-lg text-green-400 mb-3">Preview & Edit ({products.length} products)</h3>
            <table className="w-full text-sm text-left text-white">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Description</th>
                  <th className="px-3 py-2">MRP</th>
                  <th className="px-3 py-2">Quantity</th>
                  <th className="px-3 py-2">Expiry</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={i} className="bg-slate-600 border-b border-slate-700">
                    <td className="px-2 py-1">
                      <input
                        value={p.Name}
                        onChange={(e) => handleProductChange(i, "Name", e.target.value)}
                        className="w-full bg-slate-500 rounded px-2 py-1"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        value={p.Description}
                        onChange={(e) => handleProductChange(i, "Description", e.target.value)}
                        className="w-full bg-slate-500 rounded px-2 py-1"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="number"
                        value={p.Mrp}
                        onChange={(e) => handleProductChange(i, "Mrp", e.target.value)}
                        className="w-full bg-slate-500 rounded px-2 py-1"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="number"
                        value={p.Quantity}
                        onChange={(e) => handleProductChange(i, "Quantity", e.target.value)}
                        className="w-full bg-slate-500 rounded px-2 py-1"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="date"
                        value={p.Expiry}
                        onChange={(e) => handleProductChange(i, "Expiry", e.target.value)}
                        className="w-full bg-slate-500 rounded px-2 py-1"
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
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-bold text-lg"
        >
          {products.length > 0 ? `Create All ${products.length} Products` : "Create Product"}
        </button>
      </form>
    </div>
  );
};

export default CreateProducts;
