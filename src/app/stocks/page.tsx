'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';

type Stock = {
	id: string | number;
	name: string;
	quantity: number;
	lowStockThreshold: number;
	inStock: boolean;
	isLow: boolean;
	updatedAt?: string;
	isDivisible: boolean;
	dispensingUnit: string;
	unitsPerPack: number;
};

export default function StocksPage() {
	const [stocks, setStocks] = useState<Stock[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showModal, setShowModal] = useState(false);
	const [name, setName] = useState('');
	const [amount, setAmount] = useState<number>(0);
	const [low, setLow] = useState<number | ''>('');
	const [isDivisible, setIsDivisible] = useState(true);
	const [dispensingUnit, setDispensingUnit] = useState('TABLET');
	const [unitsPerPack, setUnitsPerPack] = useState<number>(1);
	
	const [q, setQ] = useState('');
	const [options, setOptions] = useState<Stock[]>([]);
	const [hideThreshold, setHideThreshold] = useState(false);
	const nameInputRef = useRef<HTMLInputElement | null>(null);
	const [dropdownWidth, setDropdownWidth] = useState<number | undefined>();

	const resetModalForm = () => {
		setName('');
		setAmount(0);
		setLow('');
		setIsDivisible(true);
		setDispensingUnit('TABLET');
		setUnitsPerPack(1);
		setQ('');
		setOptions([]);
		setHideThreshold(false);
	};

	const load = async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch('/api/stocks', { cache: 'no-store' });
			const data = await res.json();
			setStocks(data.stocks ?? []);
		} catch {
			setError('Failed to load stocks');
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => {
		load();
	}, []);

	useEffect(() => {
		const t = setTimeout(async () => {
			if (!q) return setOptions([]);
			const res = await fetch(`/api/stocks?q=${encodeURIComponent(q)}`, {
				cache: 'no-store',
			});
			const data = await res.json();
			setOptions(data.stocks ?? []);
		}, 200);
		return () => clearTimeout(t);
	}, [q]);

	useEffect(() => {
		const updateWidth = () => {
			if (nameInputRef.current) {
				setDropdownWidth(nameInputRef.current.offsetWidth);
			}
		};
		updateWidth();
		window.addEventListener('resize', updateWidth);
		return () => window.removeEventListener('resize', updateWidth);
	}, [showModal]);

	useEffect(() => {
		const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
		const exists = stocks.some((s) => norm(s.name) === norm(name));
		setHideThreshold(exists);
		if (exists) setLow('');
	}, [name, stocks]);

	const lowStocks = useMemo(() => stocks.filter((s) => s.isLow), [stocks]);
	const outStocks = useMemo(() => stocks.filter((s) => !s.inStock), [stocks]);
	const inStocks = useMemo(
		() => stocks.filter((s) => s.inStock && !s.isLow),
		[stocks]
	);

	const fmtDate = (d?: string) => {
		if (!d) return '—';
		const dt = new Date(d);
		if (Number.isNaN(dt.getTime())) return '—';
		return Intl.DateTimeFormat(undefined, {
			month: 'numeric',
			day: 'numeric',
			year: 'numeric',
		}).format(dt);
	};

	const StatusBadge = ({ s }: { s: Stock }) => {
		const variant = !s.inStock ? 'out' : s.isLow ? 'low' : 'in';
		const styles =
			variant === 'out'
				? 'bg-red-100 text-red-700'
				: variant === 'low'
				? 'bg-amber-100 text-amber-700'
				: 'bg-slate-900 text-white';
		const label =
			variant === 'out'
				? 'Out of Stock'
				: variant === 'low'
				? 'Low Stock'
				: 'In Stock';
		return (
			<span
				className={`text-xs px-2.5 py-1 rounded-full font-medium ${styles}`}
			>
				{label}
			</span>
		);
	};

	const SectionHeader = ({
		color,
		icon,
		title,
		count,
	}: {
		color: string;
		icon: React.ReactNode;
		title: string;
		count: number;
	}) => (
		<div className='flex items-center gap-2 text-lg font-semibold mb-3'>
			<span
				className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${color}`}
			>
				{icon}
			</span>
			<span>
				{title}{' '}
				<span className='font-normal text-gray-500'>({count})</span>
			</span>
		</div>
	);

	const Card = ({ s }: { s: Stock }) => (
		<div className='rounded-lg border bg-white p-4 shadow-sm'>
			<div className='flex items-start justify-between'>
				<div className='font-medium'>{s.name}</div>
				<StatusBadge s={s} />
			</div>
			<div className='mt-2 flex items-end justify-between text-sm text-gray-600'>
				<div className='space-y-1'>
					<div>
						<span className='text-gray-700'>Stock:</span>{' '}
						{s.quantity} {s.quantity === 1 ? 'pack' : 'packs'}
					</div>
					<div>
						<span className='text-gray-700'>Units per pack:</span>{' '}
						{s.unitsPerPack} {s.dispensingUnit.toLowerCase()}
						{s.unitsPerPack === 1 ? '' : 's'}
					</div>
					<div>
						<span className='text-gray-700'>Type:</span>{' '}
						{s.isDivisible ? 'Divisible' : 'Indivisible'}
					</div>
					<div>
						<span className='text-gray-700'>
							Low stock threshold:
						</span>{' '}
						{s.lowStockThreshold}
					</div>
				</div>
				<div className='text-right text-xs text-gray-500'>
					Updated: {fmtDate(s.updatedAt)}
				</div>
			</div>
		</div>
	);

	const submit = async () => {
		if (!name.trim() || !amount) return;
		const res = await fetch('/api/stocks', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				name: name.trim(),
				amount,
				lowStockThreshold: low === '' ? undefined : Number(low),
				isDivisible,
				dispensingUnit,
				unitsPerPack: Math.max(1, unitsPerPack),
			}),
		});
		if (res.ok) {
			setShowModal(false);
			resetModalForm();
			await load();
		}
	};

	return (
		<div className='max-w-5xl mx-auto p-6'>
			<div className='flex items-center justify-between mb-6'>
				<h1 className='text-3xl font-semibold'>Stock Management</h1>
				<button
					className='inline-flex items-center gap-2 px-4 py-2 rounded-md bg-slate-900 text-white shadow-sm hover:bg-slate-800 cursor-pointer'
					onClick={() => {
						resetModalForm();
						setShowModal(true);
					}}
				>
					<span className='inline-flex items-center justify-center w-5 h-5 rounded bg-white/10'>
						+
					</span>
					Add/Update Stock
				</button>
			</div>

			{error && (
				<div role='alert' className='mb-4 text-red-600 text-sm'>
					{error}
				</div>
			)}

			<section className='mb-10'>
				<SectionHeader
					color='text-red-600'
					icon={
						<svg
							viewBox='0 0 24 24'
							className='w-5 h-5 fill-current'
						>
							<path
								d='M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v5m0 4h.01'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
								fill='none'
							/>
						</svg>
					}
					title='Out of Stock'
					count={outStocks.length}
				/>
				<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
					{outStocks.length === 0 ? (
						<div className='text-sm text-gray-500'>None</div>
					) : (
						outStocks.map((s) => <Card key={String(s.id)} s={s} />)
					)}
				</div>
			</section>

			<section className='mb-10'>
				<SectionHeader
					color='text-amber-600'
					icon={
						<svg
							viewBox='0 0 24 24'
							className='w-5 h-5 fill-current'
						>
							<path d='M12 2a1 1 0 01.894.553l8 16A1 1 0 0120 20H4a1 1 0 01-.894-1.447l8-16A1 1 0 0112 2zm0 5a1 1 0 00-1 1v5a1 1 0 102 0V8a1 1 0 00-1-1zm0 8a1.5 1.5 0 100 3 1.5 1.5 0 000-3z' />
						</svg>
					}
					title='Low Stock'
					count={lowStocks.length}
				/>
				<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
					{lowStocks.length === 0 ? (
						<div className='text-sm text-gray-500'>None</div>
					) : (
						lowStocks.map((s) => <Card key={String(s.id)} s={s} />)
					)}
				</div>
			</section>

			<section>
				<SectionHeader
					color='text-emerald-600'
					icon={
						<svg
							viewBox='0 0 24 24'
							className='w-5 h-5 fill-current'
						>
							<path
								d='M9 12l2 2 4-4'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
								fill='none'
							/>
							<circle
								cx='12'
								cy='12'
								r='9'
								stroke='currentColor'
								strokeWidth='2'
								fill='none'
							/>
						</svg>
					}
					title='In Stock'
					count={inStocks.length}
				/>
				<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
					{inStocks.length === 0 ? (
						<div className='text-sm text-gray-500'>None</div>
					) : (
						inStocks.map((s) => <Card key={String(s.id)} s={s} />)
					)}
				</div>
			</section>

			{showModal && (
				<div className='fixed inset-0 bg-black/30 flex items-center justify-center'>
					<div className='bg-white rounded shadow p-4 w-full max-w-md'>
						<div className='flex items-center justify-between mb-3'>
							<h3 className='font-medium'>Add / Update Stock</h3>
							<button
								className='cursor-pointer hover:text-black/70'
								onClick={() => {
									resetModalForm();
									setShowModal(false);
								}}
							>
								✕
							</button>
						</div>
						<div className='space-y-3'>
							<div className='relative'>
								<label className='block text-sm font-medium'>
									Name
								</label>
								<input
									ref={nameInputRef}
									value={name}
									onChange={(e) => {
										setName(e.target.value);
										setQ(e.target.value);
									}}
									className='mt-1 w-full border rounded px-3 py-2'
									placeholder='Medicine name'
								/>
								{q && options.length > 0 && (
									<div className='absolute left-0 z-50 bg-white border rounded shadow mt-1 max-h-56 overflow-auto' style={{ width: dropdownWidth }}>
										{options.map((opt) => (
											<div
												key={String(opt.id)}
												className='px-3 py-2 hover:bg-gray-100 cursor-pointer'
												onClick={() => {
													setName(opt.name);
													setQ('');
													setOptions([]);
													// Existence will also be handled by the name watcher effect
												}}
											>
												{opt.name}
											</div>
										))}
									</div>
								)}
							</div>
							<div>
								<label className='block text-sm font-medium'>
									Quantity
								</label>
								<input
									type='number'
									value={amount}
									onChange={(e) =>
										setAmount(
											parseInt(e.target.value || '0', 10)
										)
									}
									className='mt-1 w-full border rounded px-3 py-2'
								/>
							</div>
							{!hideThreshold && (
								<>
									<div>
										<label className='block text-sm font-medium'>
											Dispensing Unit
										</label>
										<select
											value={dispensingUnit}
											onChange={(e) => setDispensingUnit(e.target.value)}
											className='mt-1 w-full border rounded px-3 py-2'
										>
											<option value='TABLET'>Tablet</option>
											<option value='CAPSULE'>Capsule</option>
											<option value='BOTTLE'>Bottle</option>
											<option value='VIAL'>Vial</option>
											<option value='ML'>ML</option>
											<option value='MG'>MG</option>
											<option value='SACHET'>Sachet</option>
											<option value='TUBE'>Tube</option>
											<option value='INJECTION'>Injection</option>
											<option value='OTHER'>Other</option>
										</select>
									</div>
									<div>
										<label className='block text-sm font-medium'>
											Units per Pack
										</label>
										<input
											type='number'
											value={unitsPerPack}
											onChange={(e) =>
												setUnitsPerPack(
													parseInt(e.target.value || '1', 10)
												)
											}
											min='1'
											className='mt-1 w-full border rounded px-3 py-2'
										/>
									</div>
									<div className='flex items-center gap-2'>
										<input
											type='checkbox'
											id='isDivisible'
											checked={isDivisible}
											onChange={(e) => setIsDivisible(e.target.checked)}
											className='rounded'
										/>
										<label htmlFor='isDivisible' className='text-sm font-medium'>
											Can be prescribed in individual units (divisible)
										</label>
									</div>
								</>
							)}
							{!hideThreshold && (
								<div>
									<label className='block text-sm font-medium'>
										Low stock threshold (optional)
									</label>
									<input
										type='number'
										value={low}
										onChange={(e) =>
											setLow(
												e.target.value === ''
													? ''
													: parseInt(
															e.target.value || '0',
															10
														)
											)
										}
										className='mt-1 w-full border rounded px-3 py-2'
									/>
								</div>
							)}
							<div className='flex justify-end gap-2'>
								<button
									className='px-3 py-2 rounded hover:bg-gray-100 cursor-pointer'
									onClick={() => {
										resetModalForm();
										setShowModal(false);
									}}
								>
									Cancel
								</button>
								<button
									className='px-3 py-2 rounded bg-black text-white hover:bg-black/90 cursor-pointer'
									onClick={submit}
									aria-busy={loading}
									disabled={loading}
								>
									{loading ? 'Saving…' : 'Save'}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
