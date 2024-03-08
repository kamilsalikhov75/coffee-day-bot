import { InlineKeyboard } from "grammy";
import { Role } from "../entitities/user/user.schema";
import { ACTIONS } from "../const/actions";

const KEYBOARD_BUTTONS = {
  [Role.Customer]: [
    { label: "Меню", data: ACTIONS.MENU },
    { label: "Корзина", data: ACTIONS.CART },
    { label: "Заказы", data: ACTIONS.MY_ORDERS },
  ],
  [Role.Employee]: [{ label: "Заказы", data: ACTIONS.ORDERS }],
};

export const getMainKeyboard = (role: Role) => {
  const buttons = KEYBOARD_BUTTONS[role].map((item) => [
    InlineKeyboard.text(item.label, item.data),
  ]);
  const inlineKeyboard = InlineKeyboard.from(buttons);

  return inlineKeyboard;
};
