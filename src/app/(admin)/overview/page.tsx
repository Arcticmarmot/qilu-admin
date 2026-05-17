import Link from "next/link";

const overviewItems = [
  { href: "/users", label: "用户管理", value: "账号状态" },
  { href: "/posts", label: "帖子管理", value: "内容审核" },
  { href: "/voucher-seckills/new", label: "创建秒杀活动", value: "库存配置" },
  { href: "/voucher-seckills/redeem", label: "兑换核销", value: "兑换码处理" },
];

export default function OverviewPage() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">系统概览</h2>
        <p className="mt-1 text-sm text-slate-500">后台核心模块入口</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewItems.map((item) => (
          <Link
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-200 hover:shadow"
            href={item.href}
            key={item.href}
          >
            <div className="text-sm text-slate-500">{item.value}</div>
            <div className="mt-3 text-lg font-semibold text-slate-950">
              {item.label}
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
