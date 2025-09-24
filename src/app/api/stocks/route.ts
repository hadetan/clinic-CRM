/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { serialize } from '@/lib/serialize';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

// GET /api/stocks?q=...
export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const q = searchParams.get('q')?.trim();
	const where = q
		? { name: { contains: q.toLowerCase(), mode: 'insensitive' as const } }
		: {};
	const db = prisma as any;
	const stocks = await db.stock.findMany({ where, orderBy: { name: 'asc' } });
	const data = (stocks as any[]).map((s) => ({
		id: s.id,
		name: s.name,
		quantity: s.quantity,
		lowStockThreshold: s.lowStockThreshold,
		updatedAt: s.updatedAt,
		inStock: s.quantity > 0,
		isLow: s.quantity > 0 && s.quantity <= s.lowStockThreshold,
		isDivisible: s.isDivisible,
		dispensingUnit: s.dispensingUnit,
		unitsPerPack: s.unitsPerPack,
	}));
	return NextResponse.json(serialize({ stocks: data }));
}

// POST /api/stocks  { name: string, amount: number, lowStockThreshold?: number, isDivisible?: boolean, dispensingUnit?: string, unitsPerPack?: number }
export async function POST(req: Request) {
	const body = await req.json().catch(() => ({}));
	const name = String(body.name ?? '').trim();
	const amountRaw = Number(body.amount ?? 0);
	const amount = Number.isFinite(amountRaw) ? Math.trunc(amountRaw) : 0;
	const lowStockThresholdRaw = body.lowStockThreshold;
	const lowStockThreshold =
		typeof lowStockThresholdRaw === 'number' &&
		Number.isFinite(lowStockThresholdRaw)
			? Math.max(0, Math.trunc(lowStockThresholdRaw))
			: undefined;
	const isDivisible = body.isDivisible !== undefined ? Boolean(body.isDivisible) : true;
	const dispensingUnit = body.dispensingUnit || 'TABLET';
	const unitsPerPackRaw = Number(body.unitsPerPack ?? 1);
	const unitsPerPack = Number.isFinite(unitsPerPackRaw) ? Math.max(1, Math.trunc(unitsPerPackRaw)) : 1;

	if (!name || amount === 0)
		return NextResponse.json(
			{ error: 'name and non-zero amount required' },
			{ status: 400 }
		);

	const db = prisma as any;
	const existing = await db.stock.findFirst({
		where: { name: { equals: name, mode: 'insensitive' } },
	});
	let stock;
	if (existing) {
		stock = await db.stock.update({
			where: { id: existing.id },
			data: {
				quantity: { increment: amount },
				...(lowStockThreshold !== undefined
					? { lowStockThreshold }
					: {}),
				isDivisible,
				dispensingUnit,
				unitsPerPack,
			},
		});
	} else {
		stock = await db.stock.create({
			data: {
				name,
				quantity: Math.max(0, amount),
				...(lowStockThreshold !== undefined
					? { lowStockThreshold }
					: {}),
				isDivisible,
				dispensingUnit,
				unitsPerPack,
			},
		});
	}
	return NextResponse.json(serialize({ stock }));
}
