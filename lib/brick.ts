import axios from 'axios';

const BRICK_BASE_URL = process.env.BRICK_BASE_URL || 'https://api.onebrick.io/v1';
const BRICK_CLIENT_ID = process.env.BRICK_CLIENT_ID;
const BRICK_CLIENT_SECRET = process.env.BRICK_CLIENT_SECRET;
const BRICK_PUBLIC_KEY = process.env.BRICK_PUBLIC_KEY;
const BRICK_REDIRECT_URL = process.env.BRICK_REDIRECT_URL;

// Create axios instance for Brick API
const brickApi = axios.create({
  baseURL: BRICK_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get access token
export async function getBrickAccessToken() {
  try {
    const response = await brickApi.post('/auth/token', {
      clientId: BRICK_CLIENT_ID,
      clientSecret: BRICK_CLIENT_SECRET,
    });
    return response.data.data.accessToken;
  } catch (error: any) {
    console.error('Error getting Brick access token:', error.response?.data || error.message);
    throw error;
  }
}

// Get list of available banks in Indonesia
export async function getBrickBanks() {
  try {
    const accessToken = await getBrickAccessToken();
    const response = await brickApi.get('/institution/list', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error getting Brick banks:', error.response?.data || error.message);
    throw error;
  }
}

// Create authentication URL for user to connect bank
export async function createBrickAuthUrl(institutionId: number, userId: string) {
  try {
    const accessToken = await getBrickAccessToken();
    const response = await brickApi.post('/auth/link', {
      institutionId,
      userId,
      redirectUrl: BRICK_REDIRECT_URL,
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data.data.authUrl;
  } catch (error: any) {
    console.error('Error creating Brick auth URL:', error.response?.data || error.message);
    throw error;
  }
}

// Exchange public token for access token
export async function exchangeBrickPublicToken(publicToken: string) {
  try {
    const accessToken = await getBrickAccessToken();
    const response = await brickApi.post('/auth/exchange-token', {
      publicToken,
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error exchanging Brick public token:', error.response?.data || error.message);
    throw error;
  }
}

// Get account list
export async function getBrickAccounts(accessToken: string) {
  try {
    const response = await brickApi.get('/account/list', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error getting Brick accounts:', error.response?.data || error.message);
    throw error;
  }
}

// Get account balance
export async function getBrickBalance(accessToken: string, accountId: string) {
  try {
    const response = await brickApi.get(`/account/${accountId}/balance`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error getting Brick balance:', error.response?.data || error.message);
    throw error;
  }
}

// Get transactions
export async function getBrickTransactions(accessToken: string, accountId: string, from?: string, to?: string) {
  try {
    const params: any = { accountId };
    if (from) params.from = from;
    if (to) params.to = to;

    const response = await brickApi.get('/transaction/list', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params,
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error getting Brick transactions:', error.response?.data || error.message);
    throw error;
  }
}

export const brickConfig = {
  clientId: BRICK_CLIENT_ID,
  publicKey: BRICK_PUBLIC_KEY,
  redirectUrl: BRICK_REDIRECT_URL,
};
