import { z } from "zod";

export const addressSchema = z.object({
  fullName: z.string().min(2, "Enter the name for the delivery."),
  street: z.string().min(4, "Enter your street and house number."),
  city: z.string().min(2, "Enter your city."),
  postcode: z.string().min(3, "Enter your postcode or ZIP code."),
  country: z.string().min(2, "Enter your country."),
});

export type AddressInput = z.infer<typeof addressSchema>;
