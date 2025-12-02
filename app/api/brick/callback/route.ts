import { NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { exchangeBrickPublicToken } from '@/lib/brick';
import { connectBrickBank } from '@/lib/actions/brick.actions';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const publicToken = searchParams.get('publicToken');
    const userId = searchParams.get('userId');
    const institutionId = searchParams.get('institutionId');
    const institutionName = searchParams.get('institutionName');

    if (!publicToken || !userId) {
      redirect('/my-banks?error=missing_token');
      return;
    }

    // Exchange public token for access token
    const { accessToken, accountId } = await exchangeBrickPublicToken(publicToken);

    // Connect the bank
    await connectBrickBank({
      userId,
      accessToken,
      institutionId: institutionId || 'unknown',
      institutionName: institutionName || 'Indonesian Bank',
    });

    // Redirect to my-banks page with success
    redirect('/my-banks?success=bank_connected');
  } catch (error: any) {
    console.error('Error in Brick callback:', error);
    redirect(`/my-banks?error=${encodeURIComponent(error.message)}`);
  }
}
