import React, { useEffect, useState } from "react";

import api from "../utils/api";

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const today = new Date();
  const todayFormatted = today.toDateString();

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("allproducts");
        setProducts(res.data.allproducts || []);
      } catch (err) {
        console.error("Error fetching products", err);
      }
    };
    fetchProducts();
  }, []);

  // Screen resize
  useEffect(() => {
    const resize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // 🔥 Expiry logic (FROM TODAY)
  const getExpiryInfo = (expiryDate) => {
    const expiry = new Date(expiryDate);

    const diffMonths =
      (expiry.getFullYear() - today.getFullYear()) * 12 +
      (expiry.getMonth() - today.getMonth());

    if (diffMonths <= 3) {
      return { color: "#ff4d4f", label: "WITHIN 3 MONTHS" };
    }

    if (diffMonths > 3 && diffMonths <= 6) {
      return { color: "#38bdf8", label: "AFTER 3 MONTHS" };
    }

    return { color: "#22c55e", label: "AFTER 6 MONTHS" };
  };

  // Sort by nearest expiry
  const sortedProducts = [...products].sort(
    (a, b) => new Date(a.Expiry) - new Date(b.Expiry)
  );

  return (
    <div style={{ padding: 14, background: "#0f0f0f", minHeight: "100vh" }}>
      <h2 style={{ color: "#fff" }}>Product Expiry Dashboard</h2>

      {/* TODAY DATE SHOWN CLEARLY */}
      <p style={{ color: "#ccc", marginBottom: 16 }}>
        Date: <strong>{todayFormatted}</strong> <br />
        
      </p>

      {/* DESKTOP TABLE */}
      {!isMobile && (
        <table
          width="100%"
          cellPadding="10"
          style={{
            borderCollapse: "collapse",
            background: "#1c1c1c",
            color: "#000",
          }}
        >
          <thead>
            <tr style={{ background: "#000", color: "#fff" }}>
              <th>Name</th>
              <th>Description</th>
              <th>Qty</th>
              <th>MRP</th>
              <th>Expiry Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedProducts.map((p) => {
              const exp = getExpiryInfo(p.Expiry);
              return (
                <tr
                  key={p._id}
                  style={{ backgroundColor: exp.color, fontWeight: 600 }}
                >
                  <td>{p.Name}</td>
                  <td>{p.Description}</td>
                  <td>{p.Quantity}</td>
                  <td>₹{p.Mrp}</td>
                  <td>{new Date(p.Expiry).toDateString()}</td>
                  <td>{exp.label}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* MOBILE VIEW */}
      {isMobile &&
        sortedProducts.map((p) => {
          const exp = getExpiryInfo(p.Expiry);
          return (
            <div
              key={p._id}
              style={{
                background: exp.color,
                marginBottom: 12,
                padding: 12,
                borderRadius: 10,
                fontWeight: 600,
              }}
            >
              <div>Name: {p.Name}</div>
              <div>Description: {p.Description}</div>
              <div>Qty: {p.Quantity}</div>
              <div>MRP: ₹{p.Mrp}</div>
              <div>Expiry: {new Date(p.Expiry).toDateString()}</div>
              <div>Status: {exp.label}</div>
            </div>
          );
        })}
    </div>
  );
};

export default AllProducts;
