import { PublicClientApplication } from '@azure/msal-browser';

export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AD_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AD_TENANT_ID}`, // This is the Azure AD tenant ID
    redirectUri: import.meta.env.VITE_AD_RIDERECT_URL, // This is the redirect URI registered in Azure AD
  },
  cache: {
    cacheLocation: 'localStorage', // or "sessionStorage"
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ['User.Read', 'openid', 'offline_access'],
};

export const dynamicsLoginRequest = {
  scopes: [
    `${import.meta.env.VITE_DYNAMICS_URL}/.default`, // pulls statically granted API permissions for Dynamics
  ],
};

export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
};

export const msalInstance = new PublicClientApplication(msalConfig);
