import { z } from 'zod';

// Schema for individual items in the array
export const orderItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  qty: z.number().int().min(1, "Quantity must be at least 1"),
  price: z.number().positive("Price must be a positive number"),
});

// Main Order Schema
export const createOrderSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  items: z.array(orderItemSchema).min(1, "Order must contain at least one item"),
  totalAmount: z.number().nonnegative(),
  
  // Nested Address Object matches Mongoose perfectly
  address: z.object({
    fullName: z.string().min(1, "Full name is required"),
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
  }),
  
  paymentId: z.string().min(1, "Payment ID is required"),
  status: z.enum(['pending', 'shipped', 'delivered']).default('pending'),
});
