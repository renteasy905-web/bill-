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
    setStatusMessage("Starting OCR... First time may take 30-60 seconds (downloading engine & English data)");

    try {
      // NEW STYLE: Language directly in createWorker – no load/loadLanguage/initialize needed!
      const worker = await createWorker('eng');

      setStatusMessage("Processing image... Please wait");

      const { data: { text } } = await worker.recognize(image);
      await worker.terminate();

      console.log("Extracted Text:", text);

      // Same improved parser as before (for Indian medical bills)
      const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 2);

      const extracted = [];
      let current = null;

      const expiryRegex = /(?:EXP|Expiry|Exp\.?|Use before|Mfg)[\s:]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\w{3}\s*\d{4}|\d{2}\/\d{4})/i;
      const qtyRegex = /(?:Qty|Quantity|x|X|\*)[\s:]*(\d+)/i;
      const mrpRegex = /(?:MRP|Rate|Price)[\s:]*₹?[\s]*(\d+(?:\.\d{2})?)/i;
      const priceAtEndRegex = /(\d+(?:\.\d{2})?)\s*$/;

      for (let line of lines) {
        const lower = line.toLowerCase();

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

        let mrpMatch = line.match(mrpRegex) || line.match(priceAtEndRegex);
        let mrpVal = mrpMatch ? parseFloat(mrpMatch[1] || mrpMatch[0]) : 0;

        let qtyMatch = line.match(qtyRegex);
        let qtyVal = qtyMatch ? parseInt(qtyMatch[1]) : 1;

        let expMatch = line.match(expiryRegex);
        let expVal = expMatch ? formatDate(expMatch[1] || expMatch[2]) : "";

        if (/^[A-Za-z0-9]/.test(line) && line.length > 4 && (mrpVal > 0 || qtyVal > 1 || expVal)) {
          if (current) extracted.push(current);

          let name = line
            .replace(mrpRegex, "")
            .replace(qtyRegex, "")
            .replace(expiryRegex, "")
            .replace(priceAtEndRegex, "")
            .trim();

          current = {
            Name: name || "Unknown Medicine",
            Description: "",
            Mrp: mrpVal || 0,
            Quantity: qtyVal,
            Expiry: expVal,
          };
        } else if (current) {
          current.Description += (current.Description ? " | " : "") + line;
          if (mrpVal > 0) current.Mrp = mrpVal;
          if (qtyVal > 1) current.Quantity = qtyVal;
          if (expVal) current.Expiry = expVal;
        }
      }

      if (current) extracted.push(current);

      const validProducts = extracted.filter((p) => p.Name && p.Mrp > 0 && p.Quantity > 0);

      setProducts(validProducts);
      setStatusMessage("");
      alert(`✅ Extracted ${validProducts.length} products! Review and edit below.`);
    } catch (err) {
      console.error(err);
      setStatusMessage("");
      alert("OCR failed. Try a clearer photo.");
    } finally {
      setLoading(false);
      setImage(null);
    }
  };

  const formatDate = (str) => {
    if (!str) return "";
    const parts = str.replace(/[\.\/\-]/g, "/").split("/");
    if (parts.length >= 2) {
      let [d, m, y] = parts;
      if (y && y.length === 2) y = "20" + y;
      if (m && m.length === 1) m = "0" + m;
      if (d && d.length === 1) d = "0" + d;
      return y && m && d ? `${y}-${m}-${d}` : "";
    }
    return "";
  };

  // Rest of the code (handleProductChange, submit, return JSX) remains EXACTLY THE SAME as previous version

  const handleProductChange = (index, field, value) => {
    const updated = [...products];
    updated[index][field] = field === "Mrp" || field === "Quantity" ? Number(value) || 0 : value;
    setProducts(updated);
  };

  const submit = async (e) => {
    e.preventDefault();

    if (products.length > 0) {
      setLoading(true);
      let successCount = 0;
      for (const p of products) {
        try {
          await api.post("/products", p);
          successCount++;
        } catch (err) {
          console.error("Failed:", p);
        }
      }
      alert(`✅ ${successCount}/${products.length} products created!`);
      setProducts([]);
      setLoading(false);
    } else {
      // Manual single product code (same as before)
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
        alert("Failed");
      }
    }
  };

  // JSX return same as last version (copy from previous message)
  return (
    // ... same JSX as before
  );
};

export default CreateProducts;
