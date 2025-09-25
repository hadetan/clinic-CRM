'use client';
import StockMaintain from '@/components/StockMaintain';
import React, { useEffect, useRef, useState } from 'react';

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

// Legacy derived arrays replaced by filtered variants below

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

// Removed old StatusBadge component; status handled inline in Row

// Removed old SectionHeader and Card components after layout redesign

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

	const filterTerm = q.trim().toLowerCase();
	const filteredStocks = filterTerm
		? stocks.filter((s) => s.name.toLowerCase().includes(filterTerm))
		: stocks;
	const fLowStocks = filteredStocks.filter((s) => s.isLow && s.inStock);
	const fOutStocks = filteredStocks.filter((s) => !s.inStock);
	const fInStocks = filteredStocks.filter((s) => s.inStock && !s.isLow);

	const Row = ({ s }: { s: Stock }) => {
		const status = !s.inStock
			? { label: 'Out of Stock', cls: 'bg-red-100 text-red-800' }
			: s.isLow
			? { label: 'Low Stock', cls: 'bg-amber-100 text-amber-800' }
			: { label: 'In Stock', cls: 'bg-emerald-100 text-emerald-800' };
		return (
			<div className='grid grid-cols-6 p-4 items-center border-b last:border-b-0 border-gray-200 hover:bg-gray-50 transition-colors'>
				<div className='col-span-2'>
					<p className='font-medium text-gray-900'>{s.name}</p>
					<p className='text-xs text-gray-500'>Updated: {fmtDate(s.updatedAt)}</p>
				</div>
				<div className='text-center'>
					<p className='text-xs text-gray-500'>Stock</p>
					<p className='font-medium text-gray-900'>{s.quantity} pack{s.quantity === 1 ? '' : 's'}</p>
				</div>
				<div className='text-center'>
					<p className='text-xs text-gray-500'>Units/Pack</p>
					<p className='font-medium text-gray-900'>
						{s.unitsPerPack} {s.dispensingUnit.toLowerCase()}{s.unitsPerPack === 1 ? '' : 's'}
					</p>
				</div>
				<div className='text-center'>
					<p className='text-xs text-gray-500'>Low Threshold</p>
					<p className='font-medium text-gray-900'>{s.lowStockThreshold}</p>
				</div>
				<div className='flex justify-end'>
					<span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.cls}`}>{status.label}</span>
				</div>
			</div>
		);
	};

	const Group = ({
		icon,
		color,
		title,
		list,
	}: {
		icon: React.ReactNode;
		color: string;
		title: string;
		list: Stock[];
	}) => (
		<div className='space-y-2'>
			<div className='flex items-center mb-1'>
				<span className={`mr-2 ${color}`}>{icon}</span>
				<h2 className='text-lg font-semibold text-gray-800'>
					{title}{' '}
					<span className='text-gray-500 font-normal text-base'>({list.length})</span>
				</h2>
			</div>
			<div className='bg-white rounded-lg shadow border overflow-hidden'>
				{list.length === 0 ? (
					<div className='p-4 text-sm text-gray-500'>None</div>
				) : (
					list.map((s) => <Row key={String(s.id)} s={s} />)
				)}
			</div>
		</div>
	);

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
			<header className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8'>
				<h1 className='text-3xl font-bold text-gray-800'>Stock Management</h1>
				<div className='flex items-center gap-4'>
					<div className='relative'>
						<svg
							className='w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
							viewBox='0 0 24 24'
						>
							<circle cx='11' cy='11' r='8' />
							<path d='M21 21l-4.35-4.35' />
						</svg>
						<input
							value={q}
							onChange={(e) => setQ(e.target.value)}
							placeholder='Search stock...'
							className='pl-9 pr-3 py-2 w-64 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm'
						/>
					</div>
					<button
						onClick={() => {
							resetModalForm();
							setShowModal(true);
						}}
						className='inline-flex items-center gap-2 bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg shadow hover:bg-indigo-500 transition-colors cursor-pointer'
					>
						<svg
							className='w-5 h-5'
							viewBox='0 0 24 24'
							stroke='currentColor'
							strokeWidth='2'
							fill='none'
							strokeLinecap='round'
							strokeLinejoin='round'
						>
							<path d='M12 5v14M5 12h14' />
						</svg>
						Add/Update Stock
					</button>
				</div>
			</header>

			{error && (
				<div role='alert' className='mb-4 text-red-600 text-sm'>
					{error}
				</div>
			)}

			<main className='space-y-12'>
				<Group
					icon={
						<svg
							className='w-5 h-5'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
						>
							<path d='M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z' />
							<path d='M12 9v5' />
							<path d='M12 18h.01' />
						</svg>
					}
					color='text-red-500'
					title='Out of Stock'
					list={fOutStocks}
				/>
				<Group
					icon={
						<svg
							className='w-5 h-5'
							viewBox='0 0 24 24'
							fill='currentColor'
						>
							<path d='M12 2a1 1 0 01.894.553l8 16A1 1 0 0120 20H4a1 1 0 01-.894-1.447l8-16A1 1 0 0112 2zm0 5a1 1 0 00-1 1v5a1 1 0 102 0V8a1 1 0 00-1-1zm0 8a1.5 1.5 0 100 3 1.5 1.5 0 000-3z' />
						</svg>
					}
					color='text-amber-500'
					title='Low Stock'
					list={fLowStocks}
				/>
				<Group
					icon={
						<svg
							className='w-5 h-5'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
						>
							<path d='M9 12l2 2 4-4' />
							<circle cx='12' cy='12' r='9' />
						</svg>
					}
					color='text-emerald-600'
					title='In Stock'
					list={fInStocks}
				/>
			</main>

			{showModal && (
				<StockMaintain
					amount={amount}
					dispensingUnit={dispensingUnit}
					dropdownWidth={dropdownWidth}
					hideThreshold={hideThreshold}
					isDivisible={isDivisible}
					loading={loading}
					low={low}
					name={name}
					nameInputRef={nameInputRef}
					options={options}
					q={q}
					resetModalForm={resetModalForm}
					setAmount={setAmount}
					setDispensingUnit={setDispensingUnit}
					setIsDivisible={setIsDivisible}
					setLow={setLow}
					setName={setName}
					setOptions={setOptions}
					setQ={setQ}
					setShowModal={setShowModal}
					setUnitsPerPack={setUnitsPerPack}
					submit={submit}
					unitsPerPack={unitsPerPack}
				/>
			)}
		</div>
	);
}
