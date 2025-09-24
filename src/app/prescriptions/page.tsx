'use client';
import React, { useEffect, useState } from 'react';
import PrintLayout from '@/components/PrintLayout';

type Item = {
	medName: string;
	dosage?: string | null;
	quantity: number;
	stock?: { name: string; dispensingUnit?: string; unitsPerPack?: number } | null;
	prescribedAs?: string;
	unitsPerPack?: number;
};
type Patient = { name: string; phone: string; age?: number | null };
type Prescription = {
	id: number | string;
	number: number;
	patient: Patient;
	items: Item[];
	symptoms?: string | null;
	createdAt?: string;
};

export default function PrescriptionsPage() {
	const [list, setList] = useState<Prescription[]>([]);
	const [active, setActive] = useState<Prescription | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const load = async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch('/api/prescriptions', {
				cache: 'no-store',
			});
			const data = await res.json();
			setList(data.prescriptions ?? []);
		} catch {
			setError('Failed to load prescriptions');
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => {
		load();
	}, []);

	return (
		<div className='max-w-4xl mx-auto p-4'>
			<h1 className='text-2xl font-semibold mb-4'>All Prescriptions</h1>
			{error && (
				<div role='alert' className='mb-4 text-red-600 text-sm'>
					{error}
				</div>
			)}
			{loading && (
				<div className='mb-4 text-sm text-gray-500'>Loading…</div>
			)}
			<div className='grid gap-3'>
				{list.map((p) => (
					<button
						key={String(p.id)}
						className='text-left border rounded px-4 py-3 hover:bg-gray-50 cursor-pointer'
						onClick={() => setActive(p)}
					>
						<div className='flex items-center justify-between'>
							<div className='font-medium'>#{p.number}</div>
							<div className='text-sm text-gray-500'>
								{p.patient.phone}
							</div>
						</div>
						<div className='text-sm'>
							{p.patient.name}
							{typeof p.patient.age === 'number' && (
								<span className='text-gray-500'> · Age: {p.patient.age}</span>
							)}
						</div>
					</button>
				))}
			</div>

			{active && (
				<PrintLayout>
					<div className='max-w-3xl mx-auto w-full p-4 print:max-w-none print:w-auto print:p-0 print:mx-0'>
						{/* On-screen modal view */}
						<div className='no-print fixed inset-0 bg-black/30 flex items-center justify-center'>
							<div className='bg-white rounded shadow p-4 w-full max-w-2xl'>
								<div className='flex items-center justify-between mb-3'>
									<h3 className='font-medium'>
										Prescription #{active.number}
									</h3>
									<button className='hover:text-black/70 cursor-pointer' onClick={() => setActive(null)}>✕</button>
								</div>
								<div className='flex items-center justify-between'>
									<div>
										<div className='font-medium'>
											Patient: {active.patient.name}
										</div>
										<div className='text-sm'>
											Phone: {active.patient.phone}
										</div>
										{typeof active.patient.age === 'number' && (
											<div className='text-sm'>
												Age: {active.patient.age}
											</div>
										)}
									</div>
									<div>No.: {active.number}</div>
								</div>
								<hr className='my-3' />
								<div className='mb-3'>
									<div className='font-medium mb-1'>
										Symptoms
									</div>
									<div className='whitespace-pre-wrap min-h-6'>
										{active.symptoms ?? '—'}
									</div>
								</div>
								<div>
									<div className='font-medium mb-1'>
										Medications
									</div>
									<ol className='list-decimal list-inside space-y-1'>
										{active.items.map((i, idx) => {
											const formatQuantity = () => {
												if (i.prescribedAs === 'PACKS' && i.unitsPerPack) {
													const dispensingUnit = i.stock?.dispensingUnit?.toLowerCase() || 'unit';
													const totalUnits = i.quantity * i.unitsPerPack;
													return ` × ${i.quantity} pack${i.quantity !== 1 ? 's' : ''} (${totalUnits} ${dispensingUnit}${totalUnits !== 1 ? 's' : ''})`;
												} else if (i.prescribedAs === 'UNITS' && i.stock?.dispensingUnit) {
													const dispensingUnit = i.stock.dispensingUnit.toLowerCase();
													return ` × ${i.quantity} ${dispensingUnit}${i.quantity !== 1 ? 's' : ''}`;
												} else {
													return i.quantity ? ` × ${i.quantity}` : '';
												}
											};
											
											return (
												<li key={idx}>
													<span className='font-medium'>
														{i.medName}
													</span>
													{i.dosage ? ` — ${i.dosage}` : ''}
													{formatQuantity()}
												</li>
											);
										})}
									</ol>
								</div>
								<div className='mt-4 flex justify-end'>
									<button
										className='px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 cursor-pointer'
										onClick={() => window.print()}
									>
										Print
									</button>
								</div>
							</div>
						</div>

						{/* Printable section (hidden on screen, only for print) */}
						<div
							id='printable-prescription'
							className='hidden print:block mt-8 border-t pt-4 print:mt-0 print:border-0 print:pt-0'
						>
							<div className='flex items-start justify-between mb-2'>
								<div>
									<div className='font-semibold'>
										Patient: {active.patient.name || '—'}
									</div>
									<div className='text-sm'>
										Phone: {active.patient.phone || '—'}
									</div>
									<div className='text-sm'>
										Age: {typeof active.patient.age === 'number' ? active.patient.age : '—'}
									</div>
								</div>
								<div className='text-right text-sm'>
									<div>Prescription No.: {active.number}</div>
									<div>Date: {active.createdAt ? new Date(active.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}</div>
								</div>
							</div>
							<hr className='my-2' />

							<div className='mb-2 min-h-[200px]'>
								<div className='font-semibold mb-1'>Symptoms</div>
								<div className='whitespace-pre-wrap min-h-6'>
									{active.symptoms ?? '—'}
								</div>
							</div>

							<div className='mb-4'>
								<div className='font-semibold mb-1'>Medications</div>
								<table className='w-full border-collapse'>
									<thead>
										<tr className='text-left'>
											<th className='border-t border-b py-1 pr-2'>#</th>
											<th className='border-t border-b py-1 pr-2'>Medicine</th>
											<th className='border-t border-b py-1 pr-2'>Dosage</th>
											<th className='border-t border-b py-1 pr-2'>Quantity</th>
										</tr>
									</thead>
									<tbody>
										{active.items.map((i, idx) => {
											const formatQuantity = () => {
												if (i.prescribedAs === 'PACKS' && i.unitsPerPack) {
													const dispensingUnit = i.stock?.dispensingUnit?.toLowerCase() || 'unit';
													const totalUnits = i.quantity * i.unitsPerPack;
													return `${i.quantity} pack${i.quantity !== 1 ? 's' : ''} (${totalUnits} ${dispensingUnit}${totalUnits !== 1 ? 's' : ''})`;
												} else if (i.prescribedAs === 'UNITS' && i.stock?.dispensingUnit) {
													const dispensingUnit = i.stock.dispensingUnit.toLowerCase();
													return `${i.quantity} ${dispensingUnit}${i.quantity !== 1 ? 's' : ''}`;
												} else {
													return i.quantity || '—';
												}
											};
											
											return (
												<tr key={idx} className='align-top'>
													<td className='py-1 pr-2'>{idx + 1}</td>
													<td className='py-1 pr-2 font-medium'>{i.medName}</td>
													<td className='py-1 pr-2'>{i.dosage || '—'}</td>
													<td className='py-1 pr-2'>{formatQuantity()}</td>
												</tr>
											);
										})}
										{active.items.length === 0 && (
											<tr>
												<td colSpan={4} className='py-2 text-sm text-gray-600'>—</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>

							<div className='flex justify-between pt-6 print:mt-auto'>
								<div className='text-sm text-gray-700'>Doctor signature: _______________________</div>
							</div>
						</div>
					</div>
				</PrintLayout>
			)}
		</div>
	);
}
