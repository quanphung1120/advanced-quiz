// features/landing-page/components/how-it-works-section.tsx

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Create your flashcards",
      description:
        "Build your deck with questions and answers. Add images, code snippets, or rich text to make your cards more effective.",
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4v16m8-8H4"
          />
        </svg>
      ),
    },
    {
      number: "02",
      title: "Study with spaced repetition",
      description:
        "Our algorithm presents cards at optimal intervals based on how well you know each one. Easy cards appear less often, difficult ones more frequently.",
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      number: "03",
      title: "Track your mastery",
      description:
        "Watch your progress grow as you master each card. See detailed analytics on your retention rates and study patterns.",
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="relative py-20 sm:py-28">
      {/* Background Decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="container relative mx-auto max-w-6xl px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-block text-sm font-medium uppercase tracking-widest text-primary">
            How it works
          </span>
          <h2 className="font-display mb-4 text-3xl font-normal tracking-tight sm:text-4xl md:text-5xl">
            Simple, yet powerful
          </h2>
          <p className="text-lg text-muted-foreground">
            Get started in minutes and build a learning habit that lasts.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="absolute left-1/2 top-16 hidden h-[calc(100%-8rem)] w-px -translate-x-1/2 bg-linear-to-b from-primary/30 via-primary to-primary/30 lg:block" />

          <div className="space-y-12 lg:space-y-0">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`relative flex flex-col items-center gap-8 lg:flex-row lg:gap-16 ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                } ${index !== 0 ? "lg:mt-24" : ""}`}
              >
                {/* Step Content */}
                <div
                  className={`flex-1 ${
                    index % 2 === 0 ? "lg:text-right" : "lg:text-left"
                  }`}
                >
                  <div
                    className={`inline-block rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:shadow-lg ${
                      index % 2 === 0 ? "lg:ml-auto" : ""
                    }`}
                  >
                    <span className="font-display mb-2 block text-4xl font-normal text-primary/30">
                      {step.number}
                    </span>
                    <h3 className="font-display mb-3 text-xl">{step.title}</h3>
                    <p className="max-w-md text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Center Circle */}
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-4 border-background bg-linear-to-br from-primary to-primary/80 shadow-lg shadow-primary/20 transition-transform duration-300 hover:scale-110">
                  <span className="text-primary-foreground">{step.icon}</span>
                </div>

                {/* Spacer for layout */}
                <div className="hidden flex-1 lg:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
