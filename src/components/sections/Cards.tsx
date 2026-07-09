import {
  Boxes,
  CircuitBoard,
  ClipboardCheck,
  Globe2,
  Handshake,
  Layers3,
  Microscope,
  PackageCheck,
  SearchCheck,
  ShieldCheck,
  TrendingDown,
  Truck,
} from "lucide-react";
import { AnimatedWrapper } from "@/components/ui/AnimatedWrapper";

const icons = [
  SearchCheck,
  ShieldCheck,
  TrendingDown,
  Boxes,
  Globe2,
  Truck,
  Microscope,
  PackageCheck,
  CircuitBoard,
  ClipboardCheck,
  Layers3,
  Handshake,
];

export function SimpleCardGrid({
  items,
}: {
  items: Array<{ title: string; body?: string; description?: string }>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => {
        const Icon = icons[index % icons.length];

        return (
          <AnimatedWrapper key={`${item.title}-${index}`} delay={index * 0.03}>
            <article className="h-full rounded-md border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-xl hover:shadow-slate-950/8">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-cyan-50 text-cyan-800">
                <Icon aria-hidden="true" className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-950">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {item.body || item.description}
              </p>
            </article>
          </AnimatedWrapper>
        );
      })}
    </div>
  );
}

export function DetailCardGrid({
  items,
  labels,
}: {
  items: Array<{
    title: string;
    description: string;
    benefit?: string;
    process?: string;
    when?: string;
  }>;
  labels: {
    benefit: string;
    process: string;
    when: string;
  };
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {items.map((item, index) => {
        const Icon = icons[index % icons.length];

        return (
          <AnimatedWrapper key={item.title} delay={index * 0.03}>
            <article className="h-full rounded-md border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-slate-950 text-cyan-300">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">
                    {item.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {item.description}
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {item.benefit ? (
                  <div className="rounded-md bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
                      {labels.benefit}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {item.benefit}
                    </p>
                  </div>
                ) : null}
                {item.process ? (
                  <div className="rounded-md bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
                      {labels.process}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {item.process}
                    </p>
                  </div>
                ) : null}
                {item.when ? (
                  <div className="rounded-md bg-slate-50 p-4 md:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
                      {labels.when}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {item.when}
                    </p>
                  </div>
                ) : null}
              </div>
            </article>
          </AnimatedWrapper>
        );
      })}
    </div>
  );
}
