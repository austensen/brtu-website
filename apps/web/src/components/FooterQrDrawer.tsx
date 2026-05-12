import { useCallback, useEffect, useId, useRef, useState } from "react";
import QRCode from "qrcode";

type Props = {
  pageUrl: string;
};

function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return fetch(dataUrl).then((r) => r.blob());
}

export default function FooterQrDrawer({ pageUrl }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [actionHint, setActionHint] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setDataUrl(null);
    setQrError(null);
    QRCode.toDataURL(pageUrl, { margin: 2, width: 256, errorCorrectionLevel: "M" })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrError("Could not generate QR code.");
      });
    return () => {
      cancelled = true;
    };
  }, [pageUrl]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => {
      setDialogOpen(false);
      triggerRef.current?.focus();
    };
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  const clearHintSoon = useCallback(() => {
    window.setTimeout(() => setActionHint(null), 2800);
  }, []);

  const open = () => {
    dialogRef.current?.showModal();
    setDialogOpen(true);
  };

  const close = () => {
    dialogRef.current?.close();
  };

  const onDialogPointerDown = (e: React.PointerEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) e.currentTarget.close();
  };

  const downloadPng = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "brtu-qr-code.png";
    a.rel = "noopener";
    a.click();
  };

  const copyImageOrUrl = async () => {
    if (!dataUrl) return;
    try {
      const blob = await dataUrlToBlob(dataUrl);
      const type = blob.type === "image/png" ? "image/png" : blob.type;
      await navigator.clipboard.write([new ClipboardItem({ [type]: blob })]);
      setActionHint("QR image copied");
      clearHintSoon();
    } catch {
      try {
        await navigator.clipboard.writeText(pageUrl);
        setActionHint("URL copied (image copy not supported here)");
        clearHintSoon();
      } catch {
        setActionHint("Copy failed");
        clearHintSoon();
      }
    }
  };

  return (
    <div className="site-footer__qr">
      <button
        ref={triggerRef}
        type="button"
        className="site-footer__qr-trigger"
        aria-haspopup="dialog"
        aria-expanded={dialogOpen}
        onClick={open}
      >
        QR Code
      </button>

      <dialog
        ref={dialogRef}
        className="footer-qr-dialog"
        aria-labelledby={titleId}
        onPointerDown={onDialogPointerDown}
      >
        <div className="footer-qr-dialog__panel" onPointerDown={(e) => e.stopPropagation()}>
          <div className="footer-qr-dialog__header">
            <h2 className="footer-qr-dialog__title" id={titleId}>
              QR code for this page
            </h2>
            <button type="button" className="footer-qr-dialog__close" onClick={close} aria-label="Close">
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <div className="footer-qr-dialog__body">
            {qrError ? <p className="footer-qr-dialog__error">{qrError}</p> : null}
            {dataUrl ? (
              <img
                className="footer-qr-dialog__img"
                src={dataUrl}
                width={256}
                height={256}
                alt={`QR code linking to ${pageUrl}`}
              />
            ) : !qrError ? (
              <p className="footer-qr-dialog__loading">Generating…</p>
            ) : null}

            <p className="footer-qr-dialog__url" title={pageUrl}>
              {pageUrl}
            </p>

            <div className="footer-qr-dialog__actions">
              <button
                type="button"
                className="footer-qr-dialog__icon-btn"
                onClick={copyImageOrUrl}
                disabled={!dataUrl}
                aria-label="Copy QR code image"
                title="Copy QR code image"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none">
                  <path
                    d="M9 18H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v1"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <rect x="9" y="8" width="10" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
                </svg>
              </button>
              <button
                type="button"
                className="footer-qr-dialog__icon-btn"
                onClick={downloadPng}
                disabled={!dataUrl}
                aria-label="Download QR code image"
                title="Download QR code image"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none">
                  <path
                    d="M12 4v11M8 11l4 4 4-4M5 20h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            {actionHint ? <p className="footer-qr-dialog__hint">{actionHint}</p> : null}
          </div>
        </div>
      </dialog>
    </div>
  );
}
