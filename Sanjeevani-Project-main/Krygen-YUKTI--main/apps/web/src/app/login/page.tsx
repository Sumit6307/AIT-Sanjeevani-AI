"use client";

import { Suspense, useState } from "react";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import Loader from "@/components/loader";

export default function LoginPage() {
  const [showSignIn, setShowSignIn] = useState(true);

  return (
    <Suspense fallback={<Loader />}>
      {showSignIn ? (
        <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
      ) : (
        <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
      )}
    </Suspense>
  );
}
