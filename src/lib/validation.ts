import { z } from "zod";

const name = z.string().trim().min(1, "Pflichtfeld").max(100);
const email = z.string().trim().email("Ungültige E-Mail-Adresse").max(200);
const socialHandle = z
  .string()
  .trim()
  .max(60)
  .optional()
  .or(z.literal(""));

export const pickupOrderSchema = z.object({
  bookId: z.string().uuid(),
  deliveryType: z.literal("pickup"),
  firstName: name,
  lastName: name,
  email,
  socialHandle,
  // Honeypot-Feld gegen einfache Bots — muss leer bleiben.
  website: z.string().max(0).optional().or(z.literal("")),
});

export const shippingOrderSchema = z.object({
  bookId: z.string().uuid(),
  deliveryType: z.literal("shipping"),
  firstName: name,
  lastName: name,
  email,
  socialHandle,
  street: z.string().trim().min(1, "Pflichtfeld").max(150),
  houseNumber: z.string().trim().min(1, "Pflichtfeld").max(20),
  postalCode: z.string().trim().min(3, "Pflichtfeld").max(12),
  city: z.string().trim().min(1, "Pflichtfeld").max(100),
  country: z.string().trim().min(1, "Pflichtfeld").max(60).default("Deutschland"),
  website: z.string().max(0).optional().or(z.literal("")),
});

export const createOrderSchema = z.discriminatedUnion("deliveryType", [
  pickupOrderSchema,
  shippingOrderSchema,
]);

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
