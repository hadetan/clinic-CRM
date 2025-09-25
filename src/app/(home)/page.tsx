'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import PrintLayout from '@/components/PrintLayout';
import { useReactToPrint } from 'react-to-print';
import { todayPrintDate } from '@/lib/date';
import PrescriptionForm, { PrescItem, StockItem } from '@/components/prescriptionForm';

export default function PrescriptionPage() {
	const [phone, setPhone] = useState('');
	const [name, setName] = useState('');
	const [age, setAge] = useState<number | ''>('');
	const [symptoms, setSymptoms] = useState('');
	const [items, setItems] = useState<PrescItem[]>([
		{ medName: '', quantity: 1, prescribedAs: 'UNITS' },
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
		setItems((arr) => [
			...arr,
			{ medName: '', quantity: 1, prescribedAs: 'UNITS' },
		]);
	const removeItem = (idx: number) =>
		setItems((arr) => arr.filter((_, i) => i !== idx));
	const updateItem = (idx: number, patch: Partial<PrescItem>) =>
		setItems((arr) =>
			arr.map((it, i) => (i === idx ? { ...it, ...patch } : it))
		);

	const handleSelectMed = (idx: number, med: StockItem) => {
		updateItem(idx, {
			medName: med.name,
			stock: med,
			prescribedAs: 'UNITS', // Default to units for divisible items
			unitsPerPack: med.unitsPerPack,
		});
		setStockQuery('');
		setActiveIdx(null);
	};

	const printRef = useRef<HTMLDivElement | null>(null);

	const pageStyle = `@page { margin: 10mm 12mm; } body { -webkit-print-color-adjust: exact; font-family: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif; font-size:12pt; line-height:1.25; }`;

	const reactToPrint = useReactToPrint({
		contentRef: printRef,
		pageStyle,
		documentTitle: prescNumberPreview
			? `Prescription-${prescNumberPreview}`
			: nextNumberPrediction
			? `Prescription-${nextNumberPrediction}`
			: 'Prescription',
		preserveAfterPrint: false,
	});

	const onPrint = async () => {
		if (!isSaved) {
			const num = await saveIfNeeded();
			if (!num) return;
			await new Promise<void>((r) => requestAnimationFrame(() => r()));
			await new Promise<void>((r) => requestAnimationFrame(() => r()));
		}
		reactToPrint();
	};

	const clearForm = () => {
		setPhone('');
		setName('');
		setAge('');
		setSymptoms('');
		setItems([{ medName: '', quantity: 1, prescribedAs: 'UNITS' }]);
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
					.map(
						({
							medName,
							dosage,
							quantity,
							stock,
							prescribedAs,
							unitsPerPack,
						}) => ({
							medName,
							dosage,
							quantity,
							stockId: stock?.id,
							prescribedAs:
								prescribedAs ||
								(stock?.isDivisible ? 'UNITS' : 'PACKS'),
							unitsPerPack:
								unitsPerPack || stock?.unitsPerPack || 1,
						})
					),
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

	const todayDateString = useMemo(() => todayPrintDate(), []);

	return (
		<PrintLayout>
			<div className='max-w-3xl mx-auto w-full p-4 print:max-w-none print:w-auto print:p-0 print:mx-0'>
				<PrescriptionForm
					activeIdx={activeIdx}
					addItem={addItem}
					age={age}
					clearForm={clearForm}
					handleSelectMed={handleSelectMed}
					isFormValid={isFormValid}
					isSaved={isSaved}
					items={items}
					loading={loading}
					name={name}
					nextNumberPrediction={nextNumberPrediction}
					onPhoneBlur={onPhoneBlur}
					onPrint={onPrint}
					onSave={onSave}
					phone={phone}
					prescNumberPreview={prescNumberPreview}
					removeItem={removeItem}
					setActiveIdx={setActiveIdx}
					setAge={setAge}
					setName={setName}
					setPhone={setPhone}
					setStockQuery={setStockQuery}
					setSymptoms={setSymptoms}
					stockOptions={stockOptions}
					stockQuery={stockQuery}
					symptoms={symptoms}
					updateItem={updateItem}
				/>

				{/* Printable section (hidden on screen, only for print) */}
				<div
					ref={printRef}
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
								<div>Date: {todayDateString}</div>
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
