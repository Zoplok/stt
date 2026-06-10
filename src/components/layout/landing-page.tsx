"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { SignInButton, SignUpButton, SignOutButton, useUser } from "@clerk/nextjs";
import {
  Wand2,
  Globe2,
  Zap,
  Mic,
  FileVideo,
  Layers,
  ArrowRight,
  Play,
  Captions,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Mic,
    title: "AI Transcription",
    description: "98%+ accuracy across 90+ languages using Whisper, Deepgram & AssemblyAI.",
  },
  {
    icon: Layers,
    title: "Timeline Editor",
    description: "Drag-to-resize segments, split, merge, and keyboard shortcuts — like a pro NLE.",
  },
  {
    icon: Globe2,
    title: "AI Translation",
    description: "Translate into 30+ languages instantly with GPT-4. Tone and context preserved.",
  },
  {
    icon: Wand2,
    title: "AI Tools",
    description: "Auto-generate summaries, chapter markers, hashtags, and YouTube descriptions.",
  },
  {
    icon: FileVideo,
    title: "Burn & Export",
    description: "Export SRT, VTT, ASS, JSON or burn subtitles directly into your video.",
  },
  {
    icon: Zap,
    title: "Realtime Sync",
    description: "Subtitles sync live with playback. Edit and preview simultaneously.",
  },
];

const stats = [
  { value: "98%", label: "ACCURACY" },
  { value: "90+", label: "LANGUAGES" },
  { value: "<2MIN", label: "TURNAROUND" },
  { value: "5", label: "EXPORT FORMATS" },
];

const engines = ["OPENAI WHISPER", "DEEPGRAM", "ASSEMBLYAI", "FFMPEG"];

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex h-7 w-7 items-center justify-center border border-border bg-card">
        <Captions className="h-3.5 w-3.5 text-foreground" />
        <span className="rec-dot absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
      </div>
      <span className="font-mono text-[13px] font-semibold tracking-[0.18em] text-foreground">
        SUBTITLE.AI
      </span>
    </div>
  );
}

export function LandingPage() {
  const { isSignedIn } = useUser();

  return (
    <div className="relative min-h-dvh bg-background">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Logo />

          <div className="hidden items-center gap-1 md:flex">
            {[
              { href: "#features", label: "Features" },
              { href: "#workflow", label: "Workflow" },
              { href: "#pricing", label: "Pricing" },
            ].map((l) => (
              <Button key={l.href} variant="ghost" size="xs" asChild>
                <Link href={l.href}>{l.label}</Link>
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {isSignedIn ? (
              <>
                <SignOutButton>
                  <Button variant="ghost" size="xs">Sign out</Button>
                </SignOutButton>
                <Button size="xs" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <Button variant="ghost" size="xs">Sign in</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button size="xs">Start free</Button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="mx-auto max-w-6xl px-6 pt-24 pb-16">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <Badge variant="outline" className="gap-2 font-mono text-[10px] tracking-[0.15em]">
              <span className="rec-dot h-1.5 w-1.5 rounded-full bg-primary" />
              REC — TRANSCRIPTION ENGINE ONLINE
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="mt-8 text-[clamp(2.6rem,7vw,4.8rem)] leading-[1.04] font-bold tracking-[-0.03em] text-foreground"
          >
            Studio-grade subtitles.
            <br />
            <span className="text-muted-foreground">No studio required.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="mt-6 max-w-xl text-[16px] leading-[1.7] text-muted-foreground"
          >
            Upload any video or audio. Three AI engines transcribe it in under two minutes.
            Cut, time, translate, and ship — from one timeline.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.22 }}
            className="mt-10 flex items-center gap-3"
          >
            {isSignedIn ? (
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  Open dashboard <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            ) : (
              <SignUpButton mode="modal">
                <Button size="lg">
                  Start transcribing <ArrowRight data-icon="inline-end" />
                </Button>
              </SignUpButton>
            )}
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">View features</Link>
            </Button>
          </motion.div>
        </div>

        {/* ── MONITOR MOCKUP ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-20"
        >
          <Card className="gap-0 overflow-hidden rounded-none border-border p-0">
            {/* Monitor header */}
            <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2">
              <div className="flex items-center gap-3">
                <span className="rec-dot h-2 w-2 rounded-full bg-primary" />
                <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
                  PGM — PROJECT_FINAL_V3.MP4
                </span>
              </div>
              <span className="font-mono text-[10px] tracking-[0.15em] text-muted-foreground">
                TC 00:00:42:11
              </span>
            </div>

            <CardContent className="p-0">
              <div className="flex" style={{ height: "320px" }}>
                {/* Program monitor */}
                <div className="relative flex flex-1 items-center justify-center border-r border-border bg-black">
                  <div className="flex h-14 w-14 items-center justify-center border border-border">
                    <Play className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 border border-border bg-background/90 px-3 py-1.5 font-mono text-[11px] whitespace-nowrap text-foreground">
                    Welcome to the fastest subtitle workflow.
                  </div>
                  {/* Safe-area corners */}
                  <div className="pointer-events-none absolute inset-4 border border-border/40" />
                </div>

                {/* Caption list */}
                <div className="hidden w-64 flex-col sm:flex">
                  <div className="border-b border-border px-3 py-2 font-mono text-[9px] tracking-[0.2em] text-muted-foreground">
                    CAPTIONS — EN
                  </div>
                  {[
                    { t: "00:00:04:00", s: "Welcome to the fastest subtitle workflow." },
                    { t: "00:00:08:12", s: "Upload your footage and let the engines run." },
                    { t: "00:00:14:03", s: "Edit timing on the timeline, frame by frame." },
                    { t: "00:00:21:18", s: "Translate and export in every format.", active: true },
                    { t: "00:00:27:09", s: "Then ship it. That's the whole job." },
                  ].map((row, i) => (
                    <div
                      key={i}
                      className={`border-b border-border/60 px-3 py-2 ${
                        row.active ? "border-l-2 border-l-primary bg-primary/5" : ""
                      }`}
                    >
                      <div className="mb-0.5 font-mono text-[9px] text-muted-foreground">{row.t}</div>
                      <div className="line-clamp-2 text-[11px] leading-tight text-foreground/70">{row.s}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline + waveform */}
              <div className="border-t border-border bg-muted/20 px-4 py-3">
                <div className="mb-2 flex items-end gap-px">
                  {[12, 18, 8, 22, 14, 26, 10, 19, 24, 9, 16, 21, 12, 25, 8, 17, 23, 11, 20, 15, 26, 10, 18, 13, 22, 9, 24, 16, 11, 19, 14, 25, 8, 21, 17, 12, 23, 10, 20, 15].map((h, i) => (
                    <div
                      key={i}
                      className={`w-1.5 shrink-0 ${i >= 16 && i <= 22 ? "bg-primary/70" : "bg-muted-foreground/25"}`}
                      style={{ height: h }}
                    />
                  ))}
                </div>
                <div className="flex gap-1">
                  {[14, 22, 10, 26, 16, 20, 12, 24, 15, 18].map((w, i) => (
                    <div
                      key={i}
                      className={`h-4 shrink-0 border ${
                        i === 3 ? "border-primary/60 bg-primary/15" : "border-border bg-muted/60"
                      }`}
                      style={{ width: w * 4 }}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* ── ENGINES STRIP ── */}
      <div className="border-y border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">POWERED BY</span>
          {engines.map((e) => (
            <span key={e} className="font-mono text-[11px] tracking-[0.15em] text-muted-foreground/60">
              {e}
            </span>
          ))}
        </div>
      </div>

      {/* ── STATS ── */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 border border-border md:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`px-6 py-8 ${i > 0 ? "border-l border-border max-md:border-l-0 max-md:[&:nth-child(even)]:border-l" : ""} ${i >= 2 ? "max-md:border-t" : ""}`}
            >
              <div className="font-mono text-3xl font-bold tracking-tight text-foreground">{s.value}</div>
              <div className="mt-2 font-mono text-[10px] tracking-[0.2em] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-12 max-w-xl">
          <span className="font-mono text-[10px] tracking-[0.25em] text-primary">/ FEATURES</span>
          <h2 className="mt-4 text-[clamp(1.8rem,4vw,2.6rem)] font-bold tracking-[-0.02em] text-foreground">
            One timeline. Every step.
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            No context-switching between tools. Upload once — transcribe, edit, translate, and export.
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={item}
              className="group bg-background p-6 transition-colors hover:bg-card"
            >
              <f.icon className="h-4.5 w-4.5 text-muted-foreground transition-colors group-hover:text-primary" />
              <h3 className="mt-5 text-[15px] font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{f.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── WORKFLOW ── */}
      <section id="workflow" className="border-t border-border py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 max-w-xl">
            <span className="font-mono text-[10px] tracking-[0.25em] text-primary">/ WORKFLOW</span>
            <h2 className="mt-4 text-[clamp(1.8rem,4vw,2.6rem)] font-bold tracking-[-0.02em] text-foreground">
              Ingest. Cut. Deliver.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-3">
            {[
              { n: "01", title: "INGEST", desc: "Drag in any video or audio file. MP4, MOV, MP3, WAV — all supported." },
              { n: "02", title: "CUT", desc: "AI transcribes with speaker labels. Fine-tune timing in the timeline editor." },
              { n: "03", title: "DELIVER", desc: "Translate to 30+ languages, export to any format, or burn captions in." },
            ].map((step) => (
              <div key={step.n} className="bg-background p-8">
                <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-primary">{step.n}</span>
                <h3 className="mt-4 font-mono text-[13px] font-semibold tracking-[0.2em] text-foreground">{step.title}</h3>
                <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-border py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div>
              <h2 className="text-[clamp(1.6rem,4vw,2.4rem)] font-bold tracking-[-0.02em] text-foreground">
                Roll tape.
              </h2>
              <p className="mt-2 text-[15px] text-muted-foreground">
                Free to start. No credit card required.
              </p>
            </div>
            {isSignedIn ? (
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  Open dashboard <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            ) : (
              <SignUpButton mode="modal">
                <Button size="lg">
                  Start free <ArrowRight data-icon="inline-end" />
                </Button>
              </SignUpButton>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <Logo />
          <p className="font-mono text-[10px] tracking-[0.15em] text-muted-foreground/60">
            © {new Date().getFullYear()} SUBTITLE.AI — ALL RIGHTS RESERVED
          </p>
          <div className="flex items-center gap-1">
            {["Privacy", "Terms", "GitHub"].map((l) => (
              <Button key={l} variant="ghost" size="xs" asChild>
                <Link href="#">{l}</Link>
              </Button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
