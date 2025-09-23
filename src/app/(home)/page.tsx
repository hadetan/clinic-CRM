'use client';
import React, { useEffect, useState } from 'react';
import PrintLayout from '@/components/PrintLayout';

type StockItem = {
	id: string | number;
	name: string;
	quantity: number;
	lowStockThreshold: number;
	inStock: boolean;
	isLow: boolean;
};

type PrescItem = {
	medName: string;
	dosage?: string;
	quantity: number;
	stock?: StockItem | null;
};

export default function PrescriptionPage() {
	const [phone, setPhone] = useState('');
	const [name, setName] = useState('');
	const [age, setAge] = useState<number | ''>('');
	const [symptoms, setSymptoms] = useState('');
	const [items, setItems] = useState<PrescItem[]>([
		{ medName: '', quantity: 1 },
	]);
	const [stockQuery, setStockQuery] = useState('');
	const [stockOptions, setStockOptions] = useState<StockItem[]>([]);
	const [activeIdx, setActiveIdx] = useState<number | null>(null);
	const [loading, setLoading] = useState(false);
	const [prescNumberPreview, setPrescNumberPreview] = useState<number | null>(
		null
	);
	const [nextNumberPrediction, setNextNumberPrediction] = useState<
		number | null
	>(null);
	const [isSaved, setIsSaved] = useState(false);

	const refreshNextNumber = async () => {
		try {
			const res = await fetch('/api/prescriptions', {
				cache: 'no-store',
			});
			const data = await res.json();
			const list: Array<{ number?: number }> = Array.isArray(
				data.prescriptions
			)
				? data.prescriptions
				: [];
			const maxNum = list.reduce(
				(m: number, p: { number?: number }) =>
					typeof p.number === 'number' ? Math.max(m, p.number) : m,
				0
			);
			setNextNumberPrediction((maxNum || 0) + 1);
		} catch {
			// ignore prediction errors
		}
	};

	useEffect(() => {
		const t = setTimeout(async () => {
			if (!stockQuery || activeIdx === null) {
				setStockOptions([]);
				return;
			}
			const res = await fetch(
				`/api/stocks?q=${encodeURIComponent(stockQuery)}`,
				{ cache: 'no-store' }
			);
			const data = await res.json();
			setStockOptions(data.stocks ?? []);
		}, 200);
		return () => clearTimeout(t);
	}, [stockQuery, activeIdx]);

	useEffect(() => {
		refreshNextNumber();
	}, []);

	const onPhoneBlur = async () => {
		const p = phone.trim();
		if (!p) return;
		const res = await fetch(
			`/api/patients?phone=${encodeURIComponent(p)}`,
			{ cache: 'no-store' }
		);
		const data = await res.json();
		if (data.patient?.name) setName(data.patient.name);
		if (typeof data.patient?.age === 'number') setAge(data.patient.age);
	};

	const addItem = () =>
		setItems((arr) => [...arr, { medName: '', quantity: 1 }]);
	const removeItem = (idx: number) =>
		setItems((arr) => arr.filter((_, i) => i !== idx));
	const updateItem = (idx: number, patch: Partial<PrescItem>) =>
		setItems((arr) =>
			arr.map((it, i) => (i === idx ? { ...it, ...patch } : it))
		);

	const handleSelectMed = (idx: number, med: StockItem) => {
		updateItem(idx, { medName: med.name, stock: med });
		setStockQuery('');
		setActiveIdx(null);
	};

	const onPrint = async () => {
		if (!isSaved) {
			const num = await saveIfNeeded();
			if (!num) return;
			await new Promise<void>((r) => requestAnimationFrame(() => r()));
			await new Promise<void>((r) => requestAnimationFrame(() => r()));
		}
		window.print();
	};

	const clearForm = () => {
		setPhone('');
		setName('');
		setAge('');
		setSymptoms('');
		setItems([{ medName: '', quantity: 1 }]);
		setStockQuery('');
		setStockOptions([]);
		setPrescNumberPreview(null);
		setIsSaved(false);
		void refreshNextNumber();
	};

	const saveIfNeeded = async (): Promise<number | null> => {
		if (isSaved) return prescNumberPreview ?? null;
		setLoading(true);
		try {
			const payload = {
				phone: phone.trim(),
				name: name.trim(),
				age: age === '' ? undefined : Number(age),
				symptoms: symptoms.trim() || undefined,
				items: items
					.filter((i) => i.medName.trim().length > 0)
					.map(({ medName, dosage, quantity }) => ({
						medName,
						dosage,
						quantity,
					})),
			};
			const res = await fetch('/api/prescriptions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			if (!res.ok) return null;
			const data = await res.json();
			const num: number | null =
				typeof data?.prescription?.number === 'number'
					? data.prescription.number
					: null;
			if (num) setPrescNumberPreview(num);
			setIsSaved(true);
			return num;
		} catch {
			return null;
		} finally {
			setLoading(false);
		}
	};

	const onSave = async () => {
		await saveIfNeeded();
	};

	const isFormValid =
		phone.trim().length > 0 &&
		name.trim().length > 0 &&
		symptoms.trim().length > 0 &&
		items.some((i) => i.medName.trim().length > 0);

	return (
		<PrintLayout>
			<div className='max-w-3xl mx-auto w-full p-4 print:max-w-none print:w-auto print:p-0 print:mx-0'>
				<div className='flex items-center justify-between mb-4'>
					<h1 className='text-2xl font-semibold'>Prescription</h1>
					<div className='text-sm'>
						No.: {prescNumberPreview ?? nextNumberPrediction ?? '—'}
					</div>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
					<div>
						<label className='block text-sm font-medium'>
							Patient Phone
						</label>
						<input
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							onBlur={onPhoneBlur}
							className='mt-1 w-full border rounded px-3 py-2'
							placeholder='e.g., 9876543210'
						/>
					</div>
					<div>
						<label className='block text-sm font-medium'>
							Patient Name
						</label>
						<input
							value={name}
							onChange={(e) => setName(e.target.value)}
							className='mt-1 w-full border rounded px-3 py-2'
							placeholder='Patient name'
						/>
					</div>
					<div>
						<label className='block text-sm font-medium'>
							Patient Age
						</label>
						<input
							type='number'
							value={age}
							onChange={(e) => setAge(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value || '0', 10)))}
							className='mt-1 w-full border rounded px-3 py-2'
							placeholder='Age'
							min={0}
						/>
					</div>
				</div>

				<div className='mb-4'>
					<label className='block text-sm font-medium'>
						Symptoms
					</label>
					<textarea
						value={symptoms}
						onChange={(e) => setSymptoms(e.target.value)}
						className='mt-1 w-full border rounded px-3 py-2'
						rows={3}
						placeholder='Describe symptoms'
					/>
				</div>

				<div className='mb-4'>
					<div className='flex items-center justify-between mb-2'>
						<h2 className='text-lg font-medium'>Medications</h2>
						<button
							className='no-print text-sm px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 cursor-pointer'
							onClick={addItem}
						>
							+ Add
						</button>
					</div>
					<div className='space-y-3'>
						{items.map((it, idx) => (
							<div
								key={idx}
								className='grid grid-cols-1 md:grid-cols-12 gap-2 items-start'
							>
								<div className='md:col-span-5 relative'>
									<label className='block text-xs font-medium'>
										Medicine
									</label>
									<input
										value={it.medName}
										onChange={(e) => {
											updateItem(idx, {
												medName: e.target.value,
											});
											setStockQuery(e.target.value);
										}}
										onFocus={() => setActiveIdx(idx)}
										onBlur={() => {
											// Delay closing so click on menu can register
											setTimeout(
												() =>
													setActiveIdx((prev) =>
														prev === idx
															? null
															: prev
													),
												100
											);
										}}
										onKeyDown={(e) => {
											if (e.key === 'Escape')
												setActiveIdx(null);
										}}
										className='mt-1 w-full border rounded px-3 py-2'
										placeholder='Type to search...'
									/>
									{/* Stock status under the input */}
									{it.medName &&
										(() => {
											const scoped =
												activeIdx === idx
													? stockOptions
													: [];
											const opt =
												(scoped.find(
													(s) =>
														s.name.toLowerCase() ===
														it.medName.toLowerCase()
												) as StockItem | undefined) ||
												it.stock ||
												null;
											if (!opt) return null;
											if (
												!opt.inStock ||
												(typeof opt.quantity ===
													'number' &&
													opt.quantity <= 0)
											) {
												return (
													<div className='mt-1 text-xs text-red-600'>
														Not in stock
													</div>
												);
											}
											if (opt.isLow) {
												return (
													<div className='mt-1 text-xs text-amber-600'>
														Low on stock
													</div>
												);
											}
										})()}
									{activeIdx === idx &&
										stockQuery &&
										stockOptions.length > 0 && (
											<div className='absolute left-0 right-0 z-20 bg-white border rounded shadow mt-1 max-h-48 overflow-auto w-full'>
												{stockOptions.map((opt) => (
													<div
														key={String(opt.id)}
														className='px-3 py-2 hover:bg-gray-100 cursor-pointer'
														onMouseDown={() =>
															handleSelectMed(
																idx,
																opt
															)
														}
													>
														{opt.name}{' '}
														{opt.quantity <= 0 && (
															<span className='text-red-600'>
																(out)
															</span>
														)}
													</div>
												))}
											</div>
										)}
								</div>
								<div className='md:col-span-3'>
									<label className='block text-xs font-medium'>
										Dosage
									</label>
									<input
										value={it.dosage ?? ''}
										onChange={(e) =>
											updateItem(idx, {
												dosage: e.target.value,
											})
										}
										className='mt-1 w-full border rounded px-3 py-2'
										placeholder='e.g., 1 day, 1 night'
									/>
								</div>
								<div className='md:col-span-2'>
									<label className='block text-xs font-medium'>
										Qty
									</label>
									<input
										type='number'
										value={it.quantity}
										onChange={(e) =>
											updateItem(idx, {
												quantity: Math.max(
													1,
													parseInt(
														e.target.value || '1',
														10
													)
												),
											})
										}
										className='mt-1 w-full border rounded px-3 py-2'
										min={1}
									/>
								</div>
								<div className='md:col-span-2 flex'>
									<button
										className='no-print inline-flex items-center px-2 py-1 text-xs font-medium border border-red-300 text-red-600 rounded hover:bg-red-50 hover:border-red-400 cursor-pointer'
										onClick={() => removeItem(idx)}
									>
										✕
									</button>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className='no-print flex gap-2 justify-end'>
					<button
						onClick={onPrint}
						disabled={loading || !isFormValid}
						className='px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed'
					>
						Print
					</button>
					<button
						onClick={onSave}
						disabled={loading || isSaved || !isFormValid}
						className='px-4 py-2 rounded bg-black text-white hover:bg-black/90 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed'
					>
						{loading ? 'Saving…' : 'Save'}
					</button>
					<button
						type='button'
						onClick={clearForm}
						className='px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 cursor-pointer'
					>
						Clear
					</button>
				</div>

				{/* Printable section (hidden on screen, only for print) */}
				<div
					id='printable'
					className='hidden print:block mt-8 border-t pt-4 print:mt-0 print:border-0 print:pt-0'
				>
					<div>
						{/* Header */}
						<div className='flex items-start justify-between mb-2'>
							<div>
								<div className='font-semibold'>
									Patient: {name || '—'}
								</div>
								<div className='text-sm'>
									Phone: {phone || '—'}
								</div>
								<div className='text-sm'>
									Age: {age === '' ? '—' : age}
								</div>
							</div>
							<div className='text-right text-sm'>
								<div>
									Prescription No.:{' '}
									{prescNumberPreview ??
										nextNumberPrediction ??
										'—'}
								</div>
								<div>
									Date: {new Date().toLocaleDateString()}
								</div>
							</div>
						</div>
						<hr className='my-2' />

						{/* Symptoms */}
						<div className='mb-2 min-h-[200px]'>
							<div className='font-semibold mb-1'>Symptoms</div>
							<div className='whitespace-pre-wrap min-h-6'>
								{symptoms || '—'}
							</div>
						</div>

						{/* Medications Table */}
						<div className='mb-4'>
							<div className='font-semibold mb-1'>
								Medications
							</div>
							<table className='w-full border-collapse'>
								<thead>
									<tr className='text-left'>
										<th className='border-t border-b py-1 pr-2'>
											#
										</th>
										<th className='border-t border-b py-1 pr-2'>
											Medicine
										</th>
										<th className='border-t border-b py-1 pr-2'>
											Dosage
										</th>
										<th className='border-t border-b py-1 pr-2'>
											Qty
										</th>
									</tr>
								</thead>
								<tbody>
									{items
										.filter((i) => i.medName)
										.map((i, idx) => (
											<tr key={idx} className='align-top'>
												<td className='py-1 pr-2'>
													{idx + 1}
												</td>
												<td className='py-1 pr-2 font-medium'>
													{i.medName}
												</td>
												<td className='py-1 pr-2'>
													{i.dosage || '—'}
												</td>
												<td className='py-1 pr-2'>
													{i.quantity || '—'}
												</td>
											</tr>
										))}
									{items.filter((i) => i.medName).length ===
										0 && (
										<tr>
											<td
												colSpan={4}
												className='py-2 text-sm text-gray-600'
											>
												—
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</div>
					{/* Footer / Signature at bottom of page when printing */}
					<div className='flex justify-between pt-6 print:mt-auto'>
						<div className='text-sm text-gray-700'>
							Doctor signature: _______________________
						</div>
					</div>
				</div>
			</div>
		</PrintLayout>
	);
}
