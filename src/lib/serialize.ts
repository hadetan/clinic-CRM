// Safely convert Prisma results (which may contain BigInt) into JSON-serializable objects.
// BigInt values are converted to strings to avoid precision loss and JSON errors.
export function serialize<T>(value: T): T {
	return JSON.parse(
		JSON.stringify(value, (_key, v) =>
			typeof v === 'bigint' ? v.toString() : v
		)
	) as T;
}

export default serialize;
