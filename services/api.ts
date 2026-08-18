import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://coin-earn-backend.onrender.com/api";
export const ACCESS_TOKEN_KEY = "@CoinEarnApp_access_token";

export const REFRESH_TOKEN_KEY = "@CoinEarnApp_refresh_token";

type ApiOptions = RequestInit & {
  isFormData?: boolean;
};

// ======================================================
// API REQUEST
// ======================================================

export const apiRequest = async (
  endpoint: string,
  options: ApiOptions = {},
) => {
  try {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);

    const isFormData = options.isFormData === true;

    console.log("====================================");

    console.log(
      "API REQUEST:",
      options.method || "GET",
      `${API_URL}${endpoint}`,
    );

    console.log("TOKEN:", token ? "FOUND" : "NOT FOUND");

    console.log("FORM DATA:", isFormData);

    // ==================================================
    // HEADERS
    // ==================================================

    const headers: Record<string, string> = {
      ...((options.headers as Record<string, string>) || {}),
    };

    // IMPORTANT:
    // NEVER manually set Content-Type for FormData.
    //
    // Fetch will automatically create:
    // multipart/form-data; boundary=...
    //
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    // ==================================================
    // AUTH TOKEN
    // ==================================================

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // ==================================================
    // FETCH OPTIONS
    // ==================================================

    const fetchOptions: RequestInit = {
      method: options.method || "GET",

      headers,

      body: options.body,
    };

    // ==================================================
    // REQUEST
    // ==================================================

    const response = await fetch(`${API_URL}${endpoint}`, fetchOptions);

    const responseText = await response.text();

    console.log("HTTP STATUS:", response.status);

    console.log("RAW RESPONSE:", responseText);

    // ==================================================
    // PARSE RESPONSE
    // ==================================================

    let data: any = {};

    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = {
        message: responseText,
      };
    }

    console.log("API RESPONSE:", data);

    console.log("====================================");

    // ==================================================
    // ERROR
    // ==================================================

    if (!response.ok) {
      throw new Error(
        data?.message || `Request failed with status ${response.status}`,
      );
    }

    return data;
  } catch (error: any) {
    console.error("API REQUEST ERROR:", endpoint, error);

    throw error;
  }
};

// ======================================================
// TOKEN HELPERS
// ======================================================

export const saveToken = async (token: string) => {
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);

  console.log("ACCESS TOKEN SAVED");
};

export const getToken = async () => {
  return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
};

export const removeToken = async () => {
  await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);

  console.log("ACCESS TOKEN REMOVED");
};

export const saveRefreshToken = async (token: string) => {
  await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);

  console.log("REFRESH TOKEN SAVED");
};

export const getRefreshToken = async () => {
  return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
};

export const removeRefreshToken = async () => {
  await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);

  console.log("REFRESH TOKEN REMOVED");
};

export const clearAuthTokens = async () => {
  await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);

  console.log("ALL AUTH TOKENS REMOVED");
};
