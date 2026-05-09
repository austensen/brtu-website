export type MarketingContactFormFields = {
  formName: string;
  nameLabel: string;
  emailLabel: string;
  messageLabel: string;
  submitLabel: string;
  successMessage: string;
  errorMessage: string;
};

type Props = {
  title: string;
  bodyHtml: string;
  pageType: string;
  contactEmail?: string;
  contactForm?: MarketingContactFormFields;
  /** Full form action URL including `?sent=1` query */
  contactFormAction?: string;
  sent: boolean;
};

export default function MarketingPageContent({
  title,
  bodyHtml,
  pageType,
  contactEmail,
  contactForm,
  contactFormAction,
  sent,
}: Props) {
  const showContactChrome = pageType === "contact" && contactForm;

  return (
    <>
      <h1>{title}</h1>
      <div className="prose" dangerouslySetInnerHTML={{ __html: bodyHtml }} />

      {pageType === "contact" && contactEmail && contactForm ? (
        <p style={{ marginTop: "var(--space-6)" }}>
          <a className="btn btn--primary" href={`mailto:${contactEmail}`}>
            {contactForm.emailLabel}
          </a>
        </p>
      ) : null}

      {showContactChrome && contactForm && contactFormAction ? (
        <section
          className="card"
          style={{ marginTop: "var(--space-6)", maxWidth: "40rem" }}
          aria-labelledby="contact-form-heading"
        >
          <p id="contact-form-heading" className="visually-hidden">
            {contactForm.nameLabel}
          </p>
          {sent ? (
            <p role="status">{contactForm.successMessage}</p>
          ) : (
            <form
              name={contactForm.formName}
              method="POST"
              data-netlify="true"
              action={contactFormAction}
              aria-describedby="contact-form-errors"
              {...{ "netlify-honeypot": "bot-field" }}
            >
              <input type="hidden" name="form-name" value={contactForm.formName} />
              <p className="visually-hidden">
                <label>
                  Don’t fill this out if you’re human:
                  <input name="bot-field" />
                </label>
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                <label>
                  <span style={{ display: "block", fontWeight: 600, marginBottom: "var(--space-2)" }}>
                    {contactForm.nameLabel}
                  </span>
                  <input
                    type="text"
                    name="name"
                    required
                    autoComplete="name"
                    style={{
                      width: "100%",
                      padding: "var(--space-3)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius)",
                      font: "inherit",
                    }}
                  />
                </label>
                <label>
                  <span style={{ display: "block", fontWeight: 600, marginBottom: "var(--space-2)" }}>
                    {contactForm.emailLabel}
                  </span>
                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    style={{
                      width: "100%",
                      padding: "var(--space-3)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius)",
                      font: "inherit",
                    }}
                  />
                </label>
                <label>
                  <span style={{ display: "block", fontWeight: 600, marginBottom: "var(--space-2)" }}>
                    {contactForm.messageLabel}
                  </span>
                  <textarea
                    name="message"
                    required
                    rows={6}
                    style={{
                      width: "100%",
                      padding: "var(--space-3)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius)",
                      font: "inherit",
                    }}
                  />
                </label>
                <button type="submit" className="btn btn--primary">
                  {contactForm.submitLabel}
                </button>
              </div>
            </form>
          )}
          <p
            id="contact-form-errors"
            style={{ marginTop: "var(--space-4)", fontSize: "0.9rem", color: "var(--color-text-muted)" }}
          >
            {contactForm.errorMessage}
          </p>
        </section>
      ) : null}
    </>
  );
}
