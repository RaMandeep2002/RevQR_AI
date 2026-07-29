"use client";

import { tourSteps } from "@/lib/tour-steps";
import { NextStep, NextStepProvider } from "nextstepjs";

export default function TourProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextStepProvider>
      <NextStep
        steps={tourSteps}
        shadowRgb="99,102,241"
        shadowOpacity="0.6"
        onStart={(tourName) => console.log(`Tour started: ${tourName}`)}
        onComplete={(tourName) => {
          console.log(`Tour completed: ${tourName}`);
          localStorage.setItem(`${tourName}`, "true");
        }}
        onSkip={(step, tourName) => {
          console.log(`Tour skipped at step ${step} in ${tourName}`);
          localStorage.setItem(`${tourName}`, "true");
        }}
      >
        {children}
      </NextStep>
    </NextStepProvider>
  );
}
