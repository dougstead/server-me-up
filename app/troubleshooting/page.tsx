import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import ConnectionDiagnostic from "@/components/ConnectionDiagnostic";
import TroubleshootingGameReference from "@/components/TroubleshootingGameReference";
import { pageMetadata } from "@/lib/metadata";
import { faqSchema } from "@/lib/structured-data";
import { troubleshootingTopics } from "@/lib/troubleshooting";

export const metadata: Metadata = pageMetadata({
  title: "Server Connection Troubleshooting",
  description:
    "Free troubleshooting guide for dedicated game servers: why players can't connect, port forwarding problems, CGNAT, firewall issues, SteamCMD failures and more, plus an interactive diagnostic.",
  path: "/troubleshooting",
});

export default function TroubleshootingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <JsonLd
        data={faqSchema(
          troubleshootingTopics.map((topic) => ({
            question: topic.question,
            answer: topic.shortAnswer,
          })),
        )}
      />

      <div className="mx-auto max-w-3xl px-6 py-16">
        <Breadcrumbs items={[{ label: "Troubleshooting" }]} />

        <p className="text-sm font-semibold uppercase tracking-widest text-sky-400">
          SelfServr
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Server Connection Troubleshooting
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
          Your server runs, but something still isn&apos;t working -- either
          jump into the interactive diagnostic below, or find your specific
          problem in the list.
        </p>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">
            Diagnose your connection problem
          </h2>

          <p className="mt-2 max-w-2xl text-slate-300">
            Answer a handful of yes/no questions and we&apos;ll narrow down
            the most likely cause.
          </p>

          <div className="mt-5">
            <ConnectionDiagnostic />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Common problems</h2>

          <div className="mt-6 space-y-8">
            {troubleshootingTopics.map((topic) => (
              <div key={topic.id} id={topic.id} className="scroll-mt-20">
                <h3 className="text-xl font-semibold text-white">
                  {topic.question}
                </h3>

                <p className="mt-2 leading-7 text-slate-200">
                  {topic.shortAnswer}
                </p>

                <p className="mt-3 leading-7 text-slate-400">
                  {topic.explanation}
                </p>

                {topic.steps && topic.steps.length > 0 && (
                  <ol className="mt-3 list-decimal space-y-2 pl-6 leading-7 text-slate-300">
                    {topic.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                )}

                {topic.relatedGuides && topic.relatedGuides.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {topic.relatedGuides.map((guide) => (
                      <Link
                        key={guide.href}
                        href={guide.href}
                        className="font-semibold text-sky-400 hover:text-sky-300 hover:underline"
                      >
                        {guide.label} →
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">
            Ports and install method by game
          </h2>

          <p className="mt-2 max-w-2xl text-slate-300">
            Quick reference for a specific game&apos;s required ports and
            how its dedicated server is installed.
          </p>

          <div className="mt-5">
            <TroubleshootingGameReference />
          </div>
        </section>
      </div>
    </main>
  );
}
