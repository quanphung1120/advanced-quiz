// features/landing-page/components/how-it-works-section.tsx

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Create your flashcards",
      description:
        "Build your deck with questions and answers. Add images, code snippets, or rich text to make your cards more effective.",
    },
    {
      number: "02",
      title: "Study with spaced repetition",
      description:
        "Our algorithm presents cards at optimal intervals based on how well you know each one. Easy cards appear less often, difficult ones more frequently.",
    },
    {
      number: "03",
      title: "Track your mastery",
      description:
        "Watch your progress grow as you master each card. See detailed analytics on your retention rates and study patterns.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-block text-sm font-medium uppercase tracking-widest text-primary">
            How it works
          </span>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, yet powerful
          </h2>
          <p className="text-lg text-muted-foreground">
            Get started in minutes and build a learning habit that lasts.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="absolute left-1/2 top-16 hidden h-[calc(100%-8rem)] w-px -translate-x-1/2 bg-border lg:block" />

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
                    className={`inline-block ${
                      index % 2 === 0 ? "lg:ml-auto" : ""
                    }`}
                  >
                    <span className="mb-2 block font-mono text-4xl font-bold text-primary/20">
                      {step.number}
                    </span>
                    <h3 className="mb-3 text-xl font-semibold">{step.title}</h3>
                    <p className="max-w-md text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Center Circle */}
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-4 border-background bg-primary shadow-lg">
                  <span className="text-lg font-bold text-primary-foreground">
                    {index + 1}
                  </span>
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
