"use client";

import { useState, useEffect } from "react";

export let globalUser: any = null;
export let globalSession: any = null;
export let initialFetched = false;
export const listeners = new Set<() => void>();

export function notifyListeners() {
  listeners.forEach((l) => l());
}

export function updateClientSession(user: any, session: any) {
  globalUser = user;
  globalSession = session;
  initialFetched = true;
  notifyListeners();
}

export function useSession() {
  const [state, setState] = useState({
    data: globalUser ? { user: globalUser, session: globalSession } : null,
    isPending: !initialFetched && globalUser === null,
  });

  useEffect(() => {
    const handleChange = () => {
      setState({
        data: globalUser ? { user: globalUser, session: globalSession } : null,
        isPending: false,
      });
    };

    listeners.add(handleChange);

    if (!initialFetched && typeof window !== "undefined") {
      fetchSessionSilent();
    } else {
      handleChange();
    }

    return () => {
      listeners.delete(handleChange);
    };
  }, []);

  return state;
}

async function fetchSessionSilent() {
  try {
    const { env } = await import("@my-better-t-app/env/web");
    const res = await fetch(`${env.NEXT_PUBLIC_SERVER_URL}/api/auth/session`, {
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.user) {
        globalUser = data.user;
        globalSession = data.session;
      } else {
        globalUser = null;
        globalSession = null;
      }
    } else {
      globalUser = null;
      globalSession = null;
    }
  } catch {
    globalUser = null;
    globalSession = null;
  }
  initialFetched = true;
  notifyListeners();
}
