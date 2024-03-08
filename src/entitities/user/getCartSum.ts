import { CartItem } from "./types";

export const getCartSum = (cart: CartItem[]) => {
  const sum = cart.reduce((acc, cartItem) => {
    return acc + cartItem.count * cartItem.product.price;
  }, 0);

  return sum;
};
