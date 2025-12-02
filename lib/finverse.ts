import axios from 'axios';

const FINVERSE_BASE_URL = process.env.FINVERSE_BASE_URL || 'https://api.prod.finverse.net';
const FINVERSE_CUSTOMER_APP_ID = process.env.FINVERSE_CUSTOMER_APP_ID;
const FINVERSE_CLIENT_ID = process.env.FINVERSE_CLIENT_ID;
const FINVERSE_CLIENT_SECRET = process.env.FINVERSE_CLIENT_SECRET;
const FINVERSE_REDIRECT_URL = process.env.FINVERSE_REDIRECT_URL;

// Create axios instance for Finverse API
const finverseApi = axios.create({
  baseURL: FINVERSE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get customer token (replaces getFinverseAccessToken)
export async function getFinverseCustomerToken() {
  try {
    const response = await finverseApi.post('/auth/customer/token', {
      customer_app_id: FINVERSE_CUSTOMER_APP_ID,
      client_id: FINVERSE_CLIENT_ID,
      client_secret: FINVERSE_CLIENT_SECRET,
      grant_type: 'client_credentials',
    });
    return response.data.access_token || response.data.customer_token;
  } catch (error: any) {
    console.error('Error getting Finverse customer token:', error.response?.data || error.message);
    throw error;
  }
}

// Get list of available institutions (banks)
export async function getFinverseInstitutions(country: string = 'ID') {
  try {
    const customerToken = await getFinverseCustomerToken();
    
    const response = await finverseApi.get('/institutions', {
      headers: {
        'Authorization': `Bearer ${customerToken}`,
      },
      params: {
        country: country,
      },
    });
    return response.data.institutions || response.data;
  } catch (error: any) {
    console.error('Error getting Finverse institutions:', error.response?.data || error.message);
    throw error;
  }
}

// Create Link Token for user to connect bank
export async function createFinverseLinkToken(userId: string, institutionId?: string) {
  try {
    const customerToken = await getFinverseCustomerToken();
    
    const response = await finverseApi.post('/link/token', {
      headers: {
        'Authorization': `Bearer ${customerToken}`,
      },
      external_user_id: userId,
      redirect_uri: FINVERSE_REDIRECT_URL,
      institution_id: institutionId,
    });
    return response.data.access_token;
  } catch (error: any) {
    console.error('Error creating Finverse link token:', error.response?.data || error.message);
    throw error;
  }
}

// Exchange code for access token
export async function exchangeFinverseCode(code: string) {
  try {
    const response = await finverseApi.post('/auth/token', {
      code: code,
      client_id: FINVERSE_CLIENT_ID,
      client_secret: FINVERSE_CLIENT_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: FINVERSE_REDIRECT_URL,
    });
    return {
      accessToken: response.data.access_token,
      loginIdentityId: response.data.login_identity_id,
    };
  } catch (error: any) {
    console.error('Error exchanging Finverse code:', error.response?.data || error.message);
    throw error;
  }
}

// Get user's accounts
export async function getFinverseAccounts(accessToken: string) {
  try {
    const response = await finverseApi.get('/accounts', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data.accounts || response.data;
  } catch (error: any) {
    console.error('Error getting Finverse accounts:', error.response?.data || error.message);
    throw error;
  }
}

// Get account balance
export async function getFinverseBalance(accessToken: string, accountId: string) {
  try {
    const response = await finverseApi.get(`/accounts/${accountId}/balance`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error getting Finverse balance:', error.response?.data || error.message);
    throw error;
  }
}

// Get transactions
export async function getFinverseTransactions(
  accessToken: string,
  accountId: string,
  startDate?: string,
  endDate?: string
) {
  try {
    const params: any = {
      account_id: accountId,
    };
    
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const response = await finverseApi.get('/transactions', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params,
    });
    return response.data.transactions || response.data;
  } catch (error: any) {
    console.error('Error getting Finverse transactions:', error.response?.data || error.message);
    throw error;
  }
}

// Get institution details
export async function getFinverseInstitution(institutionId: string) {
  try {
    const customerToken = await getFinverseCustomerToken();
    const response = await finverseApi.get(`/institutions/${institutionId}`, {
      headers: {
        'Authorization': `Bearer ${customerToken}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error getting Finverse institution:', error.response?.data || error.message);
    throw error;
  }
}

export const finverseConfig = {
  clientId: FINVERSE_CLIENT_ID,
  customerAppId: FINVERSE_CUSTOMER_APP_ID,
  redirectUrl: FINVERSE_REDIRECT_URL,
  baseUrl: FINVERSE_BASE_URL,
};
