const ACCESS_URL =
	'https://googlesheetbackend-fcnayjd1g-adorn4711s-projects.vercel.app/testaccess';
const BUSINESS_URL =
	'https://googlesheetbackend-fcnayjd1g-adorn4711s-projects.vercel.app/workitems';
const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET ?? '';

function extractCookie(setCookieHeader: string | null): string | null {
	if (!setCookieHeader) {
		return null;
	}
	const first = setCookieHeader.split(',')[0] ?? '';
	const cookie = first.split(';')[0]?.trim() ?? '';
	return cookie.length > 0 ? cookie : null;
}

async function fetchWithRedirects(
	url: string,
	maxRedirects = 10,
	extraHeaders: Record<string, string> = {},
): Promise<Response> {
	let currentUrl = url;
	let cookie = '';

	for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount++) {
		const headers: Record<string, string> = {
			Accept: 'text/plain, application/json',
			'x-vercel-protection-bypass': bypassSecret,
			'x-vercel-set-bypass-cookie': 'true',
			...extraHeaders,
		};

		if (cookie) {
			headers.Cookie = cookie;
		}

		const response = await fetch(currentUrl, {
			method: 'GET',
			headers,
			redirect: 'manual',
		});

		const maybeCookie = extractCookie(response.headers.get('set-cookie'));
		if (maybeCookie) {
			cookie = maybeCookie;
		}

		if (response.status < 300 || response.status >= 400) {
			return response;
		}

		const location = response.headers.get('location');
		if (!location) {
			throw new Error('Redirect response without location header.');
		}

		currentUrl = new URL(location, currentUrl).toString();
		console.log('Following redirect to:', currentUrl);
	}

	throw new Error(`Too many redirects (>${maxRedirects}).`);
}

async function getBusinessDataWithBearer(token: string): Promise<void> {
	const response = await fetchWithRedirects(BUSINESS_URL, 10, {
		Authorization: `Bearer ${token}`,
	});

	const body = await response.text();
	console.log('Business status:', response.status, response.statusText);
	console.log('Business body:', body);
}

async function callBackend(): Promise<void> {
	if (!bypassSecret) {
		throw new Error('Missing VERCEL_AUTOMATION_BYPASS_SECRET environment variable.');
	}

	console.log('Calling backend test access endpoint with bypass secret from env.');
	const response = await fetchWithRedirects(ACCESS_URL);

	const body = await response.text();
	console.log('Status:', response.status, response.statusText);
	const token = response.status === 200 ? JSON.parse(body).accessToken : null;
	console.log('Token:', token);

	if (token) {
		await getBusinessDataWithBearer(token);
	}
}

callBackend().catch((error: unknown) => {
	console.error('Request failed:', error);
	process.exitCode = 1;
});
