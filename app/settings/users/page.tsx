import { requireAdmin } from "@/lib/auth";
import { db } from "@/db/client";
import { PageTitle } from "@/components/ui-blocks";
import { createMember, deleteUser, resetPassword, updateRole } from "./actions";

export default async function UsersPage() {
  await requireAdmin();
  const users = db.prepare("SELECT id, name, username, role, created_at as createdAt FROM users ORDER BY role, name").all() as { id: string; name: string; username: string; role: string }[];
  return <div className="space-y-5"><PageTitle title="家庭成员" subtitle="管理员可以添加成员、重置密码。" />
    <form action={createMember} className="card grid gap-3 p-5 sm:grid-cols-5"><input className="field" name="name" placeholder="昵称" required /><input className="field" name="username" placeholder="用户名" required /><input className="field" name="password" placeholder="初始密码" required /><select className="field" name="role" defaultValue="member"><option value="member">成员</option><option value="admin">管理员</option></select><button className="btn">添加成员</button></form>
    <div className="grid gap-3">{users.map((u) => <div className="card grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center" key={u.id}><div><div className="font-black text-orange-800">{u.name} <span className="text-sm muted">@{u.username}</span></div><div className="text-sm muted">{u.role === "admin" ? "管理员" : "成员"}</div></div><form action={updateRole} className="flex gap-2 items-center"><input type="hidden" name="id" value={u.id} /><select className="field text-sm" name="role" defaultValue={u.role}><option value="member">成员</option><option value="admin">管理员</option></select><button className="btn secondary text-sm">改角色</button></form><form action={resetPassword} className="flex gap-2"><input type="hidden" name="id" value={u.id} /><input className="field" name="password" placeholder="新密码" /><button className="btn secondary">重置</button></form><form action={deleteUser}><input type="hidden" name="id" value={u.id} /><button className="btn danger">删除</button></form></div>)}</div>
  </div>;
}
