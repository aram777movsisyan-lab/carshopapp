import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(2),
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const carCreateSchema = z.object({
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  trim: z.string().optional(),
  color: z.string().optional(),
  nickname: z.string().optional(),
  mileage: z.number().int().nonnegative().optional(),
  transmission: z.string().optional(),
  drivetrain: z.string().optional(),
  engine: z.string().optional(),
  mainPhotoUrl: z.string().url().optional(),
  tags: z.array(z.string()).default([])
});

export const carUpdateSchema = carCreateSchema.partial();

const modCategories = ['SUSPENSION', 'ENGINE', 'COSMETIC', 'INTERIOR', 'EXHAUST', 'OTHER'] as const;

export const modCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.enum(modCategories),
  installedAt: z.string().datetime().optional(),
  cost: z.number().nonnegative().optional()
});

export const listingCreateSchema = z.object({
  type: z.enum(['CAR', 'PART', 'SERVICE']),
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.string().min(2),
  price: z.number().nonnegative(),
  currency: z.string().default('USD'),
  condition: z.enum(['NEW', 'USED']),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  images: z.array(z.string()).default([]),
  relatedCarId: z.string().uuid().optional(),
  isActive: z.boolean().default(true)
});

export const listingUpdateSchema = listingCreateSchema.partial();

export const shopCreateSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  logoUrl: z.string().url().optional()
});

const serviceCategories = ['MAINTENANCE', 'DETAILING', 'TUNING', 'PERFORMANCE', 'DIAGNOSTICS', 'OTHER'] as const;

export const serviceOfferCreateSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  basePrice: z.number().nonnegative().optional(),
  durationMinutes: z.number().int().positive().optional(),
  category: z.enum(serviceCategories)
});

export const bookingCreateSchema = z.object({
  shopId: z.string().uuid(),
  serviceOfferId: z.string().uuid().optional(),
  scheduledAt: z.string().datetime(),
  notes: z.string().optional()
});

export const bookingUpdateSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).optional(),
  scheduledAt: z.string().datetime().optional(),
  notes: z.string().optional()
});

export const eventCreateSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  dateTimeStart: z.string().datetime(),
  dateTimeEnd: z.string().datetime().optional(),
  locationName: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  coverImageUrl: z.string().url().optional(),
  category: z.enum(['MEET', 'SHOW', 'TRACK', 'CRUISE']),
  maxAttendees: z.number().int().positive().optional()
});

export const eventUpdateSchema = eventCreateSchema.partial();

export const eventRsvpSchema = z.object({
  status: z.enum(['GOING', 'INTERESTED'])
});

export const reviewCreateSchema = z.object({
  targetType: z.enum(['SHOP', 'EVENT']),
  targetId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(3),
  body: z.string().optional()
});

export const favoriteCreateSchema = z.object({
  targetType: z.enum(['CAR', 'LISTING', 'SHOP', 'EVENT']),
  targetId: z.string().uuid()
});

export const conversationCreateSchema = z.object({
  listingId: z.string().uuid().optional(),
  shopId: z.string().uuid().optional(),
  participantId: z.string().uuid()
});

export const messageCreateSchema = z.object({
  content: z.string().min(1)
});

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(10)
});

export const searchQuerySchema = z.object({
  q: z.string().optional(),
  location: z.string().optional(),
  type: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().nonnegative().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(12)
});
