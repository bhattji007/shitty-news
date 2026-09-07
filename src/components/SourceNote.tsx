/**
 * Rendered as the first thing inside <body> on every page, so that anyone who
 * opens view-source is met immediately.
 */
export default function SourceNote() {
  return (
    <div
      hidden
      aria-hidden="true"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html:
          "<!-- If you're reading the source, you're looking for something real. Wrong website. -->",
      }}
    />
  );
}
