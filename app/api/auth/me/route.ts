import { jsonResponse, handleRouteError, ApiError } from '@/lib/http';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new ApiError(401, 'Unauthorized');
    }
    return jsonResponse({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        city: user.city,
        country: user.country
      }
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
