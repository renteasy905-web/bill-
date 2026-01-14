const mongoose = require("mongoose");
const Sale = require("../models/Sales");      // ✅ matches Sales.js
const Product = require("../models/Products"); // ✅ matches Products.js



exports.createSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { customer, items, totalAmount, paymentMode } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('Items are required');
    }
    if (totalAmount === undefined || totalAmount === null) {
      throw new Error('Total amount is required');
    }

    // Enrich items with product name (for reliable display)
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.product).select('itemName salePrice');
        if (!product) throw new Error(`Product not found: ${item.product}`);
        return {
          product: item.product,
          name: product.itemName || 'Unknown Product',
          quantity: item.quantity,
          price: item.price || product.salePrice || 0,
        };
      })
    );

    // Validate stock
    for (const item of enrichedItems) {
      const product = await Product.findById(item.product).session(session);
      if (!product) throw new Error(`Product not found: ${item.product}`);
      if (product.quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.itemName}`);
      }
    }

    // Deduct stock
    for (const item of enrichedItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { quantity: -item.quantity } },
        { session }
      );
    }

    const sale = await Sale.create(
      [{
        customer: customer || null,
        items: enrichedItems,
        totalAmount,
        paymentMode: paymentMode || 'Cash',
      }],
      { session }
    );

    await session.commitTransaction();
    res.status(201).json({ success: true, sale: sale[0] });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

exports.getAllSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('customer', 'name phone address')
      .populate('items.product', 'itemName salePrice quantity')
      .sort({ date: -1 });
    res.status(200).json({ success: true, sales });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('customer', 'name phone address')
      .populate('items.product', 'itemName salePrice quantity');
    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale not found' });
    }
    res.status(200).json({ success: true, sale });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateSaleById = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sale = await Sale.findById(req.params.id).session(session);
    if (!sale) throw new Error('Sale not found');

    const { items: newItems, totalAmount, paymentMode } = req.body;

    if (newItems && Array.isArray(newItems)) {
      // Restore old stock
      for (const oldItem of sale.items) {
        await Product.findByIdAndUpdate(
          oldItem.product,
          { $inc: { quantity: oldItem.quantity } },
          { session }
        );
      }

      // Enrich new items
      const enrichedNewItems = await Promise.all(
        newItems.map(async (item) => {
          const product = await Product.findById(item.product).select('itemName salePrice');
          if (!product) throw new Error(`Product not found: ${item.product}`);
          return {
            product: item.product,
            name: product.itemName || 'Unknown Product',
            quantity: item.quantity,
            price: item.price || product.salePrice || 0,
          };
        })
      );

      // Deduct new stock
      for (const item of enrichedNewItems) {
        const product = await Product.findById(item.product).session(session);
        if (product.quantity < item.quantity) {
          throw new Error(`Insufficient stock for ${product.itemName}`);
        }
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { quantity: -item.quantity } },
          { session }
        );
      }

      sale.items = enrichedNewItems;
    }

    if (totalAmount !== undefined) sale.totalAmount = totalAmount;
    if (paymentMode) sale.paymentMode = paymentMode;

    await sale.save({ session });
    await session.commitTransaction();

    res.status(200).json({ success: true, sale });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

exports.deleteSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sale = await Sale.findById(req.params.id).session(session);
    if (!sale) throw new Error('Sale not found');

    // Restore stock
    for (const item of sale.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { quantity: item.quantity } },
        { session }
      );
    }

    await Sale.findByIdAndDelete(req.params.id).session(session);
    await session.commitTransaction();

    res.status(200).json({ success: true, message: 'Sale deleted and stock restored' });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};
