import { useState } from "react";
import type { MarketingContactFormFields } from "./marketingContactFormTypes";
import styles from "./MarketingPageContent.module.css";

type Props = {
  contactForm: MarketingContactFormFields;
  /** Path only (no query), e.g. `/en/contact` — POST target for Netlify Forms */
  postPath: string;
  /** Full URL after successful submit (includes `?sent=1`) */
  successUrl: string;
};

export default function ContactNetlifyForm({
  contactForm,
  postPath,
  successUrl,
}: Props) {
  const [submitError, setSubmitError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(false);
    setIsSubmitting(true);
    const form = e.currentTarget;
    try {
      const data = new FormData(form);
      const params = new URLSearchParams();
      data.forEach((value, key) => {
        params.append(key, typeof value === "string" ? value : value.name);
      });
      const body = params.toString();
      const res = await fetch(postPath, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      if (res.ok) {
        window.location.assign(successUrl);
        return;
      }
      setSubmitError(true);
    } catch {
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <form
        name={contactForm.formName}
        method="POST"
        data-netlify="true"
        action={successUrl}
        onSubmit={handleSubmit}
        aria-describedby={submitError ? "contact-form-errors" : undefined}
        {...{ "netlify-honeypot": "bot-field" }}
      >
        <input type="hidden" name="form-name" value={contactForm.formName} />
        <p className="visually-hidden">
          <label>
            Don’t fill this out if you’re human:
            <input name="bot-field" />
          </label>
        </p>
        <div className={styles.fieldStack}>
          <label>
            <span className={styles.labelText}>{contactForm.nameLabel}</span>
            <input
              type="text"
              name="name"
              required
              autoComplete="name"
              className={styles.input}
              disabled={isSubmitting}
            />
          </label>
          <label>
            <span className={styles.labelText}>{contactForm.emailLabel}</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className={styles.input}
              disabled={isSubmitting}
            />
          </label>
          <label>
            <span className={styles.labelText}>{contactForm.messageLabel}</span>
            <textarea
              name="message"
              required
              rows={6}
              className={styles.textarea}
              disabled={isSubmitting}
            />
          </label>
          <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
            {contactForm.submitLabel}
          </button>
        </div>
      </form>
      {submitError ? (
        <p id="contact-form-errors" className={styles.formFootnote} role="alert">
          {contactForm.errorMessage}
        </p>
      ) : null}
    </>
  );
}
