import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Tell us your name, at least 2 letters."),
  email: z.email("Enter a valid email address, like name@example.com."),
  message: z.string().min(10, "Write a few words so we can help, at least 10 characters."),
});

export type ContactInput = z.infer<typeof contactSchema>;
