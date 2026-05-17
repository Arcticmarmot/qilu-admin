"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { getToken, setToken } from "@/lib/auth";
import { getErrorMessage } from "@/lib/error";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
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
      const result = await login({ username: username.trim(), password });
      setToken(result.token);
      router.replace("/users");
    } catch (error) {
      setMessage(getErrorMessage(error, "登录失败，请稍后重试"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef2f5] px-4 py-8 text-slate-950">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-200/70 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden min-h-[560px] flex-col justify-between bg-slate-950 p-10 text-white lg:flex">
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-base font-bold text-slate-950">
              Q
            </div>
            <div className="mt-12">
              <p className="text-sm font-medium text-teal-200">
                Qilu Admin Console
              </p>
              <h1 className="mt-4 max-w-sm text-4xl font-semibold leading-tight tracking-normal">
                内容社区后台管理
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
                管理用户、内容与券活动，保持后台操作清晰稳定。
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <p className="text-xs font-medium uppercase text-slate-500">
              Qilu Content Community
            </p>
          </div>
        </div>

        <div className="flex min-h-[560px] items-center px-6 py-10 sm:px-10">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-9 lg:hidden">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-base font-bold text-white">
                Q
              </div>
              <p className="text-sm font-medium text-teal-700">
                Qilu Admin Console
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold tracking-normal text-slate-950">
                管理员登录
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                使用管理员账号和密码进入后台。
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  管理员账号
                </span>
                <input
                  autoComplete="username"
                  className="h-12 w-full rounded-md border border-slate-200 bg-white px-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-4 focus:ring-teal-100"
                  disabled={loading}
                  name="username"
                  placeholder="admin"
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  密码
                </span>
                <input
                  autoComplete="current-password"
                  className="h-12 w-full rounded-md border border-slate-200 bg-white px-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-4 focus:ring-teal-100"
                  disabled={loading}
                  name="password"
                  placeholder="请输入密码"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>

              {message ? (
                <div className="rounded-md border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-700">
                  {message}
                </div>
              ) : null}

              <button
                className="h-12 w-full rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500"
                disabled={loading || !username.trim() || !password}
                type="submit"
              >
                {loading ? "登录中..." : "登录后台"}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-slate-400">
              仅限授权管理员访问
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
