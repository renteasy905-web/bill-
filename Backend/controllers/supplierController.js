// controllers/supplierController.js
const Product = require('../models/Product');

exports.getSupplierSummary = async (req, res) => {
  try {
    const summary = await Product.aggregate([
      // Step 1: Filter only products with valid supplier name
      {
        $match: {
          stockBroughtBy: { $exists: true, $ne: '', $type: 'string' },
        },
      },

      // Step 2: Group by supplier
      {
        $group: {
          _id: '$stockBroughtBy',
          totalPurchaseValue: {
            $sum: { $multiply: ['$quantity', '$purchasePrice'] },
          },
          productsCount: { $sum: 1 },
          lastStockDate: { $max: '$createdAt' },
        },
      },

      // Step 3: Sort alphabetically by supplier name
      {
        $sort: { _id: 1 },
      },

      // Step 4: Shape the output to match frontend expectations
      {
        $project: {
          _id: 0,
          supplier: '$_id',
          totalPendingAmount: '$totalPurchaseValue', // current stock value (can be adjusted later)
          productsCount: 1,
          lastStockDate: 1,
        },
      },
    ]);

    // Optional: If you later add a Payments collection, you can compute real pending here
    // Example future improvement:
    // const realPending = await calculateRealPending(summary);

    res.status(200).json({
      success: true,
      count: summary.length,
      suppliers: summary,
    });
  } catch (error) {
    console.error('Error in getSupplierSummary:', error);

    // Better error handling for client
    const status = error.name === 'CastError' ? 400 : 500;
    const message =
      error.name === 'CastError'
        ? 'Invalid data format in database'
        : 'Internal server error while fetching supplier summary';

    res.status(status).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
