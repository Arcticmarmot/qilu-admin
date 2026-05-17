import Link from "next/link";

const contentItems = [
  { href: "/users", label: "用户管理", value: "账号资料与状态" },
  { href: "/posts", label: "帖子管理", value: "帖子内容与可见性" },
  { href: "/comments", label: "评论管理", value: "评论内容与状态" },
  { href: "/replies", label: "回复管理", value: "回复链路与状态" },
  { href: "/likes", label: "点赞管理", value: "点赞记录查询" },
];

const seckillItems = [
  {
    href: "/voucher-seckills/vouchers/new",
    label: "创建优惠券",
    value: "兑换券基础信息",
  },
  { href: "/voucher-seckills/new", label: "创建秒杀活动", value: "库存与时间配置" },
  { href: "/voucher-seckills/preheat", label: "库存预热", value: "秒杀库存写入" },
  { href: "/voucher-seckills/redeem", label: "兑换核销", value: "兑换码处理" },
];

export default function OverviewPage() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">系统概览</h2>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-950">
                内容与互动
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                用户、帖子、评论、回复、点赞
              </p>
            </div>
            <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700 ring-1 ring-inset ring-teal-200">
              {contentItems.length} 个入口
            </span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {contentItems.map((item) => (
              <Link
                className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-teal-200 hover:bg-white hover:shadow-sm"
                href={item.href}
                key={item.href}
              >
                <div className="text-xs font-medium text-slate-500">
                  {item.value}
                </div>
                <div className="mt-2 text-base font-semibold text-slate-950">
                  {item.label}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-950">
                秒杀管理
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                优惠券、活动、库存、核销
              </p>
            </div>
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
              {seckillItems.length} 个入口
            </span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {seckillItems.map((item) => (
              <Link
                className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-teal-200 hover:bg-white hover:shadow-sm"
                href={item.href}
                key={item.href}
              >
                <div className="text-xs font-medium text-slate-500">
                  {item.value}
                </div>
                <div className="mt-2 text-base font-semibold text-slate-950">
                  {item.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
