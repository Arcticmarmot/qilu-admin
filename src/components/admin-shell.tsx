"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AUTH_INVALID_EVENT, clearToken, getToken } from "@/lib/auth";
import type { AuthInvalidDetail } from "@/lib/auth";
import { getCurrentUser, type CurrentUser } from "@/lib/api";
import { cx } from "@/lib/cx";

const navItems = [
  { href: "/users", label: "用户管理" },
  { href: "/posts", label: "内容管理" },
  { href: "/voucher-seckills", label: "秒杀券管理" },
];

function getPageTitle(pathname: string) {
  return navItems.find((item) => pathname.startsWith(item.href))?.label ?? "后台";
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const pageTitle = useMemo(() => getPageTitle(pathname), [pathname]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (!getToken()) {
        router.replace("/login");
        return;
      }

      setReady(true);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [router]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    let ignore = false;

    getCurrentUser()
      .then((user) => {
        if (!ignore) {
          setCurrentUser(user);
        }
      })
      .catch(() => {
        if (!ignore) {
          setCurrentUser(null);
        }
      });

    return () => {
      ignore = true;
    };
  }, [ready]);

  useEffect(() => {
    function handleAuthInvalid(event: Event) {
      const detail = (event as CustomEvent<AuthInvalidDetail>).detail;
      window.sessionStorage.setItem(
        "qilu_admin_login_message",
        detail?.message ?? "登录状态已失效，请重新登录",
      );
      router.replace("/login");
    }

    window.addEventListener(AUTH_INVALID_EVENT, handleAuthInvalid);

    return () => {
      window.removeEventListener(AUTH_INVALID_EVENT, handleAuthInvalid);
    };
  }, [router]);

  function handleLogout() {
    clearToken();
    router.replace("/login");
  }

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-500">
        正在进入后台...
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-sidebar text-white lg:flex">
        <div className="flex h-16 items-center border-b border-white/10 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500 text-sm font-bold text-white">
            Q
          </div>
          <div className="ml-3">
            <div className="text-sm font-semibold">Qilu Admin</div>
            <div className="text-xs text-slate-400">歧路后台</div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);

            return (
              <Link
                className={cx(
                  "flex h-10 items-center rounded-lg px-3 text-sm font-medium transition",
                  active
                    ? "bg-white text-slate-950"
                    : "text-slate-300 hover:bg-white/10 hover:text-white",
                )}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-4 text-xs leading-5 text-slate-400">
          Qilu minimal admin
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-16 flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div>
              <p className="text-xs font-medium uppercase text-slate-500">
                Admin Console
              </p>
              <h1 className="text-xl font-semibold tracking-normal text-slate-950">
                {pageTitle}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <div className="text-sm font-medium text-slate-900">
                  {currentUser?.nickname ?? "管理员"}
                </div>
                <div className="text-xs text-slate-500">
                  {currentUser?.email ?? "已登录"}
                </div>
              </div>
              <button
                className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                type="button"
                onClick={handleLogout}
              >
                退出登录
              </button>
            </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto border-t border-slate-100 px-4 py-2 lg:hidden">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);

              return (
                <Link
                  className={cx(
                    "shrink-0 rounded-md px-3 py-2 text-sm font-medium",
                    active
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-600",
                  )}
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
