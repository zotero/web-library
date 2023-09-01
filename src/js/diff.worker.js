const emscripten_notify_memory_growth = () => {
	needsMoreMemory = true;
};

const writeToMemoryAt = (memory, ptr, data) => {
	(new Uint8Array(memory.buffer, ptr, data.byteLength)).set(data);
};

const readFromMemoryAt = (memory, ptr, length) => {
	return new Uint8Array(memory.buffer, ptr, length);
};

const ensureMemory = (memory, requiredBytes) => {
	const reservedBytes = memory.buffer.byteLength;
	if (requiredBytes > reservedBytes) {
		const requiredOrMaxBytes = Math.min(maxMemory, requiredBytes);
		const newReservedBytes = Math.ceil(requiredOrMaxBytes / bytesPerPage) * bytesPerPage;
		memory.grow((newReservedBytes - reservedBytes) / bytesPerPage);
	}
}

const wasmImports = {
	emscripten_notify_memory_growth
};
const info = {
	"env": wasmImports,
};

const bytesPerPage = 64 * 1024;
const maxMemory = 2048 * 1024 * 1024;

var needsMoreMemory = false;
var xdelta3;

const init = async () => {
	xdelta3 = await WebAssembly.instantiateStreaming(fetch(`${self.location.origin}/static/xdelta3.wasm`), info);
};

const encode = (inputBytes, sourceBytes, outputSizeMax) => {
	const { malloc, free, xd3_encode_memory, memory } = xdelta3.instance.exports;

	// Arbitrary allocate memory based on the size of the input files and max output size
	// If it's not enough, keep doubling until we reach 2GB
	const baseMemory = 16 * 1024 * 1024;
	const requiredBytes = baseMemory + inputBytes.byteLength + sourceBytes.byteLength + outputSizeMax;
	ensureMemory(memory, 4 * requiredBytes);

	const inputPtr = malloc(inputBytes.byteLength);
	const sourcePtr = malloc(sourceBytes.byteLength);
	const outputPtr = malloc(outputSizeMax);
	const outputSizePtr = malloc(4);
	const eflags = 0;

	writeToMemoryAt(memory, inputPtr, inputBytes);
	writeToMemoryAt(memory, sourcePtr, sourceBytes);

	const ret = xd3_encode_memory(inputPtr, inputBytes.byteLength, sourcePtr, sourceBytes.byteLength, outputPtr, outputSizePtr, outputSizeMax, eflags);
	if(needsMoreMemory && memory.buffer.byteLength < maxMemory) {
		self.postMessage(['LOG', `DiffWorker needs more memory ${requiredBytes * 2} bytes`]);
		needsMoreMemory = false;
		free(inputPtr);
		free(sourcePtr);
		free(outputPtr);
		free(outputSizePtr);
		ensureMemory(memory, requiredBytes * 2);
		return encode(inputBytes, sourceBytes, outputSizeMax);
	}
	if(needsMoreMemory) {
		throw new Error(`Not enough memory to compute diff`);
	}

	const memoryView = new DataView(memory.buffer);
	const outputSize = memoryView.getUint32(outputSizePtr, true);

	const output = new Uint8Array(outputSize);
	output.set(readFromMemoryAt(memory, outputPtr, outputSize));

	free(inputPtr);
	free(sourcePtr);
	free(outputPtr);
	free(outputSizePtr);

	if(ret !== 0) {
		throw new Error(`Computing diff failed with error code ${ret}`);
	}

	return output
};

let oldFile = null;
let newFile = null;

self.addEventListener('message', function (ev) {
	const [command, payload] = ev.data;
	switch (command) {
		case 'LOAD':
			oldFile = payload.oldFile;
			newFile = payload.newFile;
			init().then(() => {
				self.postMessage(['READY', null]);
			});
			break;
		case 'DIFF': {
			const oldFileView = new Uint8Array(oldFile);
			const newFileView = new Uint8Array(newFile);
			try {
				const output = encode(newFileView, oldFileView, oldFileView.byteLength);
				self.postMessage(['DIFF_COMPLETE', output]);
			}
			catch(e) {
				self.postMessage(['DIFF_ERROR', e]);
			}
			break;
		}
	}
});
