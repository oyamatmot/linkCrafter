import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Link as LinkIcon, 
  Search, 
  BarChart2, 
  Settings,
  ChevronRight,
  ChevronLeft
} from "lucide-react";

const tutorialSteps = [
  {
    title: "Welcome to URL Shortener! 👋",
    description: "Let's take a quick tour of the awesome features waiting for you!",
    icon: LinkIcon,
  },
  {
    title: "Create Short Links 🔗",
    description: "Easily create and customize your short links with your own domain!",
    icon: LinkIcon,
  },
  {
    title: "Track Performance 📊",
    description: "View detailed analytics about your links' performance.",
    icon: BarChart2,
  },
  {
    title: "Find Content 🔍",
    description: "Search through links and discover trending content.",
    icon: Search,
  },
  {
    title: "Customize Experience ⚙️",
    description: "Personalize your experience in the settings page.",
    icon: Settings,
  },
];

export function TutorialOverlay({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  const handleNext = () => {
    if (currentStep === tutorialSteps.length - 1) {
      setIsDismissed(true);
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  if (isDismissed) return null;

  const CurrentIcon = tutorialSteps[currentStep].icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardContent className="pt-6 text-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center mb-4"
              >
                <CurrentIcon className="h-12 w-12 text-primary" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">
                {tutorialSteps[currentStep].title}
              </h2>
              <p className="text-muted-foreground mb-6">
                {tutorialSteps[currentStep].description}
              </p>
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <div className="flex gap-1">
                  {tutorialSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 w-1.5 rounded-full ${
                        index === currentStep ? "bg-primary" : "bg-primary/20"
                      }`}
                    />
                  ))}
                </div>
                <Button onClick={handleNext}>
                  {currentStep === tutorialSteps.length - 1 ? (
                    "Get Started"
                  ) : (
                    <>
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}