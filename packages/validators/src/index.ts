import { z } from "zod";

// ตัวอย่าง Schema กลางที่แชร์ระหว่าง Storefront, Admin, NestJS
export const CreateProductDto = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.number().positive("Price must be positive"),
});

export type CreateProductInput = z.infer<typeof CreateProductDto>;
