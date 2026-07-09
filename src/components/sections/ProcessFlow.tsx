import { ArrowRight } from "lucide-react";
import { AnimatedWrapper } from "@/components/ui/AnimatedWrapper";

export function ProcessFlow({
  steps,
}: {
  steps: Array<{ title: string; body: string }>;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-5">
      {steps.map((step, index) => (
        <AnimatedWrapper key={step.title} delay={index * 0.04}>
          <div className="relative h-full rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md bg-cyan-500 text-sm font-bold text-slate-950">
              {index + 1}
            </div>
            <h3 className="text-lg font-semibold text-slate-950">
              {step.title}
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {step.body}
            </p>
            {index < steps.length - 1 ? (
              <ArrowRight
                aria-hidden="true"
                className="absolute -right-5 top-8 hidden h-5 w-5 text-cyan-700 lg:block"
              />
            ) : null}
          </div>
        </AnimatedWrapper>
      ))}
    </div>
  );
}
