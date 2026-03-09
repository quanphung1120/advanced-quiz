import { AdvancedImage } from "@cloudinary/react";
import { motion } from "framer-motion";
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
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsRoot,
  TabsTab,
} from "@/components/ui/tabs";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { cloudinary } from "@/lib/cloudinary";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const heroImage = cloudinary.image("hero-visual-new_qkd2sj");

const features = [
  {
    icon: Layers3,
    title: "Collections",
    description:
      "Group cards by subject, topic, or chapter. Share with collaborators and keep everything version-tracked.",
    detail:
      "Each collection gets its own review schedule and progress tracking.",
  },
  {
    icon: Brain,
    title: "Spaced repetition",
    description:
      "Our SRS algorithm schedules cards at the optimal moment before they would have been forgotten.",
    detail: "Based on SM-2 with adaptive difficulty tuning.",
  },
  {
    icon: Zap,
    title: "Rapid review mode",
    description:
      "Flip through your deck fast when you just want a quick pass before an exam or a meeting.",
  },
  {
    icon: Users,
    title: "Collaboration",
    description:
      "Invite teammates or study partners to a shared collection. Each member tracks their own progress independently.",
  },
  {
    icon: BookOpen,
    title: "Study analytics",
    description:
      "See your retention rate, due card counts, and daily streak so you always know how you're doing.",
  },
  {
    icon: Orbit,
    title: "Any device",
    description:
      "A responsive, keyboard-accessible interface that works on desktop, tablet, and mobile out of the box.",
  },
] satisfies Array<{
  icon: LucideIcon;
  title: string;
  description: string;
  detail?: string;
}>;

const testimonials = [
  {
    quote:
      "I moved my entire med school deck here. The SRS is genuinely the most reliable I've used — cards show up right when I'm about to forget them.",
    name: "Amara L.",
    role: "Medical student",
  },
  {
    quote:
      "The collection sharing feature alone makes it worth it. My study group all review the same deck but our progress is completely separate.",
    name: "Tobias M.",
    role: "Bar exam candidate",
  },
  {
    quote:
      "Finally a flashcard app that doesn't look like a toy. The interface is clean, dark, and doesn't get in the way of actually studying.",
    name: "Priya S.",
    role: "Software engineer",
  },
] as const;

type BillingCycle = "monthly" | "annual";

type PricingPlan = {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  features: string[];
  highlighted?: boolean;
  ctaLabel: string;
  ctaTo: string;
};

const pricingPlans: Record<BillingCycle, PricingPlan[]> = {
  monthly: [
    {
      name: "Starter",
      monthlyPrice: 0,
      annualPrice: 0,
      description:
        "Everything you need to get started and build a study habit.",
      features: [
        "Up to 3 collections",
        "300 flashcards total",
        "Basic review mode",
        "Community support",
      ],
      ctaLabel: "Get started free",
      ctaTo: "/sign-up",
    },
    {
      name: "Pro",
      monthlyPrice: 9,
      annualPrice: 9,
      description: "For learners who need unlimited space and advanced review.",
      features: [
        "Unlimited collections",
        "Unlimited flashcards",
        "Full SRS algorithm",
        "Collaboration (up to 5)",
        "Analytics dashboard",
        "Priority support",
      ],
      highlighted: true,
      ctaLabel: "Start free trial",
      ctaTo: "/sign-up",
    },
    {
      name: "Team",
      monthlyPrice: 24,
      annualPrice: 24,
      description: "For study groups, bootcamps, and institutions.",
      features: [
        "Everything in Pro",
        "Unlimited collaborators",
        "Admin dashboard",
        "SSO / SAML",
        "Custom branding",
        "Dedicated support",
      ],
      ctaLabel: "Contact sales",
      ctaTo: "/sign-up",
    },
  ],
  annual: [
    {
      name: "Starter",
      monthlyPrice: 0,
      annualPrice: 0,
      description:
        "Everything you need to get started and build a study habit.",
      features: [
        "Up to 3 collections",
        "300 flashcards total",
        "Basic review mode",
        "Community support",
      ],
      ctaLabel: "Get started free",
      ctaTo: "/sign-up",
    },
    {
      name: "Pro",
      monthlyPrice: 9,
      annualPrice: 6,
      description: "For learners who need unlimited space and advanced review.",
      features: [
        "Unlimited collections",
        "Unlimited flashcards",
        "Full SRS algorithm",
        "Collaboration (up to 5)",
        "Analytics dashboard",
        "Priority support",
      ],
      highlighted: true,
      ctaLabel: "Start free trial",
      ctaTo: "/sign-up",
    },
    {
      name: "Team",
      monthlyPrice: 24,
      annualPrice: 17,
      description: "For study groups, bootcamps, and institutions.",
      features: [
        "Everything in Pro",
        "Unlimited collaborators",
        "Admin dashboard",
        "SSO / SAML",
        "Custom branding",
        "Dedicated support",
      ],
      ctaLabel: "Contact sales",
      ctaTo: "/sign-up",
    },
  ],
};

const primaryButtonClass =
  "h-12 rounded-none border border-primary bg-primary px-6 text-[11px] font-semibold tracking-[0.24em] text-primary-foreground shadow-none transition-colors hover:translate-y-0 hover:bg-primary/90 active:translate-y-0";

const secondaryButtonClass =
  "h-12 rounded-none border border-border bg-background px-6 text-[11px] font-semibold tracking-[0.24em] text-foreground shadow-none transition-colors hover:translate-y-0 hover:bg-accent active:translate-y-0";

const contentCardClass = "min-h-[18rem] p-6 sm:p-7";
const pricingCardClass = "min-h-[34rem] border border-border p-6 sm:p-7";

function SectionIntro({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description?: string;
}) {
  return (
    <motion.div
      className="space-y-5"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={stagger}
    >
      <motion.p
        variants={fadeUp}
        className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground"
      >
        {label}
      </motion.p>
      <motion.h2
        variants={fadeUp}
        className="max-w-xl text-4xl font-semibold leading-none tracking-[-0.06em] text-foreground sm:text-5xl"
      >
        {title}
      </motion.h2>
      {description ? (
        <motion.p
          variants={fadeUp}
          className="max-w-lg text-base leading-7 text-muted-foreground"
        >
          {description}
        </motion.p>
      ) : null}
    </motion.div>
  );
}

function HeroVisual() {
  return (
    <AdvancedImage
      cldImg={heroImage}
      alt="Advanced Quiz hero visual"
      className="mx-auto block w-full max-w-[480px] object-contain"
    />
  );
}

function FeatureCard({
  index,
  title,
  description,
  detail,
  icon: Icon,
}: {
  index: number;
  title: string;
  description: string;
  detail?: string;
  icon: LucideIcon;
}) {
  return (
    <motion.article variants={fadeUp}>
      <Card className={contentCardClass}>
        <CardHeader>
          <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground/80">
            {String(index).padStart(2, "0")}
          </span>
          <span className="flex h-10 w-10 items-center justify-center border border-border text-muted-foreground">
            <Icon className="h-4 w-4" />
          </span>
        </CardHeader>
        <CardContent className="pt-8">
          <h3 className="text-[1.65rem] font-semibold leading-[1.1] tracking-[-0.04em] text-foreground">
            {title}
          </h3>
          <p className="mt-4 text-[15px] leading-7 text-muted-foreground">
            {description}
          </p>
        </CardContent>
        {detail ? (
          <CardFooter>
            <p className="text-[13px] leading-6 text-muted-foreground">{detail}</p>
          </CardFooter>
        ) : null}
      </Card>
    </motion.article>
  );
}

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
    <motion.article variants={fadeUp}>
      <Card className={contentCardClass}>
        <CardHeader className="justify-start">
          <div className="flex gap-1 text-primary">
            {Array.from({ length: 5 }).map((_, index) => (
              <span
                key={index}
                className="h-2.5 w-2.5 border border-primary bg-primary"
              />
            ))}
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          <p className="text-[15px] leading-8 text-foreground">
            &ldquo;{quote}&rdquo;
          </p>
        </CardContent>
        <CardFooter>
          <p className="text-[15px] font-semibold text-foreground">{name}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {role}
          </p>
        </CardFooter>
      </Card>
    </motion.article>
  );
}

function PricingPlanCard({
  billingCycle,
  name,
  monthlyPrice,
  annualPrice,
  description,
  features,
  highlighted = false,
  ctaLabel,
  ctaTo,
}: PricingPlan & { billingCycle: BillingCycle }) {
  const price = billingCycle === "annual" ? annualPrice : monthlyPrice;

  return (
    <motion.article variants={fadeUp}>
      <Card
        className={[pricingCardClass, highlighted ? "bg-accent/40" : ""].join(
          " ",
        )}
      >
        <CardHeader className="border-b border-border pb-7">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              {name}
            </p>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-5xl font-semibold tracking-[-0.08em] text-foreground">
                ${price}
              </span>
              <span className="pb-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                / {billingCycle === "annual" ? "mo billed annually" : "month"}
              </span>
            </div>
          </div>
          {highlighted ? (
            <span className="border border-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
              Most popular
            </span>
          ) : null}
        </CardHeader>
        <CardContent className="pt-7">
          <p className="text-[15px] leading-7 text-muted-foreground">{description}</p>
          <div className="mt-10 border-t border-border pt-8">
            <ul className="space-y-3">
              {features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-[15px] leading-7 text-foreground"
                >
                  <span className="mt-1 flex h-4 w-4 items-center justify-center border border-border">
                    <Check className="h-3 w-3 text-primary" />
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter className="border-t-0 pt-10">
          <Link to={ctaTo} className="block">
            <Button
              variant={highlighted ? "primary" : "outline"}
              size="lg"
              className={
                highlighted
                  ? `w-full justify-center ${primaryButtonClass}`
                  : `w-full justify-center ${secondaryButtonClass}`
              }
            >
              {ctaLabel}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.article>
  );
}

export function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="landing-grid-surface fixed inset-0 -z-10 opacity-70" />

      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-[96rem] items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold uppercase tracking-[0.24em] text-foreground">
              Advanced Quiz
            </span>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to={isAuthenticated ? "/dashboard" : "/sign-in"}>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-none border border-transparent px-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground shadow-none hover:bg-accent"
              >
                {isAuthenticated ? "Dashboard" : "Sign in"}
              </Button>
            </Link>
            {!isAuthenticated ? (
              <Link to="/sign-up">
                <Button size="sm" className={primaryButtonClass}>
                  Get started
                </Button>
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[96rem] px-5 sm:px-8 lg:px-10">
        <div className="border-x border-border">
          <section className="grid gap-12 border-b border-border px-5 py-14 sm:px-8 sm:py-16 lg:grid-cols-12 lg:gap-10 lg:px-10 lg:py-20">
            <motion.div
              className="flex flex-col justify-between lg:col-span-7"
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <div className="max-w-3xl space-y-6">
                <motion.h1
                  variants={fadeUp}
                  className="max-w-3xl text-5xl font-semibold leading-[0.94] tracking-[-0.08em] text-foreground sm:text-6xl xl:text-[5.9rem]"
                >
                  Study with
                  <br />
                  structure.
                  <br />
                  Remember longer.
                </motion.h1>
                <motion.p
                  variants={fadeUp}
                  className="max-w-2xl text-lg leading-8 text-muted-foreground"
                >
                  Advanced Quiz combines collections, flashcards, and spaced
                  repetition in one focused workspace, so every study session
                  stays clear, fast, and worth repeating.
                </motion.p>
              </div>

              <motion.div
                variants={fadeUp}
                className="mt-10 flex flex-wrap gap-3"
              >
                <Link to={isAuthenticated ? "/dashboard" : "/sign-up"}>
                  <Button size="xl" className={primaryButtonClass}>
                    {isAuthenticated ? "ENTER WORKSPACE" : "START FOR FREE"}
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button
                    variant="outline"
                    size="xl"
                    className={secondaryButtonClass}
                  >
                    PREVIEW DASHBOARD
                  </Button>
                </Link>
              </motion.div>

            </motion.div>

            <motion.div
              className="lg:col-span-5"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.55,
                delay: 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <HeroVisual />
            </motion.div>
          </section>

          <section
            id="features"
            className="grid gap-12 border-b border-border px-5 py-14 sm:px-8 sm:py-16 lg:grid-cols-12 lg:gap-10 lg:px-10 lg:py-20"
          >
            <div className="lg:col-span-4">
              <SectionIntro
                label="Features"
                title="Everything you need to study smarter"
              />
            </div>

            <motion.div
              className="grid auto-rows-fr gap-px border border-border bg-border lg:col-span-8 md:grid-cols-2 xl:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={stagger}
            >
              {features.map((feature, index) => (
                <FeatureCard
                  key={feature.title}
                  index={index + 1}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  detail={feature.detail}
                />
              ))}
            </motion.div>
          </section>

          <section className="grid gap-12 border-b border-border px-5 py-14 sm:px-8 sm:py-16 lg:grid-cols-12 lg:gap-10 lg:px-10 lg:py-20">
            <div className="lg:col-span-4">
              <SectionIntro
                label="What people say"
                title="Trusted by serious learners"
              />
            </div>

            <motion.div
              className="grid auto-rows-fr gap-px border border-border bg-border lg:col-span-8 md:grid-cols-2 xl:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={stagger}
            >
              {testimonials.map((testimonial) => (
                <Testimonial
                  key={testimonial.name}
                  quote={testimonial.quote}
                  name={testimonial.name}
                  role={testimonial.role}
                />
              ))}
            </motion.div>
          </section>

          <section
            id="pricing"
            className="border-b border-border px-5 py-14 sm:px-8 sm:py-16 lg:px-10 lg:py-20"
          >
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-4">
                <SectionIntro
                  label="Pricing"
                  title="Simple, transparent plans"
                  description="Choose the plan that matches your scale. No hidden fees."
                />
              </div>

              <TabsRoot
                defaultValue="monthly"
                className="flex flex-col gap-8 lg:col-span-8"
              >
                <div className="flex justify-start lg:justify-end">
                  <TabsList className="border-border">
                    <TabsIndicator className="bg-foreground" />
                    <TabsTab
                      value="monthly"
                      className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground data-[active]:text-foreground hover:text-foreground"
                    >
                      Monthly
                    </TabsTab>
                    <TabsTab
                      value="annual"
                      className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground data-[active]:text-foreground hover:text-foreground"
                    >
                      Annual · save 30%
                    </TabsTab>
                  </TabsList>
                </div>

                {(["monthly", "annual"] as const).map((billingCycle) => (
                  <TabsPanel
                    key={billingCycle}
                    value={billingCycle}
                    className="w-full"
                  >
                    <motion.div
                      className="grid auto-rows-fr gap-6 xl:grid-cols-3"
                      initial="hidden"
                      animate="visible"
                      variants={stagger}
                    >
                      {pricingPlans[billingCycle].map((plan) => (
                        <PricingPlanCard
                          key={`${billingCycle}-${plan.name}`}
                          billingCycle={billingCycle}
                          {...plan}
                        />
                      ))}
                    </motion.div>
                  </TabsPanel>
                ))}
              </TabsRoot>
            </div>
          </section>

          <section className="px-5 py-14 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp}
              className="landing-grid-surface border border-border bg-accent/40 p-8 sm:p-10 lg:p-12"
            >
              <div className="max-w-3xl space-y-6">
                <h2 className="text-4xl font-semibold leading-none tracking-[-0.06em] text-foreground sm:text-5xl">
                  Ready to study smarter?
                </h2>
                <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                  Join thousands of learners who use Advanced Quiz to build
                  lasting knowledge — not just short-term recall.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link to="/sign-up">
                    <Button size="lg" className={primaryButtonClass}>
                      Create your free account
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  {isAuthenticated ? (
                    <Link to="/dashboard">
                      <Button
                        variant="outline"
                        size="lg"
                        className={secondaryButtonClass}
                      >
                        Open dashboard
                      </Button>
                    </Link>
                  ) : null}
                </div>
              </div>
            </motion.div>
          </section>
        </div>

        <footer className="border-x border-t border-border px-5 py-6 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
                Advanced Quiz
              </span>
              <span className="hidden h-4 w-px bg-border sm:block" />
              <p>
                © {new Date().getFullYear()} Advanced Quiz. All rights reserved.
              </p>
            </div>
            <div className="flex flex-wrap gap-5">
              <a
                href="#features"
                className="transition-colors hover:text-foreground"
              >
                Features
              </a>
              <a href="#pricing" className="transition-colors hover:text-foreground">
                Pricing
              </a>
              <Link
                to="/sign-in"
                className="transition-colors hover:text-foreground"
              >
                Sign in
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
