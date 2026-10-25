"use client";

import type { ReactNode } from "react";
import { FileText, ExternalLink, Download, AlertTriangle } from "lucide-react";
import clsx from "clsx";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import styles from "./DocumentViewer.module.scss";

export interface DocumentViewerDocument {
  name: string;
  /** MIME type, used to choose an inline rendering strategy. */
  type?: string;
  /** Optional URL for download/preview. */
  url?: string;
  /** Inline text content rendered for text-like documents when no URL is provided. */
  previewContent?: ReactNode;
}

export interface DocumentViewerProps {
  document: DocumentViewerDocument;
  /** Message shown when the format cannot be rendered inline. */
  unsupportedText?: ReactNode;
  /** Accessible label for the viewer region. */
  ariaLabel?: string;
  className?: string;
}

function isImageType(type?: string): boolean {
  return Boolean(type && type.toLowerCase().startsWith("image/"));
}

function isTextType(type?: string): boolean {
  if (!type) return false;
  const t = type.toLowerCase();
  return (
    t.startsWith("text/") ||
    t === "application/json" ||
    t === "application/xml" ||
    t === "application/javascript"
  );
}

function isPdfType(type?: string): boolean {
  return Boolean(type && type.toLowerCase() === "application/pdf");
}

function isHttpOrHttps(url?: string): boolean {
  return Boolean(url && /^https?:\/\//i.test(url));
}

export function DocumentViewer({
  document: doc,
  unsupportedText = "This file format cannot be previewed inline.",
  ariaLabel = "Document preview",
  className,
}: DocumentViewerProps) {
  const hasUrl = Boolean(doc.url);
  const safeUrl = isHttpOrHttps(doc.url) ? doc.url : undefined;

  let body: ReactNode;
  let rendered = false;

  if (isImageType(doc.type) && safeUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    body = <img className={styles.image} src={safeUrl} alt={doc.name} />;
    rendered = true;
  } else if (isTextType(doc.type) && doc.previewContent != null) {
    body = (
      <pre className={styles.textContent}>
        {typeof doc.previewContent === "string"
          ? doc.previewContent
          : String(doc.previewContent)}
      </pre>
    );
    rendered = true;
  } else if (isPdfType(doc.type) && safeUrl) {
    // Render PDFs in an iframe; browsers without plugin fallback show a download prompt.
    body = (
      <iframe
        className={styles.iframe}
        src={safeUrl}
        title={doc.name}
        sandbox="allow-same-origin allow-scripts allow-popups"
      />
    );
    rendered = true;
  } else if (doc.previewContent != null && !hasUrl) {
    // Generic inline fallback for preview content (e.g. rich text excerpt).
    body = <div className={styles.richContent}>{doc.previewContent}</div>;
    rendered = true;
  } else {
    body = (
      <div className={styles.unsupported}>
        <Alert
          variant="warning"
          icon={<AlertTriangle aria-hidden="true" />}
          title={unsupportedText}
          description={doc.name}
        />
        {safeUrl && (
          <div className={styles.unsupportedActions}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download aria-hidden="true" />}
              onClick={() => {
                window.open(safeUrl, "_blank", "noopener,noreferrer");
              }}
            >
              Download
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <section
      className={clsx(styles.viewer, className)}
      aria-label={ariaLabel}
      data-rendered={rendered || undefined}
    >
      <header className={styles.header}>
        <span className={styles.icon} aria-hidden="true">
          <FileText />
        </span>
        <div className={styles.titleWrap}>
          <h3 className={styles.title}>{doc.name}</h3>
          {doc.type && <p className={styles.type}>{doc.type}</p>}
        </div>
        {safeUrl && (
          <a
            className={styles.openLink}
            href={safeUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>Open in viewer</span>
            <ExternalLink aria-hidden="true" />
          </a>
        )}
      </header>
      <div className={styles.body}>{body}</div>
    </section>
  );
}
