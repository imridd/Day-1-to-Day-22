
import { z } from "zod";

export const productSchema = z.object({
  sku: z.string()
    .trim()
    .regex(/^[A-Za-z0-9_-]{3,32}$/, "SKU must be 3-32 characters"),

  name: z.string()
    .trim()
    .min(2, "Minimum 2 characters")
    .max(100, "Maximum 100 characters"),

  price: z.string()
    .regex(
      /^(?:0|[1-9]\d{0,7})(?:\.\d{1,2})?$/,
      "Enter a valid price with maximum 2 decimals"
    )
    .transform(Number),

  stock: z.string()
    .regex(/^(0|[1-9]\d*)$/, "Stock must be a whole number")
    .refine(value => Number(value) <= 4294967295, "Stock is too large")
    .transform(Number)
});
