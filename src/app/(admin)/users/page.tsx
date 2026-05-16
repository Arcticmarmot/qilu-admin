"use client";

import { FormEvent, useEffect, useState } from "react";
import { Pagination } from "@/components/pagination";
import { StatusBadge } from "@/components/status-badge";
import { TableEmpty, TableError, TableLoading } from "@/components/table-state";
import { getAdminUserPage, type AdminUser, type PageResult } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import { formatDateTime } from "@/lib/format";

const PAGE_SIZE = 20;

function getUserStatus(status?: number) {
  if (status === 1) {
    return { label: "正常", tone: "green" as const };
  }

  if (status === 0) {
    return { label: "停用", tone: "red" as const };
  }

  return { label: "未知", tone: "slate" as const };
}

export default function UsersPage() {
  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<PageResult<AdminUser>>({
    current: 1,
    size: PAGE_SIZE,
    total: 0,
    records: [],
  });

  useEffect(() => {
    let ignore = false;

    const timeoutId = window.setTimeout(() => {
      if (ignore) {
        return;
      }

      setLoading(true);
      setError("");

      getAdminUserPage({
        current: page,
        size: PAGE_SIZE,
        keyword,
        status,
      })
        .then((result) => {
          if (!ignore) {
            setData(result);
          }
        })
        .catch((requestError) => {
          if (!ignore) {
            setError(getErrorMessage(requestError, "用户列表加载失败"));
            setData({
              current: page,
              size: PAGE_SIZE,
              total: 0,
              records: [],
            });
          }
        })
        .finally(() => {
          if (!ignore) {
            setLoading(false);
          }
        });
    }, 0);

    return () => {
      ignore = true;
      window.clearTimeout(timeoutId);
    };
  }, [keyword, page, status]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setKeyword(keywordInput.trim());
  }

  function handleStatusChange(value: string) {
    setPage(1);
    setStatus(value);
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">用户管理</h2>
        <p className="mt-1 text-sm text-slate-500">用户账号、状态与创建时间</p>
      </div>

      <form
        className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row"
        onSubmit={handleSearch}
      >
        <input
          className="h-10 min-w-0 flex-1 rounded-md border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
          placeholder="搜索昵称、邮箱或 UUID"
          value={keywordInput}
          onChange={(event) => setKeywordInput(event.target.value)}
        />
        <select
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
          value={status}
          onChange={(event) => handleStatusChange(event.target.value)}
        >
          <option value="">全部状态</option>
          <option value="1">正常</option>
          <option value="0">停用</option>
        </select>
        <button
          className="h-10 rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          查询
        </button>
      </form>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-3">用户</th>
                <th className="px-6 py-3">邮箱</th>
                <th className="px-6 py-3">状态</th>
                <th className="px-6 py-3">创建时间</th>
                <th className="px-6 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? <TableLoading colSpan={5} /> : null}
              {!loading && error ? (
                <TableError colSpan={5} message={error} />
              ) : null}
              {!loading && !error && data.records.length === 0 ? (
                <TableEmpty colSpan={5} />
              ) : null}
              {!loading && !error
                ? data.records.map((user) => {
                    const statusInfo = getUserStatus(user.status);

                    return (
                      <tr className="hover:bg-slate-50" key={user.uuid}>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-950">
                            {user.nickname || "-"}
                          </div>
                          <div className="mt-1 max-w-72 truncate text-xs text-slate-500">
                            {user.uuid}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {user.email || "-"}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge tone={statusInfo.tone}>
                            {statusInfo.label}
                          </StatusBadge>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {formatDateTime(user.createdAt ?? user.createAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            className="h-8 rounded-md border border-slate-200 px-3 text-xs font-medium text-slate-500"
                            disabled
                            type="button"
                          >
                            待接入
                          </button>
                        </td>
                      </tr>
                    );
                  })
                : null}
            </tbody>
          </table>
        </div>
        <Pagination
          current={page}
          loading={loading}
          size={PAGE_SIZE}
          total={data.total}
          onChange={setPage}
        />
      </section>
    </div>
  );
}
