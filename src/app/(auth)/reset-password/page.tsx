import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries";
import { ResetPasswordCard } from "@/features/auth/components/reset-password-card";

const ResetPasswordPage = async () => {
  const user = await getCurrent();

  if (user) redirect("/");

  return <ResetPasswordCard />;
};

export default ResetPasswordPage;
