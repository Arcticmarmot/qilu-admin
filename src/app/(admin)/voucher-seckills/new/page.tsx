"use client";

import { FormEvent, useState } from "react";
import { createVoucherSeckill } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";

function normalizeDateTime(value: string) {
  return value.length === 16 ? `${value}:00` : value;
}

export default function CreateVoucherSeckillPage() {
  const [voucherId, setVoucherId] = useState("");
  const [totalStock, setTotalStock] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [redeemDeadline, setRedeemDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const seckillId = await createVoucherSeckill({
        voucherId: Number(voucherId),
        totalStock: Number(totalStock),
        startTime: normalizeDateTime(startTime),
        endTime: normalizeDateTime(endTime),
        redeemDeadline: normalizeDateTime(redeemDeadline),
      });
      setMessage(`秒杀活动创建成功，ID：${seckillId}`);
      setVoucherId("");
      setTotalStock("");
      setStartTime("");
      setEndTime("");
      setRedeemDeadline("");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "秒杀活动创建失败"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">
          创建秒杀活动
        </h2>
        <p className="mt-1 text-sm text-slate-500">优惠券、库存与时间窗口</p>
      </div>

      <form
        className="max-w-3xl space-y-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              优惠券 ID
            </span>
            <input
              className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              disabled={loading}
              min={1}
              placeholder="1"
              type="number"
              value={voucherId}
              onChange={(event) => setVoucherId(event.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              活动总库存
            </span>
            <input
              className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              disabled={loading}
              min={1}
              placeholder="100"
              type="number"
              value={totalStock}
              onChange={(event) => setTotalStock(event.target.value)}
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              秒杀开始时间
            </span>
            <input
              className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              disabled={loading}
              type="datetime-local"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              秒杀结束时间
            </span>
            <input
              className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              disabled={loading}
              type="datetime-local"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              兑换截止时间
            </span>
            <input
              className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              disabled={loading}
              type="datetime-local"
              value={redeemDeadline}
              onChange={(event) => setRedeemDeadline(event.target.value)}
            />
          </label>
        </div>

        {message ? (
          <div className="rounded-md border border-green-200 bg-green-50 px-3.5 py-3 text-sm text-green-700">
            {message}
          </div>
        ) : null}
        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="flex justify-end">
          <button
            className="h-10 rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500"
            disabled={
              loading ||
              !voucherId ||
              !totalStock ||
              !startTime ||
              !endTime ||
              !redeemDeadline
            }
            type="submit"
          >
            {loading ? "创建中..." : "创建秒杀活动"}
          </button>
        </div>
      </form>
    </div>
  );
}
