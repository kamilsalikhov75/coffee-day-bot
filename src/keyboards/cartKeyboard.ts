import { InlineKeyboard } from "grammy";
import { CartItem } from "../entitities/user/types";
import { ACTIONS } from "../const/actions";

export const getCart = (cart: CartItem[]) => {
  const buttons = cart.map((cartItem) => [
    InlineKeyboard.text(
      `${cartItem.product.title} ${cartItem.count}шт. x ${
        cartItem.product.price
      } руб. = ${cartItem.count * cartItem.product.price} руб.`,
      `${ACTIONS.PRODUCT}-${cartItem.product._id}`
    ),
  ]);

  if (buttons.length > 0) {
    return InlineKeyboard.from(buttons)
      .row()
      .text("Оформить заказ", ACTIONS.CREATE_ORDER)
      .text("Очистить корзину", ACTIONS.CLEAR_CART)
      .row()
      .text("Меню", ACTIONS.MENU);
  }

  const keyboard = InlineKeyboard.from(buttons)
    .row()
    .text("Меню", ACTIONS.MENU);
  return keyboard;
};
