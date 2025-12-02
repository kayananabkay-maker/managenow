import { NextRequest, NextResponse } from 'next/server';
import { createFinverseLinkToken } from '@/lib/finverse';
import { getLoggedInUser } from '@/lib/actions/user.actions.sqlite';

export async function POST(request: NextRequest) {
  try {
    // Get logged in user
    const user = await getLoggedInUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { institutionId } = body;

    console.log('[Finverse Connect] Creating link token for user:', user.id, 'institution:', institutionId);

    // Create link token (returns access_token)
    const accessToken = await createFinverseLinkToken(user.id, institutionId);
    
    // Create Finverse Link URL with the access token
    const linkUrl = `https://link.finverse.net?access_token=${accessToken}`;
    
    console.log('[Finverse Connect] Success! Link URL created');
    
    return NextResponse.json({
      success: true,
      accessToken,
      linkUrl,
    });
  } catch (error: any) {
    console.error('[Finverse Connect] Error:', error.response?.data || error.message);
    return NextResponse.json(
      {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to create link token',
      },
      { status: 500 }
    );
  }
}
