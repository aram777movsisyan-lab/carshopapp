import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ApiError, jsonResponse, handleRouteError } from '@/lib/http';
import { listingCreateSchema } from '@/lib/validators';
import { requireUser, getCurrentUser } from '@/lib/auth';
import { buildPagination, parseNumber } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const { page, pageSize } = buildPagination(searchParams);

    const where: Prisma.ListingWhereInput = {};
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const country = searchParams.get('country') ?? searchParams.get('location');
    const q = searchParams.get('q');
    const minPrice = parseNumber(searchParams.get('minPrice'));
    const maxPrice = parseNumber(searchParams.get('maxPrice'));
    const userOnly = searchParams.get('owner') === 'me';

    if (type) where.type = type as any;
    if (category) where.category = category;
    if (city) where.city = city;
    if (state) where.state = state;
    if (country) where.country = country;
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } }
      ];
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        (where.price as Prisma.DecimalFilter).gte = new Prisma.Decimal(minPrice);
      }
      if (maxPrice !== undefined) {
        (where.price as Prisma.DecimalFilter).lte = new Prisma.Decimal(maxPrice);
      }
    }
    if (userOnly) {
      const current = await getCurrentUser();
      if (!current) {
        throw new ApiError(401, 'Unauthorized');
      }
      where.sellerId = current.id;
    }

    const [items, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { seller: true, relatedCar: true },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.listing.count({ where })
    ]);

    return jsonResponse({ listings: items, page, pageSize, total });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const json = await request.json();
    const parsed = listingCreateSchema.safeParse(json);
    if (!parsed.success) {
      throw new ApiError(400, 'Invalid payload', parsed.error.flatten());
    }
    const data = parsed.data;

    const listing = await prisma.listing.create({
      data: {
        sellerId: user.id,
        type: data.type,
        title: data.title,
        description: data.description,
        category: data.category,
        price: new Prisma.Decimal(data.price),
        currency: data.currency,
        condition: data.condition,
        city: data.city,
        state: data.state,
        country: data.country,
        images: data.images ?? [],
        relatedCarId: data.relatedCarId,
        isActive: data.isActive ?? true
      }
    });

    return jsonResponse({ listing }, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
