import type {
	IExecuteFunctions,
	IExecuteSingleFunctions,
	ILoadOptionsFunctions,
	IHookFunctions,
	IHttpRequestOptions,
} from 'n8n-workflow';

// Token cache structure
interface TokenCache {
	token: string;
	expiresAt: number;
}

// In-memory token cache (persists across node executions in same n8n process)
const tokenCache = new Map<string, TokenCache>();

// Token validity duration: 55 minutes (assuming 1-hour tokens)
const TOKEN_VALIDITY_MS = 55 * 60 * 1000;

/**
 * Get authentication token from cache or by calling the login endpoint
 * @param context - The execution context
 * @returns Bearer token string
 */
export async function getAuthToken(
	context: IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions | IHookFunctions,
): Promise<string> {
	const credentials = await context.getCredentials('qActionApi');

	if (!credentials) {
		throw new Error('No credentials provided');
	}

	const apiUrl = credentials.apiUrl as string;
	const clientId = credentials.clientId as string;
	const apiKey = credentials.apiKey as string;

	// Create cache key based on credential ID (unique per credential instance)
	// Falls back to apiUrl:clientId if id is not available
	const cacheKey = credentials.id ? String(credentials.id) : `${apiUrl}:${clientId}`;

	// Check if we have a valid cached token
	const cached = tokenCache.get(cacheKey);
	if (cached && cached.expiresAt > Date.now()) {
		return cached.token;
	}

	// Token not cached or expired, fetch a new one
	try {
		const loginOptions: IHttpRequestOptions = {
			method: 'POST',
			url: `${apiUrl}api/v1/authentication/login`,
			headers: {
				'X-Client-Id': clientId,
				'X-API-Key': apiKey,
			},
			returnFullResponse: false,
		};

		const token = (await context.helpers.request(loginOptions)) as string;

		// Cache the token
		tokenCache.set(cacheKey, {
			token: token.trim(),
			expiresAt: Date.now() + TOKEN_VALIDITY_MS,
		});

		return token.trim();
	} catch (error) {
		throw new Error(`Authentication failed: ${error.message}`);
	}
}

/**
 * Make an authenticated request to the QAction API
 * @param context - The execution context
 * @param options - HTTP request options
 * @returns Response data
 */
export async function qActionApiRequest(
	context: IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions | IHookFunctions,
	options: IHttpRequestOptions,
): Promise<unknown> {
	const credentials = await context.getCredentials('qActionApi');
	const token = await getAuthToken(context);

	const requestOptions: IHttpRequestOptions = {
		...options,
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
			...options.headers,
		},
		url: `${credentials.apiUrl}${options.url}`,
	};

	return context.helpers.request(requestOptions);
}

/**
 * Creates a preSend function that automatically adds Bearer token authentication
 * This can be used in routing configurations to avoid repeating auth code
 * @returns A preSend function that adds the Authorization header
 */
export function withAuth() {
	return async function (
		this: IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions | IHookFunctions,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> {
		// Get authentication token
		const token = await getAuthToken(this);

		// Add authentication header
		requestOptions.headers = {
			...(requestOptions.headers || {}),
			Authorization: `Bearer ${token}`,
		};

		return requestOptions;
	};
}
