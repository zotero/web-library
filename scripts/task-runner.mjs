import { spawn } from 'child_process';

// ── ANSI codes ──────────────────────────────────────────────────────────

export const RESET = '\x1b[0m';
export const BOLD = '\x1b[1m';
export const DIM = '\x1b[2m';
export const GREEN = '\x1b[32m';
export const YELLOW = '\x1b[33m';
export const RED = '\x1b[31m';
export const CYAN = '\x1b[36m';
export const CLEAR = '\x1b[2J\x1b[H';

const MAX_BUFFER = 1000;

// Fall back to plain, append-only line logging for non-TTY sessions.
const INTERACTIVE = !!(process.stdin.isTTY && process.stdout.isTTY);

function logLine(msg) {
	process.stdout.write(`${msg}\n`);
}

// ── Shared helpers ──────────────────────────────────────────────────────

function truncate(str, len) {
	str = str.replace(/\x1b\[[0-9;]*m/g, '');
	return str.length > len ? str.slice(0, len - 1) + '…' : str;
}

function keyRange(tasks) {
	return tasks.length > 1 ? `${tasks[0].key}-${tasks[tasks.length - 1].key}` : tasks[0].key;
}

function statusIcon(status) {
	if (status === 'done' || status === 'stopped') return `${GREEN}✓${RESET}`;
	if (status === 'running' || status === 'starting') return `${YELLOW}…${RESET}`;
	return `${RED}✗${RESET}`;
}

function statusDot(status) {
	if (status === 'running') return `${GREEN}●${RESET}`;
	if (status === 'starting') return `${YELLOW}●${RESET}`;
	if (status === 'done' || status === 'stopped') return `${CYAN}●${RESET}`;
	return `${RED}●${RESET}`;
}

function drawOverview(title, hint, tasks, useKeys) {
	let out = CLEAR;
	out += `${BOLD}${title}${RESET}`;
	if (hint) out += `  ${hint}`;
	out += '\n\n';
	for (const t of tasks) {
		const dot = useKeys ? statusDot(t.status) : statusIcon(t.status);
		const prefix = useKeys ? `${BOLD}[${t.key}]${RESET} ${dot}` : `${dot}`;
		const statusText = useKeys ? ` ${DIM}(${t.status})${RESET}` : '';
		const last = t.lastLine ? `  ${DIM}${truncate(t.lastLine, process.stdout.columns - 30)}${RESET}` : '';
		out += `  ${prefix} ${t.label}${statusText}${last}\n`;
	}
	out += '\n';
	process.stdout.write(out);
}

function drawTaskOutput(task) {
	let out = CLEAR;
	out += `${BOLD}[${task.key}] ${task.label}${RESET}  ${DIM}Press ${task.key} or Esc to go back${RESET}\n`;
	out += `${DIM}${'─'.repeat(process.stdout.columns)}${RESET}\n`;
	const rows = process.stdout.rows - 3;
	const lines = task.buffer.slice(-rows);
	out += lines.join('\n') + '\n';
	process.stdout.write(out);
}

function appendOutput(task, data, draw) {
	for (const line of data.toString().split('\n')) {
		const trimmed = line.replace(/\r$/, '');
		if (trimmed.length === 0) continue;
		task.buffer.push(trimmed);
		task.lastLine = trimmed;
		if (!INTERACTIVE) {
			logLine(`${DIM}[${task.label}]${RESET} ${trimmed}`);
		}
	}
	if (task.buffer.length > MAX_BUFFER) {
		task.buffer = task.buffer.slice(-MAX_BUFFER);
	}
	if (task.status === 'starting') {
		task.status = 'running';
	}
	if (INTERACTIVE) {
		draw();
	}
}

function spawnTask(task, env, draw) {
	const proc = spawn(task.cmd, task.args, {
		stdio: ['ignore', 'pipe', 'pipe'],
		env: { ...process.env, ...env },
	});
	proc.stdout.on('data', data => appendOutput(task, data, draw));
	proc.stderr.on('data', data => appendOutput(task, data, draw));
	task.proc = proc;
	task.status = 'starting';
	return proc;
}

function setupInput(tasks, draw, getActiveTask, setActiveTask, onCtrlC) {
	if (!INTERACTIVE) {
		// No raw-mode key handling without a TTY; SIGINT/SIGTERM cover shutdown.
		return () => {};
	}
	process.stdin.setRawMode(true);
	process.stdin.resume();
	const onData = key => {
		const ch = key.toString();
		if (ch === '\x03') { onCtrlC(); return; }
		if (ch === '\x1b' && key.length === 1) { setActiveTask(null); draw(); return; }
		const idx = parseInt(ch) - 1;
		if (idx >= 0 && idx < tasks.length) {
			setActiveTask(getActiveTask() === idx ? null : idx);
			draw();
		}
	};
	process.stdin.on('data', onData);
	return onData;
}

function teardownInput(onData) {
	if (!INTERACTIVE) {
		return;
	}
	process.stdin.removeListener('data', onData);
	process.stdin.setRawMode(false);
	process.stdin.pause();
}

// ── Batch runner (parallel tasks with interactive output viewing) ────────

export function runBatch(label, taskDefs) {
	return new Promise((resolve, reject) => {
		const total = taskDefs.length;
		let completed = 0;
		let failed = false;
		let activeTask = null;

		const tasks = taskDefs.map((t, i) => ({
			key: String(i + 1),
			...t,
			status: 'starting',
			lastLine: '',
			buffer: [],
			proc: null,
		}));

		const hint = `${DIM}Press ${keyRange(tasks)} to view output, Esc to go back${RESET}`;

		if (!INTERACTIVE) {
			logLine(`${BOLD}${label}${RESET}`);
		}

		function draw() {
			if (!INTERACTIVE) {
				return;
			}
			if (activeTask !== null) {
				drawTaskOutput(tasks[activeTask]);
			} else {
				drawOverview(label, hint, tasks, true);
			}
		}

		for (const task of tasks) {
			const proc = spawnTask(task, task.env || {}, draw);
			proc.on('close', code => {
				task.status = code === 0 ? 'done' : 'failed';
				task.proc = null;
				if (code !== 0) failed = true;
				completed++;
				if (!INTERACTIVE) {
					logLine(`  ${statusIcon(task.status)} ${task.label}`);
				}
				draw();
				if (completed === total) {
					teardownInput(onData);
					if (INTERACTIVE) {
						// Show final overview without key hints
						drawOverview(label, '', tasks, false);
					}
					if (failed) {
						reject(new Error(`${label} failed`));
					} else {
						resolve();
					}
				}
			});
		}

		const onData = setupInput(
			tasks, draw,
			() => activeTask,
			v => { activeTask = v; },
			() => {
				teardownInput(onData);
				for (const task of tasks) {
					if (task.proc) task.proc.kill('SIGTERM');
				}
				process.exit(1);
			}
		);

		draw();
	});
}

// ── Single task runner (sequential one-shot task with spinner) ───────────

export function runSingle(label, cmd, args, env = {}) {
	return new Promise((resolve, reject) => {
		const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
		let frame = 0;

		process.stdout.write(`  ${YELLOW}${frames[0]}${RESET} ${label}`);

		const interval = setInterval(() => {
			frame = (frame + 1) % frames.length;
			process.stdout.write(`\r\x1b[2K  ${YELLOW}${frames[frame]}${RESET} ${label}`);
		}, 80);

		const proc = spawn(cmd, args, {
			stdio: ['ignore', 'pipe', 'pipe'],
			env: { ...process.env, ...env },
		});

		proc.on('close', code => {
			clearInterval(interval);
			if (code === 0) {
				process.stdout.write(`\r\x1b[2K  ${GREEN}✓${RESET} ${label}\n`);
				resolve();
			} else {
				process.stdout.write(`\r\x1b[2K  ${RED}✗${RESET} ${label}\n`);
				reject(new Error(`${label} failed (exit ${code})`));
			}
		});
	});
}

// ── Interactive runner (long-running parallel tasks with UI) ────────────

export function runInteractive(title, subtitle, taskDefs) {
	let activeTask = null;

	const tasks = taskDefs.map((t, i) => ({
		key: String(i + 1),
		...t,
		status: 'starting',
		lastLine: '',
		buffer: [],
		proc: null,
	}));

	function draw() {
		if (!INTERACTIVE) {
			return;
		}
		if (activeTask !== null) {
			drawTaskOutput(tasks[activeTask]);
		} else {
			const sub = subtitle ? `${CYAN}${subtitle}${RESET}` : '';
			const hint = `${sub}  ${DIM}Press ${keyRange(tasks)} to view output, Ctrl+C to quit${RESET}`;
			drawOverview(title, hint, tasks, true);
		}
	}

	function cleanup() {
		process.stdout.write(`\n${DIM}Shutting down...${RESET}\n`);
		for (const task of tasks) {
			if (task.proc) task.proc.kill('SIGTERM');
		}
		setTimeout(() => {
			for (const task of tasks) {
				if (task.proc) task.proc.kill('SIGKILL');
			}
			process.exit(0);
		}, 3000);
	}

	if (!INTERACTIVE) {
		logLine(`${BOLD}${title}${RESET}${subtitle ? `  ${CYAN}${subtitle}${RESET}` : ''}`);
	}

	for (const task of tasks) {
		const proc = spawnTask(task, { FORCE_COLOR: '1' }, draw);
		proc.on('close', code => {
			task.status = code === 0 ? 'stopped' : `exited (${code})`;
			task.proc = null;
			if (!INTERACTIVE) {
				logLine(`  ${statusIcon(task.status)} ${task.label} ${DIM}(${task.status})${RESET}`);
			}
			draw();
		});
	}

	setupInput(
		tasks, draw,
		() => activeTask,
		v => { activeTask = v; },
		cleanup
	);

	process.on('SIGINT', cleanup);
	process.on('SIGTERM', cleanup);

	draw();
}
