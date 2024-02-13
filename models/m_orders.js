const mongoose = require('mongoose')


const orderItemSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    product_name: {
        type: String,
        default: ''
    },
    quantity: {
        type: Number,
        required: true,
    },
});


const m_orders = mongoose.Schema({
    user_id: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    items: [orderItemSchema],
    total_amount: {
        type: Number,
        required: true,
    }
}, { timestamps: true })


module.exports = mongoose.model('m_orders', m_orders)