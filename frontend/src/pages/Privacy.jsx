import React from 'react';
import { Container, Card } from 'react-bootstrap';
import './InfoPages.css';

const Privacy = () => {
  return (
    <div className="info-page">
      <div className="info-hero bg-danger text-white py-5">
        <Container>
          <h1 className="display-4 fw-bold text-center">Privacy Policy</h1>
          <p className="lead text-center">Your privacy is our priority</p>
        </Container>
      </div>

      <Container className="py-5">
        <Card className="shadow p-5">
          <p className="text-muted">Last Updated: March 2026</p>

          <h3 className="fw-bold mt-4 mb-3">1. Information We Collect</h3>
          <p>
            We collect information that you provide directly to us when registering as a donor
            or requesting blood:
          </p>
          <ul>
            <li>Personal Information: Name, email address, phone number, date of birth</li>
            <li>Health Information: Blood group, medical history, donation history</li>
            <li>Location Data: GPS coordinates (with your consent) for donor matching</li>
            <li>Contact Information: Address and emergency contact details</li>
          </ul>

          <h3 className="fw-bold mt-4 mb-3">2. How We Use Your Information</h3>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Connect blood donors with recipients in emergency situations</li>
            <li>Send notifications about nearby blood requests</li>
            <li>Maintain and update blood stock inventories</li>
            <li>Organize and manage blood donation camps</li>
            <li>Improve our services and user experience</li>
            <li>Communicate important updates and safety information</li>
          </ul>

          <h3 className="fw-bold mt-4 mb-3">3. Location Data</h3>
          <p>
            We use location data to match donors with nearby recipients. Location tracking is:
          </p>
          <ul>
            <li>Only activated with your explicit consent</li>
            <li>Used solely for donor-recipient matching purposes</li>
            <li>Can be disabled at any time from your account settings</li>
            <li>Never shared with third parties for marketing purposes</li>
          </ul>

          <h3 className="fw-bold mt-4 mb-3">4. Data Security</h3>
          <p>
            We implement industry-standard security measures to protect your data:
          </p>
          <ul>
            <li>SSL/TLS encryption for all data transmission</li>
            <li>Secure password hashing using bcrypt</li>
            <li>JWT-based authentication for secure sessions</li>
            <li>Regular security audits and updates</li>
            <li>Limited access to personal data by authorized personnel only</li>
          </ul>

          <h3 className="fw-bold mt-4 mb-3">5. Data Sharing</h3>
          <p>We may share your information with:</p>
          <ul>
            <li>
              <strong>Healthcare Facilities:</strong> Verified hospitals and blood banks for
              blood request fulfillment
            </li>
            <li>
              <strong>Other Donors:</strong> Limited information (name, blood group) when
              responding to requests
            </li>
            <li>
              <strong>Legal Requirements:</strong> When required by law or to protect rights and
              safety
            </li>
          </ul>
          <p>We NEVER sell your personal information to third parties.</p>

          <h3 className="fw-bold mt-4 mb-3">6. Your Rights</h3>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data at any time</li>
            <li>Update or correct your information</li>
            <li>Delete your account and associated data</li>
            <li>Opt-out of notifications (except critical emergency alerts)</li>
            <li>Request a copy of your data</li>
            <li>Disable location tracking</li>
          </ul>

          <h3 className="fw-bold mt-4 mb-3">7. Data Retention</h3>
          <p>
            We retain your personal information for as long as your account is active or as
            needed to provide services. Donation history is kept for medical record purposes
            and regulatory compliance.
          </p>

          <h3 className="fw-bold mt-4 mb-3">8. Cookies and Tracking</h3>
          <p>
            We use cookies to enhance your experience and maintain session information. You can
            control cookie preferences through your browser settings.
          </p>

          <h3 className="fw-bold mt-4 mb-3">9. Children's Privacy</h3>
          <p>
            Our service is intended for users aged 18 and above. We do not knowingly collect
            information from minors.
          </p>

          <h3 className="fw-bold mt-4 mb-3">10. Changes to Privacy Policy</h3>
          <p>
            We may update this policy periodically. We will notify you of significant changes
            via email or through the platform.
          </p>

          <h3 className="fw-bold mt-4 mb-3">11. Contact Us</h3>
          <p>
            If you have questions about this Privacy Policy, please contact us at:
            <br />
            <strong>Email:</strong> privacy@droplife.com
            <br />
            <strong>Phone:</strong> +91 123-456-7890
          </p>

          <div className="alert alert-info mt-4">
            <strong>Note:</strong> By using DROPLIFE, you agree to this Privacy Policy and our
            Terms of Service. Your trust is important to us, and we are committed to protecting
            your privacy.
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default Privacy;