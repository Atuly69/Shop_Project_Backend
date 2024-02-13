const mongoose = require("mongoose");
const m_product = mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
    },
    product_img: {
      type: String,
      default: ""
    },
    price: {
      type: Number,
      default: 0,
    },
    status: {
      type: Number,
      default: 1, //0=Inactive,1=Active,-1=deleted
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("m_product", m_product);
