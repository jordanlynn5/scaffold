import { PasswordRecovery } from "../PasswordRecovery";
export const metadata = { title: "Set a new password · Scaffold" };
export default function ResetPasswordPage() {
  return <PasswordRecovery mode="reset" />;
}
