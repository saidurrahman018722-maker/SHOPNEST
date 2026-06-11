import { z } from 'zod';

// 1. The Full Schema (Matches Prisma)
export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().nonnegative("Price must be 0 or greater"),
  category: z.string().min(1, "Category is required"),
  stock: z.number().int().nonnegative("Stock cannot be negative"),

  images: z.array(z.string().url("Must be a valid URL")).default([]), 
  
  createdAt: z.date(),
  rating: z.number().min(0).max(5).default(0),
  numReviews: z.number().int().nonnegative().default(0),
});
export const CreateProductSchema = ProductSchema.omit({
  id: true,
  createdAt: true,
  rating: true,
  numReviews: true,
});