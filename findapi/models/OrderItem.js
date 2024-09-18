// models/OrderItem.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  title: String,
  description: String,
  start_price: Number,
  reserve_price: Number
});

const OrderItem = mongoose.model('orders', orderItemSchema);

module.exports = OrderItem;
