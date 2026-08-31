export default async function handler(_request, response) {
  response.setHeader('cache-control', 'no-store')
  response.setHeader('content-type', 'application/json; charset=utf-8')
  response.setHeader('x-content-type-options', 'nosniff')
  response.statusCode = 410
  response.end(JSON.stringify({
    error: 'legacy_route_retired',
    message: 'This legacy general-purpose AI route is retired. ProofTTL production AI is limited to the Fact Audit product and its supporting verification surfaces.',
  }))
}
