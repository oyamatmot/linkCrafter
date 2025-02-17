import { NavigationBar } from "@/components/navigation-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function PrivacyPolicy() {
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
              <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <h2>1. Information We Collect</h2>
              <p>
                LinkCrafter collects information you provide directly, including:
                - Account information (username, email)
                - Usage data and analytics
                - Link creation and management data
              </p>

              <h2>2. How We Use Your Information</h2>
              <p>
                We use collected information to:
                - Provide and improve our services
                - Monitor and analyze trends
                - Protect against unauthorized access
              </p>

              <h2>3. Data Security</h2>
              <p>
                We implement appropriate security measures to protect your data
                against unauthorized access, alteration, or destruction.
              </p>

              <h2>4. Updates to This Policy</h2>
              <p>
                We may update this policy periodically. We will notify users of any
                material changes via email or through the platform.
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
