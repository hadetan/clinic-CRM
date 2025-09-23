'use client';
import React from 'react';

export default function PrintLayout({
    targetId='printable',
	children,
}: {
	children: React.ReactNode;
    targetId?: string
}) {
	return (
		<div className='print:bg-white print:text-black'>
			{children}
			<style>{`
        @media print {
          /* Reduce margins to fit more content while leaving room for printers */
          @page { margin: 10mm 12mm; }
          body { background: white; }
          /* Print typography */
                body, #${targetId} { font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif; font-size: 12pt; line-height: 1.25; }
          /* Hide everything by default */
          body * { visibility: hidden; }
          /* Explicitly show ${targetId} area */
                #${targetId}, #${targetId} * { visibility: visible; }
                #${targetId}-prescription, #${targetId}-prescription * { visibility: visible; }
          /* Place ${targetId} area at the top-left for clean output */
                #${targetId} { position: absolute; left: 0; top: 0; width: 100%; min-height: 100vh; display: flex; flex-direction: column; }
                #${targetId}-prescription { position: absolute; left: 0; top: 0; width: 100%; min-height: 100vh; display: flex; flex-direction: column; }
          /* Avoid awkward page breaks in tables */
                #${targetId} table { page-break-inside: auto; }
                #${targetId} tr, #${targetId} td, #printable th { page-break-inside: avoid; }
          /* Utility to opt-out specific elements */
          .no-print { display: none !important; visibility: hidden !important; }
        }
      `}</style>
		</div>
	);
}
