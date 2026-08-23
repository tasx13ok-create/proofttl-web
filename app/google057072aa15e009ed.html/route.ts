export const dynamic = 'force-static'

export function GET() {
  return new Response('google-site-verification: google057072aa15e009ed.html\n', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  })
}
