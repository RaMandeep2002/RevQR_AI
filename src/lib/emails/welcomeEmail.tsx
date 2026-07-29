import * as React from 'react';

export default function WelcomeEmail({ name }: { name: string }) {
  return (
    <html lang="en">
      <body style={main}>
        <div style={container}>
          <div style={header}>
            <h1 style={logo}>RevQR</h1>
          </div>
          <div style={content}>
            <h2 style={heading}>Welcome {name}! 👋</h2>
            <p style={paragraph}>
              We're thrilled to have you join our platform. RevQR helps you collect and manage reviews seamlessly using AI-powered QR codes.
            </p>
            <p style={paragraph}>
              Get started by creating your first QR code and see how easy it is to boost your customer feedback.
            </p>
            <div style={btnContainer}>
              <a href="https://www.qreview.in/" style={button}>
                Go to Dashboard
              </a>
            </div>
            <p style={paragraph}>
              If you have any questions, feel free to reply to this email. We're here to help!
            </p>
          </div>
          <div style={footer}>
            <p style={footerText}>
              © {new Date().getFullYear()} RevQR. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  margin: '0',
  padding: '0',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
  maxWidth: '580px',
};

const header = {
  padding: '24px',
  textAlign: 'center' as const,
  borderBottom: '1px solid #e6ebf1',
};

const logo = {
  margin: '0',
  fontSize: '24px',
  fontWeight: '700',
  color: '#3b82f6',
};

const content = {
  padding: '24px 48px',
};

const heading = {
  fontSize: '24px',
  letterSpacing: '-0.5px',
  lineHeight: '1.3',
  fontWeight: '600',
  color: '#1f2937',
  margin: '0 0 24px',
};

const paragraph = {
  margin: '0 0 16px',
  fontSize: '16px',
  lineHeight: '1.5',
  color: '#4b5563',
};

const btnContainer = {
  textAlign: 'center' as const,
  marginTop: '32px',
  marginBottom: '32px',
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const footer = {
  padding: '0 48px',
};

const footerText = {
  margin: '0',
  fontSize: '14px',
  color: '#9ca3af',
  textAlign: 'center' as const,
};
