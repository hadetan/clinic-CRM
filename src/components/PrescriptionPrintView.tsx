import React from 'react';

export type PrintItem = {
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

export type PrintPatient = { 
	name: string; 
	phone: string; 
	age?: number | null | '';
};

export type PrintPrescription = {
	number?: number | null;
	patient: PrintPatient;
	items: PrintItem[];
	symptoms?: string | null;
	createdAt?: string;
};

type PrescriptionPrintViewProps = {
	prescription: PrintPrescription;
	className?: string;
};

export default function PrescriptionPrintView({ 
	prescription, 
	className = '' 
}: PrescriptionPrintViewProps) {
	const formatQuantity = (item: PrintItem) => {
		if (!item.stock) return item.quantity || '—';
		
		if (item.prescribedAs === 'PACKS' && item.unitsPerPack) {
			const dispensingUnit = item.stock.dispensingUnit?.toLowerCase() || 'unit';
			const totalUnits = item.quantity * item.unitsPerPack;
			return `${item.quantity} pack${item.quantity !== 1 ? 's' : ''} (${totalUnits} ${dispensingUnit}${totalUnits !== 1 ? 's' : ''})`;
		} else if (item.prescribedAs === 'UNITS' && item.stock.dispensingUnit) {
			const dispensingUnit = item.stock.dispensingUnit.toLowerCase();
			return `${item.quantity} ${dispensingUnit}${item.quantity !== 1 ? 's' : ''}`;
		} else {
			return item.quantity || '—';
		}
	};

	const formatAge = (age: number | null | '' | undefined) => {
		if (age === '' || age === null || age === undefined) return '—';
		return age;
	};

	return (
		<div className={`${className} h-full flex flex-col`}>
			{/* Header */}
			<div className='flex items-start justify-between mb-2'>
				<div>
					<div className='font-semibold'>
						Patient: {prescription.patient.name || '—'}
					</div>
					<div className='text-sm'>
						Phone: {prescription.patient.phone || '—'}
					</div>
					<div className='text-sm'>
						Age: {formatAge(prescription.patient.age)}
					</div>
				</div>
				<div className='text-right text-sm'>
					<div>
						Prescription No.: {prescription.number || '—'}
					</div>
					<div>
						Date: {prescription.createdAt 
							? new Date(prescription.createdAt).toLocaleDateString() 
							: new Date().toLocaleDateString()
						}
					</div>
				</div>
			</div>
			<hr className='my-2' />

			{/* Symptoms */}
			<div className='mb-2 flex-1'>
				<div className='font-semibold mb-1'>Symptoms</div>
				<div className='whitespace-pre-wrap min-h-6'>
					{prescription.symptoms || '—'}
				</div>
			</div>

			{/* Medications Table */}
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
						{prescription.items
							.filter((i) => i.medName)
							.map((i, idx) => (
								<tr key={idx} className='align-top'>
									<td className='py-1 pr-2'>{idx + 1}</td>
									<td className='py-1 pr-2 font-medium'>{i.medName}</td>
									<td className='py-1 pr-2'>{i.dosage || '—'}</td>
									<td className='py-1 pr-2'>{formatQuantity(i)}</td>
								</tr>
							))}
						{prescription.items.filter((i) => i.medName).length === 0 && (
							<tr>
								<td colSpan={4} className='py-2 text-sm text-gray-600'>—</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* Footer / Signature */}
			<div className='flex justify-between pt-6 mt-auto'>
				<div className='text-sm text-gray-700'>
					Doctor signature: _______________________
				</div>
			</div>
		</div>
	);
}