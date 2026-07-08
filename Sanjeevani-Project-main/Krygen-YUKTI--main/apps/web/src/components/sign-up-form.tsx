import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

import Loader from "./loader";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useTranslation } from "./language-provider";

export default function SignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
  const router = useRouter();
  const { isPending } = authClient.useSession();
  const { t } = useTranslation();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
        },
        {
          onSuccess: () => {
            router.push("/dashboard");
            toast.success("Sign up successful");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
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
          <div className="inline-flex size-12 items-center justify-center rounded-none border-4 border-black bg-[#A3E635] text-2xl font-black text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
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
            {t("auth.signUpTitle")}
          </h2>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-5"
          >
            <form.Field name="name">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name} className="text-xs font-black uppercase tracking-wide">
                    {t("auth.nameLabel")}
                  </Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    placeholder="John Doe"
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
                  {state.isSubmitting ? "⏳ ..." : t("auth.registerBtn")}
                </Button>
              )}
            </form.Subscribe>
          </form>

          <div className="mt-6 border-t-2 border-dashed border-black pt-4 text-center">
            <button
              onClick={onSwitchToSignIn}
              className="text-xs font-black uppercase tracking-wider text-black dark:text-white hover:text-[#5C94FF] dark:hover:text-[#5C94FF] underline decoration-2 underline-offset-2"
            >
              {t("auth.roleSelection") === "Select your workspace role" ? "Already have an account? Sign In" : "पहले से खाता है? साइन इन करें"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
