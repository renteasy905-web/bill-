// src/utils/generatePDFs.js
import jsPDF from "jspdf";
import "jspdf-autotable";

// Your original invoice PDF function
export const generateInvoicePDF = (sale, pharmacyDetails) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const purple = "#6b21a8";
  const lightPurple = "#e9d5ff";
  const darkText = "#111827";
  const gray = "#6b7280";

  doc.setFillColor(purple);
  doc.rect(0, 0, 210, 30, "F");
  doc.setTextColor(255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("TAX INVOICE", 105, 18, { align: "center" });

  doc.setTextColor(lightPurple);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("MEDICAL INVOICE", 105, 38, { align: "center" });

  doc.setFontSize(11);
  doc.setTextColor(darkText);
  doc.setFont("helvetica", "normal");
  doc.text(pharmacyDetails.name, 20, 55);
  doc.text(pharmacyDetails.address, 20, 62);
  doc.text(`Phone: ${pharmacyDetails.phone}`, 20, 69);

  doc.setFillColor(lightPurple);
  doc.rect(10, 80, 190, 12, "F");
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Party's Name", 15, 88);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${sale.customer?.name || "Walk-in Patient"}`, 15, 98);
  doc.text(`Address: ${sale.customer?.address || "—"}`, 15, 105);
  doc.text(`Phone: ${sale.customer?.phone || "—"}`, 15, 112);

  const tableColumn = ["S.No", "Items", "HSN", "BATCH", "MRP", "TAX", "Amount"];
  const tableRows = [];

  sale.items.forEach((item, index) => {
    const product = item.product || {};
    const amount = (item.price * item.quantity).toFixed(2);
    tableRows.push([
      index + 1,
      product.Name || "Item",
      "—",
      "—",
      `₹${product.Mrp?.toFixed(2) || item.price.toFixed(2)}`,
      "—",
      `₹${amount}`,
    ]);
  });

  doc.autoTable({
    startY: 120,
    head: [tableColumn],
    body: tableRows,
    theme: "grid",
    headStyles: { fillColor: purple, textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { fontSize: 10, cellPadding: 3, overflow: "linebreak" },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 70 },
      2: { cellWidth: 25 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 },
      5: { cellWidth: 20 },
      6: { cellWidth: 30 },
    },
  });

  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFillColor(purple);
  doc.rect(130, finalY, 70, 10, "F");
  doc.setTextColor(255);
  doc.setFontSize(11);
  doc.text("Sub Total", 135, finalY + 7);
  doc.setTextColor(darkText);
  doc.text(`₹${sale.totalAmount?.toFixed(2) || "0.00"}`, 175, finalY + 7, { align: "right" });

  doc.setFontSize(10);
  doc.text("Amount in words: Rupees One Hundred Only", 20, finalY + 25);

  doc.setFontSize(10);
  doc.text("Terms & Conditions:", 20, finalY + 45);
  doc.text("1. Goods once sold will not be taken back or exchanged.", 25, finalY + 52);
  doc.text("2. All disputes subject to Bengaluru jurisdiction.", 25, finalY + 59);

  doc.setFontSize(11);
  doc.text("Seal & Signature", 150, finalY + 70, { align: "right" });

  doc.setFontSize(9);
  doc.setTextColor(gray);
  doc.text("Thank you for your purchase - Vishwas Medical", 105, 280, { align: "center" });

  return doc.output("blob");
};

// New Order PDF function
export const generateOrderPDF = (orderItems, pharmacyDetails = {}) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const blue = "#1e40af";
  const darkText = "#111827";

  doc.setFillColor(blue);
  doc.rect(0, 0, 210, 35, "F");
  doc.setTextColor(255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("STOCK ORDER REQUEST", 105, 22, { align: "center" });

  doc.setFontSize(12);
  doc.text("Vishwas Medical", 105, 32, { align: "center" });

  doc.setTextColor(darkText);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("From:", 20, 50);
  doc.text(pharmacyDetails.name || "Vishwas Medical", 20, 58);
  doc.text(pharmacyDetails.address || "Shivamogga, Karnataka", 20, 65);
  doc.text(`Phone: ${pharmacyDetails.phone || "—"}`, 20, 72);
  doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, 20, 79);

  const tableColumn = ["S.No", "Product Name", "Supplier", "Current Stock", "Order Qty"];
  const tableRows = [];

  orderItems.forEach((item, index) => {
    tableRows.push([
      index + 1,
      item.Name || "—",
      item.stockBroughtBy || "Unknown",
      item.Quantity || 0,
      item.suggestedQty || "—",
    ]);
  });

  doc.autoTable({
    startY: 90,
    head: [tableColumn],
    body: tableRows,
    theme: "grid",
    headStyles: { fillColor: blue, textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { fontSize: 10, cellPadding: 4, overflow: "linebreak" },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 70 },
      2: { cellWidth: 45 },
      3: { cellWidth: 30 },
      4: { cellWidth: 30 },
    },
  });

  const finalY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(11);
  doc.setTextColor(darkText);
  doc.text("Kindly supply the above mentioned quantities at the earliest.", 20, finalY);
  doc.text("Thank you!", 20, finalY + 10);

  doc.setFontSize(9);
  doc.setTextColor("#666666");
  doc.text("Generated by Vishwas Medical Inventory System", 105, 280, { align: "center" });

  return doc.output("blob");
};
