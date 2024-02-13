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


const m_carts = mongoose.Schema({
    user_id: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    items: [orderItemSchema]
}, { timestamps: true })


module.exports = mongoose.model('m_carts', m_carts)