import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { env } from "@my-better-t-app/env/web";
import z from "zod";

import { authClient } from "@/lib/auth-client";

import Loader from "./loader";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useTranslation } from "./language-provider";

const BOOTSTRAP_ADMIN_EMAIL = "admin@admin.com";
const BOOTSTRAP_ADMIN_PASSWORD = "admin123";

function isBootstrapAdminCredentials(email: string, password: string) {
  return email.trim().toLowerCase() === BOOTSTRAP_ADMIN_EMAIL && password === BOOTSTRAP_ADMIN_PASSWORD;
}

export default function SignInForm({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) {
  const router = useRouter();
  const { isPending } = authClient.useSession();
  const { t } = useTranslation();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      const email = value.email.trim();
      const password = value.password;
      const bootstrapAdmin = isBootstrapAdminCredentials(email, password);

      const promoteBootstrapAdmin = async () => {
        const session = await authClient.getSession();
        const sessionUserId = session.data?.user?.id;
        if (!sessionUserId) {
          throw new Error("Unable to read session for admin setup");
        }

        const response = await fetch(`${env.NEXT_PUBLIC_SERVER_URL}/api/mvp/admin/bootstrap-access`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": sessionUserId,
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        if (!response.ok) {
          throw new Error(data?.error ?? "Unable to activate admin access");
        }
      };

      if (!bootstrapAdmin) {
        await authClient.signIn.email(
          {
            email,
            password,
          },
          {
            onSuccess: () => {
              router.push("/dashboard");
              toast.success("Sign in successful");
            },
            onError: (error) => {
              toast.error(error.error.message || error.error.statusText);
            },
          },
        );
        return;
      }

      let signedIn = false;
      await authClient.signIn.email(
        {
          email,
          password,
        },
        {
          onSuccess: async () => {
            signedIn = true;
          },
          onError: () => {},
        },
      );

      if (!signedIn) {
        await authClient.signUp.email(
          {
            name: "Admin",
            email,
            password,
          },
          {
            onSuccess: () => {
              signedIn = true;
            },
            onError: (error) => {
              toast.error(error.error.message || error.error.statusText);
            },
          },
        );
      }

      if (!signedIn) {
        return;
      }

      try {
        await promoteBootstrapAdmin();
        router.push("/dashboard#admin-dashboard");
        toast.success("Admin sign in successful");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to activate admin access");
      }
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        
        {/* Logo and Greeting */}
        <div className="text-center space-y-2">
          <div className="inline-flex size-12 items-center justify-center rounded-none border-4 border-black bg-[#5C94FF] text-2xl font-black text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            🩺
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl">
            Sanjeevni
          </h1>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
            {t("auth.roleSelection") === "Select your workspace role" ? "Telemedicine Portal Gateway" : "टेलीमेडिसिन पोर्टल गेटवे"}
          </p>
        </div>

        {/* Form Card */}
        <div className="border-4 border-black bg-white dark:bg-[#1E1E1E] p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] rounded-none">
          <h2 className="text-xl font-black uppercase tracking-tight text-foreground mb-6 border-b-2 border-black pb-2">
            {t("auth.signInTitle")}
          </h2>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-5"
          >
            <form.Field name="email">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name} className="text-xs font-black uppercase tracking-wide">
                    {t("auth.emailLabel")}
                  </Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    placeholder="name@example.com"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="border-2 border-black focus-visible:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus-visible:translate-x-[-1px] focus-visible:translate-y-[-1px] rounded-none outline-none dark:bg-[#2A2A2A]"
                  />
                  {field.state.meta.errors.map((error) => (
                    <p key={error?.message} className="text-xs font-bold text-red-500 mt-1">
                      ⚠️ {error?.message}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name} className="text-xs font-black uppercase tracking-wide">
                    {t("auth.passwordLabel")}
                  </Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    placeholder="••••••••"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="border-2 border-black focus-visible:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus-visible:translate-x-[-1px] focus-visible:translate-y-[-1px] rounded-none outline-none dark:bg-[#2A2A2A]"
                  />
                  {field.state.meta.errors.map((error) => (
                    <p key={error?.message} className="text-xs font-bold text-red-500 mt-1">
                      ⚠️ {error?.message}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>

            <form.Subscribe>
              {(state) => (
                <Button
                  type="submit"
                  disabled={!state.canSubmit || state.isSubmitting}
                  className="w-full bg-[#A3E635] text-black border-2 border-black font-black hover:bg-lime-400 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5 active:translate-y-0 uppercase text-xs tracking-wider rounded-none mt-2"
                >
                  {state.isSubmitting ? "⏳ ..." : t("auth.loginBtn")}
                </Button>
              )}
            </form.Subscribe>
          </form>

          <div className="mt-6 border-t-2 border-dashed border-black pt-4 text-center">
            <button
              onClick={onSwitchToSignUp}
              className="text-xs font-black uppercase tracking-wider text-black dark:text-white hover:text-[#5C94FF] dark:hover:text-[#5C94FF] underline decoration-2 underline-offset-2"
            >
              {t("auth.roleSelection") === "Select your workspace role" ? "Need an account? Sign Up" : "खाता नहीं है? साइन अप करें"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
