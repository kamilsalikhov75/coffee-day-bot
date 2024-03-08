import { InlineKeyboard } from "grammy";
import { ACTIONS } from "../const/actions";

export const getProductKeyboard = (productId: string) => {
  const inlineKeyboard = new InlineKeyboard()
    .text("Добавить в корзину", `${ACTIONS.ADD_TO_CART}-${productId}`)
    .row()
    .text("Назад", ACTIONS.MENU)
    .row()
    .text("Главное меню", ACTIONS.MAIN_MENU);

  return inlineKeyboard;
};
