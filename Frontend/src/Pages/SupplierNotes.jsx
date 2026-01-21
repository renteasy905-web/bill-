import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, DollarSign, Package, Calendar, AlertCircle } from 'lucide-react';

const SupplierNotes = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSupplierSummary = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get('/suppliers/summary');
        if (response.data?.success) {
          setSuppliers(response.data.suppliers || []);
        } else {
          setError(response.data?.message || 'Failed to load supplier data');
        }
      } catch (err) {
        console.error('Failed to fetch supplier summary:', err);
        setError(
          err.response?.data?.message ||
          'Could not connect to server. Please check if backend is running.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchSupplierSummary();
  }, []);

  // Format amount in Indian Rupees style
  const formatAmount = (amount) => {
    if (!amount && amount !== 0) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-indigo-400">
            Supplier Notes & Pending
          </h1>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 p-5 bg-red-950/60 border border-red-800 rounded-xl flex items-center gap-3 text-red-200">
            <AlertCircle size={24} />
            <span>{error}</span>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-14 h-14 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg text-slate-400">Loading suppliers...</p>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {suppliers.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-700">
                <AlertCircle size={48} className="mx-auto mb-4 text-slate-500" />
                <h3 className="text-2xl font-medium text-slate-300 mb-3">
                  No suppliers found
                </h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  Add products with supplier name in "Stock Brought By" field to see summary here.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {suppliers.map((supplier) => (
                  <div
                    key={supplier.supplier}
                    className="bg-slate-900/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-800 hover:border-indigo-700/50 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-900/20"
                  >
                    <h2 className="text-2xl font-bold text-indigo-300 mb-5 truncate">
                      {supplier.supplier}
                    </h2>
                    <div className="space-y-6">
                      {/* Pending Amount */}
                      <div className="flex items-center gap-4">
                        <div className="p-4 bg-indigo-950/60 rounded-xl">
                          <DollarSign size={28} className="text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Total Pending Amount</p>
                          <p className="text-2xl font-bold">
                            {formatAmount(supplier.totalPendingAmount)}
                          </p>
                        </div>
                      </div>

                      {/* Product Count */}
                      <div className="flex items-center gap-4">
                        <div className="p-4 bg-emerald-950/60 rounded-xl">
                          <Package size={28} className="text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Products in Stock</p>
                          <p className="text-2xl font-bold">
                            {supplier.productsCount || 0}
                          </p>
                        </div>
                      </div>

                      {/* Last Stock Date */}
                      {supplier.lastStockDate && (
                        <div className="flex items-center gap-4">
                          <div className="p-4 bg-amber-950/60 rounded-xl">
                            <Calendar size={28} className="text-amber-400" />
                          </div>
                          <div>
                            <p className="text-sm text-slate-400">Last Stock Added</p>
                            <p className="text-lg">
                              {new Date(supplier.lastStockDate).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SupplierNotes;
