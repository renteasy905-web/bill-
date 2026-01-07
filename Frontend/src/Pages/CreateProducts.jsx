
import React, { useState } from 'react'
import api from '../utils/api';

const CreateProducts = () => {
  const [Name , setname] = useState('');
  const [Descaiption , setDescription] = useState('');
  const [Mrp , setMrp] = useState('');
  const [Quantity , setquntity] = useState('');
  const [expiry , setexpiry] = useState('');

  const submit  = async (g)=>{
    g.preventDefault();
    const playload = { Name, Description: Descaiption, Mrp, Quantity, Expiry:expiry };
    
    try {
      await api.post('/products',  playload );
      alert("product created");
    } catch (error) {
      alert(error);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4">
      
      {/* Brand Heading */}
      <h1 className="text-3xl font-bold text-indigo-400 mb-6 tracking-wide">
        Vishwas Medical
      </h1>

      <form
        onSubmit={submit}
        className="w-full max-w-md bg-slate-800 rounded-2xl shadow-xl p-6 space-y-4
                   transition transform hover:-translate-y-1 hover:shadow-2xl"
      >
        <h2 className="text-xl font-semibold text-gray-100 text-center">
          Create Product
        </h2>

        <input required
          value={Name}
          onChange={(r)=> setname(r.target.value)}
          type="text"
          placeholder="Name of product"
          className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2
                     focus:ring-2 focus:ring-indigo-500 outline-none
                     hover:border-indigo-400 transition"
        />

        <input required
          type="text"
          placeholder="Description"
          value={Descaiption}
          onChange={(r)=> setDescription(r.target.value)}
          className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2
                     focus:ring-2 focus:ring-indigo-500 outline-none
                     hover:border-indigo-400 transition"
        />

        <div className="grid grid-cols-2 gap-3">
          <input required
            type="number"
            placeholder="MRP"
            value={Mrp}
            onChange={(r)=> setMrp(r.target.value)}
            className="bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2
                       focus:ring-2 focus:ring-indigo-500 outline-none
                       hover:border-indigo-400 transition"
          />

          <input required
            type="text"
            value={Quantity}
            onChange={(r)=> setquntity(r.target.value)}
            placeholder="Quantity"
            className="bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2
                       focus:ring-2 focus:ring-indigo-500 outline-none
                       hover:border-indigo-400 transition"
          />
        </div>

        <input
          type="text" required
          placeholder="Expiry (MM/YYYY)"
          value={expiry}
          onChange={(r)=> setexpiry(r.target.value)}
          className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2
                     focus:ring-2 focus:ring-indigo-500 outline-none
                     hover:border-indigo-400 transition"
        />

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white py-2 rounded-lg
                     font-medium transition-all
                     hover:from-indigo-500 hover:to-indigo-400 hover:shadow-lg
                     active:scale-[0.97]"
        >
          Create Product
        </button>
      </form>
    </div>
  )
}

export default CreateProducts
