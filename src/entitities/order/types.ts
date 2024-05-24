import { CartItem, User } from "../user/types";

export interface Order {
  _id: string;
  customer: User;
  cart: CartItem[];
  sum: number;
  createdAt: string;
  numberId: number;
}
