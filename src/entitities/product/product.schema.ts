import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true,
  },
  description: String,
  price: {
    type: Number,
    require: true,
  },

  composition: [String],
});

export const ProductModel = mongoose.model("Product", productSchema);
