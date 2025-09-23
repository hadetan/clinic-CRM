import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'Prescription',
	description: 'Doctor prescription builder and print preview',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<nav className='no-print p-4 border-b mb-4 flex gap-4'>
					<Link href='/' className='underline'>
						Home
					</Link>
					<Link href='/stocks' className='underline'>
						Stocks
					</Link>
					<Link href='/prescriptions' className='underline'>
						All Prescriptions
					</Link>
				</nav>
				{children}
			</body>
		</html>
	);
}
