import React, { useState } from "react";
import api from "../utils/api";

const CreateProducts = () => {
  const [products, setProducts] = useState([
    { Name: "", Description: "", Mrp: "", Quantity: "", Expiry: "" },
  ]);

  const [loading, setLoading] = useState(false);

  const addRow = () => {
    setProducts([...products, { Name: "", Description: "", Mrp: "", Quantity: "", Expiry: "" }]);
  };

  const handleChange = (index, field, value) => {
    const updated = [...products];
    updated[index][field] = field === "Mrp" || field === "Quantity" ? Number(value) || "" : value;
    setProducts(updated);
  };

  const createAll = async () => {
    const validProducts = products.filter(p => p.Name && p.Description && p.Mrp > 0 && p.Quantity > 0 && p.Expiry);

    if (validProducts.length === 0) {
      alert("Add at least one complete product!");
      return;
    }

    setLoading(true);
    let success = 0;
    let failed = [];

    for (const p of validProducts) {
      try {
        await api.post("/products", p);
        success++;
      } catch (err) {
        failed.push(p.Name);
      }
    }

    alert(success === validProducts.length ? `✅ All ${success} products created!` : `✅ ${success} created, Failed: ${failed.length}`);

    setProducts([{ Name: "", Description: "", Mrp: "", Quantity: "", Expiry: "" }]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <h1 className="text-4xl font-bold text-indigo-400 text-center mb-8">Vishwas Medical - Add Products</h1>

      <div className="max-w-5xl mx-auto bg-slate-800 rounded-2xl p-8 shadow-xl">
        <h2 className="text-3xl font-bold text-center mb-6">Add Multiple Products</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-4 py-3 text-left">Product Name</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">MRP</th>
                <th className="px-4 py-3 text-left">Quantity</th>
                <th className="px-4 py-3 text-left">Expiry</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={i} className="bg-slate-600 border-b border-slate-700">
                  <td className="px-4 py-2"><input value={p.Name} onChange={e => handleChange(i, "Name", e.target.value)} className="w-full bg-slate-500 rounded px-3 py-2" placeholder="Name" /></td>
                  <td className="px-4 py-2"><input value={p.Description} onChange={e => handleChange(i, "Description", e.target.value)} className="w-full bg-slate-500 rounded px-3 py-2" placeholder="Description" /></td>
                  <td className="px-4 py-2"><input type="number" value={p.Mrp} onChange={e => handleChange(i, "Mrp", e.target.value)} className="w-full bg-slate-500 rounded px-3 py-2" placeholder="MRP" /></td>
                  <td className="px-4 py-2"><input type="number" value={p.Quantity} onChange={e => handleChange(i, "Quantity", e.target.value)} className="w-full bg-slate-500 rounded px-3 py-2" placeholder="Qty" /></td>
                  <td className="px-4 py-2"><input type="date" value={p.Expiry} onChange={e => handleChange(i, "Expiry", e.target.value)} className="w-full bg-slate-500 rounded px-3 py-2" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button onClick={addRow} className="mt-6 bg-blue-600 hover:bg-blue-700 py-3 px-6 rounded-xl font-bold">
          + Add New Row
        </button>

        <button onClick={createAll} disabled={loading} className="ml-4 mt-6 bg-green-600 hover:bg-green-700 py-3 px-6 rounded-xl font-bold text-xl">
          {loading ? "Saving..." : "Create All Products"}
        </button>
      </div>
    </div>
  );
};

export default CreateProducts;
