"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { SignInButton, SignUpButton, SignOutButton, useUser } from "@clerk/nextjs";
import {
  Wand2,
  Globe2,
  Zap,
  PlayCircle,
  Mic,
  FileVideo,
  Layers,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Clock,
  Languages,
} from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "AI Transcription",
    description: "98%+ accuracy across 90+ languages using Whisper, Deepgram & AssemblyAI.",
    accent: "indigo",
  },
  {
    icon: Layers,
    title: "Timeline Editor",
    description: "Drag-to-resize segments, split, merge, and keyboard shortcuts — like a pro NLE.",
    accent: "blue",
  },
  {
    icon: Globe2,
    title: "AI Translation",
    description: "Translate into 30+ languages instantly with GPT-4. Tone and context preserved.",
    accent: "violet",
  },
  {
    icon: Wand2,
    title: "AI Tools",
    description: "Auto-generate summaries, chapter markers, hashtags, and YouTube descriptions.",
    accent: "purple",
  },
  {
    icon: FileVideo,
    title: "Burn & Export",
    description: "Export SRT, VTT, ASS, JSON or burn subtitles directly into your video.",
    accent: "pink",
  },
  {
    icon: Zap,
    title: "Realtime Sync",
    description: "Subtitles sync live with playback. Edit and preview simultaneously.",
    accent: "amber",
  },
];

const stats = [
  { value: "98%", label: "Accuracy", icon: CheckCircle2 },
  { value: "90+", label: "Languages", icon: Languages },
  { value: "<2 min", label: "Turnaround", icon: Clock },
  { value: "5", label: "Export formats", icon: Sparkles },
];

const logos = ["OpenAI", "Deepgram", "AssemblyAI", "FFmpeg", "Next.js"];

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const accentMap: Record<string, string> = {
  indigo: "bg-indigo-500/10 text-indigo-400 ring-indigo-500/20",
  blue: "bg-blue-500/10 text-blue-400 ring-blue-500/20",
  violet: "bg-violet-500/10 text-violet-400 ring-violet-500/20",
  purple: "bg-purple-500/10 text-purple-400 ring-purple-500/20",
  pink: "bg-pink-500/10 text-pink-400 ring-pink-500/20",
  amber: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
};

export function LandingPage() {
  const { isSignedIn } = useUser();

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-[#06060f]">

      {/* Background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-64 left-1/2 -translate-x-1/2 w-[1100px] h-[700px] rounded-full bg-indigo-600/[0.07] blur-[140px]" />
        <div className="absolute top-[40%] -left-64 w-[700px] h-[700px] rounded-full bg-violet-700/[0.05] blur-[120px]" />
        <div className="absolute top-[60%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/[0.05] blur-[120px]" />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.015]" style={{backgroundImage:"linear-gradient(rgba(255,255,255,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.4) 1px,transparent 1px)",backgroundSize:"72px 72px"}} />
      </div>

      {/* ── NAV ── */}
      <nav className="relative z-20 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <PlayCircle className="w-4 h-4 text-white" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-white">SubtitleAI</span>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center gap-7 text-[13px] font-medium text-white/50">
            <Link href="#features" className="hover:text-white/90 transition-colors">Features</Link>
            <Link href="#how" className="hover:text-white/90 transition-colors">How it works</Link>
            <Link href="#pricing" className="hover:text-white/90 transition-colors">Pricing</Link>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-2">
            {isSignedIn ? (
              <>
                <Link href="/dashboard" className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-[13px] font-semibold text-white transition-all shadow-lg shadow-indigo-500/20">
                  Dashboard →
                </Link>
                <SignOutButton>
                  <button className="px-3 py-1.5 rounded-lg text-[13px] text-white/40 hover:text-white/70 transition-colors">Sign out</button>
                </SignOutButton>
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="px-4 py-1.5 rounded-lg text-[13px] font-medium text-white/50 hover:text-white/80 transition-colors">Sign in</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-4 py-1.5 rounded-lg bg-white text-[13px] font-semibold text-black hover:bg-white/90 transition-all shadow-lg shadow-white/10">
                    Get started free
                  </button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-28 pb-20 flex flex-col items-center text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[12px] font-medium text-indigo-300"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Now with Deepgram Nova-3 · AssemblyAI Universal-3 Pro
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08 }}
          className="text-[clamp(2.8rem,8vw,5.5rem)] font-bold tracking-[-0.03em] leading-[1.02] mb-6"
        >
          <span className="text-white">Subtitles in</span>
          <br />
          <span style={{background:"linear-gradient(135deg,#a5b4fc 0%,#818cf8 40%,#6366f1 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text"}}>
            under 2 minutes.
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.16 }}
          className="text-[17px] text-white/45 max-w-[560px] leading-[1.7] mb-10"
        >
          Upload any video or audio. Get studio-quality subtitles powered by three AI engines.
          Edit, translate, and export — all in one place.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.22 }}
          className="flex items-center gap-3"
        >
          {isSignedIn ? (
            <Link href="/dashboard" className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[15px] font-semibold transition-all shadow-xl shadow-indigo-500/25 hover:-translate-y-0.5">
              Go to Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ) : (
            <SignUpButton mode="modal">
              <button className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[15px] font-semibold transition-all shadow-xl shadow-indigo-500/25 hover:-translate-y-0.5">
                Start free <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </SignUpButton>
          )}
          <Link href="#features" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 text-[15px] font-medium transition-all hover:-translate-y-0.5">
            See features
          </Link>
        </motion.div>

        {/* Product UI mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.38 }}
          className="mt-16 w-full max-w-4xl relative"
        >
          {/* Glow behind mockup */}
          <div className="absolute inset-x-20 -top-8 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
          <div className="absolute inset-0 rounded-2xl bg-indigo-500/5 blur-3xl -z-10 scale-95" />

          {/* Browser chrome */}
          <div className="rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/60">
            {/* Browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.03] border-b border-white/[0.06]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <div className="flex-1 mx-4">
                <div className="max-w-[280px] mx-auto bg-white/[0.05] rounded-md px-3 py-1 text-[11px] text-white/25 font-mono">
                  app.subtitleai.io/projects/edit
                </div>
              </div>
            </div>

            {/* App UI */}
            <div className="bg-[#09090f] flex" style={{height: "340px"}}>
              {/* Sidebar */}
              <div className="w-12 border-r border-white/[0.06] flex flex-col items-center py-4 gap-4 shrink-0">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600" />
                {[...Array(3)].map((_,i) => (
                  <div key={i} className="w-5 h-5 rounded bg-white/[0.06]" />
                ))}
              </div>

              {/* Video + subtitle preview */}
              <div className="flex-1 flex flex-col">
                <div className="flex-1 flex">
                  {/* Video pane */}
                  <div className="flex-1 bg-black/40 flex items-center justify-center relative border-r border-white/[0.06]">
                    <div className="w-16 h-16 rounded-full bg-white/[0.06] flex items-center justify-center">
                      <PlayCircle className="w-7 h-7 text-white/30" />
                    </div>
                    {/* Subtitle preview */}
                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/80 rounded-lg text-[12px] text-white/90 font-medium whitespace-nowrap border border-white/10">
                      Welcome to SubtitleAI — the fastest way...
                    </div>
                    {/* time */}
                    <div className="absolute top-3 right-3 text-[10px] font-mono text-white/25">00:42 / 03:18</div>
                  </div>

                  {/* Subtitle list */}
                  <div className="w-56 flex flex-col">
                    <div className="px-3 py-2 border-b border-white/[0.06] text-[10px] font-medium text-white/30 uppercase tracking-widest">Subtitles</div>
                    {[
                      { t: "00:00:04", s: "Welcome to SubtitleAI, the fastest..." },
                      { t: "00:00:08", s: "Upload your video and get subtitles..." },
                      { t: "00:00:14", s: "Edit in the timeline, translate into..." },
                      { t: "00:00:21", s: "Export to SRT, VTT, ASS or burn in.", active: true },
                      { t: "00:00:27", s: "Powered by three AI engines for..." },
                    ].map((row, i) => (
                      <div key={i} className={`px-3 py-2 border-b border-white/[0.04] ${row.active ? "bg-indigo-600/15 border-l-2 border-l-indigo-500" : ""}`}>
                        <div className="text-[9px] font-mono text-white/25 mb-0.5">{row.t}</div>
                        <div className="text-[10px] text-white/60 leading-tight line-clamp-2">{row.s}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                <div className="h-16 border-t border-white/[0.06] bg-black/20 px-3 flex flex-col justify-center gap-1">
                  <div className="flex gap-1">
                    {[60,90,45,110,70,80,55,95,65,75].map((w, i) => (
                      <div key={i} className={`h-5 rounded flex-shrink-0 ${i === 3 ? "bg-indigo-600/60 border border-indigo-500/40" : "bg-white/[0.06] border border-white/[0.08]"}`} style={{width: w/5}} />
                    ))}
                  </div>
                  <div className="flex gap-1">
                    {[50,80,100,60,90,55,70,85,65,75].map((w, i) => (
                      <div key={i} className="h-2 rounded flex-shrink-0 bg-white/[0.04]" style={{width: w/5}} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── LOGOS / TRUST ── */}
      <div className="relative z-10 border-y border-white/[0.05] py-5">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-center gap-10 flex-wrap">
          <span className="text-[11px] text-white/20 font-medium uppercase tracking-widest mr-2">Powered by</span>
          {logos.map((l) => (
            <span key={l} className="text-[13px] font-semibold text-white/20 hover:text-white/40 transition-colors">{l}</span>
          ))}
        </div>
      </div>

      {/* ── STATS ── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20 grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 text-center hover:border-white/[0.12] transition-colors">
            <s.icon className="w-4 h-4 text-indigo-400/70 mx-auto mb-3" />
            <div className="text-3xl font-bold text-white tracking-tight">{s.value}</div>
            <div className="text-[12px] text-white/35 mt-1 font-medium">{s.label}</div>
          </div>
        ))}
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-medium text-white/40 mb-4 uppercase tracking-widest">
            Features
          </div>
          <h2 className="text-[clamp(2rem,5vw,3.2rem)] font-bold tracking-[-0.025em] text-white mb-3">
            Everything in one workflow.
          </h2>
          <p className="text-white/40 text-[16px] max-w-lg mx-auto leading-relaxed">
            No context-switching between tools. Upload once, transcribe, edit, translate, and export.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={item}
              className="group p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.035] transition-all cursor-default"
            >
              <div className={`inline-flex p-2.5 rounded-xl ring-1 mb-5 ${accentMap[f.accent]}`}>
                <f.icon className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-[15px] font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-[13px] text-white/40 leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="relative z-10 border-t border-white/[0.05] py-28">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-medium text-white/40 mb-4 uppercase tracking-widest">
              How it works
            </div>
            <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-bold tracking-[-0.025em] text-white">
              Three steps to perfect subtitles.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-8 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px bg-gradient-to-r from-transparent via-indigo-500/25 to-transparent" />
            {[
              { n: "01", title: "Upload", desc: "Drag and drop any video or audio file. MP4, MOV, MP3, WAV — all supported." },
              { n: "02", title: "Transcribe", desc: "Choose your AI provider. Get a precise transcript with speaker labels in seconds." },
              { n: "03", title: "Edit & Export", desc: "Fine-tune in the timeline editor, translate, then export or burn in." },
            ].map((step) => (
              <div key={step.n} className="relative flex flex-col items-center text-center p-8 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-5">
                  <span className="text-[13px] font-bold text-indigo-400 font-mono">{step.n}</span>
                </div>
                <h3 className="text-[16px] font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-[13px] text-white/40 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 py-28 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="w-14 h-14 mx-auto mb-7 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
            <Wand2 className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-[clamp(2rem,5vw,3rem)] font-bold tracking-[-0.025em] text-white mb-4">
            Start subtitling today.
          </h2>
          <p className="text-white/40 text-[16px] mb-8 leading-relaxed">
            Free to get started. No credit card required.
          </p>
          {isSignedIn ? (
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[15px] transition-all shadow-xl shadow-indigo-500/25 hover:-translate-y-0.5">
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <SignUpButton mode="modal">
              <button className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[15px] transition-all shadow-xl shadow-indigo-500/25 hover:-translate-y-0.5">
                Get started free <ArrowRight className="w-4 h-4" />
              </button>
            </SignUpButton>
          )}
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-white/[0.05] py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <PlayCircle className="w-3 h-3 text-white" />
            </div>
            <span className="text-[13px] font-semibold text-white/40">SubtitleAI</span>
          </div>
          <p className="text-[12px] text-white/20">© {new Date().getFullYear()} SubtitleAI. All rights reserved.</p>
          <div className="flex items-center gap-5 text-[12px] text-white/30">
            <Link href="#" className="hover:text-white/60 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white/60 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white/60 transition-colors">GitHub</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
