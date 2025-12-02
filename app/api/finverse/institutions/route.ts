import { NextRequest, NextResponse } from 'next/server';
import { getFinverseInstitutions } from '@/lib/finverse';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country') || 'ID'; // Indonesia
    
    console.log('[Finverse Institutions] Fetching institutions for country:', country);
    
    const institutions = await getFinverseInstitutions(country);
    
    console.log('[Finverse Institutions] Success! Found', institutions?.length || 0, 'institutions');
    
    return NextResponse.json({
      success: true,
      institutions,
    });
  } catch (error: any) {
    console.error('[Finverse Institutions] Error:', error.response?.data || error.message);
    return NextResponse.json(
      {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch institutions',
      },
      { status: 500 }
    );
  }
}
