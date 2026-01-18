import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

const SPOTIFY_REFRESH_TOKEN_URL = "https://accounts.spotify.com/api/token";

async function refreshAccessToken(token) {
  try {
    const basicAuth = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString("base64");

    const response = await fetch(SPOTIFY_REFRESH_TOKEN_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      // Fall back to old refresh token if a new one wasn't provided
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

const handler = NextAuth({
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "user-top-read",
          show_dialog: true, // Always show login dialog to prevent stale sessions
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Initial sign in
      if (account) {
        console.log("[NextAuth] Initial sign in - account received:", {
          hasAccessToken: !!account.access_token,
          hasRefreshToken: !!account.refresh_token,
          expiresAt: account.expires_at,
        });
        return {
          accessToken: account.access_token,
          accessTokenExpires: account.expires_at * 1000,
          refreshToken: account.refresh_token,
          user: token,
        };
      }

      // Return previous token if it hasn't expired yet
      if (Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Access token has expired, try to refresh it
      console.log("[NextAuth] Token expired, refreshing...");
      return await refreshAccessToken(token);
    },
    async session({ session, token }) {
      console.log("[NextAuth] Building session:", {
        hasAccessToken: !!token.accessToken,
        hasError: !!token.error,
      });
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },
  // Force session to be checked on every request
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hour - forces re-auth more frequently
  },
  // Enable debug mode in development
  debug: process.env.NODE_ENV === "development",
});

export { handler as GET, handler as POST };
