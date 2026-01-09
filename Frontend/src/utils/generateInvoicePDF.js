import jsPDF from "jspdf";
import "jspdf-autotable";

export const generateInvoicePDF = (sale, pharmacyDetails) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Colors
  const purple = "#6b21a8"; // Tax Invoice header
  const lightPurple = "#e9d5ff";
  const darkText = "#111827";
  const gray = "#6b7280";

  // Header - TAX INVOICE (Purple)
  doc.setFillColor(purple);
  doc.rect(0, 0, 210, 30, "F");
  doc.setTextColor(255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("TAX INVOICE", 105, 18, { align: "center" });

  // MEDICAL INVOICE Title
  doc.setTextColor(lightPurple);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("MEDICAL INVOICE", 105, 38, { align: "center" });

  // Pharmacy Details
  doc.setFontSize(11);
  doc.setTextColor(darkText);
  doc.setFont("helvetica", "normal");
  doc.text(pharmacyDetails.name, 20, 55);
  doc.text(pharmacyDetails.address, 20, 62);
  doc.text(`Phone: ${pharmacyDetails.phone}`, 20, 69);

  // Party's Name (Patient/Customer)
  doc.setFillColor(lightPurple);
  doc.rect(10, 80, 190, 12, "F");
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Party's Name", 15, 88);

  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${sale.customer?.name || "Walk-in Patient"}`, 15, 98);
  doc.text(`Address: ${sale.customer?.address || "—"}`, 15, 105);
  doc.text(`Phone: ${sale.customer?.phone || "—"}`, 15, 112);

  // Invoice Table
  const tableColumn = ["S.No", "Items", "HSN", "BATCH", "MRP", "TAX", "Amount"];
  const tableRows = [];

  sale.items.forEach((item, index) => {
    const product = item.product || {};
    const amount = (item.price * item.quantity).toFixed(2);
    tableRows.push([
      index + 1,
      product.Name || "Item",
      "—", // HSN (you can add later if needed)
      "—", // BATCH (add batch if you have it)
      `₹${product.Mrp?.toFixed(2) || item.price.toFixed(2)}`,
      "—", // TAX (add GST % if you track it)
      `₹${amount}`,
    ]);
  });

  doc.autoTable({
    startY: 120,
    head: [tableColumn],
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: purple,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
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

  // Subtotal & Total
  const finalY = doc.lastAutoTable.finalY + 10;

  doc.setFillColor(purple);
  doc.rect(130, finalY, 70, 10, "F");
  doc.setTextColor(255);
  doc.setFontSize(11);
  doc.text("Sub Total", 135, finalY + 7);

  doc.setTextColor(darkText);
  doc.text(`₹${sale.totalAmount?.toFixed(2) || "0.00"}`, 175, finalY + 7, { align: "right" });

  // Amount in Words (simple placeholder - you can add a real converter later)
  doc.setFontSize(10);
  doc.text("Amount in words: Rupees One Hundred Only", 20, finalY + 25);

  // Terms & Conditions
  doc.setFontSize(10);
  doc.text("Terms & Conditions:", 20, finalY + 45);
  doc.text("1. Goods once sold will not be taken back or exchanged.", 25, finalY + 52);
  doc.text("2. All disputes subject to Bengaluru jurisdiction.", 25, finalY + 59);

  // Seal & Signature
  doc.setFontSize(11);
  doc.text("Seal & Signature", 150, finalY + 70, { align: "right" });

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(gray);
  doc.text("Thank you for your purchase - Vishwas Medical", 105, 280, { align: "center" });

  return doc;
};
