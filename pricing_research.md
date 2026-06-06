# QReview AI - Pricing & Packaging Strategy Research

Based on the functionality of your application (QR Code generation, AI review management, businesses/locations, and bookings/reports), here is a strategic breakdown for SaaS payment packages. The goal is to provide a compelling entry point while capping high-value features (like AI usage and API interactions) to drive upgrades.

## Proposed Tier Structure

We recommend a 3-tier model to capture different market segments: **Starter (Free/Low Cost)**, **Growth (Mid-tier)**, and **Premium (High-tier)**.

---

### 1. Starter / Basic Tier
**Price:** ₹0/month (Free Forever) or ₹999/month (Low Entry)
**Target Audience:** Small single-location businesses or independent freelancers looking to dip their toes into QR marketing and basic review management.
**Goal:** Product-led growth and user acquisition.

**Feature Caps & Limits:**
- **Locations/Businesses:** 1 Location
- **QR Codes:** Up to 3 Static QR Codes
- **QR Customization:** Basic (standard colors, no custom logos)
- **AI Review Generation:** Capped at **10 AI-generated replies/month** (Limits OpenAI/LLM costs)
- **Review Requests:** Up to 50 email requests/month (No SMS)
- **Analytics/Reports:** Basic 7-day overview (Total scans, total clicks)
- **Support:** Community / Email support (72-hour SLA)
- **Branding:** "Powered by QReview" watermark on QR codes/widgets

---

### 2. Growth / Pro Tier (The "Sweet Spot")
**Price:** ₹2,999/month (or ₹29,990/year - 2 months free)
**Target Audience:** Growing businesses with active foot traffic needing automated review management and dynamic marketing tools.
**Goal:** Maximum MRR (Monthly Recurring Revenue).

**Feature Caps & Limits:**
- **Locations/Businesses:** Up to 3 Locations
- **QR Codes:** Unlimited Static, up to **20 Dynamic QR Codes** (allows updating destination URL without re-printing)
- **QR Customization:** Advanced (Custom logos, gradients, shapes, premium templates)
- **AI Review Generation:** Capped at **100 AI-generated replies/month**
- **Review Requests:** Up to 500 email requests & 100 SMS requests/month
- **Analytics/Reports:** 90-day historical data, scan locations, device types, booking conversion tracking
- **Integrations:** Basic CRM integrations (e.g., Mailchimp, Google My Business direct reply)
- **Support:** Priority Email Support (24-hour SLA)
- **Branding:** White-labeled (No QReview branding)

---

### 3. Premium / Elite Tier
**Price:** ₹7,999/month (or ₹79,990/year - 2 months free)
**Target Audience:** Multi-location franchises, agencies, or high-volume enterprise clients.
**Goal:** High ACV (Annual Contract Value) and lock-in.

**Feature Caps & Limits:**
- **Locations/Businesses:** Unlimited (or generous cap like 15+)
- **QR Codes:** Unlimited Dynamic & Static
- **QR Customization:** Full White-label + Custom CSS/Branding for scan landing pages
- **AI Review Generation:** **Unlimited** (or very high soft-cap like 2000/month to prevent abuse, with "Custom Voice" AI trained on their brand)
- **Review Requests:** Unlimited Emails & up to 1000 SMS requests/month
- **Analytics/Reports:** Unlimited history, Custom Report Builder, Scheduled Email Reports, Export to CSV/PDF
- **Integrations:** Webhooks, REST API access, Zapier integration
- **Team Management:** Role-based access control (Admin, Manager, Staff) for up to 10 users
- **Support:** Dedicated Account Manager & Live Chat

---

## Strategic Considerations for Implementation

### 1. Cost Control (Why we cap what we cap)
*   **AI API Costs:** Every time a user generates an AI review, it costs you money (OpenAI/Anthropic tokens). Strictly capping this in lower tiers protects your profit margins.    
*   **Storage & Database:** Capping locations and dynamic QR codes limits database bloat and query complexity on your Supabase backend.

### 2. Token Costing & Unit Economics

To ensure the SaaS model is highly profitable, we must analyze the exact cost of generating review replies using AI. 

#### A. Token Consumption Assumptions
A typical review reply generation request involves:
*   **Input (Prompt):** System instructions, prompt templates, 1-2 few-shot examples, context of the business/location, the customer's review text, and the desired tone. 
    *   *Average Input Size:* **~400 tokens**
*   **Output (Response):** A polite, professional, and context-aware response ready to copy-paste or post.
    *   *Average Output Size:* **~150 tokens**

#### B. LLM Cost Comparison Table
Below is the unit economics comparison across popular LLM providers, including conversions to Indian Rupees (assumes exchange rate of 1 USD = ₹83):

| LLM Model | Input Cost / 1M | Output Cost / 1M | Cost Per Gen (400 In / 150 Out) | Starter Cost (10 replies/mo) | Growth Cost (100 replies/mo) | Premium Cost (2k replies/mo) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Gemini 1.5 Flash** | $0.075 | $0.30 | **$0.000075** (~₹0.006) | $0.00075 (~₹0.06) | $0.0075 (~₹0.62) | $0.15 (~₹12.45) |
| **GPT-4o-mini** | $0.15 | $0.60 | **$0.000150** (~₹0.012) | $0.00150 (~₹0.12) | $0.0150 (~₹1.25) | $0.30 (~₹24.90) |
| **Claude 3 Haiku** | $0.25 | $1.25 | **$0.0002875** (~₹0.024) | $0.002875 (~₹0.24) | $0.02875 (~₹2.39) | $0.575 (~₹47.73) |
| **GPT-4o** | $2.50 | $10.00 | **$0.002500** (~₹0.208) | $0.02500 (~₹2.08) | $0.2500 (~₹20.75) | $5.00 (~₹415.00) |
| **Claude 3.5 Sonnet** | $3.00 | $15.00 | **$0.003450** (~₹0.286) | $0.03450 (~₹2.86) | $0.3450 (~₹28.64) | $6.90 (~₹572.70) |

#### C. Strategic Recommendations
1.  **Default Model Selection (GPT-4o-mini or Gemini 1.5 Flash):**
    *   For standard review responses, **GPT-4o-mini** or **Gemini 1.5 Flash** are highly recommended. Their reasoning capabilities are excellent for simple text reviews, and the operating cost is virtually zero (less than **₹1.25** / $0.015 per user/month on the Growth plan).
2.  **Premium Model Tiering (GPT-4o / Claude 3.5 Sonnet):**
    *   Reserve premium models for the Elite/Premium tier (e.g., if a user configures a "Custom Brand Voice" or requires complex multi-turn sentiment analysis/brand defense rules).
3.  **Tier Pricing vs. Cost Margin:**
    *   *Growth Tier (₹2,999/mo):* The AI COGS (Cost of Goods Sold) is under **₹1.25** using GPT-4o-mini, yielding a **99.9%** gross margin on LLM costs.
    *   *Premium Tier (₹7,999/mo):* Even if a high-volume user maxes out 2,000 generations using GPT-4o-mini (₹24.90) or Claude 3 Haiku (₹47.73), your margins remain incredibly strong. If they use a premium model like GPT-4o (₹415.00), it represents only ~5.2% of their monthly subscription, which is still highly acceptable.

---

### 3. Technical Implementation in Next.js / Supabase
To enforce these limits, you'll need:
*   **A `subscriptions` table:** To track the user's active tier (e.g., via Stripe Webhooks) and their current limits.
*   **A `usage_tracking` table:** To increment counters every time a user performs a capped action (e.g., `ai_reviews_generated_this_month`, `sms_sent_this_month`).
*   **Middleware / API Checks:** Before executing the `/api/ai/generate-review` route, query the user's current usage vs. their tier allowance. If exceeded, return a `403 Payment Required` status and prompt an upsell modal in the UI.

### 4. Upsell Triggers
Design the app to show the user what they are missing. For example:
*   Show the "Upload Logo" button in the QR customizer for Free users, but when clicked, show a modal: *"Custom Logos are available on the Growth Plan. [Upgrade Now]"*.
*   When a user hits 80% of their AI generation limit, show a warning toast: *"You have 2 AI responses left this month. Upgrade to keep saving time."*
