import { NextRequest, NextResponse } from 'next/server';
import { syncBrickTransactions } from '@/lib/actions/brick.actions';
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
    const { bankId } = body;

    if (!bankId) {
      return NextResponse.json(
        { success: false, error: 'Bank ID is required' },
        { status: 400 }
      );
    }

    // Sync transactions
    const result = await syncBrickTransactions(bankId);
    
    return NextResponse.json({
      success: true,
      count: result.count,
      message: `Synced ${result.count} transactions`,
    });
  } catch (error: any) {
    console.error('Error syncing Brick transactions:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to sync transactions',
      },
      { status: 500 }
    );
  }
}
