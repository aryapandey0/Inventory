const express = require('express');
const Product = require('../models/Product');

const router = express.Router();


router.post("/create", async (req, res) => {
  const { name, category, price, quantity, expiryDate } = req.body;

  try {
    const product = new Product({
      name,
      category,
      price,
      quantity,
      expiryDate
    });

    await product.save();
    return res.status(201).json(product);
  } catch (err) {
    console.error("Insert error:", err);
    return res.status(400).json({ message: "Product not inserted", error: err.message });
  }
});

router.get("/all", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const nameFilter = req.query.name;
    const priceFilter = req.query.price;
    const categoryFilter = req.query.category;
    const sortBy = req.query.sortBy; // e.g. price, expiryDate
    const order = req.query.order === "desc" ? -1 : 1; // default asc

    const filter = {};
    if (nameFilter) filter.name = nameFilter;
    if (priceFilter) filter.price = Number(priceFilter);
    if (categoryFilter) filter.category = categoryFilter;

    const total = await Product.countDocuments(filter);

    let query = Product.find(filter).skip(skip).limit(limit);

    if (sortBy) {
      const sortOptions = {};
      sortOptions[sortBy] = order;
      query = query.sort(sortOptions);
    }

    const products = await query;

    return res.status(200).json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: products
    });
  } catch (err) {
    console.error("Fetch error:", err);
    return res.status(500).json({ message: "Failed to fetch products", error: err.message });
  }
});


router.put("/:id", async (req, res) => {
  const productId = req.params.id;
  const { name, category, price, quantity, expiryDate } = req.body;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { name, category, price, quantity, expiryDate },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updatedProduct);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Failed to update", error: err.message });
  }
});


router.delete("/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Deleted successfully", product: deletedProduct });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Failed to delete", error: err.message });
  }
});

module.exports = router;
