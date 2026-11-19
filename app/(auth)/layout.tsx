import type { ReactNode } from "react";

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-400 text-lg font-bold text-slate-950 shadow-lg shadow-indigo-950/30">
        A
      </div>
      <span className="text-xl font-semibold tracking-tight">Appointly</span>
    </div>
  );
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900 lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <aside className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-slate-950 px-12 py-10 text-white lg:flex xl:px-20">
        <div
          aria-hidden="true"
          className="absolute -left-40 -top-40 size-[30rem] rounded-full bg-indigo-500/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-48 -right-36 size-[32rem] rounded-full bg-cyan-400/10 blur-3xl"
        />

        <div className="relative">
          <BrandMark />
        </div>

        <div className="relative mx-auto w-full max-w-lg py-16">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-indigo-300">
            Your time, better planned
          </p>
          <h1 className="max-w-md text-5xl font-semibold leading-[1.12] tracking-tight xl:text-6xl">
            Make room for what matters.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-slate-300">
            Keep appointments, people, and plans together in one calm,
            organized place.
          </p>

          <div
            aria-hidden="true"
            className="mt-12 rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20 backdrop-blur"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-sm font-medium text-white">Today&apos;s schedule</p>
                <p className="mt-1 text-xs text-slate-400">A little more in sync</p>
              </div>
              <div className="rounded-xl bg-indigo-400/15 px-3 py-2 text-sm font-semibold text-indigo-200">
                3 events
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3 rounded-2xl bg-white/[0.06] p-3">
                <div className="h-10 w-1 rounded-full bg-indigo-300" />
                <div>
                  <p className="text-sm font-medium">Weekly planning</p>
                  <p className="mt-1 text-xs text-slate-400">9:30 AM · 30 min</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/[0.06] p-3">
                <div className="h-10 w-1 rounded-full bg-cyan-300" />
                <div>
                  <p className="text-sm font-medium">Client consultation</p>
                  <p className="mt-1 text-xs text-slate-400">11:00 AM · 45 min</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="relative text-sm text-slate-400">
          A clearer schedule starts here.
        </p>
      </aside>

      <main className="flex min-h-screen flex-col items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="mb-10 lg:hidden">
          <BrandMark />
        </div>
        <div className="w-full max-w-md">{children}</div>
        <p className="mt-10 text-center text-xs text-slate-500">
          Simple scheduling for a more focused day.
        </p>
      </main>
    </div>
  );
}