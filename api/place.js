export default async function handler(req, res) {
  try {
    const PLACE_ID = process.env.PLACE_ID;
    const GOOGLE_PLACES_KEY = process.env.GOOGLE_PLACES_KEY;

    if (!PLACE_ID || !GOOGLE_PLACES_KEY) {
      return res.status(500).json({
        error: true,
        message: 'Missing environment variables'
      });
    }

    const fields = [
      'displayName',
      'formattedAddress',
      'currentOpeningHours',
      'websiteUri',
      'rating',
      'userRatingCount',
      'location'
    ].join(',');

    const url =
      `https://places.googleapis.com/v1/places/${encodeURIComponent(PLACE_ID)}` +
      `?fields=${encodeURIComponent(fields)}&key=${encodeURIComponent(GOOGLE_PLACES_KEY)}`;

    const googleRes = await fetch(url, {
      headers: { Accept: 'application/json' }
    });

    if (!googleRes.ok) {
      const body = await googleRes.text();
      return res.status(502).json({
        error: true,
        message: 'Google Places request failed',
        status: googleRes.status,
        body: body.slice(0, 500)
      });
    }

    const d = await googleRes.json();

    const slim = {
      displayName: d.displayName?.text ?? null,
      formattedAddress: d.formattedAddress ?? null,
      websiteUri: d.websiteUri ?? null,
      rating: typeof d.rating === 'number' ? d.rating : null,
      userRatingCount: typeof d.userRatingCount === 'number' ? d.userRatingCount : null,
      currentOpeningHours: d.currentOpeningHours ?? null,
      location: d.location ?? null,
      fetchedAt: new Date().toISOString()
    };

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=86400');

    return res.status(200).json(slim);
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: 'Unexpected server error',
      details: String(err)
    });
  }
}
