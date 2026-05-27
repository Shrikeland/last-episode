/**
 * Returns true if the BASE_URL is reachable from this environment.
 * Vercel DDoS protection blocks cloud sandbox IPs (returns 403 or "Host not in allowlist").
 * Integration tests skip gracefully when unreachable.
 */
export async function isBaseUrlReachable(): Promise<boolean> {
  const url = process.env.BASE_URL || 'https://www.episode.watch'
  try {
    const res = await fetch(`${url}/login`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    })
    if (res.status === 403) return false
    const body = await res.text()
    if (body.trim() === 'Host not in allowlist') return false
    return res.status < 500
  } catch {
    return false
  }
}
