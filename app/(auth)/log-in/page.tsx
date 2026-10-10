import type { Metadata } from "next";
import { AuthForm } from "../AuthForm";

export const metadata: Metadata = { title: "Log in · Scaffold" };

export default function LogInPage() {
  return <AuthForm mode="log-in" />;
}
