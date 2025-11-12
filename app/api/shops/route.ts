import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiError, jsonResponse, handleRouteError } from '@/lib/http';
import { shopCreateSchema } from '@/lib/validators';
import { requireUser } from '@/lib/auth';
import { buildPagination } from '@/lib/utils';
import { Role } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const { page, pageSize } = buildPagination(searchParams);
    const q = searchParams.get('q');
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const country = searchParams.get('country') ?? searchParams.get('location');

    const where: any = {};
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } }
      ];
    }
    if (city) where.city = city;
    if (state) where.state = state;
    if (country) where.country = country;

    const [shops, total] = await Promise.all([
      prisma.shop.findMany({
        where,
        include: { services: true, owner: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.shop.count({ where })
    ]);

    return jsonResponse({ shops, page, pageSize, total });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(Role.SHOP_OWNER);
    const json = await request.json();
    const parsed = shopCreateSchema.safeParse(json);
    if (!parsed.success) {
      throw new ApiError(400, 'Invalid payload', parsed.error.flatten());
    }

    const existing = await prisma.shop.findFirst({ where: { ownerId: user.id } });
    if (existing) {
      throw new ApiError(400, 'Shop already exists for this owner');
    }

    const shop = await prisma.shop.create({
      data: {
        ...parsed.data,
        ownerId: user.id
      }
    });

    return jsonResponse({ shop }, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
