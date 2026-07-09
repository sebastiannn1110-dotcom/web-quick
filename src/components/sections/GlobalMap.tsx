import { MapPin } from "lucide-react";
import { AnimatedWrapper } from "@/components/ui/AnimatedWrapper";

export function GlobalMap({
  regions,
  locations,
  notice,
  contactLabel,
}: {
  regions: Array<{ name: string; body: string }>;
  locations: string[];
  notice: string;
  contactLabel: string;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <AnimatedWrapper>
        <div className="dark-panel grid-lines relative min-h-[420px] overflow-hidden rounded-md p-6 text-white">
          <div className="absolute inset-x-8 top-1/2 h-px bg-cyan-300/40" />
          <div className="absolute inset-y-8 left-1/3 w-px bg-white/10" />
          <div className="absolute inset-y-8 right-1/3 w-px bg-white/10" />
          <div className="relative grid h-full gap-4 md:grid-cols-3">
            {regions.map((region, index) => (
              <div
                key={region.name}
                className="flex min-h-48 flex-col justify-end rounded-md border border-white/15 bg-white/8 p-5 backdrop-blur-sm transition hover:bg-white/14"
              >
                <MapPin
                  aria-hidden="true"
                  className={`mb-5 h-7 w-7 ${
                    index === 1 ? "text-emerald-300" : "text-cyan-300"
                  }`}
                />
                <h3 className="text-xl font-semibold">{region.name}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  {region.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedWrapper>
      <AnimatedWrapper delay={0.05}>
        <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
            {contactLabel}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {locations.map((location) => (
              <span
                key={location}
                className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              >
                {location}
              </span>
            ))}
          </div>
          <p className="mt-6 rounded-md bg-amber-50 p-4 text-sm leading-7 text-amber-950">
            {notice}
          </p>
        </div>
      </AnimatedWrapper>
    </div>
  );
}
