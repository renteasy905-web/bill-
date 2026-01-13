import React from "react";
import { Link } from "react-router-dom";
import { Bell, Plus, Package, ShoppingCart, Receipt, BarChart3, Users, Pill, AlertTriangle } from "lucide-react";

const First = () => {
  const quickActions = [
    {
      title: "New Sale",
      desc: "Create bills instantly",
      icon: Receipt,
      color: "rose",
      to: "/sales",
    },
    {
      title: "Billing Cart",
      desc: "Add items & checkout",
      icon: ShoppingCart,
      color: "sky",
      to: "/cart",
    },
    {
      title: "All Products",
      desc: "Manage inventory & stock",
      icon: Package,
      color: "emerald",
      to: "/allproducts",
    },
    {
      title: "Sales Report",
      desc: "View analytics & trends",
      icon: BarChart3,
      color: "violet",
      to: "/allsales",
    },
    {
      title: "New Product",
      desc: "Add medicines & details",
      icon: Plus,
      color: "cyan",
      to: "/createProducts",
    },
  // In quickActions array (already correct in my last code)
{
  title: "Order Stock",
  desc: "Low stock & expired items",
  icon: AlertTriangle,
  color: "orange",
  to: "/order-stock",  // ← this is correct (lowercase + hyphen)
}
  ];
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 text-white overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg">
                <Pill size={28} className="text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-cyan-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
                Vishwas Medical
              </h1>
            </div>
            {/* Notification */}
            <Link
              to="/notifications"
              className="relative p-3 rounded-full hover:bg-white/10 transition"
            >
              <Bell size={24} className="text-cyan-300 hover:text-cyan-200" />
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md animate-pulse">
                3
              </span>
            </Link>
          </div>
        </div>
      </header>
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-cyan-300 via-indigo-400 to-purple-400 bg-clip-text text-transparent mb-6 tracking-tight">
          Vishwas Medical
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
          Fast billing • Smart stock • Expiry alerts • Loyal customers
        </p>
      </section>
      {/* Quick Action Cards */}
      <section className="max-w-7xl mx-auto px-4 pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {quickActions.map((action, index) => (
            <Link
              key={action.to}
              to={action.to}
              className={`group relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 shadow-2xl border border-white/10 overflow-hidden transition-all duration-500 hover:-translate-y-4 hover:shadow-3xl hover:border-${action.color}-500/50 hover:bg-gradient-to-br hover:from-slate-800 hover:to-slate-900`}
              style={{ animationDelay: `${index * 100}ms`, animation: "fadeInUp 0.8s ease-out forwards" }}
            >
              {/* Subtle gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br from-${action.color}-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-${action.color}-700/50 to-${action.color}-900/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <action.icon size={40} className={`text-${action.color}-300`} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{action.title}</h3>
                <p className="text-gray-400 group-hover:text-gray-200 transition-colors">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      {/* Floating Action Button - New Customer */}
      <Link
        to="/createCustomer"
        className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-full p-6 shadow-2xl shadow-amber-600/50 hover:shadow-amber-700/70 transition-all duration-300 transform hover:scale-110 flex items-center gap-3"
      >
        <Users size={28} />
        <span className="hidden sm:inline font-bold text-lg">New Customer</span>
      </Link>
    </div>
  );
};
export default First;
