import ContactNetlifyForm from "./ContactNetlifyForm";
import styles from "./MarketingPageContent.module.css";
import type { MarketingContactFormFields } from "./marketingContactFormTypes";

export type { MarketingContactFormFields };

type Props = {
  title: string;
  bodyHtml: string;
  pageType: string;
  contactEmail?: string;
  contactForm?: MarketingContactFormFields;
  /** Full form action URL including `?sent=1` query */
  contactFormAction?: string;
  /** Path only (no query); POST target for Netlify when showing the form */
  contactFormPostPath?: string;
  sent: boolean;
};

export default function MarketingPageContent({
  title,
  bodyHtml,
  pageType,
  contactEmail,
  contactForm,
  contactFormAction,
  contactFormPostPath,
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

      {showContactChrome && contactForm && contactFormAction && contactFormPostPath ? (
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
            <ContactNetlifyForm
              contactForm={contactForm}
              postPath={contactFormPostPath}
              successUrl={contactFormAction}
            />
          )}
        </section>
      ) : null}
    </>
  );
}
