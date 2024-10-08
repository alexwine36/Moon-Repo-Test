import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Navigation } from '../src/components/Navigation';
import './globals.css';
import styles from './page.module.css';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'Create Next App',
	description: 'Generated by create next app',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={inter.className}
				// style={{
				// 	width: '100vw',
				// 	height: '100vh',
				// }}
			>
				<main className={styles.main}>
					<Navigation />
					<div className={styles.wrapper}>{children}</div>
				</main>
			</body>
		</html>
	);
}
