import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { serialize } from '@/lib/serialize';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

// GET /api/patients?phone=...
export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const phone = searchParams.get('phone')?.trim();
	if (!phone)
		return NextResponse.json({ error: 'phone required' }, { status: 400 });

	// Use Prisma client; cast to allow model delegate access in strict TS
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = prisma as any;
	const patient = await db.patient.findUnique({ where: { phone } });
	return NextResponse.json({ patient: serialize(patient) });
}

// POST /api/patients  { phone, name }
export async function POST(req: Request) {
	const body = await req.json().catch(() => ({}));
	const phone = String(body.phone ?? '').trim();
	const name = String(body.name ?? '').trim();
  const ageRaw = body.age;
  const age = Number.isFinite(Number(ageRaw)) ? Math.max(0, Math.floor(Number(ageRaw))) : undefined;
	if (!phone || !name)
		return NextResponse.json(
			{ error: 'name and phone required' },
			{ status: 400 }
		);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = prisma as any;
	const patient = await db.patient.upsert({
		where: { phone },
		create: { phone, name, age },
		update: { name, age },
	});
	return NextResponse.json({ patient: serialize(patient) });
}
