import jsPDF from "jspdf";
import "jspdf-autotable";

// Invoice PDF (Professional Bill Format)
export const generateInvoicePDF = (sale, pharmacyDetails = {}) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Header Section with Border
  doc.setLineWidth(0.5);
  doc.rect(10, 10, 190, 35);
  
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(pharmacyDetails.name || "VISHWAS MEDICAL STORES", 105, 20, { align: "center" });
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(pharmacyDetails.address || "Church Street, Bengaluru - 560001, Karnataka", 105, 27, { align: "center" });
  doc.text(`Phone: ${pharmacyDetails.phone || "+91-XXXXXXXXXX"} | Email: ${pharmacyDetails.email || "contact@vishwasmedical.com"}`, 105, 32, { align: "center" });
  doc.text(`GSTIN: ${pharmacyDetails.gstin || "29XXXXXXXXXXXXX"} | Drug License: ${pharmacyDetails.license || "KA/XXX/XXXX"}`, 105, 37, { align: "center" });

  // Invoice Title Bar
  doc.setFillColor(0, 0, 0);
  doc.rect(10, 48, 190, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("TAX INVOICE", 105, 53.5, { align: "center" });

  // Invoice Details Section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  
  const invoiceNo = sale.invoiceNo || `INV${Date.now().toString().slice(-6)}`;
  const invoiceDate = sale.date ? new Date(sale.date).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN");
  
  doc.text(`Invoice No: ${invoiceNo}`, 15, 63);
  doc.text(`Invoice Date: ${invoiceDate}`, 15, 68);
  doc.text(`Payment Mode: ${sale.paymentMode || "Cash"}`, 15, 73);

  // Customer Details Box
  doc.setLineWidth(0.3);
  doc.rect(10, 78, 95, 25);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("BILL TO:", 12, 83);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Name: ${sale.customer?.name || "Walk-in Customer"}`, 12, 88);
  doc.text(`Phone: ${sale.customer?.phone || "N/A"}`, 12, 93);
  doc.text(`Address: ${sale.customer?.address || "—"}`, 12, 98);

  // Billing Summary Box
  doc.rect(110, 78, 90, 25);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("BILLING SUMMARY:", 112, 83);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Total Items: ${sale.items?.length || 0}`, 112, 88);
  doc.text(`Total Qty: ${sale.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}`, 112, 93);
  doc.text(`Pharmacist: ${sale.pharmacist || "—"}`, 112, 98);

  // Items Table
  const tableColumn = ["S.No", "Medicine Name", "Batch No.", "Expiry", "Qty", "MRP", "Disc%", "Amount"];
  const tableRows = sale.items.map((item, index) => {
    const prodName = item.name || item.product?.itemName || item.product?.Name || "Unknown Medicine";
    const batchNo = item.batchNo || item.product?.batchNo || "—";
    const expiry = item.expiry || item.product?.expiryDate || "—";
    const discount = item.discount || 0;
    const amount = (item.price * item.quantity * (1 - discount / 100)).toFixed(2);
    
    return [
      index + 1,
      prodName,
      batchNo,
      expiry,
      item.quantity,
      `₹${item.price.toFixed(2)}`,
      discount > 0 ? `${discount}%` : "—",
      `₹${amount}`,
    ];
  });

  doc.autoTable({
    startY: 108,
    head: [tableColumn],
    body: tableRows,
    theme: "striped",
    headStyles: { 
      fillColor: [0, 0, 0], 
      textColor: [255, 255, 255], 
      fontStyle: "bold",
      fontSize: 9,
      halign: "center"
    },
    styles: { 
      fontSize: 8, 
      cellPadding: 2,
      lineColor: [0, 0, 0],
      lineWidth: 0.1
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: 55 },
      2: { cellWidth: 25, halign: "center" },
      3: { cellWidth: 20, halign: "center" },
      4: { cellWidth: 12, halign: "center" },
      5: { cellWidth: 20, halign: "right" },
      6: { cellWidth: 15, halign: "center" },
      7: { cellWidth: 25, halign: "right" },
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  // Totals Section
  let finalY = doc.lastAutoTable.finalY + 5;
  
  const subtotal = sale.subtotal || sale.totalAmount || 0;
  const taxRate = sale.taxRate || 0;
  const taxAmount = (subtotal * taxRate / 100);
  const totalAmount = subtotal + taxAmount;
  const discount = sale.discount || 0;

  // Totals Box
  const totalsX = 135;
  const totalsWidth = 65;
  
  doc.setLineWidth(0.3);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  
  // Subtotal
  doc.text("Subtotal:", totalsX, finalY);
  doc.text(`₹${subtotal.toFixed(2)}`, totalsX + totalsWidth, finalY, { align: "right" });
  
  // Discount
  if (discount > 0) {
    finalY += 5;
    doc.text(`Discount (${discount}%):`, totalsX, finalY);
    doc.text(`- ₹${(subtotal * discount / 100).toFixed(2)}`, totalsX + totalsWidth, finalY, { align: "right" });
  }
  
  // Tax
  if (taxRate > 0) {
    finalY += 5;
    doc.text(`GST (${taxRate}%):`, totalsX, finalY);
    doc.text(`₹${taxAmount.toFixed(2)}`, totalsX + totalsWidth, finalY, { align: "right" });
  }
  
  // Total Line
  finalY += 1;
  doc.setLineWidth(0.5);
  doc.line(totalsX, finalY, totalsX + totalsWidth, finalY);
  
  finalY += 6;
  doc.setFillColor(0, 0, 0);
  doc.rect(totalsX - 2, finalY - 5, totalsWidth + 2, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("TOTAL AMOUNT:", totalsX, finalY);
  doc.text(`₹${(sale.totalAmount || totalAmount).toFixed(2)}`, totalsX + totalsWidth, finalY, { align: "right" });
  
  // Amount in Words
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  finalY += 8;
  const amountInWords = numberToWords(sale.totalAmount || totalAmount);
  doc.text(`Amount in Words: ${amountInWords} Only`, 15, finalY);

  // Terms and Conditions
  finalY += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Terms & Conditions:", 15, finalY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  finalY += 4;
  doc.text("1. Goods once sold will not be taken back or exchanged", 15, finalY);
  finalY += 4;
  doc.text("2. All disputes subject to local jurisdiction only", 15, finalY);
  finalY += 4;
  doc.text("3. Prescription medicines sold on valid prescription only", 15, finalY);

  // Signature Section
  const signY = 260;
  doc.setLineWidth(0.3);
  doc.line(15, signY, 60, signY);
  doc.line(150, signY, 195, signY);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Customer Signature", 15, signY + 4);
  doc.text("For " + (pharmacyDetails.name || "VISHWAS MEDICAL STORES"), 150, signY + 4);
  doc.text("Authorized Signatory", 150, signY + 8);

  // Footer
  doc.setLineWidth(0.5);
  doc.line(10, 275, 200, 275);
  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);
  doc.text("This is a computer generated invoice and does not require signature", 105, 280, { align: "center" });
  doc.text(`Generated on: ${new Date().toLocaleString("en-IN")}`, 105, 285, { align: "center" });

  return doc.output("blob");
};

// Order PDF (Professional Purchase Order Format)
export const generateOrderPDF = (orderItems, pharmacyDetails = {}) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Header with Border
  doc.setLineWidth(0.5);
  doc.rect(10, 10, 190, 35);
  
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(pharmacyDetails.name || "VISHWAS MEDICAL STORES", 105, 20, { align: "center" });
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(pharmacyDetails.address || "Church Street, Bengaluru - 560001, Karnataka", 105, 27, { align: "center" });
  doc.text(`Phone: ${pharmacyDetails.phone || "+91-XXXXXXXXXX"} | Email: ${pharmacyDetails.email || "contact@vishwasmedical.com"}`, 105, 32, { align: "center" });
  doc.text(`GSTIN: ${pharmacyDetails.gstin || "29XXXXXXXXXXXXX"} | Drug License: ${pharmacyDetails.license || "KA/XXX/XXXX"}`, 105, 37, { align: "center" });

  // Purchase Order Title
  doc.setFillColor(0, 0, 0);
  doc.rect(10, 48, 190, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("PURCHASE ORDER", 105, 53.5, { align: "center" });

  // Order Details
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  
  const orderNo = `PO${Date.now().toString().slice(-6)}`;
  const orderDate = new Date().toLocaleDateString("en-IN");
  
  doc.text(`Order No: ${orderNo}`, 15, 63);
  doc.text(`Order Date: ${orderDate}`, 15, 68);
  doc.text(`Required By: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN")}`, 15, 73);

  // From Section
  doc.setLineWidth(0.3);
  doc.rect(10, 78, 90, 25);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("FROM:", 12, 83);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(pharmacyDetails.name || "Vishwas Medical Stores", 12, 88);
  doc.text(pharmacyDetails.address || "Church Street, Bengaluru", 12, 93);
  doc.text(`Phone: ${pharmacyDetails.phone || "+91-XXXXXXXXXX"}`, 12, 98);

  // To Section
  doc.rect(105, 78, 95, 25);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("TO: SUPPLIER", 107, 83);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("(To be filled by supplier)", 107, 88);
  doc.text("Name: _______________________", 107, 93);
  doc.text("Address: ____________________", 107, 98);

  // Order Items Table
  const tableColumn = ["S.No", "Product Name", "Manufacturer/Supplier", "Order Qty", "Unit", "Rate", "Amount"];
  
  const tableRows = orderItems.map((item, index) => [
    index + 1,
    item.itemName || item.Name || "—",
    item.stockBroughtBy || item.manufacturer || "—",
    item.orderQty === "" || item.orderQty == null ? "—" : item.orderQty,
    item.unit || "Pcs",
    "______",
    "______",
  ]);

  doc.autoTable({
    startY: 108,
    head: [tableColumn],
    body: tableRows,
    theme: "striped",
    headStyles: { 
      fillColor: [0, 0, 0], 
      textColor: [255, 255, 255], 
      fontStyle: "bold",
      fontSize: 9,
      halign: "center"
    },
    styles: { 
      fontSize: 8, 
      cellPadding: 2.5,
      lineColor: [0, 0, 0],
      lineWidth: 0.1
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: 60 },
      2: { cellWidth: 45 },
      3: { cellWidth: 18, halign: "center" },
      4: { cellWidth: 15, halign: "center" },
      5: { cellWidth: 20, halign: "right" },
      6: { cellWidth: 20, halign: "right" },
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  // Total Summary Box
  let finalY = doc.lastAutoTable.finalY + 10;
  
  doc.setLineWidth(0.3);
  doc.rect(135, finalY, 65, 30);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Subtotal:", 137, finalY + 5);
  doc.text("_____________", 165, finalY + 5);
  
  doc.text("Tax (GST):", 137, finalY + 11);
  doc.text("_____________", 165, finalY + 11);
  
  doc.setLineWidth(0.5);
  doc.line(137, finalY + 14, 198, finalY + 14);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("TOTAL:", 137, finalY + 20);
  doc.text("_____________", 165, finalY + 20);

  // Terms and Conditions
  finalY = finalY + 38;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Terms & Conditions:", 15, finalY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  finalY += 4;
  doc.text("1. Please supply medicines with minimum 12 months expiry", 15, finalY);
  finalY += 4;
  doc.text("2. Payment terms: As per agreement", 15, finalY);
  finalY += 4;
  doc.text("3. Delivery charges: To be borne by supplier", 15, finalY);
  finalY += 4;
  doc.text("4. GST will be claimed as per tax invoice", 15, finalY);

  // Special Instructions
  finalY += 8;
  doc.setFont("helvetica", "bold");
  doc.text("Special Instructions:", 15, finalY);
  doc.setFont("helvetica", "normal");
  finalY += 4;
  doc.text("Please confirm this order and provide expected delivery date.", 15, finalY);

  // Signature Section
  const signY = 255;
  doc.setLineWidth(0.3);
  doc.line(15, signY, 60, signY);
  doc.line(150, signY, 195, signY);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Prepared By", 15, signY + 4);
  doc.text(`Date: ${orderDate}`, 15, signY + 8);
  
  doc.text("Authorized By", 150, signY + 4);
  doc.text("Purchase Manager", 150, signY + 8);

  // Footer
  doc.setLineWidth(0.5);
  doc.line(10, 270, 200, 270);
  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);
  doc.text("This is a computer generated purchase order", 105, 275, { align: "center" });
  doc.text(`Generated on: ${new Date().toLocaleString("en-IN")} | ${pharmacyDetails.name || "Vishwas Medical"}`, 105, 280, { align: "center" });

  return doc.output("blob");
};

// Utility function to convert number to words
function numberToWords(num: number): string {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];

  if (num === 0) return "Zero";

  const numStr = Math.floor(num).toString();
  const decimals = Math.round((num - Math.floor(num)) * 100);

  let words = "";

  // Lakhs
  if (numStr.length > 5) {
    const lakhs = parseInt(numStr.slice(0, -5));
    if (lakhs > 0) words += convertHundreds(lakhs) + " Lakh ";
  }

  // Thousands
  if (numStr.length > 3) {
    const thousands = parseInt(numStr.slice(-5, -3));
    if (thousands > 0) words += convertHundreds(thousands) + " Thousand ";
  }

  // Hundreds
  const hundreds = parseInt(numStr.slice(-3));
  if (hundreds > 0) words += convertHundreds(hundreds);

  if (decimals > 0) {
    words += " and " + decimals + " Paise";
  }

  return words.trim() + " Rupees";

  function convertHundreds(n: number): string {
    let str = "";
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const o = n % 10;

    if (h > 0) str += ones[h] + " Hundred ";
    if (t === 1) str += teens[o] + " ";
    else {
      if (t > 0) str += tens[t] + " ";
      if (o > 0) str += ones[o] + " ";
    }
    return str;
  }
}
