"use client";
import { useState } from "react";
import {
  BASELINE,
  BUDGET,
  DAYS,
  forecast,
  type Assumptions,
} from "@/lib/campaign";
import { ArrowDownRight, RotateCcw } from "lucide-react";
const controls: {
  key: keyof Assumptions;
  label: string;
  max: number;
  step?: number;
  suffix?: string;
}[] = [
  { key: "contacts", label: "Participating campus contacts", max: 40 },
  {
    key: "visitsPerContact",
    label: "Unique visits per campus contact",
    max: 100,
  },
  {
    key: "campusConversion",
    label: "Campus registration conversion",
    max: 60,
    suffix: "%",
  },
  {
    key: "communityVisitors",
    label: "Community landing visitors",
    max: 1000,
    step: 25,
  },
  {
    key: "communityConversion",
    label: "Community registration conversion",
    max: 60,
    suffix: "%",
  },
  {
    key: "overlap",
    label: "Community overlap with campus visitors",
    max: 100,
    suffix: "%",
  },
  {
    key: "sharingRate",
    label: "Initial registrants delivering invitations",
    max: 100,
    suffix: "%",
  },
  {
    key: "deliveredInvites",
    label: "Delivered invites per sharing registrant",
    max: 5,
  },
  {
    key: "referralConversion",
    label: "Delivered invite → registration",
    max: 60,
    step: 0.01,
    suffix: "%",
  },
  {
    key: "spent",
    label: "Budget committed",
    max: 2000,
    step: 50,
    suffix: " INR",
  },
];
export default function CampaignSimulator() {
  const [input, setInput] = useState<Assumptions>(BASELINE);
  const model = forecast(input);
  return (
    <section id="simulator" className="scroll-mt-24">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-3 text-lime-200">
            Decision lab / simulated assumptions
          </p>
          <h2 className="text-3xl sm:text-4xl">Challenge the plan.</h2>
          <p className="mt-3 max-w-2xl text-zinc-400">
            What if fewer campuses participate? What if conversion drops? Change
            the assumptions and inspect the consequence.
          </p>
        </div>
        <button
          className="text-link flex items-center gap-2"
          onClick={() => setInput(BASELINE)}
        >
          <RotateCcw size={14} /> Reset assumptions
        </button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
        <div className="panel grid gap-5 sm:grid-cols-2">
          {controls.map((c) => (
            <label key={c.key} className="block text-sm text-zinc-300">
              <span className="mb-3 flex justify-between gap-2">
                <span>{c.label}</span>
                <strong className="shrink-0 font-mono text-lime-200">
                  {input[c.key]}
                  {c.suffix}
                </strong>
              </span>
              <input
                className="w-full accent-lime-300"
                type="range"
                min="0"
                max={c.max}
                step={c.step || 1}
                value={input[c.key]}
                onChange={(e) =>
                  setInput((v) => ({ ...v, [c.key]: Number(e.target.value) }))
                }
              />
            </label>
          ))}
        </div>
        <div className="panel">
          <div
            aria-live="polite"
            className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6"
          >
            <div>
              <p className="eyebrow">Forecast registrations</p>
              <p className="mt-3 text-6xl font-semibold tracking-tighter">
                {model.total}
                <span className="ml-3 text-xl text-zinc-500">/ 500</span>
              </p>
            </div>
            <p
              className={`rounded-full px-3 py-2 text-sm ${model.gap ? "bg-amber-300/10 text-amber-200" : "bg-lime-300/10 text-lime-200"}`}
            >
              {model.gap
                ? `${model.gap} short of target`
                : "Target reached in this scenario"}
            </p>
          </div>
          <table className="mt-5 w-full text-left text-sm">
            <caption className="sr-only">Forecast by acquisition route</caption>
            <thead className="text-zinc-500">
              <tr>
                <th className="py-3 font-normal">Route</th>
                <th className="text-right font-normal">Registrations</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Campus distribution", model.campus],
                ["Relevant communities", model.community],
                ["Incremental peer invites", model.referrals],
              ].map(([label, count]) => (
                <tr key={label} className="border-t border-white/10">
                  <td className="py-3 text-zinc-300">{label}</td>
                  <td className="text-right font-mono">{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-5 rounded-xl bg-black/30 p-4 text-sm">
            <p className="text-lime-200">
              ₹{model.remaining.toLocaleString()} uncommitted • referral
              contribution {model.referralContribution.toFixed(2)}
            </p>
            <p className="mt-3 leading-relaxed text-zinc-400">
              Campus visits = contacts × visits/contact. Communities are
              discounted for overlap. Referrals = initial registrations ×
              participation × delivered invitations × conversion. One referral
              generation only; no compounding.
            </p>
          </div>
          <div className="mt-5 border-l-2 border-amber-300 pl-4">
            <p className="eyebrow text-amber-200">Recovery decision</p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">
              {model.gap
                ? model.additionalContacts
                  ? `At the current campus yield, approximately ${model.additionalContacts} additional participating contacts could cover the gap before referral effects. This requires access to new audiences and is not guaranteed.`
                  : "Campus yield is zero. Diagnose distribution and the offer before committing more money."
                : "Keep the reserve. Validate eligibility and deduplicate registrations before claiming the target."}
            </p>
          </div>
          <button
            className="text-link mt-6 inline-flex items-center gap-2"
            onClick={() => setInput({ ...BASELINE, campusConversion: 20 })}
          >
            <ArrowDownRight size={16} /> Test the 382-registration downside
          </button>
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-zinc-500">
        These are illustrative planning assumptions, not student research or
        campaign results. Group members are not landing visitors. Delivered
        invitations are assumptions; share clicks cannot verify delivery. The
        baseline assumes no cross-channel overlap; use the slider to challenge
        it.
      </p>
      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <div>
          <p className="eyebrow mb-4">₹2,000 allocation</p>
          <div className="panel space-y-5">
            {BUDGET.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between gap-4 text-sm">
                  <strong>{item.label}</strong>
                  <span className="font-mono text-lime-200">
                    ₹{item.amount}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="eyebrow mb-4">Seven-day operating plan</p>
          <div className="space-y-5">
            {DAYS.map(([day, title, description]) => (
              <div key={day} className="flex gap-4">
                <span className="font-mono text-xs text-lime-200">{day}</span>
                <div>
                  <h3 className="text-sm">{title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
