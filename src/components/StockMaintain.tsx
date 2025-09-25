export interface StockOption {
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

interface StockMaintainProps {
	resetModalForm: () => void;
	setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
	nameInputRef: React.RefObject<HTMLInputElement | null>;
	name: string;
	setName: React.Dispatch<React.SetStateAction<string>>;
	setQ: React.Dispatch<React.SetStateAction<string>>;
	options: StockOption[];
	dropdownWidth: number | undefined;
	setOptions: React.Dispatch<React.SetStateAction<StockOption[]>>;
	amount: number;
	setAmount: React.Dispatch<React.SetStateAction<number>>;
	hideThreshold: boolean;
	dispensingUnit: string;
	q: string;
	setDispensingUnit: React.Dispatch<React.SetStateAction<string>>;
	unitsPerPack: number;
	setUnitsPerPack: React.Dispatch<React.SetStateAction<number>>;
	isDivisible: boolean;
	setIsDivisible: React.Dispatch<React.SetStateAction<boolean>>;
	low: number | '';
	setLow: React.Dispatch<React.SetStateAction<number | ''>>;
	submit: () => void;
	loading: boolean;
}

const StockMaintain: React.FC<StockMaintainProps> = ({
	resetModalForm,
	setShowModal,
	nameInputRef,
	name,
	setName,
	setQ,
	options,
	dropdownWidth,
	setOptions,
	amount,
	setAmount,
	hideThreshold,
	dispensingUnit,
	q,
	setDispensingUnit,
	unitsPerPack,
	setUnitsPerPack,
	isDivisible,
	setIsDivisible,
	low,
	setLow,
	submit,
	loading,
}) => {
	return (
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
							<div
								className='absolute left-0 z-50 bg-white border rounded shadow mt-1 max-h-56 overflow-auto'
								style={{ width: dropdownWidth }}
							>
								{options.map((opt: StockOption) => (
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
								setAmount(parseInt(e.target.value || '0', 10))
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
									onChange={(e) =>
										setDispensingUnit(e.target.value)
									}
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
									onChange={(e) =>
										setIsDivisible(e.target.checked)
									}
									className='rounded'
								/>
								<label
									htmlFor='isDivisible'
									className='text-sm font-medium'
								>
									Can be prescribed in individual units
									(divisible)
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
	);
};

export default StockMaintain;
