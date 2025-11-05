export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  createdBy?: string; // ✅ ADICIONAR
}