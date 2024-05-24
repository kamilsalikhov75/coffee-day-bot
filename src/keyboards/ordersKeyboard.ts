import { Order } from "../entitities/order/types";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { InlineKeyboard } from "grammy";
import { ACTIONS } from "../const/actions";

export const getOrdersKeyboard = (orders: Order[]) => {
  const buttons = orders.map((order) => {
    const date = format(order.createdAt, "dd MMMM yyyy", { locale: ru });

    return [
      InlineKeyboard.text(
        `№${order.numberId} ${date} | ${order.sum} руб.`,
        `${ACTIONS.ORDER}-${order._id}`
      ),
    ];
  });

  const inlineKeyboard = InlineKeyboard.from(buttons);

  return inlineKeyboard;
};
