"use client";

import Link from "next/link";
import { Calendar, BarChart3, ShieldCheck, ScanLine, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <main className="flex flex-col flex-1 bg-[#F8F9FB]">
      <SiteNav />
      <Hero />
      <FeatureStrip />
      <Footer />
    </main>
  );
}

function SiteNav() {
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100"
    >
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <Logo sublabel="" />
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
          <a href="#about" className="hover:text-indigo-600 transition-colors">About</a>
          <a href="#help" className="hover:text-indigo-600 transition-colors">Help</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-slate-600 hover:bg-slate-100 font-bold">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white border-none rounded-full px-6 py-5 font-bold shadow-md">
              Sign up
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

function Hero() {
  return (
    <section className="relative isolate min-h-[calc(100vh-64px)] flex items-center overflow-hidden text-white">
      {/* Full-bleed campus background — `isolate` keeps z-stacking inside the section */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/bghero.jpg"
          alt="University campus"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        {/* Even tint — campus visible across the whole hero */}
        <div className="absolute inset-0 bg-ink-900/40" />
        {/* Subtle vignette so corners feel finished */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(15,23,42,0.5)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 lg:py-20 grid lg:grid-cols-12 gap-10 lg:gap-12 items-center w-full">
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-3 py-1 text-xs font-medium ring-1 ring-white/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              W3C verifiable credentials
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
              Your academic identity,
              <br />
              <span className="bg-gradient-to-r from-amber-300 to-pink-300 bg-clip-text text-transparent">
                verified.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base sm:text-lg text-white/85 leading-relaxed">
              Access your timetable, scorecard, and student records with secure
              QR-based authentication. No passwords, no hassle.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-brand-700 hover:bg-white/90 hover:text-brand-800 shadow-lg">
                  Sign up <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white/30 hover:bg-white/10 hover:border-white/50">
                  Log in
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <IdCard />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function IdCard() {
  return (
    <div className="relative w-[260px] sm:w-[280px] bg-white rounded-2xl shadow-[0_24px_50px_-16px_rgba(0,0,0,0.45)] overflow-hidden ring-1 ring-white/20">
      <div className="p-5 flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-brand-600 rounded-md" />
            <span className="text-xs font-semibold text-ink-900">StudentPortal</span>
          </div>
          <span className="text-[9px] font-semibold tracking-widest text-ink-400 uppercase">Student ID</span>
        </div>

        <div className="mb-3">
          <div className="h-20 w-20 rounded-full overflow-hidden ring-4 ring-ink-50 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80"
              alt="Profile"
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "https://i.pravatar.cc/200?u=studentportal-jane";
              }}
            />
          </div>
        </div>

        <h3 className="text-base font-semibold text-ink-900">Jane Doe</h3>
        <p className="text-xs text-ink-500 mb-4">Computer Science, B.S.</p>

        <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-ink-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/bghero.jpg"
            alt="Campus"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="w-full pt-3 border-t border-ink-100 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[9px] font-semibold text-ink-400 uppercase tracking-wider">Credential ID</span>
            <span className="text-[11px] font-mono text-ink-700">2024-CS-8412</span>
          </div>
          <div className="h-8 w-8 bg-brand-50 text-brand-600 rounded-lg flex items-center justify-center">
            <ScanLine className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureStrip() {
  const features = [
    {
      icon: Calendar,
      title: "Smart Timetable",
      body: "View your weekly schedule organized by course, with rooms and lab assignments updated in real time.",
      delay: 0.1,
    },
    {
      icon: BarChart3,
      title: "Live Scorecard",
      body: "Track grades semester by semester with visual breakdowns and class-average comparisons.",
      delay: 0.2,
    },
    {
      icon: ShieldCheck,
      title: "Verified Identity",
      body: "Cryptographically signed credentials. Scannable anywhere — from libraries to employers.",
      delay: 0.3,
    },
  ];

  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: f.delay }}
            className="rounded-card bg-white border border-ink-200/70 p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="h-10 w-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-ink-900 mb-1.5">{f.title}</h3>
            <p className="text-sm text-ink-600 leading-relaxed">{f.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mt-auto border-t border-ink-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <Logo />
          <p className="mt-3 text-xs text-ink-500 max-w-[220px] leading-relaxed">
            © 2026 StudentPortal. All rights reserved.
          </p>
        </div>
        <FooterCol title="Product" links={["Features", "Pricing", "Integrations"]} />
        <FooterCol title="Resources" links={["Documentation", "Guides", "Blog"]} />
        <FooterCol title="Company" links={["About", "Contact", "Legal"]} />
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-ink-500">{title}</div>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l}>
            <a className="text-ink-700 hover:text-brand-700 transition-colors text-sm" href="#">{l}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
