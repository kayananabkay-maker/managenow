import { NextRequest, NextResponse } from 'next/server';
import { createBrickAuthUrl } from '@/lib/brick';
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

    if (!institutionId) {
      return NextResponse.json(
        { success: false, error: 'Institution ID is required' },
        { status: 400 }
      );
    }

    // Create auth URL
    const authUrl = await createBrickAuthUrl(institutionId, user.userId);
    
    return NextResponse.json({
      success: true,
      authUrl,
    });
  } catch (error: any) {
    console.error('Error creating Brick auth URL:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create auth URL',
      },
      { status: 500 }
    );
  }
}
