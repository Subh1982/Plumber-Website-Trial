"use client";

import { FormEvent, useState } from "react";

const services = [
  "Blocked drains",
  "Leaking taps",
  "Burst pipes",
  "Hot-water systems",
  "Toilets",
  "Gas fitting",
  "Installations",
  "Maintenance",
  "Something else",
];

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/__forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData as unknown as Record<string, string>).toString(),
      });

      if (!response.ok) throw new Error("Submission failed");
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form
      className="contact-form"
      name="plumbing-enquiry"
      method="POST"
      data-netlify="true"
      data-netlify-honeypot="bot-field"
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="form-name" value="plumbing-enquiry" />
      <p className="form-honeypot" aria-hidden="true">
        <label>Don’t fill this out: <input name="bot-field" tabIndex={-1} autoComplete="off" /></label>
      </p>

      <div className="form-heading">
        <span className="kicker">REQUEST A CALLBACK</span>
        <h3>Tell us what’s happening.</h3>
        <p>Send a few details and our team will get back to you during business hours.</p>
      </div>

      <div className="form-grid">
        <label>
          <span>Name *</span>
          <input name="name" type="text" autoComplete="name" required />
        </label>
        <label>
          <span>Phone *</span>
          <input name="phone" type="tel" autoComplete="tel" inputMode="tel" required />
        </label>
        <label>
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" />
        </label>
        <label>
          <span>Suburb *</span>
          <input name="suburb" type="text" autoComplete="address-level2" required />
        </label>
        <label className="form-wide">
          <span>What do you need help with? *</span>
          <select name="service" defaultValue="" required>
            <option value="" disabled>Select a service</option>
            {services.map((service) => <option key={service}>{service}</option>)}
          </select>
        </label>
        <label className="form-wide">
          <span>Tell us about the job *</span>
          <textarea name="message" rows={4} placeholder="What’s happening, and when would you like us to attend?" required />
        </label>
      </div>

      <div className="form-submit-row">
        <button type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send enquiry"}<span aria-hidden="true">→</span>
        </button>
        <small>By submitting, you agree that we may contact you about this enquiry.</small>
      </div>

      <div className="form-status" aria-live="polite">
        {status === "sent" && <p className="form-success"><b>Thanks—your enquiry is on its way.</b><br />We’ll be in touch during business hours.</p>}
        {status === "error" && <p className="form-error"><b>We couldn’t send that just now.</b><br />Please call <a href="tel:+61291587742">02 9158 7742</a>.</p>}
      </div>
    </form>
  );
}
