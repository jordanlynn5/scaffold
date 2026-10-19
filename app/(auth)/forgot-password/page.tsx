import { PasswordRecovery } from "../PasswordRecovery";
export const metadata = { title: "Forgot password · Scaffold" };
export default function ForgotPasswordPage() {
  return <PasswordRecovery mode="request" />;
}
