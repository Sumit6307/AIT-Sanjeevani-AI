import { env } from "@my-better-t-app/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import prisma from "@my-better-t-app/db";
import { hashPassword, verifyPassword } from "@my-better-t-app/auth";
import crypto from "node:crypto";

import mvpRoute from "./routes/mvp";

const app = new Hono();

app.use(logger());
console.log("Server starting with CORS_ORIGIN:", env.CORS_ORIGIN);

app.use(
  "/*",
  cors({
    origin: (origin) => origin || env.CORS_ORIGIN, // Allow all origins (Hackathon mode)
    allowMethods: ["GET", "POST", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "x-user-id", "X-User-Id"],
    credentials: true,
  }),
);

// Custom Auth Router
const authRouter = new Hono();

// Sign Up Route
authRouter.post("/signup/email", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    if (!email || !password || !name) {
      return c.json({ error: "Missing required fields: name, email, password" }, 400);
    }

    const emailClean = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: emailClean },
    });

    if (existingUser) {
      return c.json({ error: "User already exists" }, 400);
    }

    const hashedPassword = hashPassword(password);
    const userId = crypto.randomUUID();

    // Determine default role based on email or defaults
    const isBootstrapAdmin = emailClean === "admin@admin.com";
    const role = isBootstrapAdmin ? "ADMIN" : "PATIENT";
    const approvalState = isBootstrapAdmin ? "APPROVED" : "APPROVED";

    // Create User and Account records inside transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          id: userId,
          name,
          email: emailClean,
          role,
          approvalState,
        },
      });

      await tx.account.create({
        data: {
          id: crypto.randomUUID(),
          userId,
          providerId: "credential",
          accountId: emailClean,
          password: hashedPassword,
        },
      });

      return newUser;
    });

    // Create session
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const session = await prisma.session.create({
      data: {
        id: crypto.randomUUID(),
        token: sessionToken,
        userId: user.id,
        expiresAt,
      },
    });

    // Set Session Cookie
    setCookie(c, "sanjeevani_session_id", sessionToken, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return c.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        approvalState: user.approvalState,
      },
      session,
    });
  } catch (err: any) {
    console.error("Signup error:", err);
    return c.json({ error: err.message || "Signup failed" }, 500);
  }
});

// Sign In Route
authRouter.post("/signin/email", async (c) => {
  try {
    const { email, password } = await c.req.json();
    if (!email || !password) {
      return c.json({ error: "Missing email or password" }, 400);
    }

    const emailClean = email.trim().toLowerCase();

    // Find User
    const user = await prisma.user.findUnique({
      where: { email: emailClean },
    });

    if (!user) {
      return c.json({ error: "Invalid email or password" }, 400);
    }

    // Find Account (credential provider)
    const account = await prisma.account.findFirst({
      where: {
        userId: user.id,
        providerId: "credential",
      },
    });

    if (!account || !account.password) {
      return c.json({ error: "No local credentials set up for this email" }, 400);
    }

    // Verify Password
    const isValid = verifyPassword(password, account.password);
    if (!isValid) {
      return c.json({ error: "Invalid email or password" }, 400);
    }

    // Create session
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const session = await prisma.session.create({
      data: {
        id: crypto.randomUUID(),
        token: sessionToken,
        userId: user.id,
        expiresAt,
      },
    });

    // Set Session Cookie
    setCookie(c, "sanjeevani_session_id", sessionToken, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return c.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        approvalState: user.approvalState,
      },
      session,
    });
  } catch (err: any) {
    console.error("Signin error:", err);
    return c.json({ error: err.message || "Signin failed" }, 500);
  }
});

// Session Check Route
authRouter.get("/session", async (c) => {
  try {
    const sessionToken = getCookie(c, "sanjeevani_session_id");
    if (!sessionToken) {
      return c.json(null);
    }

    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      // Clean up expired session if exists
      if (session) {
        await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      }
      deleteCookie(c, "sanjeevani_session_id");
      return c.json(null);
    }

    return c.json({
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        approvalState: session.user.approvalState,
      },
      session: {
        id: session.id,
        userId: session.userId,
        expiresAt: session.expiresAt,
      },
    });
  } catch (err: any) {
    console.error("Session fetch error:", err);
    return c.json(null);
  }
});

// Sign Out Route
authRouter.post("/sign-out", async (c) => {
  try {
    const sessionToken = getCookie(c, "sanjeevani_session_id");
    if (sessionToken) {
      await prisma.session.delete({
        where: { token: sessionToken },
      }).catch(() => {});
    }

    deleteCookie(c, "sanjeevani_session_id", {
      path: "/",
      secure: true,
      sameSite: "None",
    });

    return c.json({ success: true });
  } catch (err: any) {
    console.error("Signout error:", err);
    return c.json({ success: false });
  }
});

app.route("/api/auth", authRouter);
app.route("/api/mvp", mvpRoute);

app.get("/", (c) => {
  return c.text("OK");
});

export default app;
