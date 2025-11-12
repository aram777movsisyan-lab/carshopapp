import { PrismaClient, Role, ListingType, ListingCondition, ServiceCategory, EventCategory, ReviewTargetType } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.favorite.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.serviceOffer.deleteMany();
  await prisma.shop.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.mod.deleteMany();
  await prisma.car.deleteMany();
  await prisma.eventAttendee.deleteMany();
  await prisma.event.deleteMany();
  await prisma.review.deleteMany();
  await prisma.user.deleteMany();

  const password = await hash('password123', 10);

  const [alice, bob, charlie] = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Alice Johnson',
        username: 'alice',
        email: 'alice@example.com',
        passwordHash: password,
        bio: 'Track addict and time attack enthusiast.',
        city: 'Austin',
        country: 'USA',
        role: Role.USER
      }
    }),
    prisma.user.create({
      data: {
        name: 'Bob Smith',
        username: 'bob',
        email: 'bob@example.com',
        passwordHash: password,
        bio: 'Owner of Apex Performance Garage.',
        city: 'Los Angeles',
        country: 'USA',
        role: Role.SHOP_OWNER
      }
    }),
    prisma.user.create({
      data: {
        name: 'Charlotte Reyes',
        username: 'charlotte',
        email: 'charlotte@example.com',
        passwordHash: password,
        bio: 'Event organizer and community builder.',
        city: 'Seattle',
        country: 'USA',
        role: Role.USER
      }
    })
  ]);

  const aliceCar = await prisma.car.create({
    data: {
      userId: alice.id,
      make: 'Nissan',
      model: 'Skyline GT-R',
      year: 1998,
      color: 'Midnight Purple',
      nickname: 'Midnight Dream',
      drivetrain: 'AWD',
      engine: 'RB26DETT',
      tags: ['JDM', 'track'],
      mods: {
        create: [
          {
            title: 'HKS Coilovers',
            category: 'SUSPENSION',
            description: 'Track setup for improved handling.'
          },
          {
            title: 'Greddy Exhaust',
            category: 'EXHAUST',
            description: 'Titanium exhaust for performance and sound.'
          }
        ]
      }
    }
  });

  const listing = await prisma.listing.create({
    data: {
      sellerId: alice.id,
      type: ListingType.PART,
      title: 'Forged wheels set',
      description: 'Set of lightweight forged wheels, perfect for track days.',
      category: 'Wheels',
      price: 2200,
      currency: 'USD',
      condition: ListingCondition.USED,
      city: 'Austin',
      country: 'USA',
      images: [],
      relatedCarId: aliceCar.id
    }
  });

  const shop = await prisma.shop.create({
    data: {
      ownerId: bob.id,
      name: 'Apex Performance Garage',
      description: 'Specialists in performance builds and track support.',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      phone: '+1-555-0100',
      website: 'https://apexgarage.example.com',
      services: {
        create: [
          {
            title: 'Track Inspection',
            category: ServiceCategory.DIAGNOSTICS,
            description: 'Comprehensive pre-track inspection and setup.',
            basePrice: 350,
            durationMinutes: 120
          },
          {
            title: 'Dyno Tuning',
            category: ServiceCategory.TUNING,
            description: 'Custom ECU tuning session on our in-house dyno.',
            basePrice: 500,
            durationMinutes: 180
          }
        ]
      }
    },
    include: { services: true }
  });

  const booking = await prisma.booking.create({
    data: {
      userId: alice.id,
      shopId: shop.id,
      serviceOfferId: shop.services[0].id,
      scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'CONFIRMED',
      notes: 'Prep for upcoming track event.'
    }
  });

  await prisma.review.create({
    data: {
      reviewerId: alice.id,
      targetType: ReviewTargetType.SHOP,
      targetId: shop.id,
      rating: 5,
      title: 'Top-notch service',
      body: 'Apex handled my track prep flawlessly. Highly recommended!'
    }
  });

  const shopStats = await prisma.review.aggregate({
    _avg: { rating: true },
    _count: { rating: true },
    where: { targetType: ReviewTargetType.SHOP, targetId: shop.id }
  });

  await prisma.shop.update({
    where: { id: shop.id },
    data: {
      ratingAverage: shopStats._avg.rating ?? 0,
      ratingCount: shopStats._count.rating
    }
  });

  const event = await prisma.event.create({
    data: {
      creatorId: charlie.id,
      title: 'Sunset Canyon Run',
      description: 'Weekend canyon cruise followed by coffee and networking.',
      dateTimeStart: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      locationName: 'Sunset Diner',
      city: 'Seattle',
      state: 'WA',
      country: 'USA',
      category: EventCategory.CRUISE,
      attendees: {
        create: [
          { userId: alice.id, status: 'GOING' },
          { userId: bob.id, status: 'INTERESTED' }
        ]
      }
    }
  });

  await prisma.review.create({
    data: {
      reviewerId: alice.id,
      targetType: ReviewTargetType.EVENT,
      targetId: event.id,
      rating: 4,
      title: 'Great vibes',
      body: 'Beautiful roads and friendly people.'
    }
  });

  const eventStats = await prisma.review.aggregate({
    _avg: { rating: true },
    _count: { rating: true },
    where: { targetType: ReviewTargetType.EVENT, targetId: event.id }
  });

  await prisma.event.update({
    where: { id: event.id },
    data: {
      ratingAverage: eventStats._avg.rating ?? 0,
      ratingCount: eventStats._count.rating
    }
  });

  const conversation = await prisma.conversation.create({
    data: {
      listingId: listing.id,
      participants: {
        create: [
          { userId: alice.id },
          { userId: bob.id }
        ]
      },
      messages: {
        create: [
          { senderId: alice.id, content: 'Hey Bob, are you interested in the wheel set?' },
          { senderId: bob.id, content: 'Absolutely! Let\'s discuss pickup this weekend.' }
        ]
      }
    }
  });

  await prisma.favorite.createMany({
    data: [
      { userId: alice.id, targetType: 'SHOP', targetId: shop.id },
      { userId: alice.id, targetType: 'EVENT', targetId: event.id },
      { userId: alice.id, targetType: 'LISTING', targetId: listing.id }
    ],
    skipDuplicates: true
  });

  console.log('Seed data created:', { alice: alice.email, bob: bob.email, charlotte: charlie.email, conversation: conversation.id });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
