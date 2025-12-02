import { NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { exchangeFinverseCode } from '@/lib/finverse';
import { connectFinverseBank } from '@/lib/actions/finverse.actions';
import { getLoggedInUser } from '@/lib/actions/user.actions.sqlite';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    console.log('[Finverse Callback] Received code:', code ? 'present' : 'missing', 'state:', state);

    const user = await getLoggedInUser();

    if (!code || !user) {
      console.error('[Finverse Callback] Missing code or user');
      redirect('/my-banks?error=missing_code');
      return;
    }

    // Exchange code for access token
    const { accessToken, loginIdentityId } = await exchangeFinverseCode(code);

    console.log('[Finverse Callback] Token exchanged, login_identity_id:', loginIdentityId);

    // Connect the bank
    await connectFinverseBank({
      userId: user.userId,
      accessToken,
      itemId: loginIdentityId,
      institutionId: state || 'unknown',
    });

    console.log('[Finverse Callback] Bank connected successfully');

    // Redirect to my-banks page with success
    redirect('/my-banks?success=bank_connected');
  } catch (error: any) {
    console.error('[Finverse Callback] Error:', error.response?.data || error.message);
    redirect(`/my-banks?error=${encodeURIComponent(error.message)}`);
  }
}
