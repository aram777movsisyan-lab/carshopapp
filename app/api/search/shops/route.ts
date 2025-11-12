import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonResponse, handleRouteError } from '@/lib/http';
import { searchQuerySchema } from '@/lib/validators';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const parsed = searchQuerySchema.safeParse({
      q: url.searchParams.get('q') ?? undefined,
      location: url.searchParams.get('location') ?? undefined,
      category: url.searchParams.get('category') ?? undefined,
      city: url.searchParams.get('city') ?? undefined,
      state: url.searchParams.get('state') ?? undefined,
      page: url.searchParams.get('page') ? Number(url.searchParams.get('page')) : undefined,
      pageSize: url.searchParams.get('pageSize') ? Number(url.searchParams.get('pageSize')) : undefined
    });

    if (!parsed.success) {
      return jsonResponse({ shops: [], page: 1, pageSize: 10, total: 0 });
    }

    const { page, pageSize, q, location, category, city, state } = parsed.data;
    const where: any = {};
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } }
      ];
    }
    if (city) where.city = city;
    if (state) where.state = state;
    if (location) where.country = location;
    if (category) {
      where.services = {
        some: { category: { contains: category, mode: 'insensitive' } }
      };
    }

    const [items, total] = await Promise.all([
      prisma.shop.findMany({
        where,
        include: { services: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.shop.count({ where })
    ]);

    return jsonResponse({ shops: items, page, pageSize, total });
  } catch (error) {
    return handleRouteError(error);
  }
}
