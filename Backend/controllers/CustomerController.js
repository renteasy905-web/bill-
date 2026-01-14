const Customer = require("../models/Customer");


exports.createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json({ success: true, customer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ name: 1 });
    res.status(200).json({ success: true, customers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
