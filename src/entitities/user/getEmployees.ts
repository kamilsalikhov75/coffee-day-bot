import { Role, UserModel } from "./user.schema";

export const getEmployeesTelegramIDS = async () => {
  const employees = await UserModel.find({ role: Role.Employee });

  return employees.map((employee) => employee.telegramId);
};
