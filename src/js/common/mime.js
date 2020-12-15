// mime-sniffing loosely based on client code linked below but compares bytes instead of string so
// that we don't need TextEncoder and also avoids potential false positives caused by U+FFFD
// replacement character
// https://github.com/zotero/zotero/blob/2b5a22c13207232fd39834c3eb203a0516f986b8/chrome/content/zotero/xpcom/mime.js#L34

// [magic numbers as bytes, mime-type, (offset)]
const magicBytesLookup = [
	[[0x25, 0x50, 0x44, 0x46, 0x2d], 'application/pdf'],
	[[0x25, 0x21, 0x50, 0x53, 0x2d, 0x41, 0x64, 0x6f, 0x62, 0x65, 0x2d], 'application/postscript', 0],
	[[0x25, 0x21, 0x20, 0x50, 0x53, 0x2d, 0x41, 0x64, 0x6f, 0x62, 0x65, 0x2d], 'application/postscript', 0],
	[[0x46, 0x72, 0x6f, 0x6d], 'text/plain', 0],
	[[0x3e, 0x46, 0x72, 0x6f, 0x6d], 'text/plain', 0],
	[[0x23, 0x21], 'text/plain', 0],
	[[0x3c, 0x3f, 0x78, 0x6d, 0x6c], 'text/xml', 0],
	[[0x3c, 0x21, 0x44, 0x4f, 0x43, 0x54, 0x59, 0x50, 0x45, 0x20, 0x68, 0x74, 0x6d, 0x6c], 'text/html', 0],
	[[0x3c, 0x68, 0x74, 0x6d, 0x6c], 'text/html', 0],
	[[0x47, 0x49, 0x46, 0x38], 'image/gif', 0],
	[[0x4a, 0x46, 0x49, 0x46], 'image/jpeg'],
	[[0x46, 0x4c, 0x56], 'video/x-flv', 0],
	[[0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1], 'application/msword', 0],
	[[0xff, 0xd8, 0xff, 0xdb], 'image/jpeg', 0],
	[[0x00, 0x00, 0x01, 0x00], 'image/vnd.microsoft.icon', 0],
	[[0x53, 0x51, 0x4c, 0x69, 0x74, 0x65, 0x20, 0x66, 0x6f, 0x72, 0x6d, 0x61, 0x74, 0x20, 0x33, 0x00], 'application/x-sqlite3', 0],
	[[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 'image/png', 0],
];

const indexOfSequence = (needle, haystack, fromIndex = 0, toIndex = null) => {
	if(haystack instanceof ArrayBuffer) {
		haystack = new Uint8Array(haystack);
	}

	const index = haystack.indexOf(needle[0], fromIndex);

	if(toIndex !== null && index > toIndex) {
		return -1;
	}
	if(needle.length === 1 || index === -1) {
		return index;
	}

	for(var i = index, j = 0; j < needle.length && i < haystack.length; i++, j++) {
		if(haystack[i] !== needle[j]) {
			return indexOfSequence(needle, haystack, index + 1, toIndex);
		}
	}

	return(i === index + needle.length) ? index : -1;
};

const sniffForMIMEType = (bytesArray) => {
	const headBytes = bytesArray.slice(0, 200); // first 200 bytes

	for (let [magicBytes, mimeType, offset] of magicBytesLookup) {
		if(offset !== undefined && indexOfSequence(magicBytes, headBytes, 0, 0) !== -1) {
			return mimeType;
		} else if(indexOfSequence(magicBytes, headBytes) !== -1) {
			return mimeType
		}
	}
	return '';
};

export { sniffForMIMEType };
