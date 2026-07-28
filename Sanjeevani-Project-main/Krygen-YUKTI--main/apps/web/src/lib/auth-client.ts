import { env } from "@my-better-t-app/env/web";
import { useSession, updateClientSession } from "./auth-client-react";

export function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    if (env.NEXT_PUBLIC_SERVER_URL && !env.NEXT_PUBLIC_SERVER_URL.includes("localhost")) {
      return env.NEXT_PUBLIC_SERVER_URL.replace(/\/$/, "");
    }
    return window.location.origin;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (env.NEXT_PUBLIC_SERVER_URL && !env.NEXT_PUBLIC_SERVER_URL.includes("localhost")) {
    return env.NEXT_PUBLIC_SERVER_URL.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}

// Server Component / Client async session fetcher
async function getSession(
  options?: { fetchOptions?: { headers?: HeadersInit; throw?: boolean } }
): Promise<AuthSession | AuthSessionFailure> {
  try {
    const fetchHeaders = new Headers();
    if (options?.fetchOptions?.headers) {
      const h = options.fetchOptions.headers;
      const ignoreHeaders = new Set(["host", "x-forwarded-host", "connection", "content-length", "content-encoding"]);
      if (typeof (h as any).forEach === "function") {
        (h as any).forEach((value: string, key: string) => {
          if (!ignoreHeaders.has(key.toLowerCase())) {
            fetchHeaders.append(key, value);
          }
        });
      } else if (Array.isArray(h)) {
        h.forEach(([key, value]) => {
          if (!ignoreHeaders.has(key.toLowerCase())) {
            fetchHeaders.append(key, value);
          }
        });
      } else {
        Object.entries(h).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (!ignoreHeaders.has(key.toLowerCase())) {
              fetchHeaders.append(key, String(value));
            }
          }
        });
      }
    }

    if (typeof window !== "undefined" && !fetchHeaders.has("authorization")) {
      const storedToken = localStorage.getItem("sanjeevani_session_token");
      if (storedToken) {
        fetchHeaders.set("Authorization", `Bearer ${storedToken}`);
      }
    }

    const res = await fetch(`${getBaseUrl()}/api/auth/session`, {
      headers: fetchHeaders,
      credentials: "include",
    });

    if (!res.ok) {
      if (options?.fetchOptions?.throw) {
        throw new Error(`Session request failed: ${res.statusText}`);
      }
      return { data: null, user: undefined, session: undefined };
    }

    const data = await res.json();
    if (!data || !data.user) {
      return { data: null, user: undefined, session: undefined };
    }

    const result = {
      user: data.user,
      session: data.session,
      data: {
        user: data.user,
        session: data.session,
      },
    };

    if (typeof window !== "undefined") {
      updateClientSession(data.user, data.session);
    }

    return result;
  } catch (err) {
    if (options?.fetchOptions?.throw) {
      throw err;
    }
    return { data: null, user: undefined, session: undefined };
  }
}

// Email sign in interface matching Better Auth client
const signIn = {
  email: async (
    data: any,
    options?: { onSuccess?: (ctx: any) => void; onError?: (ctx: any) => void }
  ) => {
    try {
      const res = await fetch(`${getBaseUrl()}/api/auth/signin/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
        credentials: "include",
      });

      const body = await res.json();

      if (!res.ok) {
        options?.onError?.({
          error: {
            message: body.error || "Login failed",
            statusText: body.error || "Login failed",
          },
        });
        return;
      }

      if (typeof window !== "undefined") {
        updateClientSession(body.user, body.session);
      }
      options?.onSuccess?.({
        user: body.user,
        session: body.session,
      });
    } catch (err: any) {
      options?.onError?.({
        error: {
          message: err.message || "Network error",
          statusText: "Network error",
        },
      });
    }
  },
};

// Email sign up interface matching Better Auth client
const signUp = {
  email: async (
    data: any,
    options?: { onSuccess?: (ctx: any) => void; onError?: (ctx: any) => void }
  ) => {
    try {
      const res = await fetch(`${getBaseUrl()}/api/auth/signup/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
        credentials: "include",
      });

      const body = await res.json();

      if (!res.ok) {
        options?.onError?.({
          error: {
            message: body.error || "Registration failed",
            statusText: body.error || "Registration failed",
          },
        });
        return;
      }

      if (typeof window !== "undefined") {
        updateClientSession(body.user, body.session);
      }
      options?.onSuccess?.({
        user: body.user,
        session: body.session,
      });
    } catch (err: any) {
      options?.onError?.({
        error: {
          message: err.message || "Network error",
          statusText: "Network error",
        },
      });
    }
  },
};

// Sign out function matching Better Auth client
async function signOut(options?: {
  onSuccess?: () => void;
  fetchOptions?: { onSuccess?: () => void };
}) {
  try {
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("sanjeevani_session_token") : null;
    const headers: Record<string, string> = {};
    if (storedToken) {
      headers["Authorization"] = `Bearer ${storedToken}`;
    }
    await fetch(`${getBaseUrl()}/api/auth/sign-out`, {
      method: "POST",
      headers,
      credentials: "include",
    });
  } catch {}

  if (typeof window !== "undefined") {
    updateClientSession(null, null);
  }

  const onSuccess = options?.onSuccess || options?.fetchOptions?.onSuccess;
  onSuccess?.();
}

export type AuthSession = {
  user: {
    id: string;
    name: string;
    email: string;
    role: "PATIENT" | "DOCTOR" | "PHARMACY" | "ADMIN";
    approvalState: string;
  };
  session: {
    id: string;
    userId: string;
    expiresAt: Date | string;
  };
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: "PATIENT" | "DOCTOR" | "PHARMACY" | "ADMIN";
      approvalState: string;
    };
    session: {
      id: string;
      userId: string;
      expiresAt: Date | string;
    };
  };
};

export type AuthSessionFailure = {
  user: undefined;
  session: undefined;
  data: null;
};

export const authClient = {
  useSession,
  getSession,
  signIn,
  signUp,
  signOut,
  $Infer: {} as {
    Session: AuthSession;
  },
};
