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