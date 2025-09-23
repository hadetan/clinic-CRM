/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { serialize } from '@/lib/serialize';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

// GET /api/prescriptions
export async function GET() {
	const db = prisma as any;
	const prescriptions = await db.prescription.findMany({
		orderBy: { id: 'desc' },
		include: {
			patient: true,
			items: { include: { stock: true } },
		},
		take: 50,
	});
	return NextResponse.json(serialize({ prescriptions }));
}

// POST /api/prescriptions
// body: { phone: string, name: string, symptoms?: string, items: { medName: string, dosage?: string, quantity?: number }[] }
export async function POST(req: Request) {
	const body = await req.json().catch(() => ({}));
	const phone = String(body.phone ?? '').trim();
	const name = String(body.name ?? '').trim();
  const ageRaw = body.age;
  const age = Number.isFinite(Number(ageRaw)) ? Math.max(0, Math.floor(Number(ageRaw))) : undefined;
	const symptoms = body.symptoms ? String(body.symptoms) : null;
	const items: Array<{
		medName: string;
		dosage?: string;
		quantity?: number;
	}> = Array.isArray(body.items) ? body.items : [];

	if (!phone || !name)
		return NextResponse.json(
			{ error: 'name and phone required' },
			{ status: 400 }
		);
	if (items.length === 0)
		return NextResponse.json(
			{ error: 'at least one item required' },
			{ status: 400 }
		);

	// Use a transaction to create the prescription and adjust stock atomically
	const db = prisma as any;
	const created = await db.$transaction(async (tx: any) => {
		// Ensure patient exists
		const patient = await tx.patient.upsert({
			where: { phone },
			create: { phone, name, age },
			update: { name, age },
		});

		// Normalize and validate items
		const normalized = items
			.map((i) => ({
				medName: String(i.medName ?? '').trim(),
				dosage: i.dosage ? String(i.dosage) : undefined,
				quantity: Number.isFinite(i.quantity)
					? Math.max(1, Number(i.quantity))
					: 1,
			}))
			.filter((i) => i.medName.length > 0);

		if (normalized.length === 0)
			throw NextResponse.json(
				{ error: 'invalid items' },
				{ status: 400 }
			);

		// Fetch candidate stocks (case-insensitive)
		const names = Array.from(new Set(normalized.map((i) => i.medName)));
		const stocks = await tx.stock.findMany({
			where: {
				OR: names.map((n) => ({
					name: { equals: n, mode: 'insensitive' },
				})),
			},
		});

		// Create prescription with items, linking to stock when available
		const createdRx = await tx.prescription.create({
			data: {
				patientId: patient.id,
				symptoms: symptoms ?? undefined,
				items: {
					create: normalized.map((i) => {
						const found = (stocks as any[]).find(
							(s) =>
								s.name.toLowerCase() === i.medName.toLowerCase()
						);
						return {
							medName: i.medName,
							dosage: i.dosage,
							quantity: i.quantity,
							stockId: found?.id,
						};
					}),
				},
			},
			include: { patient: true, items: { include: { stock: true } } },
		});

		// Aggregate total quantities per stockId to decrement
		const totals = new Map<bigint | number, number>();
		for (const i of normalized) {
			const found = (stocks as any[]).find(
				(s) => s.name.toLowerCase() === i.medName.toLowerCase()
			);
			if (found?.id) {
				const key = found.id as bigint | number;
				totals.set(key, (totals.get(key) ?? 0) + i.quantity);
			}
		}

		// Decrement stock quantities; clamp to zero when insufficient
		for (const [stockId, total] of totals) {
			await tx.stock.updateMany({
				where: { id: stockId, quantity: { gte: total } },
				data: { quantity: { decrement: total } },
			});
			await tx.stock.updateMany({
				where: { id: stockId, quantity: { lt: total } },
				data: { quantity: 0 },
			});
		}

		return createdRx;
	});

	return NextResponse.json(serialize({ prescription: created }));
}
