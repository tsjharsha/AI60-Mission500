"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { request } from "@/lib/supabase/services";
import { trackEvent } from "@/lib/analytics/trackEvent";
import { getProjectByName } from "@/lib/projects";
import ProjectWorkbench from "@/components/experience/ProjectWorkbench";
type Invite = {
  creatorName: string;
  projectName: string;
  missingRoles: string[];
  isFull: boolean;
  mode: string;
};
function InviteContent() {
  const { code } = useParams<{ code: string }>();
  const search = useSearchParams();
  const preview = search.get("preview") === "1";
  const { setReferralContext } = useAppStore();
  const [data, setData] = useState<Invite | null>(null),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    request<Invite>(`/api/squads/${encodeURIComponent(code)}`)
      .then((value) => {
        if (active) {
          setData(value);
          setError("");
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    if (!preview) {
      const source = search.get("source") || "squad_invite",
        referrerId = search.get("ref") || undefined;
      setReferralContext({ squadCode: code, source, referrerId });
      void trackEvent("squad_invite_opened", { source, squadCode: code });
      void trackEvent("landing_view", { source });
    }
    return () => {
      active = false;
    };
  }, [code, search, preview, retry, setReferralContext]);
  const project = getProjectByName(data?.projectName);
  return (
    <div className="studio-shell px-5 pb-20 pt-32 sm:px-8">
      <div className="mx-auto max-w-6xl">
        {error ? (
          <div className="max-w-xl">
            <h1 className="text-4xl">This invite is unavailable.</h1>
            <p role="alert" className="mt-5 text-zinc-400">
              {error}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                className="action-secondary"
                onClick={() => {
                  setError("");
                  setRetry((v) => v + 1);
                }}
              >
                Retry invite
              </button>
              <Link
                href="/register"
                onClick={() =>
                  setReferralContext({
                    squadCode: undefined,
                    referrerId: undefined,
                    source: "direct",
                  })
                }
                className="action-primary"
              >
                Register independently
              </Link>
            </div>
          </div>
        ) : !data ? (
          <p role="status">Loading the invitation…</p>
        ) : (
          <>
            <p className="eyebrow mb-5 text-lime-200">
              {preview
                ? "Invite preview / excluded from tracking"
                : `An invitation from ${data.creatorName}`}
            </p>
            <div className="grid items-start gap-10 lg:grid-cols-2">
              <div>
                <h1 className="text-5xl leading-tight sm:text-6xl">
                  “I’m building
                  <br />
                  <span className="font-serif italic text-lime-200">
                    something useful.
                  </span>
                  <br />
                  Join me?”
                </h1>
                <p className="mt-6 text-lg text-zinc-400">
                  {data.creatorName} chose {data.projectName}. Build alongside
                  them in a free, guided 60-minute online workshop concept.
                </p>
                <div className="mt-7 panel">
                  <p className="eyebrow mb-3">
                    {data.isFull
                      ? "Squad full / workshop still open"
                      : "Optional places in the team"}
                  </p>
                  <p className="text-sm">
                    {data.isFull
                      ? "You can register and attend solo or create your own squad."
                      : data.missingRoles.join(" · ")}
                  </p>
                  <p className="mt-4 text-xs leading-relaxed text-zinc-500">
                    Schedule to be announced.{" "}
                    {data.mode === "SIMULATION"
                      ? "This is a challenge demo, not an actual event enrollment."
                      : "Joining instructions require organizer confirmation."}
                  </p>
                </div>
                <div className="mt-7 flex flex-wrap gap-3">
                  {preview ? (
                    <Link className="action-primary" href="/squad">
                      Back to my squad
                    </Link>
                  ) : (
                    <>
                      <Link
                        className="action-primary"
                        href={`/register?project=${project.id}`}
                        onClick={() => {
                          if (data.isFull)
                            setReferralContext({
                              squadCode: undefined,
                              referrerId: undefined,
                              source: "direct",
                            });
                        }}
                      >
                        Register for the workshop <ArrowRight size={17} />
                      </Link>
                      <Link className="action-secondary" href="/diagnostic">
                        Find my own project
                      </Link>
                    </>
                  )}
                </div>
                <p className="mt-4 text-xs text-zinc-500">
                  Register first. Join the squad afterward if you want. No
                  diagnostic required.
                </p>
              </div>
              <ProjectWorkbench project={project} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
export default function InvitePage() {
  return (
    <Suspense fallback={<p className="pt-32">Loading invite…</p>}>
      <InviteContent />
    </Suspense>
  );
}
