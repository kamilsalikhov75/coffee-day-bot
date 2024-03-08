import mongoose from "mongoose";
import { cartSchema } from "../cart/cart.schema";

export enum Role {
  Customer = "customer",
  Employee = "employee",
}

const userSchema = new mongoose.Schema({
  telegramId: {
    type: Number,
    unique: true,
    require: true,
  },
  telegramUsername: {
    type: String,
    unique: true,
  },
  firstName: {
    type: String,
    require: true,
  },
  role: {
    type: String,
    require: true,
  },
  cart: [cartSchema],
});

export const UserModel = mongoose.model("User", userSchema);
