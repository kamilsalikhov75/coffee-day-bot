import { UserModel } from "../user/user.schema";

export const clearCart = async (userId: string) => {
  await UserModel.findByIdAndUpdate(userId, { cart: [] });
};
