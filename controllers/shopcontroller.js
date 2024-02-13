const { default: mongoose } = require("mongoose");
const m_product = require("../models/m_product");
const fs = require("fs");
const path = require("path");
const Jimp = require("jimp");
const m_orders = require("../models/m_orders");
const { log } = require("console");
const m_cart = require("../models/m_cart");

// const m_transaction = require("../models/m_transaction")
const saveBase64Images = async (
    catName,
    base64Images,
    width = 700,
    height = 700
) => {
    const uploadFolder = "uploads";
    const catFolder = path.join(uploadFolder, catName.replace(" ", ""));
    if (!fs.existsSync(catFolder)) {
        fs.mkdirSync(catFolder, { recursive: true });
    }
    for (const base64 of base64Images) {
        if (!base64?.img_src.includes("http")) {
            const dataBuffer = Buffer.from(base64?.img_src?.split(",")[1], "base64");
            const fileName = base64.img_name;
            const filePath = path.join(catFolder, fileName);

            try {
                const image = await Jimp.read(dataBuffer);
                await image.resize(width, height).write(filePath).quality(50);
                console.log(`Image ${fileName} resized and saved successfully!`);
            } catch (err) {
                console.error(`Error processing image ${fileName}:`, err);
            }
        }
    }
    return 1;
};

const saveBase64Img = async (
    name, base64
) => {
    if (base64) {
        const dataBuffer = Buffer.from(base64.split(",")[1], "base64");
        const filePath = path.join('uploads/products', name);
        try {
            const image = await Jimp.read(dataBuffer);
            await image.write(filePath).quality(55);
            console.log(
                `Image saved successfully!`
            );
        } catch (err) {
            console.error(`Error processing image ${name}:`, err);
        }

    }
    return 1;
};


const add_product = async (req, res) => {
    const {
        product_name,
        product_image,
        image_name,
        price,
    } = req.body;
    try {
        const product = new m_product({
            name: product_name,
            product_img: image_name,
            price: price,
        });
        const result = await product.save();
        if (result && saveBase64Img(image_name, product_image)) {
            return res
                .status(200)
                .json({ message: "Product added successfully", status: 1 });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};
const get_all_products = async (req, res) => {
    const { skip } = req.body;

    const aggregationPipeline = [
        {
            $facet: {
                totalCount: [{ $count: "total" }],
                data: [
                    { $skip: parseInt(skip) || 0 },
                    { $limit:  10 },
                ],
            },
        },
        {
            $project: {
                totalCount: { $arrayElemAt: ["$totalCount.total", 0] },
                data: 1,
            },
        },
    ];

    try {
        const products = await m_product.aggregate(aggregationPipeline);
        res.status(200).json(products);
    } catch (error) {
        console.error("Error retrieving products:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const edit_product = async (req, res) => {
    const {
        _id,
        product_name,
        product_image,
        image_name,
        price
    } = req.body;
    try {
        const edit_prod = await m_product.findOneAndUpdate(
            { _id: mongoose.Types.ObjectId(_id) },
            {
                $set: {
                    name: product_name,
                    price: price,
                },
            }
        );
        if (
            edit_prod && (product_image ?
                saveBase64Img(image_name, product_image) : true)
        ) {
            res
                .status(200)
                .json({ message: "Product Edited Successfully", status: 1 });
        }
    } catch (error) {
        console.error("Error deleteing subcategory:", error);
        return res
            .status(500)
            .json({ message: "Internal Server Error", status: 0 });
    }
};
const delete_product = async (req, res) => {
    const { product_id } = req.body;
    try {
        const delete_prod = await m_product.findOneAndDelete({
            _id: mongoose.Types.ObjectId(product_id),
        });
        if (delete_prod) {
            res
                .status(200)
                .json({ message: "Product Deleted Successfully", status: 1 });
        }
    } catch (error) {
        return res
            .status(500)
            .json({ message: "Internal Server Error", status: 0 });
    }
};
const place_order = async (req, res) => {
    try {
        const { user_id, items, total_amount } =
            req.body;
        const order = new m_orders({
            user_id: user_id,
            items: items,
            total_amount: total_amount
        });

        const savedOrder = await order.save();
        if (savedOrder) {
            await m_cart.deleteMany({
                user_id: mongoose.Types.ObjectId(user_id),
            });
            res.status(200).json({
                message: "Order Placed Successfully",
                status: 1,
                result: savedOrder,
            });
        } else {
            res.status(500).json({
                message: "Error placing order or updating quantities",
                status: 0,
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error", status: 0 });
    }
};

const add_cart = async (req, res) => {
    try {
        const { user_id, items, total_amount } =
            req.body;
        const cart = new m_cart({
            user_id: user_id,
            items: items
        });

        const savedcart = await cart.save();
        if (savedcart) {
            res.status(200).json({
                message: "Cart added Successfully",
                status: 1,
                result: savedcart,
            });
        } else {
            res.status(500).json({
                message: "Error placing cart or updating quantities",
                status: 0,
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error", status: 0 });
    }
};

const upd_cart = async (req, res) => {
    try {
        const { items, _id } =
            req.body;
        const cart = await m_cart.findOneAndUpdate(
            { _id: mongoose.Types.ObjectId(_id) },
            {
                $set: {
                    items: items
                },
            },
        )
        if (cart) {
            res.status(200).json({
                message: "Cart updated Successfully",
                status: 1,
                result: cart,
            });
        } else {
            res.status(500).json({
                message: "Error placing cart or updating quantities",
                status: 0,
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error", status: 0 });
    }
};

const get_user_cart = async (req, res) => {
    try {
        const { user_id } = req.body;

        const cart = await m_cart.aggregate([
            {
                $match: {
                    user_id: mongoose.Types.ObjectId(user_id),
                },
            },
            {
                $unwind: "$items",
            },
            {
                $lookup: {
                    from: "m_products",
                    localField: "items.product_id",
                    foreignField: "_id",
                    as: "items.product",
                },
            },
            {
                $addFields: {
                    "items.product": { $arrayElemAt: ["$items.product", 0] },
                },
            },
            {
                $group: {
                    _id: "$_id",
                    status: { $first: "$status" },
                    user_id: { $first: "$user_id" },
                    total_amount: { $first: "$total_amount" },
                    createdAt: { $first: "$createdAt" },
                    items: { $push: "$items" },
                },
            },
        ]);

        res.status(200).json({ cart, status: 1 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error", status: 0 });
    }
};


const get_user_order = async (req, res) => {
    try {
        const { user_id } = req.body;

        const orders = await m_orders.aggregate([
            {
                $match: {
                    user_id: mongoose.Types.ObjectId(user_id),
                },
            },
            {
                $unwind: "$items",
            },
            {
                $lookup: {
                    from: "m_products",
                    localField: "items.product_id",
                    foreignField: "_id",
                    as: "items.product",
                },
            },
            {
                $addFields: {
                    "items.product": { $arrayElemAt: ["$items.product", 0] },
                },
            },
            {
                $group: {
                    _id: "$_id",
                    status: { $first: "$status" },
                    user_id: { $first: "$user_id" },
                    total_amount: { $first: "$total_amount" },
                    createdAt: { $first: "$createdAt" },
                    items: { $push: "$items" },
                },
            },
        ]);

        res.status(200).json({ orders, status: 1 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error", status: 0 });
    }
};

const update_order = async (req, res) => {
    const { status, order_id } = req.body;
    try {
        const updated_orders = await m_orders.findOneAndUpdate(
            { _id: mongoose.Types.ObjectId(order_id) },
            { $set: { status: status } },
            { new: true }
        );
        res.status(200).json({ updated_orders, status: 1 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error", status: 0 });
    }
};

module.exports = {
    add_product,
    get_all_products,
    edit_product,
    delete_product,
    place_order,
    get_user_order,
    update_order,
    add_cart,
    upd_cart,
    get_user_cart
};
