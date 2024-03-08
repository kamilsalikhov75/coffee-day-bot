import mongoose from "mongoose";
import { cartSchema } from "../cart/cart.schema";

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    cart: [cartSchema],
    sum: Number,
  },
  { timestamps: true }
);

export const OrderModel = mongoose.model("Order", orderSchema);
