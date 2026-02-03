export function buildShareUrl(base: string, text: string) {
  const encoded = encodeURIComponent(text);
  return `${base}?text=${encoded}`;
}
