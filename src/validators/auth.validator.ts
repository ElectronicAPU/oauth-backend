import { z } from "zod";

export const signupSchema = z.object({
  name: z.string("Name is required").trim().min(1, "Name is required").max(100),
  userName: z
    .string("Username is required")
    .trim()
    .min(3, "User name must be 3 charecters")
    .max(120),
  email: z.email("Enter a valid email."),
  password: z
    .string("Password is requried.")
    .min(8, "Password must be 8 charecters")
    .max(72),
});

export const signinSchema = z.object({
  email: z.email("Enter a valid email."),
  password: z.string("Password is required.").min(1, "Password is required."),
});



export type SigninInput = z.infer<typeof signinSchema>
export type SignupInput = z.infer<typeof signupSchema>;
