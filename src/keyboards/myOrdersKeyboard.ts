import { Order } from "../entitities/order/types";
import { InlineKeyboard } from "grammy";
import { ACTIONS } from "../const/actions";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export const getMyOrdersKeyboard = (orders: Order[]) => {
  const buttons = orders.map((order) => {
    const date = format(order.createdAt, "dd MMMM yyyy", { locale: ru });

    return [
      InlineKeyboard.text(
        `${date} | ${order.sum} руб.`,
        `${ACTIONS.MY_ORDER}-${order._id}`
      ),
    ];
  });

  const inlineKeyboard = InlineKeyboard.from(buttons);

  return inlineKeyboard;
};
