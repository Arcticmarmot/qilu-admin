"use client";

import { FormEvent, useEffect, useState } from "react";
import { Pagination } from "@/components/pagination";
import { StatusBadge } from "@/components/status-badge";
import { TableEmpty, TableError, TableLoading } from "@/components/table-state";
import { getPostPage, type AdminPost, type PageResult } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import { formatDateTime, formatNumber } from "@/lib/format";

const PAGE_SIZE = 20;

function getVisibility(visibility?: number) {
  if (visibility === 1) {
    return { label: "公开", tone: "green" as const };
  }

  if (visibility === 2) {
    return { label: "仅自己", tone: "amber" as const };
  }

  return { label: "未知", tone: "slate" as const };
}

function getPostSummary(post: AdminPost) {
  return post.contentSnippet ?? post.contentPreview ?? post.content ?? "-";
}

export default function PostsPage() {
  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<PageResult<AdminPost>>({
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

      getPostPage({
        current: page,
        size: PAGE_SIZE,
        keyword,
      })
        .then((result) => {
          if (!ignore) {
            setData(result);
          }
        })
        .catch((requestError) => {
          if (!ignore) {
            setError(getErrorMessage(requestError, "帖子列表加载失败"));
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
  }, [keyword, page]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setKeyword(keywordInput.trim());
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">帖子管理</h2>
        <p className="mt-1 text-sm text-slate-500">帖子内容、作者与互动数据</p>
      </div>

      <form
        className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row"
        onSubmit={handleSearch}
      >
        <input
          className="h-10 min-w-0 flex-1 rounded-md border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
          placeholder="搜索标题或内容"
          value={keywordInput}
          onChange={(event) => setKeywordInput(event.target.value)}
        />
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
                <th className="px-6 py-3">内容</th>
                <th className="px-6 py-3">作者</th>
                <th className="px-6 py-3">可见性</th>
                <th className="px-6 py-3">互动</th>
                <th className="px-6 py-3">创建时间</th>
                <th className="px-6 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? <TableLoading colSpan={6} /> : null}
              {!loading && error ? (
                <TableError colSpan={6} message={error} />
              ) : null}
              {!loading && !error && data.records.length === 0 ? (
                <TableEmpty colSpan={6} />
              ) : null}
              {!loading && !error
                ? data.records.map((post) => {
                    const visibility = getVisibility(post.visibility);

                    return (
                      <tr className="hover:bg-slate-50" key={post.id}>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-950">
                            {post.title || `帖子 #${post.id}`}
                          </div>
                          <div className="mt-1 max-w-xl truncate text-xs text-slate-500">
                            {getPostSummary(post)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          <div>{post.nickname || "-"}</div>
                          <div className="mt-1 max-w-44 truncate text-xs text-slate-400">
                            {post.userUuid || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge tone={visibility.tone}>
                            {visibility.label}
                          </StatusBadge>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          <div>赞 {formatNumber(post.likeCount)}</div>
                          <div className="mt-1 text-xs text-slate-400">
                            评论 {formatNumber(post.commentCount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {formatDateTime(post.createdAt ?? post.createAt)}
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
