const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());


mongoose.connect('mongodb://127.0.0.1:27017/inventorydb')
  .then(() => console.log("🟢 MongoDB Connected"))
  .catch((err) => console.error('❌ DB error:', err));


const productRoute = require('./routes/productRoutes');
app.use("/api/product", productRoute);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
