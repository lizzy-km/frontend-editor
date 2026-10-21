import { z } from "zod";

export const productFormSchema = z.object({
  name: z.string().min(2, "Give the product a name."),
  categoryId: z.string().min(1, "Choose a category."),
  price: z.string().refine((value) => Number(value) > 0, "Enter a price above 0, like 49.90."),
  stock: z
    .string()
    .refine((value) => value.trim() !== "" && Number.isInteger(Number(value)) && Number(value) >= 0, "Enter a whole number, 0 or more."),
  sizes: z.string().min(1, "List at least one size, separated by commas."),
  colours: z.string().min(1, "List at least one colour, separated by commas."),
  image: z.url("Paste a full picture address, starting with https://").refine((value) => value.startsWith("https://"), "The picture address must start with https://"),
  description: z.string().min(10, "Write a short description, at least 10 characters."),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
