"use client";

import { useEffect, useState } from "react";
import { Pagination } from "@/components/pagination";
import { StatusBadge } from "@/components/status-badge";
import { TableEmpty, TableError, TableLoading } from "@/components/table-state";
import {
  getVoucherSeckillPage,
  type PageResult,
  type VoucherSeckill,
} from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import { formatDateTime, formatNumber } from "@/lib/format";

const PAGE_SIZE = 20;

function getSeckillStatus(status?: number) {
  if (status === 1) {
    return { label: "进行中", tone: "green" as const };
  }

  if (status === 2) {
    return { label: "已结束", tone: "slate" as const };
  }

  if (status === 0) {
    return { label: "未开始", tone: "amber" as const };
  }

  return { label: "未知", tone: "slate" as const };
}

export default function VoucherSeckillsPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<PageResult<VoucherSeckill>>({
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

      getVoucherSeckillPage({
        current: page,
        size: PAGE_SIZE,
        status,
      })
        .then((result) => {
          if (!ignore) {
            setData(result);
          }
        })
        .catch((requestError) => {
          if (!ignore) {
            setError(getErrorMessage(requestError, "秒杀券列表加载失败"));
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
  }, [page, status]);

  function handleStatusChange(value: string) {
    setPage(1);
    setStatus(value);
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">秒杀券管理</h2>
        <p className="mt-1 text-sm text-slate-500">券活动、库存与时间窗口</p>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <select
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
          value={status}
          onChange={(event) => handleStatusChange(event.target.value)}
        >
          <option value="">全部状态</option>
          <option value="0">未开始</option>
          <option value="1">进行中</option>
          <option value="2">已结束</option>
        </select>
      </div>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-3">活动</th>
                <th className="px-6 py-3">库存</th>
                <th className="px-6 py-3">状态</th>
                <th className="px-6 py-3">开始时间</th>
                <th className="px-6 py-3">结束时间</th>
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
                ? data.records.map((item) => {
                    const statusInfo = getSeckillStatus(item.status);

                    return (
                      <tr className="hover:bg-slate-50" key={item.seckillId}>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-950">
                            {item.title || `秒杀活动 #${item.seckillId}`}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            Voucher #{item.voucherId}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          <div>{formatNumber(item.remainingStock)} 剩余</div>
                          <div className="mt-1 text-xs text-slate-400">
                            共 {formatNumber(item.totalStock)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge tone={statusInfo.tone}>
                            {statusInfo.label}
                          </StatusBadge>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {formatDateTime(item.startTime)}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {formatDateTime(item.endTime)}
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
