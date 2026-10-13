export {};

declare global {
  namespace Express {
    interface Locals {
      userId: number;
      role: "admin" | "user";
    }
  }
}
