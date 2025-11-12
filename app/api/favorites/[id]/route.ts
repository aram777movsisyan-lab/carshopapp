import { prisma } from '@/lib/prisma';
import { jsonResponse, handleRouteError, ApiError } from '@/lib/http';
import { requireUser } from '@/lib/auth';

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const favorite = await prisma.favorite.findUnique({ where: { id: params.id } });
    if (!favorite) {
      throw new ApiError(404, 'Favorite not found');
    }
    if (favorite.userId !== user.id) {
      throw new ApiError(403, 'Forbidden');
    }
    await prisma.favorite.delete({ where: { id: params.id } });
    return jsonResponse({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
