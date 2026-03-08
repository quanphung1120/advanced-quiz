import { Link } from "react-router";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  Layers3,
  Orbit,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { AdvancedImage } from "@cloudinary/react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cloudinary } from "@/lib/cloudinary";
import {
  TabsRoot,
  TabsList,
  TabsTab,
  TabsIndicator,
  TabsPanel,
} from "@/components/ui/tabs";
import {
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipPortal,
  TooltipPositioner,
  TooltipPopup,
} from "@/components/ui/tooltip";

/* ─── Scroll-triggered fade-up ────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ─── Hero 3D Visual ──────────────────────────────────────────────────── */

const heroImage = cloudinary.image("hero-visual-new_qkd2sj");

function HeroVisual() {
  return (
    <div className="relative flex items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex items-center justify-center"
      >
        {/* Subtle highlight line at the bottom-left floating near the object */}
        <div className="absolute -bottom-10 -left-10 h-32 w-[1px] bg-primary/20" />
        <div className="absolute -bottom-10 -left-10 h-[1px] w-32 bg-primary/20" />

        <AdvancedImage
          cldImg={heroImage}
          alt="Abstract 3D Knowledge Visualization"
          className="relative z-10 block w-full max-w-[550px] object-contain"
          style={{ filter: "drop-shadow(0 0 80px rgba(217, 255, 0, 0.1))" }}
        />
      </motion.div>

      {/* Very subtle background glow to ground the object */}
      <div
        className="pointer-events-none absolute -z-10 h-[150%] w-[150%] rounded-full opacity-5 blur-[140px]"
        style={{
          background:
            "radial-gradient(circle, var(--primary) 0%, transparent 75%)",
        }}
      />
    </div>
  );
}

/* ─── Feature Card ────────────────────────────────────────────────────── */

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  tooltip?: string;
};

function FeatureCard({ icon, title, description, tooltip }: FeatureCardProps) {
  const card = (
    <motion.div
      variants={fadeUp}
      className="group flex h-full flex-col rounded-sm border border-border bg-transparent p-6 transition-all duration-200 hover:border-primary/40 hover:shadow-[0_0_32px_rgba(217,255,0,0.1)]"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/15">
        <div className="text-primary">{icon}</div>
      </div>
      <p className="mt-4 font-display text-base font-semibold tracking-tight text-foreground">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </motion.div>
  );

  if (!tooltip) return card;

  return (
    <TooltipRoot>
      <TooltipTrigger className="text-left" render={<div />}>
        {card}
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipPositioner>
          <TooltipPopup>{tooltip}</TooltipPopup>
        </TooltipPositioner>
      </TooltipPortal>
    </TooltipRoot>
  );
}

/* ─── Stat ────────────────────────────────────────────────────────────── */

function Stat({
  value,
  label,
  progress,
}: {
  value: string;
  label: string;
  progress?: number;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-xl border border-border bg-transparent p-6"
    >
      <p className="font-display text-4xl font-medium tracking-tight text-primary">
        {value}
      </p>
      <p className="mt-2 text-sm leading-5 text-muted-foreground">{label}</p>
      {progress !== undefined && (
        <div
          className="mt-4 h-1 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-primary shadow-[0_0_8px_oklch(0.52_0.26_258_/_0.6)] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </motion.div>
  );
}

/* ─── Testimonial ─────────────────────────────────────────────────────── */

function Testimonial({
  quote,
  name,
  role,
}: {
  quote: string;
  name: string;
  role: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-xl border border-border bg-transparent p-6"
    >
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            className="h-3.5 w-3.5 fill-primary text-primary"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <p className="text-sm leading-7 text-foreground">&ldquo;{quote}&rdquo;</p>
      <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 text-xs font-bold text-primary">
          {name[0]}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Pricing Plan ────────────────────────────────────────────────────── */

type PricingPlanProps = {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  billingCycle: "monthly" | "annual";
  description: string;
  features: string[];
  highlighted?: boolean;
  ctaLabel: string;
  ctaTo: string;
};

function PricingPlan({
  name,
  monthlyPrice,
  annualPrice,
  billingCycle,
  description,
  features,
  highlighted = false,
  ctaLabel,
  ctaTo,
}: PricingPlanProps) {
  const price = billingCycle === "annual" ? annualPrice : monthlyPrice;

  return (
    <motion.div
      variants={fadeUp}
      className={[
        "relative rounded-xl border p-8 transition-all duration-200",
        highlighted
          ? "border-primary/60 bg-primary/5 shadow-[0_0_60px_rgba(217,255,0,0.05)]"
          : "border-border bg-transparent hover:border-border/80",
      ].join(" ")}
    >
      {highlighted && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-md border border-primary/50 bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground tracking-tight">
          Most popular
        </span>
      )}
      <p className="font-display text-lg font-medium tracking-tight text-foreground">
        {name}
      </p>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="font-display text-5xl font-bold tracking-tight text-foreground">
          ${price}
        </span>
        <span className="text-sm text-muted-foreground">
          / {billingCycle === "annual" ? "mo, billed annually" : "month"}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      <ul className="mt-6 space-y-3">
        {features.map((f) => (
          <li
            key={f}
            className="flex items-start gap-3 text-sm text-foreground"
          >
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-md bg-primary/20">
              <Check className="h-3 w-3 text-primary" />
            </span>
            {f}
          </li>
        ))}
      </ul>
      <Link to={ctaTo} className="mt-8 block">
        <Button
          variant={highlighted ? "primary" : "outline"}
          size="lg"
          className="w-full justify-center"
        >
          {ctaLabel}
        </Button>
      </Link>
    </motion.div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────── */

export function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <TooltipProvider>
      <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
        {/* Subtle accent glow at top only */}
        <div className="pointer-events-none fixed inset-x-0 top-0 h-[40vh] bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,oklch(0.88_0.28_111_/_0.06),transparent)]" />

        {/* ── NAV ── */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/40 bg-background/80 px-5 py-4 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <span className="font-display text-base font-semibold tracking-tight text-foreground">
              Advanced Quiz
            </span>
          </div>

          <nav className="hidden items-center gap-1 sm:flex">
            <a
              href="#features"
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to={isAuthenticated ? "/dashboard" : "/sign-in"}>
              <Button variant="ghost" size="sm">
                {isAuthenticated ? "Dashboard" : "Sign in"}
              </Button>
            </Link>
            {!isAuthenticated && (
              <Link to="/sign-up">
                <Button size="sm">Get started</Button>
              </Link>
            )}
          </div>
        </header>

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          {/* ── HERO ── */}
          <section className="grid min-h-[92vh] items-center gap-16 py-20 lg:grid-cols-[1.2fr_1fr]">
            <motion.div
              className="flex flex-col justify-center space-y-10"
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <div className="space-y-6">
                <motion.h1
                  variants={fadeUp}
                  className="font-display text-7xl font-medium leading-[0.95] tracking-[-0.04em] text-foreground sm:text-8xl xl:text-[6.5rem]"
                >
                  Master Your
                  <br />
                  <span className="text-primary">Knowledge.</span>
                </motion.h1>

                <motion.p
                  variants={fadeUp}
                  className="max-w-md text-lg leading-relaxed text-muted-foreground/80"
                >
                  Advanced Quiz gives you a structured, distraction-free study
                  workspace — collections, flashcards, and SRS review baked into
                  one fast interface.
                </motion.p>
              </div>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
                <Link to={isAuthenticated ? "/dashboard" : "/sign-up"}>
                  <Button
                    size="xl"
                    className="h-14 rounded-none bg-primary px-10 text-sm font-medium tracking-widest text-primary-foreground hover:bg-primary/90"
                  >
                    {isAuthenticated ? "ENTER WORKSPACE" : "START FOR FREE"}
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button
                    variant="outline"
                    size="xl"
                    className="h-14 rounded-none border-border px-10 text-sm font-medium tracking-widest text-foreground hover:bg-accent"
                  >
                    PREVIEW DASHBOARD
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="flex items-center gap-6 text-[11px] font-medium tracking-widest text-muted-foreground/60 uppercase"
              >
                <span className="flex items-center gap-2">
                  <div className="h-1 w-1 bg-primary/50" />
                  No credit card required
                </span>
                <span className="flex items-center gap-2">
                  <div className="h-1 w-1 bg-primary/50" />
                  Free plan forever
                </span>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.3,
                ease: [0.22, 1, 0.36, 1] as const,
              }}
            >
              <HeroVisual />
            </motion.div>
          </section>

          {/* ── FEATURES ── */}
          <section id="features" className="py-24">
            <motion.div
              className="grid gap-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
            >
              <motion.p
                variants={fadeUp}
                className="text-xs font-semibold uppercase tracking-[0.3em] text-primary"
              >
                Features
              </motion.p>
              <motion.h2
                variants={fadeUp}
                className="mt-3 font-display text-4xl font-semibold leading-tight tracking-[-0.03em] text-foreground sm:text-5xl"
              >
                Everything you need to study smarter
              </motion.h2>
            </motion.div>

            <motion.div
              className="mt-12 grid h-full gap-4 sm:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
            >
              <FeatureCard
                icon={<Layers3 className="h-5 w-5" />}
                title="Organised collections"
                description="Group cards by subject, topic, or chapter. Share with collaborators and keep everything version-tracked."
                tooltip="Each collection gets its own review schedule and progress tracking."
              />
              <FeatureCard
                icon={<Brain className="h-5 w-5" />}
                title="Spaced repetition"
                description="Our SRS algorithm schedules cards at the optimal moment before they would have been forgotten."
                tooltip="Based on SM-2 with adaptive difficulty tuning."
              />
              <FeatureCard
                icon={<Zap className="h-5 w-5" />}
                title="Rapid review mode"
                description="Flip through your deck fast when you just want a quick pass before an exam or a meeting."
              />
              <FeatureCard
                icon={<Users className="h-5 w-5" />}
                title="Collaboration"
                description="Invite teammates or study partners to a shared collection. Each member tracks their own progress independently."
              />
              <FeatureCard
                icon={<BookOpen className="h-5 w-5" />}
                title="Study analytics"
                description="See your retention rate, due card counts, and daily streak so you always know how you're doing."
              />
              <FeatureCard
                icon={<Orbit className="h-5 w-5" />}
                title="Any device"
                description="A responsive, keyboard-accessible interface that works on desktop, tablet, and mobile out of the box."
              />
            </motion.div>
          </section>

          {/* ── STATS ── */}
          <section className="py-16">
            <motion.div
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
            >
              <Stat
                value="94%"
                label="Average retention after 7 days"
                progress={94}
              />
              <Stat
                value="3×"
                label="Faster memorisation vs passive re-reading"
              />
              <Stat
                value="50k+"
                label="Flashcards reviewed this month"
                progress={72}
              />
              <Stat value="12 min" label="Average daily study session" />
            </motion.div>
          </section>

          {/* ── TESTIMONIALS ── */}
          <section className="py-16">
            <motion.div
              className="mb-12 max-w-xl"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
            >
              <motion.p
                variants={fadeUp}
                className="text-xs font-semibold uppercase tracking-[0.3em] text-primary"
              >
                What people say
              </motion.p>
              <motion.h2
                variants={fadeUp}
                className="mt-3 font-display text-4xl font-bold leading-tight tracking-[-0.03em] text-foreground"
              >
                Trusted by serious learners
              </motion.h2>
            </motion.div>
            <motion.div
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
            >
              <Testimonial
                quote="I moved my entire med school deck here. The SRS is genuinely the most reliable I've used — cards show up right when I'm about to forget them."
                name="Amara L."
                role="Medical student"
              />
              <Testimonial
                quote="The collection sharing feature alone makes it worth it. My study group all review the same deck but our progress is completely separate."
                name="Tobias M."
                role="Bar exam candidate"
              />
              <Testimonial
                quote="Finally a flashcard app that doesn't look like a toy. The interface is clean, dark, and doesn't get in the way of actually studying."
                name="Priya S."
                role="Software engineer"
              />
            </motion.div>
          </section>

          {/* ── PRICING ── */}
          <section id="pricing" className="py-24">
            <motion.div
              className="mb-14 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
            >
              <motion.p
                variants={fadeUp}
                className="text-xs font-semibold uppercase tracking-[0.3em] text-primary"
              >
                Pricing
              </motion.p>
              <motion.h2
                variants={fadeUp}
                className="mt-3 font-display text-4xl font-bold leading-tight tracking-[-0.03em] text-foreground sm:text-5xl"
              >
                Simple, transparent plans
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-4 text-muted-foreground"
              >
                Choose the plan that matches your scale. No hidden fees.
              </motion.p>
            </motion.div>

            <TabsRoot
              defaultValue="monthly"
              className="flex flex-col items-center gap-10"
            >
              <TabsList>
                <TabsIndicator />
                <TabsTab value="monthly">Monthly</TabsTab>
                <TabsTab value="annual">Annual · save 30%</TabsTab>
              </TabsList>

              <TabsPanel value="monthly" className="w-full">
                <motion.div
                  className="grid gap-6 lg:grid-cols-3"
                  initial="hidden"
                  animate="visible"
                  variants={stagger}
                >
                  <PricingPlan
                    name="Starter"
                    monthlyPrice={0}
                    annualPrice={0}
                    billingCycle="monthly"
                    description="Everything you need to get started and build a study habit."
                    features={[
                      "Up to 3 collections",
                      "300 flashcards total",
                      "Basic review mode",
                      "Community support",
                    ]}
                    ctaLabel="Get started free"
                    ctaTo="/sign-up"
                  />
                  <PricingPlan
                    name="Pro"
                    monthlyPrice={9}
                    annualPrice={9}
                    billingCycle="monthly"
                    description="For learners who need unlimited space and advanced review."
                    features={[
                      "Unlimited collections",
                      "Unlimited flashcards",
                      "Full SRS algorithm",
                      "Collaboration (up to 5)",
                      "Analytics dashboard",
                      "Priority support",
                    ]}
                    highlighted
                    ctaLabel="Start free trial"
                    ctaTo="/sign-up"
                  />
                  <PricingPlan
                    name="Team"
                    monthlyPrice={24}
                    annualPrice={24}
                    billingCycle="monthly"
                    description="For study groups, bootcamps, and institutions."
                    features={[
                      "Everything in Pro",
                      "Unlimited collaborators",
                      "Admin dashboard",
                      "SSO / SAML",
                      "Custom branding",
                      "Dedicated support",
                    ]}
                    ctaLabel="Contact sales"
                    ctaTo="/sign-up"
                  />
                </motion.div>
              </TabsPanel>

              <TabsPanel value="annual" className="w-full">
                <motion.div
                  className="grid gap-6 lg:grid-cols-3"
                  initial="hidden"
                  animate="visible"
                  variants={stagger}
                >
                  <PricingPlan
                    name="Starter"
                    monthlyPrice={0}
                    annualPrice={0}
                    billingCycle="annual"
                    description="Everything you need to get started and build a study habit."
                    features={[
                      "Up to 3 collections",
                      "300 flashcards total",
                      "Basic review mode",
                      "Community support",
                    ]}
                    ctaLabel="Get started free"
                    ctaTo="/sign-up"
                  />
                  <PricingPlan
                    name="Pro"
                    monthlyPrice={9}
                    annualPrice={6}
                    billingCycle="annual"
                    description="For learners who need unlimited space and advanced review."
                    features={[
                      "Unlimited collections",
                      "Unlimited flashcards",
                      "Full SRS algorithm",
                      "Collaboration (up to 5)",
                      "Analytics dashboard",
                      "Priority support",
                    ]}
                    highlighted
                    ctaLabel="Start free trial"
                    ctaTo="/sign-up"
                  />
                  <PricingPlan
                    name="Team"
                    monthlyPrice={24}
                    annualPrice={17}
                    billingCycle="annual"
                    description="For study groups, bootcamps, and institutions."
                    features={[
                      "Everything in Pro",
                      "Unlimited collaborators",
                      "Admin dashboard",
                      "SSO / SAML",
                      "Custom branding",
                      "Dedicated support",
                    ]}
                    ctaLabel="Contact sales"
                    ctaTo="/sign-up"
                  />
                </motion.div>
              </TabsPanel>
            </TabsRoot>
          </section>

          {/* ── CTA BANNER ── */}
          <section className="py-16">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="relative overflow-hidden rounded-xl border border-primary/30 bg-transparent p-12 text-center sm:p-16"
            >
              {/* Beam scan */}
              <div
                className="pointer-events-none absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
                style={{ animation: "beam-scan 4s ease-in-out infinite 2s" }}
              />
              <div className="relative space-y-6">
                <h2 className="font-display text-5xl font-bold leading-tight tracking-[-0.03em] text-foreground sm:text-6xl">
                  Ready to study smarter?
                </h2>
                <p className="mx-auto max-w-lg text-lg text-muted-foreground">
                  Join thousands of learners who use Advanced Quiz to build
                  lasting knowledge — not just short-term recall.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link to="/sign-up">
                    <Button size="lg" className="gap-2">
                      Create your free account
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  {isAuthenticated && (
                    <Link to="/dashboard">
                      <Button variant="outline" size="lg">
                        Open dashboard
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </section>

          {/* ── FOOTER ── */}
          <footer className="flex flex-col items-center justify-between gap-4 border-t border-border py-10 text-sm text-muted-foreground sm:flex-row">
            <div className="flex items-center gap-2.5">
              <span className="font-semibold text-foreground">
                Advanced Quiz
              </span>
            </div>
            <p>
              © {new Date().getFullYear()} Advanced Quiz. All rights reserved.
            </p>
            <div className="flex gap-5">
              <a
                href="#features"
                className="transition-colors hover:text-foreground"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="transition-colors hover:text-foreground"
              >
                Pricing
              </a>
              <Link
                to="/sign-in"
                className="transition-colors hover:text-foreground"
              >
                Sign in
              </Link>
            </div>
          </footer>
        </div>
      </div>
    </TooltipProvider>
  );
}
