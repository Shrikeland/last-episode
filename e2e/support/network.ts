/**
 * Returns true if the BASE_URL is reachable from this environment.
 * Tests skip gracefully when unreachable (e.g. remote URL blocked by IP firewall).
 * When using local dev server (BASE_URL=http://localhost:3000), Playwright's
 * webServer config guarantees the server is up, so this will always return true.
 */
export async function isBaseUrlReachable(): Promise<boolean> {
  const url = process.env.BASE_URL || 'https://www.episode.watch'
  try {
    const res = await fetch(`${url}/login`, {
      method: 'GET',
      signal: AbortSignal.timeout(8000),
    })
    // 403 = IP blocked by firewall/DDoS protection — tests would all fail
    return res.status < 500 && res.status !== 403
  } catch {
    return false
  }
}
