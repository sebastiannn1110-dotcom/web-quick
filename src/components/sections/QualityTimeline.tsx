import { CheckCircle2 } from "lucide-react";
import { AnimatedWrapper } from "@/components/ui/AnimatedWrapper";

export function QualityTimeline({
  items,
}: {
  items: Array<{ title: string; body: string }>;
}) {
  return (
    <div className="relative space-y-5 before:absolute before:left-5 before:top-4 before:h-[calc(100%-32px)] before:w-px before:bg-cyan-200">
      {items.map((item, index) => (
        <AnimatedWrapper key={item.title} delay={index * 0.04}>
          <div className="relative grid gap-4 rounded-md border border-slate-200 bg-white p-5 pl-16 shadow-sm">
            <span className="absolute left-0 top-5 flex h-10 w-10 items-center justify-center rounded-md bg-cyan-500 text-slate-950">
              <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
            </span>
            <h3 className="text-lg font-semibold text-slate-950">
              {item.title}
            </h3>
            <p className="text-sm leading-7 text-slate-600">{item.body}</p>
          </div>
        </AnimatedWrapper>
      ))}
    </div>
  );
}
