import { InlineKeyboard } from "grammy";
import { Product } from "../entitities/product/types";
import { ACTIONS } from "../const/actions";

export const getProductsKeyboard = (products: Product[]) => {
  const buttons = products.map((product) => [
    InlineKeyboard.text(
      `${product.title} | ${product.price} руб`,
      `${ACTIONS.PRODUCT}-${product._id}`
    ),
  ]);
  const inlineKeyboard = InlineKeyboard.from(buttons)
    .row()
    .text("Главное меню", ACTIONS.MAIN_MENU);

  return inlineKeyboard;
};
