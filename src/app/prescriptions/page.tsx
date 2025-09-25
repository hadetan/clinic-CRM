'use client';
import React, { useEffect, useState, useRef } from 'react';
import PrintLayout from '@/components/PrintLayout';
// react-to-print default export typing workaround
import { useReactToPrint } from 'react-to-print';

type Item = {
	medName: string;
	dosage?: string | null;
	quantity: number;
	stock?: {
		name: string;
		dispensingUnit?: string;
		unitsPerPack?: number;
	} | null;
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
	const printRef = useRef<HTMLDivElement | null>(null);

	// Optional page-specific print styles for react-to-print
	const pageStyle = `@page { margin: 10mm 12mm; } body { -webkit-print-color-adjust: exact; font-family: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif; font-size:12pt; line-height:1.25; }`;

	const handlePrint = useReactToPrint({
		contentRef: printRef,
		pageStyle,
		preserveAfterPrint: false,
		documentTitle: active ? `Prescription-${active.number}` : 'Prescription',
	});

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

	const fmtDate = (d?: string) => {
		if (!d)
			return new Date().toLocaleDateString(undefined, {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
			});
		const dt = new Date(d);
		return dt.toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});
	};

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
			<h1 className='text-3xl font-bold tracking-tight text-gray-900 mb-6'>
				All Prescriptions
			</h1>
			{error && (
				<div role='alert' className='mb-4 text-red-600 text-sm'>
					{error}
				</div>
			)}
			{loading && (
				<div className='mb-4 text-sm text-gray-500'>Loading…</div>
			)}
			<div className='space-y-4'>
				{list.map((p) => {
					const age =
						typeof p.patient.age === 'number'
							? p.patient.age
							: null;
					const initials = (p.patient.name || '?')
						.charAt(0)
						.toUpperCase();
					return (
						<button
							key={String(p.id)}
							onClick={() => setActive(p)}
							className='w-full text-left bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow duration-300 cursor-pointer'
						>
							<div className='flex items-center justify-between'>
								<div className='flex items-center space-x-4'>
									<div className='flex-shrink-0 h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center'>
										<span className='text-xl font-bold text-indigo-600'>
											{initials}
										</span>
									</div>
									<div>
										<p className='text-lg font-semibold text-gray-900'>
											{p.patient.name}{' '}
											{age !== null && (
												<span className='text-sm font-normal text-gray-500'>
													(Age: {age})
												</span>
											)}
										</p>
										<p className='text-sm text-gray-500'>
											ID: #{p.number}
										</p>
									</div>
								</div>
								<div className='flex items-center space-x-10'>
									<div className='text-right'>
										<p className='text-sm text-gray-500'>
											Date
										</p>
										<p className='font-medium text-gray-900'>
											{fmtDate(p.createdAt)}
										</p>
									</div>
									<div className='text-right'>
										<p className='text-sm text-gray-500'>
											Phone
										</p>
										<p className='font-medium text-gray-900'>
											{p.patient.phone}
										</p>
									</div>
									<svg
										className='w-5 h-5 text-gray-400'
										fill='none'
										stroke='currentColor'
										strokeWidth='2'
										viewBox='0 0 24 24'
										strokeLinecap='round'
										strokeLinejoin='round'
									>
										<path d='M9 18l6-6-6-6' />
									</svg>
								</div>
							</div>
						</button>
					);
				})}
			</div>

			{active && (
				<PrintLayout>
					<div className='max-w-3xl mx-auto w-full p-4 print:max-w-none print:w-auto print:p-0 print:mx-0'>
						{/* On-screen modal view */}
						<div className='no-print fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 py-8 overflow-y-auto'>
							<div className='bg-white rounded-lg shadow-2xl w-full max-w-2xl flex flex-col'>
								{/* Header */}
								<div className='flex items-start justify-between p-6 border-b border-gray-200'>
									<div className='flex items-start space-x-4'>
										<div className='h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center'>
											<span className='text-indigo-600 font-semibold text-lg'>
												Rx
											</span>
										</div>
										<div>
											<h2 className='text-xl font-bold text-gray-900'>
												Prescription #{active.number}
											</h2>
											<p className='text-sm text-gray-500'>
												Created on:{' '}
												{active.createdAt
													? fmtDate(active.createdAt)
													: fmtDate()}
											</p>
										</div>
									</div>
									<button
										className='text-gray-400 hover:text-gray-600 transition'
										onClick={() => setActive(null)}
										aria-label='Close'
									>
										<svg
											className='w-5 h-5'
											viewBox='0 0 20 20'
											fill='none'
											stroke='currentColor'
											strokeWidth='2'
											strokeLinecap='round'
											strokeLinejoin='round'
										>
											<path d='M4 4l12 12M16 4L4 16' />
										</svg>
									</button>
								</div>

								{/* Body scrollable */}
								<div className='flex-1 overflow-y-auto'>
									{/* Patient Details */}
									<div className='p-6'>
										<h3 className='text-lg font-semibold text-gray-900 mb-4'>
											Patient Details
										</h3>
										<div className='grid grid-cols-1 md:grid-cols-3 gap-6 text-sm'>
											<div className='space-y-1'>
												<p className='text-gray-500'>
													Name
												</p>
												<p className='font-medium text-gray-900'>
													{active.patient.name}
												</p>
											</div>
											<div className='space-y-1'>
												<p className='text-gray-500'>
													Phone
												</p>
												<p className='font-medium text-gray-900'>
													{active.patient.phone}
												</p>
											</div>
											<div className='space-y-1'>
												<p className='text-gray-500'>
													Age
												</p>
												<p className='font-medium text-gray-900'>
													{typeof active.patient
														.age === 'number'
														? `${active.patient.age} years`
														: '—'}
												</p>
											</div>
										</div>
									</div>
									<hr className='border-gray-200' />

									{/* Symptoms */}
									<div className='p-6'>
										<h3 className='text-lg font-semibold text-gray-900 mb-4'>
											Symptoms
										</h3>
										<p className='text-sm text-gray-700 whitespace-pre-wrap min-h-6'>
											{active.symptoms || '—'}
										</p>
									</div>
									<hr className='border-gray-200' />

									{/* Medications */}
									<div className='p-6'>
										<h3 className='text-lg font-semibold text-gray-900 mb-4'>
											Medications
										</h3>
										<div className='overflow-x-auto rounded-md border border-gray-200'>
											<table className='w-full text-left text-sm'>
												<thead className='bg-gray-50 text-gray-600 uppercase text-xs tracking-wide'>
													<tr>
														<th className='p-3 font-semibold'>
															Medication
														</th>
														<th className='p-3 font-semibold'>
															Dosage
														</th>
														<th className='p-3 font-semibold text-right'>
															Quantity
														</th>
													</tr>
												</thead>
												<tbody className='divide-y divide-gray-100'>
													{active.items.map(
														(i, idx) => {
															const formatQuantity =
																() => {
																	if (
																		i.prescribedAs ===
																			'PACKS' &&
																		i.unitsPerPack
																	) {
																		const dispensingUnit =
																			i.stock?.dispensingUnit?.toLowerCase() ||
																			'unit';
																		const totalUnits =
																			i.quantity *
																			i.unitsPerPack;
																		return `${
																			i.quantity
																		} pack${
																			i.quantity !==
																			1
																				? 's'
																				: ''
																		} (${totalUnits} ${dispensingUnit}${
																			totalUnits !==
																			1
																				? 's'
																				: ''
																		})`;
																	} else if (
																		i.prescribedAs ===
																			'UNITS' &&
																		i.stock
																			?.dispensingUnit
																	) {
																		const dispensingUnit =
																			i.stock.dispensingUnit.toLowerCase();
																		return `${
																			i.quantity
																		} ${dispensingUnit}${
																			i.quantity !==
																			1
																				? 's'
																				: ''
																		}`;
																	} else {
																		return (
																			i.quantity ||
																			'—'
																		);
																	}
																};
															return (
																<tr
																	key={idx}
																	className='bg-white'
																>
																	<td className='p-3 font-medium text-gray-900'>
																		{
																			i.medName
																		}
																	</td>
																	<td className='p-3 text-gray-600'>
																		{i.dosage ||
																			'—'}
																	</td>
																	<td className='p-3 text-right font-medium text-gray-900'>
																		{formatQuantity()}
																	</td>
																</tr>
															);
														}
													)}
													{active.items.length ===
														0 && (
														<tr>
															<td
																colSpan={3}
																className='p-4 text-center text-gray-500'
															>
																No items
															</td>
														</tr>
													)}
												</tbody>
											</table>
										</div>
									</div>
								</div>

								{/* Footer */}
								<div className='no-print flex items-center justify-end p-6 bg-gray-50 rounded-b-lg border-t border-gray-200'>
									<button
										type='button'
										onClick={handlePrint}
										className='px-5 py-2.5 rounded-md bg-gray-200 text-sm font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer'
									>
										Print
									</button>
								</div>
						</div>
					</div>

					{/* Hidden print-only content */}
					<div
						ref={printRef}
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
