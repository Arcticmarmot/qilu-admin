"use client";

import { useEffect, useState } from "react";
import { PixelAvatar } from "@/components/pixel-avatar";
import { getCurrentUser, type CurrentUser } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import { formatDateTime } from "@/lib/format";

function getStatusLabel(status?: number) {
  if (status === 1) {
    return "正常";
  }

  if (status === 0) {
    return "停用";
  }

  return "未知";
}

export default function ProfilePage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    getCurrentUser()
      .then((result) => {
        if (!ignore) {
          setUser(result);
        }
      })
      .catch((requestError) => {
        if (!ignore) {
          setError(getErrorMessage(requestError, "管理员信息加载失败"));
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const displayName = user?.nickname ?? user?.username ?? user?.uuid ?? "管理员";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">基本信息</h2>
        <p className="mt-1 text-sm text-slate-500">当前登录管理员资料</p>
      </div>

      <section className="max-w-3xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        {loading ? (
          <div className="py-10 text-center text-sm text-slate-500">
            加载中...
          </div>
        ) : null}

        {!loading && error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {!loading && !error && user ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <PixelAvatar className="h-16 w-16" name={displayName} />
              <div>
                <div className="text-lg font-semibold text-slate-950">
                  {displayName}
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  {user.role ?? "管理员"}
                </div>
              </div>
            </div>

            <dl className="grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium text-slate-500">UUID</dt>
                <dd className="mt-1 break-all text-sm text-slate-900">
                  {user.uuid || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">用户名</dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {user.username ?? user.nickname ?? "-"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">角色</dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {user.role ?? "-"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">状态</dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {getStatusLabel(user.status)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">创建时间</dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {formatDateTime(user.createdAt ?? user.createAt)}
                </dd>
              </div>
            </dl>
          </div>
        ) : null}
      </section>
    </div>
  );
}
