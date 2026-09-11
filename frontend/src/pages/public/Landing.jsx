import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => (
  <div className="min-h-screen bg-slate-950 text-white">
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
      <p className="text-lg font-bold">SponsorMetrics BD</p>
      <div className="flex gap-3">
        <Link to="/login" className="rounded-lg px-4 py-2 text-sm text-slate-200 hover:bg-slate-800">Log in</Link>
        <Link to="/register" className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900">Get started</Link>
      </div>
    </header>
    <main className="mx-auto max-w-6xl px-6 py-20">
      <p className="text-sm uppercase tracking-widest text-amber-400">Bangladesh sponsorship marketplace</p>
      <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
        Treat event sponsorship like a measurable marketing channel.
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-slate-300">
        Organizers publish events and packages. Sponsors discover, negotiate, hold funds in escrow, and only release after proof of delivery.
      </p>
      <div className="mt-10 flex gap-4">
        <Link to="/register" className="rounded-lg bg-amber-500 px-6 py-3 font-semibold text-slate-900">Create an account</Link>
        <Link to="/login" className="rounded-lg border border-slate-700 px-6 py-3">I already have one</Link>
      </div>
      <section className="mt-20 grid gap-6 md:grid-cols-3">
        {[
          ['How it works', 'Build an event, send a proposal, negotiate in-platform, sign, pay, report, get rated.'],
          ['For organizers', 'University clubs, NGOs, and startups get professional proposals without a Word-doc scramble.'],
          ['For sponsors', 'Portfolio, ROI, budget pacing, and escrow so spend is as accountable as a media buy.'],
        ].map(([title, body]) => (
          <article key={title} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-slate-400">{body}</p>
          </article>
        ))}
      </section>
    </main>
  </div>
);

export default Landing;
