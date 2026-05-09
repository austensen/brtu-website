import styles from "./MarketingPageContent.module.css";

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
        <p className={styles.mailtoWrap}>
          <a className="btn btn--primary" href={`mailto:${contactEmail}`}>
            {contactForm.emailLabel}
          </a>
        </p>
      ) : null}

      {showContactChrome && contactForm && contactFormAction ? (
        <section
          className={`card ${styles.formSection}`}
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
              <div className={styles.fieldStack}>
                <label>
                  <span className={styles.labelText}>{contactForm.nameLabel}</span>
                  <input
                    type="text"
                    name="name"
                    required
                    autoComplete="name"
                    className={styles.input}
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
                  />
                </label>
                <label>
                  <span className={styles.labelText}>{contactForm.messageLabel}</span>
                  <textarea
                    name="message"
                    required
                    rows={6}
                    className={styles.textarea}
                  />
                </label>
                <button type="submit" className="btn btn--primary">
                  {contactForm.submitLabel}
                </button>
              </div>
            </form>
          )}
          <p id="contact-form-errors" className={styles.formFootnote}>
            {contactForm.errorMessage}
          </p>
        </section>
      ) : null}
    </>
  );
}
