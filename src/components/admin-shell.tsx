"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AUTH_INVALID_EVENT, clearToken, getToken } from "@/lib/auth";
import type { AuthInvalidDetail } from "@/lib/auth";
import { getCurrentUser, type CurrentUser } from "@/lib/api";
import { cx } from "@/lib/cx";
import { PixelAvatar } from "@/components/pixel-avatar";

type NavLink = {
  href: string;
  label: string;
};

type NavIconName =
  | "overview"
  | "users"
  | "posts"
  | "comments"
  | "replies"
  | "likes"
  | "seckill";

type NavItem =
  | (NavLink & {
      icon: NavIconName;
    })
  | {
      label: string;
      icon: NavIconName;
      children: NavLink[];
    };

const navItems: NavItem[] = [
  { href: "/overview", icon: "overview", label: "系统概览" },
  { href: "/users", icon: "users", label: "用户管理" },
  { href: "/posts", icon: "posts", label: "帖子管理" },
  { href: "/comments", icon: "comments", label: "评论管理" },
  { href: "/replies", icon: "replies", label: "回复管理" },
  { href: "/likes", icon: "likes", label: "点赞管理" },
  {
    icon: "seckill",
    label: "秒杀管理",
    children: [
      { href: "/voucher-seckills/vouchers/new", label: "创建优惠券" },
      { href: "/voucher-seckills/new", label: "创建秒杀活动" },
      { href: "/voucher-seckills/preheat", label: "库存预热" },
      { href: "/voucher-seckills/redeem", label: "兑换核销" },
    ],
  },
];

const mobileNavItems: NavLink[] = navItems.flatMap((item) =>
  "children" in item
    ? item.children
    : [{ href: item.href, label: item.label }],
);

const topNavClasses =
  "flex h-12 w-full items-center rounded-lg px-3 text-[15px] font-medium transition";
const topNavLabelClasses = "truncate text-[15px] font-medium leading-5";

function isActiveHref(pathname: string, href: string) {
  if (href === "/overview") {
    return pathname === href || pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function isActiveGroup(
  pathname: string,
  item: NavItem,
) {
  if ("href" in item) {
    return isActiveHref(pathname, item.href);
  }

  return item.children.some((child) => isActiveHref(pathname, child.href));
}

function getBreadcrumb(pathname: string) {
  if (pathname === "/profile") {
    return ["基本信息"];
  }

  for (const item of navItems) {
    if ("href" in item && isActiveHref(pathname, item.href)) {
      return [item.label];
    }

    if ("children" in item) {
      const child = item.children.find((entry) =>
        isActiveHref(pathname, entry.href),
      );

      if (child) {
        return [item.label, child.label];
      }
    }
  }

  return ["后台"];
}

function NavIcon({ name }: { name: NavIconName }) {
  if (name === "overview") {
    return (
      <svg
        aria-hidden="true"
        className="h-5 w-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          d="M4 5.5A1.5 1.5 0 0 1 5.5 4h4A1.5 1.5 0 0 1 11 5.5v4A1.5 1.5 0 0 1 9.5 11h-4A1.5 1.5 0 0 1 4 9.5v-4ZM13 5.5A1.5 1.5 0 0 1 14.5 4h4A1.5 1.5 0 0 1 20 5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4A1.5 1.5 0 0 1 13 9.5v-4ZM4 14.5A1.5 1.5 0 0 1 5.5 13h4a1.5 1.5 0 0 1 1.5 1.5v4A1.5 1.5 0 0 1 9.5 20h-4A1.5 1.5 0 0 1 4 18.5v-4ZM13 14.5a1.5 1.5 0 0 1 1.5-1.5h4a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a1.5 1.5 0 0 1-1.5-1.5v-4Z"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  if (name === "users") {
    return (
      <svg
        aria-hidden="true"
        className="h-5 w-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          d="M15.5 19.5v-1.4c0-2-1.6-3.6-3.6-3.6H7.6c-2 0-3.6 1.6-3.6 3.6v1.4M9.8 11a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM20 19.5v-1.3c0-1.7-1.1-3.1-2.7-3.5M15.8 4.8a3.2 3.2 0 0 1 0 6.2"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  if (name === "posts") {
    return (
      <svg
        aria-hidden="true"
        className="h-5 w-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          d="M6.5 4.5h11A1.5 1.5 0 0 1 19 6v12a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 18V6a1.5 1.5 0 0 1 1.5-1.5ZM8.5 8.5h7M8.5 12h7M8.5 15.5h4.5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  if (name === "comments") {
    return (
      <svg
        aria-hidden="true"
        className="h-5 w-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          d="M5 6.8A2.8 2.8 0 0 1 7.8 4h8.4A2.8 2.8 0 0 1 19 6.8v5.4a2.8 2.8 0 0 1-2.8 2.8h-4.7l-4 4v-4A2.8 2.8 0 0 1 5 12.2V6.8Z"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <path
          d="M8.5 8.5h7M8.5 11.5h4.5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  if (name === "replies") {
    return (
      <svg
        aria-hidden="true"
        className="h-5 w-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          d="M5 6.8A2.8 2.8 0 0 1 7.8 4h6.4A2.8 2.8 0 0 1 17 6.8v3.4a2.8 2.8 0 0 1-2.8 2.8H10l-3.2 3.2V13A2.8 2.8 0 0 1 5 10.2V6.8Z"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <path
          d="M12 15h2.5l2.7 2.7V15a2.6 2.6 0 0 0 1.8-2.5V10"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <path
          d="M8.2 8h5.2M8.2 10.5h3"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  if (name === "likes") {
    return (
      <svg
        aria-hidden="true"
        className="h-5 w-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          d="M7.2 10.5v8M4.8 10.5h2.4v8H4.8A1.8 1.8 0 0 1 3 16.7v-4.4a1.8 1.8 0 0 1 1.8-1.8ZM7.2 10.5l3.2-5.6a1.7 1.7 0 0 1 2.7-.3c.4.4.6 1 .5 1.6l-.5 3.1h4.5a2.4 2.4 0 0 1 2.3 3l-1.2 4.6a2.4 2.4 0 0 1-2.3 1.8H7.2"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M7 5.5h10a2 2 0 0 1 2 2v1.3a2.6 2.6 0 0 0 0 5.4v2.3a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-2.3a2.6 2.6 0 0 0 0-5.4V7.5a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="m13.2 8-3.1 4.1h3.2L10.9 16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={cx(
        "h-4 w-4 shrink-0 transition-transform",
        open ? "rotate-90" : "",
      )}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="m9 6 6 6-6 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function BreadcrumbSeparator() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 text-slate-400"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="m9 6 6 6-6 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    秒杀管理: true,
  });

  const breadcrumb = useMemo(() => getBreadcrumb(pathname), [pathname]);
  const displayName =
    currentUser?.nickname ?? currentUser?.username ?? currentUser?.uuid ?? "管理员";
  const displayMeta = currentUser?.email ?? currentUser?.role ?? "已登录";

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

  function toggleGroup(label: string) {
    setOpenGroups((current) => ({
      ...current,
      [label]: !current[label],
    }));
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
          <Image
            alt="Qilu"
            className="h-9 w-9"
            height={36}
            src="/qilu-mark-white.svg"
            width={36}
          />
          <div className="ml-3">
            <div className="text-sm font-semibold">Qilu Admin</div>
            <div className="text-xs text-slate-400">歧路后台管理系统</div>
          </div>
        </div>
        <nav className="flex-1 space-y-1.5 px-3 py-4">
          {navItems.map((item) => {
            const active = isActiveGroup(pathname, item);

            if ("children" in item) {
              const open = openGroups[item.label] ?? active;

              return (
                <div key={item.label}>
                  <button
                    className={cx(
                      topNavClasses,
                      active
                        ? "bg-white text-slate-950"
                        : "text-slate-300 hover:bg-white/10 hover:text-white",
                    )}
                    type="button"
                    onClick={() => toggleGroup(item.label)}
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-3 text-left">
                      <NavIcon name={item.icon} />
                      <span className={topNavLabelClasses}>{item.label}</span>
                    </span>
                    <ChevronIcon open={open} />
                  </button>
                  {open ? (
                    <div className="mt-1 space-y-1 pl-3">
                      {item.children.map((child) => {
                        const childActive = isActiveHref(pathname, child.href);

                        return (
                          <Link
                            className={cx(
                              "flex h-10 items-center rounded-lg px-3 text-sm font-medium transition",
                              childActive
                                ? "bg-white text-slate-950"
                                : "text-slate-400 hover:bg-white/10 hover:text-white",
                            )}
                            href={child.href}
                            key={child.href}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            }

            return (
              <Link
                className={cx(
                  topNavClasses,
                  active
                    ? "bg-white text-slate-950"
                    : "text-slate-300 hover:bg-white/10 hover:text-white",
                )}
                href={item.href}
                key={item.href}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <NavIcon name={item.icon} />
                  <span className={topNavLabelClasses}>{item.label}</span>
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-4 text-xs leading-5 text-slate-400">
          Copyrights @Arcticmarmot 2026
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-16 flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <nav
              aria-label="当前位置"
              className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500"
            >
              {breadcrumb.map((item, index) => {
                const last = index === breadcrumb.length - 1;

                return (
                  <span
                    className="flex items-center gap-2"
                    key={`${item}-${index}`}
                  >
                    {index > 0 ? <BreadcrumbSeparator /> : null}
                    <span
                      className={cx(
                        last ? "text-slate-950" : "text-slate-500",
                      )}
                    >
                      {item}
                    </span>
                  </span>
                );
              })}
            </nav>
            <div className="flex items-center gap-3">
              <Link
                className="flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-slate-100"
                href="/profile"
              >
                <PixelAvatar className="h-9 w-9" name={displayName} />
                <div className="hidden min-w-0 text-right sm:block">
                  <div className="truncate text-sm font-medium text-slate-900">
                    {displayName}
                  </div>
                  <div className="truncate text-xs text-slate-500">
                    {displayMeta}
                  </div>
                </div>
              </Link>
              <button
                className="h-9 rounded-md border border-red-200 bg-red-50 px-3 text-sm font-medium text-red-700 transition hover:border-red-300 hover:bg-red-100"
                type="button"
                onClick={handleLogout}
              >
                退出登录
              </button>
            </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto border-t border-slate-100 px-4 py-2 lg:hidden">
            {mobileNavItems.map((item) => {
              const active = isActiveHref(pathname, item.href);

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
