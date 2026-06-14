import { requireUser } from "@/lib/auth";
import { PageTitle } from "@/components/ui-blocks";
import { ChangePasswordForm } from "./change-password-form";

export default async function ChangePasswordPage() {
  await requireUser();
  return (
    <div className="mx-auto max-w-md space-y-5">
      <PageTitle title="修改密码" />
      <ChangePasswordForm />
    </div>
  );
}
