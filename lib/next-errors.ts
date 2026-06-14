/**
 * 检查是否是 Next.js 内部异常（如 redirect()、notFound()），
 * 这些异常不能被 try/catch 吞掉，必须重新抛出让框架处理。
 */
export function isNextInternalError(e: unknown): boolean {
  if (e && typeof e === "object" && "digest" in e) {
    const digest = String((e as { digest: unknown }).digest);
    if (digest.startsWith("NEXT_")) return true;
  }
  return false;
}
