import { NextRequest, NextResponse } from 'next/server';
import { getBrickBanks } from '@/lib/brick';

export async function GET(request: NextRequest) {
  try {
    const banks = await getBrickBanks();
    
    return NextResponse.json({
      success: true,
      banks,
    });
  } catch (error: any) {
    console.error('Error fetching Brick banks:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch banks',
      },
      { status: 500 }
    );
  }
}
