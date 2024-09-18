// index.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const OrderItem = require('./models/OrderItem');

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// API endpoint to search order items
app.get('/api/orders', async (req, res) => {
    try {
        const { search } = req.query;
        
        // Create query conditions based on request parameters
        let query = {};

        if (search) {
            query.title = { $regex: search, $options: 'i' }; // case-insensitive search
        }
        const orders = await OrderItem.find(query);
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
