"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { SignInButton, SignUpButton, SignOutButton, useUser } from "@clerk/nextjs";
import {
  Wand2,
  Globe2,
  Zap,
  PlayCircle,
  ChevronRight,
  Mic,
  FileVideo,
  Layers,
  ArrowRight,
  Star,
} from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "AI Transcription",
    description: "Powered by Whisper, Deepgram & AssemblyAI with 98%+ accuracy across 90+ languages.",
    color: "from-violet-500/20 to-indigo-500/20",
    border: "border-violet-500/20",
  },
  {
    icon: Layers,
    title: "Timeline Editor",
    description: "Professional subtitle editor with drag-to-resize, split, merge and keyboard shortcuts.",
    color: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/20",
  },
  {
    icon: Globe2,
    title: "AI Translation",
    description: "Translate subtitles into 30+ languages instantly using GPT-4. Preserve tone and context.",
    color: "from-emerald-500/20 to-teal-500/20",
    border: "border-emerald-500/20",
  },
  {
    icon: Wand2,
    title: "AI Tools",
    description: "Generate summaries, chapter markers, keywords, hashtags and YouTube descriptions.",
    color: "from-pink-500/20 to-rose-500/20",
    border: "border-pink-500/20",
  },
  {
    icon: FileVideo,
    title: "Burn & Export",
    description: "Export SRT, VTT, ASS, JSON or burn subtitles directly into your video with FFmpeg.",
    color: "from-orange-500/20 to-amber-500/20",
    border: "border-orange-500/20",
  },
  {
    icon: Zap,
    title: "Realtime Sync",
    description: "Subtitles sync live with your video player. Edit while watching, never lose your place.",
    color: "from-yellow-500/20 to-lime-500/20",
    border: "border-yellow-500/20",
  },
];

const stats = [
  { value: "98%", label: "Accuracy" },
  { value: "90+", label: "Languages" },
  { value: "< 2min", label: "Avg. Turnaround" },
  { value: "5 formats", label: "Export Types" },
];

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export function LandingPage() {
  const { isSignedIn } = useUser();

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute top-1/3 -left-40 w-[600px] h-[600px] rounded-full bg-violet-600/8 blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-blue-600/8 blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <PlayCircle className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight">SubtitleAI</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="#docs" className="hover:text-white transition-colors">Docs</Link>
        </div>

        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-indigo-500/25"
              >
                Dashboard →
              </Link>
              <SignOutButton>
                <button className="px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white transition-colors">
                  Sign out
                </button>
              </SignOutButton>
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="px-4 py-2 rounded-lg text-sm text-white/70 hover:text-white transition-colors">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-indigo-500/25">
                  Get started free
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-24 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10 text-sm text-white/70"
        >
          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
          <span>Powered by OpenAI Whisper · Deepgram · AssemblyAI</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6"
        >
          <span className="text-gradient">AI subtitles</span>
          <br />
          <span className="text-white/90">in seconds.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg md:text-xl text-white/55 max-w-2xl leading-relaxed mb-10"
        >
          Upload your video or audio, get accurate subtitles in under 2 minutes.
          Edit in our professional timeline editor, translate to 30+ languages, and export anywhere.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base transition-all hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <SignUpButton mode="modal">
              <button className="group flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base transition-all hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5">
                Start for free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </SignUpButton>
          )}
          <Link
            href="#features"
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl glass border border-white/10 text-white/70 hover:text-white hover:border-white/20 font-medium text-base transition-all"
          >
            See features
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-3xl"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-6 gradient-border">
              <div className="text-3xl font-bold text-gradient">{stat.value}</div>
              <div className="text-sm text-white/50 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 px-6 py-24 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Everything you need.{" "}
            <span className="text-gradient">Nothing you don&apos;t.</span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            A complete subtitle workflow in one platform. Built for speed, designed for professionals.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className={`group relative p-6 rounded-2xl glass gradient-border hover:bg-white/5 transition-all cursor-default border ${feature.border}`}
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center glass-heavy rounded-3xl gradient-border p-16"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center glow-accent float">
            <Wand2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Ready to subtitle smarter?
          </h2>
          <p className="text-white/50 mb-8 text-lg">
            Join thousands of creators and studios using SubtitleAI.
          </p>
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-lg transition-all hover:shadow-xl hover:shadow-indigo-500/30"
            >
              Go to Dashboard <ChevronRight className="w-5 h-5" />
            </Link>
          ) : (
            <SignUpButton mode="modal">
              <button className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-lg transition-all hover:shadow-xl hover:shadow-indigo-500/30">
                Get started — it&apos;s free <ChevronRight className="w-5 h-5" />
              </button>
            </SignUpButton>
          )}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-8 text-center text-sm text-white/30">
        <p>© 2025 SubtitleAI. Built with Next.js, AI, and ☕</p>
      </footer>
    </div>
  );
}
