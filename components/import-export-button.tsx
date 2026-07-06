"use client";

import { useState, useRef } from "react";

export function ImportExportButtons() {
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 导出功能
  const handleExport = async () => {
    try {
      const response = await fetch("/api/export");
      if (!response.ok) throw new Error("导出失败");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // 从响应头获取文件名或使用默认
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="([^"]+)"/);
      a.download = filenameMatch?.[1] || "home-recipes.json";

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setMessage({ text: "导出成功！", type: "success" });
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      setMessage({ text: "导出失败，请重试", type: "error" });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // 导入功能
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setMessage(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const response = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        let msg = `成功导入 ${result.imported} 个菜谱`;
        if (result.skipped > 0) {
          msg += `，跳过 ${result.skipped} 个已存在的菜谱`;
        }
        if (result.errors.length > 0) {
          msg += `（有 ${result.errors.length} 个菜谱导入失败）`;
        }
        setMessage({ text: msg, type: "success" });
        // 刷新页面
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage({ text: result.errors?.[0] || "导入失败", type: "error" });
      }
    } catch (e) {
      setMessage({ text: "文件解析失败，请确保是有效的 JSON 文件", type: "error" });
    } finally {
      setIsImporting(false);
      // 清空 input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleImport}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
        className="btn secondary"
      >
        {isImporting ? "导入中..." : "📥 导入"}
      </button>
      <button onClick={handleExport} className="btn">
        📤 导出
      </button>
      {message && (
        <div
          className={
            message.type === "success"
              ? "rounded-full bg-green-100 px-3 py-1 text-sm text-green-800"
              : "rounded-full bg-red-100 px-3 py-1 text-sm text-red-800"
          }
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
