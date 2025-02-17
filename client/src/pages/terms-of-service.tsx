import { NavigationBar } from "@/components/navigation-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0 md:pt-16">
      <NavigationBar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing LinkCrafter, you agree to be bound by these Terms of
                Service and all applicable laws and regulations.
              </p>

              <h2>2. User Responsibilities</h2>
              <p>
                Users are responsible for:
                - Maintaining account security
                - Complying with applicable laws
                - Using the service appropriately
              </p>

              <h2>3. Service Modifications</h2>
              <p>
                We reserve the right to modify or discontinue the service at any
                time without notice.
              </p>

              <h2>4. Intellectual Property</h2>
              <p>
                All content and materials available through LinkCrafter are
                protected by intellectual property rights.
              </p>

              <div className="mt-8 text-sm text-muted-foreground">
                Last updated: February 17, 2025
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
