import { User } from '@/types/user';
import { AccountInfo, IPublicClientApplication } from '@azure/msal-browser';
import { dynamicsLoginRequest, graphConfig, loginRequest } from '../configs/msal';

export const mockLogin = async (email: string, password: string) => {
  await new Promise((r) => setTimeout(r, 300));

  const isAdmin = /admin/i.test(email);
  // deterministic SSO-like id based on email for stable sessions in Lovable
  const ssoId = `mock-${btoa(email).replace(/=+/g, '')}`;

  const mockUser: User & { sso_unique_id: string } = {
    id: ssoId,                                // treat as SSO id in mock
    name: email.split('@')[0],
    email,
    role: isAdmin ? 'admin' : 'worker',       // <-- admin vs worker
    avatar: `https://api.dicebear.com/6.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
    markets: ['IL', 'CT'],                    // <-- only IL & CT in Lovable
    sso_unique_id: ssoId,                     // <-- needed for created_by filtering
  };

  // Persist both shapes used around the app
  localStorage.setItem('user', JSON.stringify(mockUser));
  localStorage.setItem(
    'loggedUser',
    JSON.stringify({
      id: mockUser.sso_unique_id,
      name: mockUser.name,
      email: mockUser.email,
      role: mockUser.role,
      sso_unique_id: mockUser.sso_unique_id,
    })
  );

  return mockUser; // IMPORTANT: AuthProvider.login() expects this
};


export const ssoLogin = async (instance: IPublicClientApplication) => {
  const loginResponse = await instance.loginPopup(loginRequest);
  const profile = await getSSOUserProfile(instance, loginResponse.account);
  return profile;
};

export const getSSOUserProfile = async (
  instance: IPublicClientApplication,
  account: AccountInfo,
) => {
  const tokenResponse = await instance.acquireTokenSilent({
    ...loginRequest,
    account: account,
  });

  console.log('ID Token acquired:', tokenResponse);

  const claims = tokenResponse.idTokenClaims;
  const ssoId = tokenResponse.uniqueId || claims.oid; // Azure AD unique user ID

  // Store the raw login info immediately
  const loggedUser = {
    id: ssoId, // Keep this as Azure SSO unique ID, not Supabase user PK
    name: claims.name,
    email: claims.preferred_username,
    sso_unique_id: ssoId
  };
  localStorage.setItem("loggedUser", JSON.stringify(loggedUser));
  console.log("logged ", loggedUser);

  // Optionally fetch extra details from Microsoft Graph
  const res = await fetch(graphConfig.graphMeEndpoint, {
    headers: {
      Authorization: `Bearer ${tokenResponse.accessToken}`,
    },
  });
  const data = await res.json();

  // Return a combined profile with SSO ID preserved
  return {
    id: ssoId, // still the Azure SSO unique ID
    name: data.displayName || claims.name,
    email: data.mail || data.userPrincipalName || claims.preferred_username,
    sso_unique_id: ssoId
  };
};


export const getD365AccessToken = async (
  instance: IPublicClientApplication,
  account: AccountInfo,
) => {
  const dynamicsTokenResponse = await instance.acquireTokenSilent({
    account: account,
    scopes: dynamicsLoginRequest.scopes,
  });

  return dynamicsTokenResponse.accessToken;
};
