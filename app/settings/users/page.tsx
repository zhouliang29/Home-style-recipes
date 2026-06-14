import { requireAdmin } from "@/lib/auth";
import { db } from "@/db/client";
import { PageTitle } from "@/components/ui-blocks";
import { createMember } from "./actions";
import { UserList } from "./user-list";

export default async function UsersPage() {
  await requireAdmin();
  const users = db.prepare("SELECT id, name, username, role, created_at as createdAt FROM users ORDER BY role, name").all() as { id: string; name: string; username: string; role: string }[];
  return (
    <div className="space-y-5">
      <PageTitle title="家庭成员" subtitle="管理员可以添加成员、重置密码。" />
      <form action={createMember} className="card grid gap-3 p-5 sm:grid-cols-5">
        <input className="field" name="name" placeholder="昵称" required />
        <input className="field" name="username" placeholder="用户名" required />
        <input className="field" name="password" placeholder="初始密码" required />
        <select className="field" name="role" defaultValue="member">
          <option value="member">成员</option>
          <option value="admin">管理员</option>
        </select>
        <button className="btn">添加成员</button>
      </form>
      <UserList users={users} />
    </div>
  );
}
