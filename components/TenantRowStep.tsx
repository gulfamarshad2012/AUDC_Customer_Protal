import type { ButtonProps } from "@heroui/react";
import type { ComponentProps } from "react";

import { cn } from "@heroui/react";
import { useControlledState } from "@react-stately/utils";
import { LazyMotion, domAnimation, m } from "framer-motion";
import React from "react";

export type RowStepProps = {
  title?: React.ReactNode;
  className?: string;
};

export interface RowStepsProps extends React.HTMLAttributes<HTMLButtonElement> {
  steps?: RowStepProps[];
  color?: ButtonProps["color"];
  currentStep?: number;
  defaultStep?: number;
  hideProgressBars?: boolean;
  className?: string;
  stepClassName?: string;
  onStepChange?: (stepIndex: number) => void;
  disableFutureSteps?: boolean;
}

function CheckIcon(props: ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <m.path
        animate={{ pathLength: 1 }}
        d="M5 13l4 4L19 7"
        initial={{ pathLength: 0 }}
        strokeLinecap="round"
        strokeLinejoin="round"
        transition={{
          delay: 0.2,
          duration: 0.3,
          ease: "easeOut",
          type: "tween",
        }}
      />
    </svg>
  );
}

const RowSteps = React.forwardRef<HTMLButtonElement, RowStepsProps>(
  (
    {
      className,
      color = "primary",
      currentStep: currentStepProp,
      defaultStep = 0,
      hideProgressBars = false,
      onStepChange,
      stepClassName,
      steps = [],
      disableFutureSteps = false,
      ...props
    },
    ref
  ) => {
    const [currentStep, setCurrentStep] = useControlledState(
      currentStepProp,
      defaultStep,
      onStepChange
    );

    const colors = React.useMemo(() => {
      let userColor;
      let fgColor;

      const colorsVars = [
        "[--active-fg-color:var(--step-fg-color)]",
        "[--active-border-color:var(--step-color)]",
        "[--active-color:var(--step-color)]",
        "[--complete-background-color:var(--step-color)]",
        "[--complete-border-color:var(--step-color)]",
        "[--inactive-border-color:hsl(var(--heroui-default-300))]",
        "[--inactive-color:hsl(var(--heroui-default-300))]",
      ];

      switch (color) {
        case "primary":
          userColor = "[--step-color:hsl(var(--heroui-primary))]";
          fgColor = "[--step-fg-color:hsl(var(--heroui-primary-foreground))]";
          break;
        case "secondary":
          userColor = "[--step-color:hsl(var(--heroui-secondary))]";
          fgColor = "[--step-fg-color:hsl(var(--heroui-secondary-foreground))]";
          break;
        case "success":
          userColor = "[--step-color:hsl(var(--heroui-success))]";
          fgColor = "[--step-fg-color:hsl(var(--heroui-success-foreground))]";
          break;
        case "warning":
          userColor = "[--step-color:hsl(var(--heroui-warning))]";
          fgColor = "[--step-fg-color:hsl(var(--heroui-warning-foreground))]";
          break;
        case "danger":
          userColor = "[--step-color:hsl(var(--heroui-error))]";
          fgColor = "[--step-fg-color:hsl(var(--heroui-error-foreground))]";
          break;
        case "default":
          userColor = "[--step-color:hsl(var(--heroui-default))]";
          fgColor = "[--step-fg-color:hsl(var(--heroui-default-foreground))]";
          break;
        default:
          userColor = "[--step-color:hsl(var(--heroui-primary))]";
          fgColor = "[--step-fg-color:hsl(var(--heroui-primary-foreground))]";
          break;
      }

      if (!className?.includes("--step-fg-color")) colorsVars.unshift(fgColor);
      if (!className?.includes("--step-color")) colorsVars.unshift(userColor);
      if (!className?.includes("--inactive-bar-color"))
        colorsVars.push(
          "[--inactive-bar-color:hsl(var(--heroui-default-300))]"
        );

      return colorsVars;
    }, [color, className]);

    return (
      <nav
        aria-label="Progress"
        className="-my-4 max-w-fit mx-auto overflow-x-auto py-4"
      >
        <ol
          className={cn("flex flex-row flex-nowrap gap-x-3", colors, className)}
        >
          {steps?.map((step, stepIdx) => {
            const status =
              currentStep === stepIdx
                ? "active"
                : currentStep < stepIdx
                  ? "inactive"
                  : "complete";
            const isDisabled = disableFutureSteps && stepIdx > currentStep;

            return (
              <li
                key={stepIdx}
                className="relative flex w-full items-center pr-12"
              >
                <button
                  key={stepIdx}
                  ref={ref}
                  aria-current={status === "active" ? "step" : undefined}
                  className={cn(
                    "rounded-large cursor-not-allowed group flex w-[220px] flex-row items-center justify-center gap-x-3 py-2.5",
                    {
                      "opacity-50": isDisabled,
                    },
                    stepClassName
                  )}
                >
                  <div className="h-ful relative flex items-center">
                    <LazyMotion features={domAnimation}>
                      <m.div animate={status} className="relative">
                        <m.div
                          initial={false}
                          transition={{ duration: 0.25 }}
                          className={cn(
                            " border-medium text-large text-default-foreground relative flex h-[35px] w-[35px] items-center justify-center rounded-full font-semibold",
                            {
                              "shadow-lg": status === "complete",
                            }
                          )}
                          variants={{
                            active: {
                              backgroundColor: "transparent",
                              borderColor: "var(--active-border-color)",
                              color: "var(--active-color)",
                            },
                            complete: {
                              backgroundColor:
                                "var(--primary)",
                              borderColor: "var(--primary)",
                            },
                            inactive: {
                              backgroundColor: "transparent",
                              borderColor: "var(--inactive-border-color)",
                              color: "var(--inactive-color)",
                            },
                          }}
                        >
                          <div className="flex items-center justify-center">
                            {status === "complete" ? (
                              <CheckIcon className="h-6 w-6 text-(--active-fg-color)" />
                            ) : (
                              <span>{stepIdx + 1}</span>
                            )}
                          </div>
                        </m.div>
                      </m.div>
                    </LazyMotion>
                  </div>
                  <div className="max-w-full text-start">
                    <div
                      className={cn(
                        "text-small text-default-foreground lg:text-medium font-medium transition-[color,opacity] duration-300 group-active:opacity-80",
                        {
                          "text-default-500": status === "inactive",
                        }
                      )}
                    >
                      {step.title}
                    </div>
                  </div>
                  {stepIdx < steps.length - 1 && !hideProgressBars && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute right-0 w-10 flex-none items-center"
                      style={{
                        // @ts-ignore
                        "--idx": stepIdx,
                      }}
                    >
                      <div
                        className={cn(
                          "relative h-0.5 w-full bg-(--inactive-bar-color) transition-colors duration-300",
                          "after:absolute after:block after:h-full after:w-0 after:bg-primary after:transition-[width] after:duration-300 after:content-['']",
                          {
                            "after:w-full": stepIdx < currentStep,
                          }
                        )}
                      />
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }
);

RowSteps.displayName = "RowSteps";

export default RowSteps;
