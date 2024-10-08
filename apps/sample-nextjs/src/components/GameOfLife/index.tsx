'use client';
import { useEffect, useRef } from 'react';
// import { Cell } from "sample-wasm";
// import { memory } from "sample-wasm/sample_wasm_bg.wasm";

const CELL_SIZE = 5; // px
const GRID_COLOR = '#CCCCCC';
const DEAD_COLOR = '#FFFFFF';
const ALIVE_COLOR = '#000000';

export const GameOfLife = () => {
	const loadWasm = async () => {
		const wasmModule = await import('../../../../../crates/sample-wasm/pkg/sample_wasm');
		const { memory } = await import('../../../../../crates/sample-wasm/pkg/sample_wasm_bg.wasm');
		return { ...wasmModule, memory };
	};
	const display = useRef<HTMLCanvasElement>(null);

	const runGameOfLife = async (canvas: HTMLCanvasElement) => {
		const { memory, Universe, Cell } = await loadWasm();
		// const pre = document.getElementById("game-of-life-canvas");
		const universe = Universe.new();
		const width = universe.width();
		const height = universe.height();

		// Give the canvas room for all of our cells and a 1px border
		// around each of them.

		canvas.height = (CELL_SIZE + 1) * height + 1;
		canvas.width = (CELL_SIZE + 1) * width + 1;

		const ctx = canvas.getContext('2d')!;
		const drawGrid = () => {
			ctx.beginPath();
			ctx.strokeStyle = GRID_COLOR;

			// Vertical lines.
			for (let i = 0; i <= width; i++) {
				ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
				ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
			}

			// Horizontal lines.
			for (let j = 0; j <= height; j++) {
				ctx.moveTo(0, j * (CELL_SIZE + 1) + 1);
				ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
			}

			ctx.stroke();
		};
		const getIndex = (row: number, column: number) => {
			return row * width + column;
		};
		const drawCells = () => {
			const cellsPtr = universe.cells();
			const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);

			ctx.beginPath();

			for (let row = 0; row < height; row++) {
				for (let col = 0; col < width; col++) {
					const idx = getIndex(row, col);

					ctx.fillStyle = cells[idx] === Cell.Dead ? DEAD_COLOR : ALIVE_COLOR;

					ctx.fillRect(col * (CELL_SIZE + 1) + 1, row * (CELL_SIZE + 1) + 1, CELL_SIZE, CELL_SIZE);
				}
			}

			ctx.stroke();
		};
		const renderLoop = () => {
			universe.tick();

			drawGrid();
			drawCells();

			requestAnimationFrame(renderLoop);
		};
		drawGrid();
		drawCells();
		requestAnimationFrame(renderLoop);
	};

	useEffect(() => {
		if (display.current) {
			runGameOfLife(display.current);
		}
	}, [display]);

	return <canvas id="game-of-life-canvas" ref={display} />;
};
