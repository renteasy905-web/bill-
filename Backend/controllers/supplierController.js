const Product = require("../models/Product"); // ← you need this model

exports.getSupplierSummary = async (req, res) => {
  try {
    const summary = await Product.aggregate([
      {
        $match: {
          stockBroughtBy: { $exists: true, $ne: "" } // skip empty/missing
        }
      },
      {
        $group: {
          _id: "$stockBroughtBy",                    // group by supplier name
          totalPurchaseValue: {
            $sum: { $multiply: ["$quantity", "$purchasePrice"] }
          },
          productsCount: { $sum: 1 },
          // Optional: last added product date
          lastStockDate: { $max: "$createdAt" }      // if you have createdAt
        }
      },
      {
        $sort: { _id: 1 } // sort alphabetically by supplier name
      },
      {
        $project: {
          supplier: "$_id",
          totalPendingAmount: "$totalPurchaseValue", // for now = current stock value
          productsCount: 1,
          lastStockDate: 1,
          _id: 0
        }
      }
    ]);

    // If you later have payments collection → you can subtract paid amounts here

    res.status(200).json({
      success: true,
      suppliers: summary
    });
  } catch (error) {
    console.error("Supplier summary error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
