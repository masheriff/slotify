"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export function TermsFooter() {
  return (
    <div className="text-center mt-4">
      <p className="text-xs">
        By clicking login, you agree to our{" "}
        <Dialog>
          <DialogTrigger asChild>
            <button className="text-red-600 hover:text-red-700 underline transition-colors">
              Terms of Service
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Terms of Service</DialogTitle>
              <DialogDescription>
                Last updated: {new Date().toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4 text-sm">
                <section>
                  <h3 className="font-semibold text-base mb-2">1. Acceptance of Terms</h3>
                  <p>
                    By accessing and using Slotify ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. This healthcare scheduling platform is designed to comply with HIPAA regulations and protect patient health information.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">2. HIPAA Compliance</h3>
                  <p>
                    Slotify is committed to maintaining HIPAA compliance. All Protected Health Information (PHI) is encrypted, stored securely, and accessed only by authorized personnel. We implement administrative, physical, and technical safeguards to protect your health information.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">3. User Responsibilities</h3>
                  <p>
                    Users must maintain the confidentiality of their login credentials and are responsible for all activities under their account. Healthcare providers must ensure only authorized personnel access patient information through the platform.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">4. Data Security</h3>
                  <p>
                    We employ industry-standard security measures including end-to-end encryption, secure data transmission protocols, and regular security audits. All data is stored in HIPAA-compliant data centers with appropriate access controls.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">5. Service Availability</h3>
                  <p>
                    While we strive for 99.9% uptime, we cannot guarantee uninterrupted service. Scheduled maintenance will be communicated in advance, and emergency maintenance may occur without notice.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">6. Limitation of Liability</h3>
                  <p>
                    Slotify shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service. Our liability is limited to the amount paid for the service in the preceding 12 months.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">7. Termination</h3>
                  <p>
                    Either party may terminate this agreement with 30 days written notice. Upon termination, all data will be securely deleted or returned according to HIPAA requirements and your organization's data retention policies.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">8. Governing Law</h3>
                  <p>
                    This agreement shall be governed by and construed in accordance with the laws of the jurisdiction where 5 AM Corporation is incorporated, without regard to conflict of law principles.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">9. Updates to Terms</h3>
                  <p>
                    We reserve the right to modify these terms at any time. Users will be notified of significant changes, and continued use of the service constitutes acceptance of the updated terms.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">10. Contact Information</h3>
                  <p>
                    For questions about these terms, please contact us at legal@5amcorp.com or through the contact information provided on our website.
                  </p>
                </section>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
        {" "}and{" "}
        <Dialog>
          <DialogTrigger asChild>
            <button className="text-red-600 hover:text-red-700 underline transition-colors">
              Privacy Policy
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Privacy Policy</DialogTitle>
              <DialogDescription>
                Last updated: {new Date().toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4 text-sm">
                <section>
                  <h3 className="font-semibold text-base mb-2">1. Information We Collect</h3>
                  <p>
                    We collect information necessary to provide healthcare scheduling services, including:
                  </p>
                  <ul className="list-disc list-inside ml-4 mt-2">
                    <li>Patient demographic information</li>
                    <li>Appointment scheduling data</li>
                    <li>Healthcare provider information</li>
                    <li>Technical information for system operation</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">2. HIPAA Protected Health Information</h3>
                  <p>
                    All Protected Health Information (PHI) is handled in accordance with HIPAA regulations. We serve as a Business Associate and have executed appropriate Business Associate Agreements with covered entities. PHI is used solely for treatment, payment, and healthcare operations.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">3. Data Usage</h3>
                  <p>
                    We use collected information to:
                  </p>
                  <ul className="list-disc list-inside ml-4 mt-2">
                    <li>Facilitate appointment scheduling</li>
                    <li>Provide customer support</li>
                    <li>Improve our services</li>
                    <li>Comply with legal obligations</li>
                    <li>Ensure system security and integrity</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">4. Data Sharing</h3>
                  <p>
                    We do not sell, trade, or otherwise transfer PHI to third parties except:
                  </p>
                  <ul className="list-disc list-inside ml-4 mt-2">
                    <li>With your explicit consent</li>
                    <li>To authorized healthcare providers for treatment</li>
                    <li>For payment and healthcare operations</li>
                    <li>As required by law</li>
                    <li>To HIPAA-compliant service providers under appropriate agreements</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">5. Data Security</h3>
                  <p>
                    We implement comprehensive security measures including:
                  </p>
                  <ul className="list-disc list-inside ml-4 mt-2">
                    <li>End-to-end encryption for data in transit and at rest</li>
                    <li>Multi-factor authentication</li>
                    <li>Regular security audits and penetration testing</li>
                    <li>Employee training on HIPAA compliance</li>
                    <li>Incident response procedures</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">6. Your Rights</h3>
                  <p>
                    Under HIPAA, you have the right to:
                  </p>
                  <ul className="list-disc list-inside ml-4 mt-2">
                    <li>Access your PHI</li>
                    <li>Request amendments to your PHI</li>
                    <li>Request restrictions on use and disclosure</li>
                    <li>Request alternative communications</li>
                    <li>File complaints about privacy practices</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">7. Data Retention</h3>
                  <p>
                    We retain PHI only as long as necessary to provide services and comply with legal requirements. Retention periods are determined by applicable laws and your organization's policies, typically 6-7 years for medical records.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">8. Breach Notification</h3>
                  <p>
                    In the event of a data breach involving PHI, we will notify affected parties and regulatory authorities within the timeframes required by HIPAA (typically within 60 days of discovery).
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">9. International Data Transfers</h3>
                  <p>
                    PHI is stored and processed within the United States in HIPAA-compliant data centers. We do not transfer PHI outside the US without appropriate safeguards and legal basis.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">10. Contact Information</h3>
                  <p>
                    For privacy-related questions or to exercise your rights, contact our Privacy Officer at:
                  </p>
                  <p className="mt-2">
                    Email: privacy@5amcorp.com<br />
                    Phone: [Phone Number]<br />
                    Address: [Company Address]
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">11. Policy Updates</h3>
                  <p>
                    We may update this privacy policy to reflect changes in our practices or legal requirements. Material changes will be communicated to users with appropriate notice periods.
                  </p>
                </section>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
        .
      </p>
    </div>
  );
}