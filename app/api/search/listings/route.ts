import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { jsonResponse, handleRouteError } from '@/lib/http';
import { searchQuerySchema } from '@/lib/validators';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const parsed = searchQuerySchema.safeParse({
      q: url.searchParams.get('q') ?? undefined,
      location: url.searchParams.get('location') ?? undefined,
      type: url.searchParams.get('type') ?? undefined,
      category: url.searchParams.get('category') ?? undefined,
      minPrice: url.searchParams.get('minPrice') ? Number(url.searchParams.get('minPrice')) : undefined,
      maxPrice: url.searchParams.get('maxPrice') ? Number(url.searchParams.get('maxPrice')) : undefined,
      city: url.searchParams.get('city') ?? undefined,
      state: url.searchParams.get('state') ?? undefined,
      page: url.searchParams.get('page') ? Number(url.searchParams.get('page')) : undefined,
      pageSize: url.searchParams.get('pageSize') ? Number(url.searchParams.get('pageSize')) : undefined
    });

    if (!parsed.success) {
      return jsonResponse({ listings: [], page: 1, pageSize: 10, total: 0 });
    }

    const { page, pageSize, q, location, type, category, minPrice, maxPrice, city, state } = parsed.data;

    const where: Prisma.ListingWhereInput = {};
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } }
      ];
    }
    if (type) where.type = type as any;
    if (category) where.category = category;
    if (city) where.city = city;
    if (state) where.state = state;
    if (location) where.country = location;
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) (where.price as Prisma.DecimalFilter).gte = new Prisma.Decimal(minPrice);
      if (maxPrice !== undefined) (where.price as Prisma.DecimalFilter).lte = new Prisma.Decimal(maxPrice);
    }

    const [items, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: { seller: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.listing.count({ where })
    ]);

    return jsonResponse({ listings: items, page, pageSize, total });
  } catch (error) {
    return handleRouteError(error);
  }
}
