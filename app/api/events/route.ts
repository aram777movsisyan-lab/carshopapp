import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiError, jsonResponse, handleRouteError } from '@/lib/http';
import { eventCreateSchema } from '@/lib/validators';
import { requireUser, getCurrentUser } from '@/lib/auth';
import { buildPagination } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const { page, pageSize } = buildPagination(searchParams);
    const q = searchParams.get('q');
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const country = searchParams.get('country') ?? searchParams.get('location');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const creator = searchParams.get('creator');

    const where: any = {};
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } }
      ];
    }
    if (city) where.city = city;
    if (state) where.state = state;
    if (country) where.country = country;
    if (startDate || endDate) {
      where.dateTimeStart = {};
      if (startDate) where.dateTimeStart.gte = new Date(startDate);
      if (endDate) where.dateTimeStart.lte = new Date(endDate);
    }
    if (creator === 'me') {
      const user = await getCurrentUser();
      if (!user) {
        throw new ApiError(401, 'Unauthorized');
      }
      where.creatorId = user.id;
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: { creator: true, attendees: true },
        orderBy: { dateTimeStart: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.event.count({ where })
    ]);

    return jsonResponse({ events, page, pageSize, total });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const json = await request.json();
    const parsed = eventCreateSchema.safeParse(json);
    if (!parsed.success) {
      throw new ApiError(400, 'Invalid payload', parsed.error.flatten());
    }
    const data = parsed.data;

    const event = await prisma.event.create({
      data: {
        creatorId: user.id,
        title: data.title,
        description: data.description,
        dateTimeStart: new Date(data.dateTimeStart),
        dateTimeEnd: data.dateTimeEnd ? new Date(data.dateTimeEnd) : undefined,
        locationName: data.locationName,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        latitude: data.latitude,
        longitude: data.longitude,
        coverImageUrl: data.coverImageUrl,
        category: data.category,
        maxAttendees: data.maxAttendees
      }
    });

    return jsonResponse({ event }, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
