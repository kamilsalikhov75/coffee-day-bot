import { Product } from "../product/types";

export interface CartItem {
  product: Product;
  count: number;
}

export interface User {
  _id: string;
  telegramId: number;
  firstName: string;
  telegramUsername: string;
  cart: CartItem[];
}
