"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { getToken, setToken } from "@/lib/auth";
import { getErrorMessage } from "@/lib/error";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const loginMessage = window.sessionStorage.getItem(
        "qilu_admin_login_message",
      );

      if (loginMessage) {
        setMessage(loginMessage);
        window.sessionStorage.removeItem("qilu_admin_login_message");
      }

      if (getToken()) {
        router.replace("/users");
      }
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const result = await login({ email: email.trim(), password });
      setToken(result.token);
      router.replace("/users");
    } catch (error) {
      setMessage(getErrorMessage(error, "登录失败，请稍后重试"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-base font-bold text-white">
            Q
          </div>
          <h1 className="text-2xl font-semibold text-slate-950">歧路后台登录</h1>
          <p className="mt-2 text-sm text-slate-500">
            使用管理员账号进入 Qilu Admin
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              邮箱
            </span>
            <input
              autoComplete="email"
              className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              disabled={loading}
              name="email"
              placeholder="admin@example.com"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              密码
            </span>
            <input
              autoComplete="current-password"
              className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              disabled={loading}
              name="password"
              placeholder="请输入密码"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {message ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {message}
            </div>
          ) : null}

          <button
            className="h-11 w-full rounded-md bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-60"
            disabled={loading || !email.trim() || !password}
            type="submit"
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </form>
      </section>
    </main>
  );
}
