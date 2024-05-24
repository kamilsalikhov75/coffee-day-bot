import { Bot, GrammyError, HttpError, InlineKeyboard } from "grammy";
import "dotenv/config";
import mongoose, { ObjectId } from "mongoose";
import { Role, UserModel } from "./entitities/user/user.schema";
import { getMainKeyboard } from "./keyboards/mainKeyboard";
import { ProductModel } from "./entitities/product/product.schema";
import { getProductsKeyboard } from "./keyboards/productsKeybord";
import { Product } from "./entitities/product/types";
import { bold } from "./helpers/bold";
import { getProductKeyboard } from "./keyboards/productKeyboard";
import { ACTIONS } from "./const/actions";
import { getCart } from "./keyboards/cartKeyboard";
import { CartItem } from "./entitities/user/types";
import { getCartSum } from "./entitities/user/getCartSum";
import { OrderModel } from "./entitities/order/order.schema";
import { clearCart } from "./entitities/cart/clearCart";
import { getMyOrdersKeyboard } from "./keyboards/myOrdersKeyboard";
import { Order } from "./entitities/order/types";
import { getEmployeesTelegramIDS } from "./entitities/user/getEmployees";
import { getOrdersKeyboard } from "./keyboards/ordersKeyboard";
import { PAYMENT_PHONE } from "./const/payment";

// Подключение к базе данных
mongoose
  .connect(process.env.MONGO_DB || "")
  .then(() => console.log("DB Connected!"));

// Создание экземляра бота
const bot = new Bot(process.env.BOT_TOKEN || "");

// Добавление доступных команд бота
bot.api.setMyCommands([
  {
    command: "start",
    description: "Запустить бота",
  },
]);

// Срабатывает после /start
bot.command("start", async (ctx) => {
  const userData = {
    telegramId: ctx.from?.id,
    firstName: ctx.from?.first_name,
    telegramUsername: ctx.from?.username,
  };
  let userRole: Role = Role.Customer;

  let user = await UserModel.findOne({ telegramId: userData.telegramId });

  if (user) {
    userRole = user.role as Role;
  } else {
    user = await new UserModel({
      ...userData,
      role: Role.Customer,
      cart: [],
    }).save();

    userRole = user?.role as Role;
  }

  const keyboard = getMainKeyboard(userRole);

  await ctx.reply(`Привет ${userData.firstName}`, {
    reply_markup: keyboard,
  });
});

//  Показывает меню кофейни
bot.callbackQuery(ACTIONS.MENU, async (ctx) => {
  const products = await ProductModel.find();
  const keyboard = getProductsKeyboard(products as unknown as Product[]);
  await ctx.reply("Наше меню:", {
    reply_markup: keyboard,
  });
});

// Показывает конкретный товар
bot.callbackQuery(/product-[\s\S]*/, async (ctx) => {
  const productId = ctx.callbackQuery.data.replace(`${ACTIONS.PRODUCT}-`, "");
  const product = await ProductModel.findById(productId);
  const composition = product?.composition.map((item) => {
    return `\n- ${item}`;
  });

  const keyboard = getProductKeyboard(product?.id);

  const warning = product?.longTime
    ? `\n${bold(
        "Внимание:"
      )} Товар готовится индивидуально, нужно будет подождать :)`
    : "";

  await ctx.reply(
    `${bold("Товар:")} ${product?.title}\n${bold("Описание:")} ${
      product?.description
    }\n${bold("Цена:")} ${product?.price} руб.${warning} \n\n ${bold(
      "Состав:"
    )} ${composition}`,
    {
      parse_mode: "HTML",
      reply_markup: keyboard,
    }
  );
});

// Добавляет товар в корзину
bot.callbackQuery(/add-to-cart-[\s\S]*/, async (ctx) => {
  const productId = ctx.callbackQuery.data.replace(
    `${ACTIONS.ADD_TO_CART}-`,
    ""
  );

  const user = await UserModel.findOne({ telegramId: ctx.from.id });

  if (
    user?.cart.find(
      (cartItem) => cartItem.product?._id.toString() === productId
    )
  ) {
    user?.cart.map(async (cartItem) => {
      const count = (cartItem.count || 0) + 1;

      const data = await UserModel.findOne({
        telegramId: user?.telegramId,
        "cart._id": cartItem.id,
      });

      if (cartItem.product && cartItem.product._id.toString() === productId) {
        await UserModel.findOneAndUpdate(
          { _id: user?.id, "cart._id": cartItem.id },
          {
            $set: {
              "cart.$.count": count,
            },
          }
        );
      }
    });
  } else {
    await UserModel.findByIdAndUpdate(user?.id, {
      cart: [...(user?.cart || []), { product: productId, count: 1 }],
    });
  }

  await ctx.reply("Товар добавлен в корзину");
});

// Показывет главное меню
bot.callbackQuery(ACTIONS.MAIN_MENU, async (ctx) => {
  const userData = {
    telegramId: ctx.from?.id,
    firstName: ctx.from?.first_name,
  };
  let userRole: Role = Role.Customer;

  try {
    let user = await UserModel.findOne({ telegramId: userData.telegramId });
    userRole = user?.role as Role;
  } catch (error) {
    console.log(error);
  }

  const keyboard = getMainKeyboard(userRole);

  await ctx.reply("Главное меню", {
    reply_markup: keyboard,
  });
});

// Показывает корзину
bot.callbackQuery(ACTIONS.CART, async (ctx) => {
  const userData = {
    telegramId: ctx.from?.id,
    firstName: ctx.from?.first_name,
  };

  const user = await UserModel.findOne({
    telegramId: userData.telegramId,
  }).populate({
    path: "cart",
    populate: {
      path: "product",
    },
  });

  const keyboard = getCart(user?.cart as unknown as CartItem[]);
  const sum = getCartSum(user?.cart as unknown as CartItem[]);
  await ctx.reply(`${bold("Корзина")}\nСумма: ${sum} руб.`, {
    reply_markup: keyboard,
    parse_mode: "HTML",
  });
});

// Создает заказ
bot.callbackQuery(ACTIONS.CREATE_ORDER, async (ctx) => {
  const userData = {
    telegramId: ctx.from?.id,
    firstName: ctx.from?.first_name,
  };

  const user = await UserModel.findOne({
    telegramId: userData.telegramId,
  }).populate({
    path: "cart",
    populate: {
      path: "product",
    },
  });

  const sum = getCartSum(user?.cart as unknown as CartItem[]);
  const cart = user?.cart.map((cartItem) => ({
    product: cartItem.product?.id,
    count: cartItem.count,
  }));
  const orders = await OrderModel.find();
  const orderId = orders.length + 1;

  const order = await new OrderModel({
    customer: user?.id,
    sum,
    cart,
    numberId: orderId,
  }).save();
  await clearCart(user?.id);
  const keyboard = getMainKeyboard(user?.role as Role);

  await ctx.reply(
    `Заказ оформлен.\nСумма к оплате: ${sum} руб.\nДля оплаты переведите ${sum} руб. На карту Тинькоф по номеру телефона ${PAYMENT_PHONE} и в комментарии к платежу укажите номер заказа: ${orderId}.\nПосле оплаты ваш заказа начнут готовить.\nКак заказ будет готов, с вами свяжется нас сотрудник.\nЖдем вас!`,
    {
      reply_markup: keyboard,
      parse_mode: "HTML",
    }
  );
  const employees = await getEmployeesTelegramIDS();
  const orderKeyboard = new InlineKeyboard().text(
    `${order.sum} руб.`,
    `${ACTIONS.ORDER}-${order.id}`
  );
  employees.forEach((employee) => {
    bot.api.sendMessage(employee as number, `Новый заказ! №${orderId}`, {
      reply_markup: orderKeyboard,
    });
  });
});

// Показывет заказы клиенту
bot.callbackQuery(ACTIONS.MY_ORDERS, async (ctx) => {
  const userData = {
    telegramId: ctx.from?.id,
    firstName: ctx.from?.first_name,
  };

  const user = await UserModel.findOne({
    telegramId: userData.telegramId,
  });

  const orders = await OrderModel.find({ customer: user?.id }).sort({
    createdAt: -1,
  });

  const keyboard = getMyOrdersKeyboard(orders as unknown as Order[]);

  await ctx.reply(`${bold("Заказы")}`, {
    reply_markup: keyboard,
    parse_mode: "HTML",
  });
});

// Показывает все заказы для сотрудника
bot.callbackQuery(ACTIONS.ORDERS, async (ctx) => {
  const orders = await OrderModel.find().sort({
    createdAt: -1,
  });

  const keyboard = getOrdersKeyboard(orders as unknown as Order[]);

  await ctx.reply(`${bold("Заказы")}`, {
    reply_markup: keyboard,
    parse_mode: "HTML",
  });
});

// Показывет конкретный заказ клиенту
bot.callbackQuery(/my-order-[\s\S]*/, async (ctx) => {
  const orderId = ctx.callbackQuery.data.replace(`${ACTIONS.MY_ORDER}-`, "");
  const order = (await OrderModel.findById(orderId).populate({
    path: "cart",
    populate: {
      path: "product",
    },
  })) as Order;

  const products = order?.cart.map((cartItem) => {
    return `\n${cartItem.product.title} ${cartItem.count}шт. x ${
      cartItem.product.price
    } руб. = ${cartItem.count * cartItem.product.price} руб.`;
  });

  await ctx.reply(
    `${bold("Сумма:")} ${order.sum} руб. \n${bold("Товары:")}${products}`,
    {
      parse_mode: "HTML",
    }
  );
});

// Показывает конкретный заказ сотруднику
bot.callbackQuery(/order-[\s\S]*/, async (ctx) => {
  const orderId = ctx.callbackQuery.data.replace(`${ACTIONS.ORDER}-`, "");
  const order = (await OrderModel.findById(orderId)
    .populate({
      path: "cart",
      populate: {
        path: "product",
      },
    })
    .populate("customer")) as Order;

  const products = order?.cart.map((cartItem) => {
    return `\n${cartItem.product.title} ${cartItem.count}шт. x ${
      cartItem.product.price
    } руб. = ${cartItem.count * cartItem.product.price} руб.`;
  });

  const contactClient = order.customer.telegramUsername
    ? `<a href="https://t.me/${order.customer.telegramUsername}">Связаться с клиентом</a>`
    : "";

  await ctx.reply(
    `Заказ №${order.numberId}\n${bold("Имя Клиента:")} ${
      order.customer.firstName
    }\n${bold("Сумма:")} ${order.sum} руб. \n${bold(
      "Товары:"
    )}${products}\n\n${contactClient}`,
    {
      parse_mode: "HTML",
    }
  );
});

// Очищает корзину
bot.callbackQuery(ACTIONS.CLEAR_CART, async (ctx) => {
  const userData = {
    telegramId: ctx.from?.id,
    firstName: ctx.from?.first_name,
  };

  const user = await UserModel.findOne({
    telegramId: userData.telegramId,
  }).populate({
    path: "cart",
    populate: {
      path: "product",
    },
  });

  await clearCart(user?.id);
  const keyboard = getMainKeyboard(user?.role as Role);

  await ctx.reply("Корзина очищена", {
    reply_markup: keyboard,
  });
});

// Обработка ошибок. Благодаря этому коду, если возникнет какая-то ошибка, бот просто напишет об ошибке, но не сломается, его не придется перезапускать
bot.catch(async (err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }

  await err.ctx.reply("Возникла ошибка :( Попробуйте еще раз");
});

// Запускает бота на сервере
bot.start({
  onStart: () => {
    console.log("Bot started!");
  },
});
