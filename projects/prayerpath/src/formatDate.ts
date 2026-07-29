export function formatDate(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
