import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

const SPOTIFY_SCOPES = [
  "user-read-email",
  "user-read-private",
  "user-top-read",
].join(" ");

const SPOTIFY_AUTH_URL = `https://accounts.spotify.com/authorize?scope=${encodeURIComponent(SPOTIFY_SCOPES)}`;

/**
 * Refresh a Spotify access token using the refresh_token grant.
 * Returns the updated token object, or marks it with an error.
 */
async function refreshAccessToken(token) {
  try {
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: token.refreshToken,
    });

    const basic = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString("base64");

    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basic}`,
      },
      body: params.toString(),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("[NextAuth] Token refresh failed:", data);
      throw new Error(data.error || "refresh_failed");
    }

    console.log("[NextAuth] Token refreshed successfully");

    return {
      ...token,
      accessToken: data.access_token,
      accessTokenExpires: Date.now() + data.expires_in * 1000,
      // Spotify may or may not return a new refresh token
      refreshToken: data.refresh_token ?? token.refreshToken,
    };
  } catch (err) {
    console.error("[NextAuth] RefreshAccessTokenError:", err.message);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

const authOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      authorization: SPOTIFY_AUTH_URL,
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  // Fix cookie issues: cookies must work for both localhost and 127.0.0.1
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false,
      },
    },
    callbackUrl: {
      name: "next-auth.callback-url",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false,
      },
    },
    csrfToken: {
      name: "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false,
      },
    },
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false,
        maxAge: 60 * 15, // 15 minutes
      },
    },
    state: {
      name: "next-auth.state",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false,
        maxAge: 60 * 15, // 15 minutes
      },
    },
  },

  callbacks: {
    async jwt({ token, account }) {
      // Initial sign-in — persist tokens from the OAuth callback
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at * 1000,
        };
      }

      // Token still valid — return as-is
      if (Date.now() < (token.accessTokenExpires ?? 0) - 60_000) {
        return token;
      }

      // Token expired — attempt refresh
      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      session.user.id = token.sub;
      return session;
    },
  },

  pages: {
    signIn: "/",
    error: "/",
  },

  // Use JWT strategy (no database needed)
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hour
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
