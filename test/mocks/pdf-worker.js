class MockPDFWorker {
	export() {
		return new Uint8Array();
	}
	import() {
		return [];
	}
}

export const pdfWorker = new MockPDFWorker();
