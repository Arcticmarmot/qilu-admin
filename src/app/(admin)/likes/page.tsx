"use client";

import { FormEvent, useEffect, useState } from "react";
import { Pagination } from "@/components/pagination";
import { StatusBadge } from "@/components/status-badge";
import { TableEmpty, TableError, TableLoading } from "@/components/table-state";
import { getLikePage, type AdminLike, type PageResult } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import { formatDateTime } from "@/lib/format";

const PAGE_SIZE = 20;

type LikeFilters = {
  likeId: string;
  creationType: string;
  creationId: string;
  userUuid: string;
  status: string;
};

const emptyFilters: LikeFilters = {
  likeId: "",
  creationType: "",
  creationId: "",
  userUuid: "",
  status: "",
};

function getLikeStatus(status?: number) {
  if (status === 1) {
    return { label: "已点赞", tone: "green" as const };
  }

  if (status === 0) {
    return { label: "已取消", tone: "slate" as const };
  }

  return { label: "未知", tone: "slate" as const };
}

function getCreationType(type?: string) {
  if (type === "POST") {
    return { label: "帖子", tone: "teal" as const };
  }

  if (type === "COMMENT") {
    return { label: "评论", tone: "amber" as const };
  }

  if (type === "REPLY") {
    return { label: "回复", tone: "green" as const };
  }

  return { label: type || "未知", tone: "slate" as const };
}

export default function LikesPage() {
  const [draftFilters, setDraftFilters] = useState<LikeFilters>(emptyFilters);
  const [filters, setFilters] = useState<LikeFilters>(emptyFilters);
  const [page, setPage] = useState(1);
  const [queryVersion, setQueryVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<PageResult<AdminLike>>({
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

      getLikePage({
        current: page,
        size: PAGE_SIZE,
        likeId: filters.likeId,
        creationType: filters.creationType,
        creationId: filters.creationId,
        userUuid: filters.userUuid,
        status: filters.status,
      })
        .then((result) => {
          if (!ignore) {
            setData(result);
          }
        })
        .catch((requestError) => {
          if (!ignore) {
            setError(getErrorMessage(requestError, "点赞列表加载失败"));
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
  }, [filters, page, queryVersion]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setFilters({
      likeId: draftFilters.likeId.trim(),
      creationType: draftFilters.creationType,
      creationId: draftFilters.creationId.trim(),
      userUuid: draftFilters.userUuid.trim(),
      status: draftFilters.status,
    });
    setQueryVersion((current) => current + 1);
  }

  function handleReset() {
    setDraftFilters(emptyFilters);
    setFilters(emptyFilters);
    setPage(1);
    setQueryVersion((current) => current + 1);
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">点赞管理</h2>
      </div>

      <form
        className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        onSubmit={handleSearch}
      >
        <div className="grid items-end gap-3 md:grid-cols-2 xl:grid-cols-[0.75fr_0.85fr_0.75fr_1.25fr_0.8fr_auto]">
          <label className="flex flex-col gap-2">
            <span className="block h-5 text-sm font-medium leading-5 text-slate-700">
              点赞 ID
            </span>
            <input
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              value={draftFilters.likeId}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  likeId: event.target.value,
                }))
              }
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="block h-5 text-sm font-medium leading-5 text-slate-700">
              创作类型
            </span>
            <select
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              value={draftFilters.creationType}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  creationType: event.target.value,
                }))
              }
            >
              <option value="">全部</option>
              <option value="POST">帖子</option>
              <option value="COMMENT">评论</option>
              <option value="REPLY">回复</option>
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="block h-5 text-sm font-medium leading-5 text-slate-700">
              创作 ID
            </span>
            <input
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              value={draftFilters.creationId}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  creationId: event.target.value,
                }))
              }
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="block h-5 text-sm font-medium leading-5 text-slate-700">
              用户 UUID
            </span>
            <input
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              placeholder="5ee308..."
              value={draftFilters.userUuid}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  userUuid: event.target.value,
                }))
              }
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="block h-5 text-sm font-medium leading-5 text-slate-700">
              状态
            </span>
            <select
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              value={draftFilters.status}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  status: event.target.value,
                }))
              }
            >
              <option value="">全部</option>
              <option value="1">已点赞</option>
              <option value="0">已取消</option>
            </select>
          </label>
          <div className="flex gap-2">
            <button
              className="h-10 w-20 rounded-md bg-teal-700 px-4 text-sm font-medium text-white transition hover:bg-teal-800 disabled:bg-teal-200 disabled:text-teal-600"
              disabled={loading}
              type="submit"
            >
              查询
            </button>
            <button
              className="h-10 w-20 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              disabled={loading}
              type="button"
              onClick={handleReset}
            >
              重置
            </button>
          </div>
        </div>
      </form>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
              <tr>
                <th className="whitespace-nowrap px-6 py-3">ID</th>
                <th className="whitespace-nowrap px-6 py-3">创作类型</th>
                <th className="whitespace-nowrap px-6 py-3">创作 ID</th>
                <th className="w-56 px-6 py-3">用户 UUID</th>
                <th className="whitespace-nowrap px-6 py-3">状态</th>
                <th className="px-6 py-3">创建时间</th>
                <th className="px-6 py-3">更新时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? <TableLoading colSpan={7} /> : null}
              {!loading && error ? (
                <TableError colSpan={7} message={error} />
              ) : null}
              {!loading && !error && data.records.length === 0 ? (
                <TableEmpty colSpan={7} />
              ) : null}
              {!loading && !error
                ? data.records.map((like) => {
                    const typeInfo = getCreationType(like.creationType);
                    const statusInfo = getLikeStatus(like.status);

                    return (
                      <tr className="hover:bg-slate-50" key={like.id}>
                        <td className="whitespace-nowrap px-6 py-4 text-xs font-medium text-slate-500">
                          ID {like.id}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <StatusBadge tone={typeInfo.tone}>
                            {typeInfo.label}
                          </StatusBadge>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                          {like.creationId ?? "-"}
                        </td>
                        <td className="w-56 px-6 py-4 text-slate-600">
                          <div className="max-w-52 truncate">
                            {like.userUuid || "-"}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <StatusBadge tone={statusInfo.tone}>
                            {statusInfo.label}
                          </StatusBadge>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {formatDateTime(like.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {formatDateTime(like.updatedAt)}
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
