export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  composition: string[];
  longTime?: boolean;
}
