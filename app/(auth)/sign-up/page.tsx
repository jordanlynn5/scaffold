import type { Metadata } from "next";
import { AuthForm } from "../AuthForm";

export const metadata: Metadata = { title: "Sign up · Scaffold" };

export default function SignUpPage() {
  return <AuthForm mode="sign-up" />;
}
