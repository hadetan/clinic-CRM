export interface StockItem {
	id: string | number;
	name: string;
	quantity: number;
	lowStockThreshold: number;
	inStock: boolean;
	isLow: boolean;
	isDivisible: boolean;
	dispensingUnit: string;
	unitsPerPack: number;
}

export interface PrescItem {
	medName: string;
	dosage?: string;
	quantity: number;
	stock?: StockItem | null;
	prescribedAs?: 'PACKS' | 'UNITS';
	unitsPerPack?: number;
}

interface PrescriptionFormProps {
	prescNumberPreview: number | null;
	nextNumberPrediction: number | null;
	phone: string;
	setPhone: React.Dispatch<React.SetStateAction<string>>;
	onPhoneBlur: () => void;
	name: string;
	setName: React.Dispatch<React.SetStateAction<string>>;
	age: number | '';
	setAge: React.Dispatch<React.SetStateAction<number | ''>>;
	symptoms: string;
	setSymptoms: React.Dispatch<React.SetStateAction<string>>;
	addItem: () => void;
	items: PrescItem[];
	updateItem: (idx: number, patch: Partial<PrescItem>) => void;
	setStockQuery: React.Dispatch<React.SetStateAction<string>>;
	setActiveIdx: React.Dispatch<React.SetStateAction<number | null>>;
	activeIdx: number | null;
	stockOptions: StockItem[];
	stockQuery: string;
	removeItem: (idx: number) => void;
	handleSelectMed: (idx: number, med: StockItem) => void;
	onPrint: () => void;
	loading: boolean;
	isFormValid: boolean;
	onSave: () => void;
	isSaved: boolean;
	clearForm: () => void;
}

export const PrescriptionForm: React.FC<PrescriptionFormProps> = ({
	prescNumberPreview,
	nextNumberPrediction,
	phone,
	setPhone,
	onPhoneBlur,
	name,
	setName,
	age,
	setAge,
	symptoms,
	setSymptoms,
	addItem,
	items,
	updateItem,
	setStockQuery,
	setActiveIdx,
	activeIdx,
	stockOptions,
	stockQuery,
	removeItem,
	handleSelectMed,
	onPrint,
	loading,
	isFormValid,
	onSave,
	isSaved,
	clearForm,
}) => {
	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8 space-y-8">
			{/* Header */}
			<div className="flex justify-between items-start">
				<div>
					<h1 className="text-2xl md:text-3xl font-bold tracking-tight">Prescription</h1>
					<p className="text-sm text-gray-500 mt-1">Fill out the form to generate a new prescription.</p>
				</div>
				<div className="text-right">
					<span className="block text-xs font-medium text-gray-500">No.</span>
					<span className="text-lg font-semibold">{prescNumberPreview ?? nextNumberPrediction ?? '—'}</span>
				</div>
			</div>

			{/* Patient Information */}
			<div className="p-5 border border-gray-200 rounded-lg bg-gray-50/60">
				<h2 className="text-base font-semibold mb-4">Patient Information</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="flex flex-col gap-1">
						<label className="text-xs font-medium text-gray-600">Patient Phone</label>
						<input
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							onBlur={onPhoneBlur}
							className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
							placeholder="e.g., 9876543210"
						/>
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-xs font-medium text-gray-600">Patient Name</label>
						<input
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
							placeholder="Patient name"
						/>
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-xs font-medium text-gray-600">Patient Age</label>
						<input
							type="number"
							value={age}
							onChange={(e) =>
								setAge(
									e.target.value === ''
										? ''
										: Math.max(0, parseInt(e.target.value || '0', 10))
								)
							}
							className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
							placeholder="Age"
							min={0}
						/>
					</div>
				</div>
			</div>

			{/* Symptoms */}
			<div className="p-5 border border-gray-200 rounded-lg bg-gray-50/60">
				<h2 className="text-base font-semibold mb-4">Symptoms</h2>
				<textarea
					value={symptoms}
					onChange={(e) => setSymptoms(e.target.value)}
					className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm min-h-[110px]"
					rows={4}
					placeholder="Describe symptoms..."
				/>
			</div>

			{/* Medications */}
			<div className="p-5 border border-gray-200 rounded-lg bg-gray-50/60">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-base font-semibold">Medications</h2>
					<button
						onClick={addItem}
						type="button"
						className="no-print inline-flex items-center gap-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 text-sm font-medium border border-indigo-200 transition-colors cursor-pointer"
					>
						<span className="text-lg leading-none">＋</span> Add
					</button>
				</div>
				<div className="space-y-4" id="medications-list">
					{items.map((it, idx) => (
						<div
							key={idx}
							className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start"
						>
							{/* Medicine */}
							<div className="md:col-span-6 relative flex flex-col gap-1">
								<label className="sr-only">Medicine</label>
								<input
									value={it.medName}
									onChange={(e) => {
										updateItem(idx, { medName: e.target.value });
										setStockQuery(e.target.value);
									}}
									onFocus={() => setActiveIdx(idx)}
									onBlur={() => {
										setTimeout(
											() => setActiveIdx((prev) => (prev === idx ? null : prev)),
											120
										);
									}}
									onKeyDown={(e) => e.key === 'Escape' && setActiveIdx(null)}
									className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
									placeholder="Type to search..."
								/>
								{it.medName && (() => {
									const scoped = activeIdx === idx ? stockOptions : [];
									const opt = (scoped.find(s => s.name.toLowerCase() === it.medName.toLowerCase()) as StockItem | undefined) || it.stock || null;
									if (!opt) return null;
									if (!opt.inStock || (typeof opt.quantity === 'number' && opt.quantity <= 0)) {
										return <div className="mt-1 text-xs text-red-600">Not in stock</div>;
									}
									if (opt.isLow) return <div className="mt-1 text-xs text-amber-600">Low on stock</div>;
									return null;
								})()}
								{activeIdx === idx && stockQuery && stockOptions.length > 0 && (
									<div className="absolute left-0 right-0 z-20 bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-56 overflow-auto w-full text-sm">
										{stockOptions.map(opt => (
											<div
												key={String(opt.id)}
												className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
												onMouseDown={() => handleSelectMed(idx, opt)}
											>
												<span>{opt.name}</span>
												{opt.quantity <= 0 && <span className="text-red-600 text-xs">(out)</span>}
											</div>
										))}
									</div>
								)}
							</div>

							{/* Dosage */}
							<div className="md:col-span-3 flex flex-col gap-1">
								<label className="sr-only">Dosage</label>
								<input
									value={it.dosage ?? ''}
									onChange={(e) => updateItem(idx, { dosage: e.target.value })}
									className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
									placeholder="e.g., 1 day, 1 night"
								/>
							</div>

							{/* Quantity */}
							<div className="md:col-span-2 flex flex-col gap-1">
								<label className="sr-only">Quantity</label>
								{it.stock && it.stock.isDivisible ? (
									<div className="space-y-1">
										<select
											value={it.prescribedAs || 'UNITS'}
											onChange={(e) => {
												const prescribedAs = e.target.value as 'PACKS' | 'UNITS';
												updateItem(idx, { prescribedAs, unitsPerPack: it.stock?.unitsPerPack || 1 });
											}}
											className="w-full h-9 rounded-md border border-gray-300 bg-white px-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
										>
											<option value="UNITS">{it.stock.dispensingUnit.toLowerCase()}s</option>
											<option value="PACKS">packs</option>
										</select>
										<input
											type="number"
											value={it.quantity}
											onChange={(e) => updateItem(idx, { quantity: Math.max(1, parseInt(e.target.value || '1', 10)) })}
											className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
											min={1}
											placeholder={it.prescribedAs === 'PACKS' ? 'packs' : it.stock.dispensingUnit.toLowerCase() + 's'}
										/>
										{it.prescribedAs === 'UNITS' && it.stock && (
											<div className="text-xs text-gray-500">≈ {Math.ceil(it.quantity / it.stock.unitsPerPack)} pack{Math.ceil(it.quantity / it.stock.unitsPerPack) !== 1 ? 's' : ''}</div>
										)}
										{it.prescribedAs === 'PACKS' && it.stock && (
											<div className="text-xs text-gray-500">= {it.quantity * it.stock.unitsPerPack} {it.stock.dispensingUnit.toLowerCase()}{it.quantity * it.stock.unitsPerPack !== 1 ? 's' : ''}</div>
										)}
									</div>
								) : (
									<input
										type="number"
										value={it.quantity}
										onChange={(e) => updateItem(idx, {
											quantity: Math.max(1, parseInt(e.target.value || '1', 10)),
											prescribedAs: 'PACKS',
											unitsPerPack: it.stock?.unitsPerPack || 1,
										})}
										className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
										min={1}
										placeholder={it.stock ? `${it.stock.dispensingUnit.toLowerCase()}s` : 'quantity'}
									/>
								)}
							</div>

							{/* Remove */}
							<div className="md:col-span-1 flex justify-end">
								<button
									onClick={() => removeItem(idx)}
									type="button"
									className="no-print p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
									aria-label="Remove row"
								>
									<span className="text-sm">✕</span>
								</button>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Actions */}
			<div className="no-print flex flex-col sm:flex-row gap-3 justify-end pt-4">
				<button
					type="button"
					onClick={clearForm}
					className="px-5 py-2.5 rounded-md border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
				>
					Clear
				</button>
				<button
					type="button"
					onClick={onPrint}
					disabled={loading || !isFormValid}
					className="px-5 py-2.5 rounded-md bg-gray-200 text-sm font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
				>
					Print
				</button>
				<button
					type="button"
					onClick={onSave}
					disabled={loading || isSaved || !isFormValid}
					className="px-6 py-2.5 rounded-md bg-indigo-600 text-white text-sm font-semibold shadow hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
				>
					{loading ? 'Saving…' : 'Save'}
				</button>
			</div>
		</div>
	);
};

export default PrescriptionForm;
