/* eslint-disable no-useless-escape */
/* eslint-disable no-cond-assign */
// `cleanISBN`, `cleanDOI` and `extractIdentifiers` adapted from https://github.com/zotero/utilities/blob/43142236a282e5e1a3190694628f329aa2e0ba8e/utilities.js

/**
 * Strip info:doi prefix and any suffixes from a DOI
 * @type String
 */
function cleanDOI(/**String**/ x) {
	if (typeof (x) != "string") {
		throw new Error("cleanDOI: argument must be a string");
	}
	// If it's a URL, try to decode it
	if (/^https?:/.test(x)) {
		try {
			x = decodeURIComponent(x);
		}
		catch (e) {
			// URI contains an invalid escape sequence
			console.warn("Not decoding URL-like DOI because of invalid escape sequence: " + x);
		}
	}
	// Even if it's not a URL, decode %3C followed by %3E as < >
	var openingPos = x.indexOf("%3C");
	if (openingPos != -1 && openingPos < x.indexOf("%3E")) {
		x = x.replace(/%3C/g, "<");
		x = x.replace(/%3E/g, ">");
	}
	var doi = x.match(/10(?:\.[0-9]{4,})?\/[^\s]*[^\s\.,]/);
	if (!doi) {
		return null;
	}
	var result = doi[0];

	// Check if the DOI ends with a bracket
	var trailingBracket = result.slice(-1);
	if ([']', ')', '}'].includes(trailingBracket)) {
		// Check the portion of the string before the matched DOI for an unclosed bracket
		let beforeDOI = x.slice(0, doi.index);
		let openingBracket = {
			']': '[',
			')': '(',
			'}': '{'
		}[trailingBracket];
		if (beforeDOI.lastIndexOf(openingBracket) > beforeDOI.lastIndexOf(trailingBracket)) {
			// Remove the trailing bracket from the DOI
			result = result.slice(0, -1);
		}
	}
	return result;
}

/**
 * Clean and validate ISBN.
 * Return isbn if valid, otherwise return false
 * @param {String} isbn
 * @param {Boolean} [dontValidate=false] Do not validate check digit
 * @return {String|Boolean} Valid ISBN or false
 */
function cleanISBN(isbnStr, dontValidate) {
	isbnStr = isbnStr.toUpperCase()
		.replace(/[\x2D\xAD\u2010-\u2015\u2043\u2212]+/g, ''); // Ignore dashes
	var isbnRE = /\b(?:97[89]\s*(?:\d\s*){9}\d|(?:\d\s*){9}[\dX])\b/g,
		isbnMatch;
	while (isbnMatch = isbnRE.exec(isbnStr)) {
		var isbn = isbnMatch[0].replace(/\s+/g, '');

		if (dontValidate) {
			return isbn;
		}

		if (isbn.length == 10) {
			// Verify ISBN-10 checksum
			let sum = 0;
			for (let i = 0; i < 9; i++) {
				sum += isbn[i] * (10 - i);
			}
			//check digit might be 'X'
			sum += (isbn[9] == 'X') ? 10 : isbn[9] * 1;

			if (sum % 11 == 0) return isbn;
		} else {
			// Verify ISBN 13 checksum
			let sum = 0;
			for (let i = 0; i < 12; i += 2) sum += isbn[i] * 1;	//to make sure it's int
			for (let i = 1; i < 12; i += 2) sum += isbn[i] * 3;
			sum += isbn[12] * 1; //add the check digit

			if (sum % 10 == 0) return isbn;
		}

		isbnRE.lastIndex = isbnMatch.index + 1; // Retry the same spot + 1
	}

	return false;
}

function extractIdentifiers(text) {
	var identifiers = [];
	var foundIDs = new Set(); // keep track of identifiers to avoid duplicates

	// First look for DOIs
	var ids = text.split(/[\s\u00A0]+/); // whitespace + non-breaking space
	var doi;
	for (let id of ids) {
		if ((doi = cleanDOI(id)) && !foundIDs.has(doi)) {
			identifiers.push({
				DOI: doi
			});
			foundIDs.add(doi);
		}
	}

	// Then try ISBNs
	if (!identifiers.length) {
		// First try replacing dashes
		let ids = text.replace(/[\u002D\u00AD\u2010-\u2015\u2212]+/g, "") // hyphens and dashes
			.toUpperCase();
		let ISBN_RE = /(?:\D|^)(97[89]\d{10}|\d{9}[\dX])(?!\d)/g;
		let isbn;
		while (isbn = ISBN_RE.exec(ids)) {
			isbn = cleanISBN(isbn[1]);
			if (isbn && !foundIDs.has(isbn)) {
				identifiers.push({
					ISBN: isbn
				});
				foundIDs.add(isbn);
			}
		}

		// Next try spaces
		if (!identifiers.length) {
			ids = ids.replace(/[ \u00A0]+/g, ""); // space + non-breaking space
			while (isbn = ISBN_RE.exec(ids)) {
				isbn = cleanISBN(isbn[1]);
				if (isbn && !foundIDs.has(isbn)) {
					identifiers.push({
						ISBN: isbn
					});
					foundIDs.add(isbn);
				}
			}
		}
	}

	// Next try arXiv
	if (!identifiers.length) {
		// arXiv identifiers are extracted without version number
		// i.e. 0706.0044v1 is extracted as 0706.0044,
		// because arXiv OAI API doesn't allow to access individual versions
		let arXiv_RE = /((?:[^A-Za-z]|^)([\-A-Za-z\.]+\/\d{7})(?:(v[0-9]+)|)(?!\d))|((?:\D|^)(\d{4}\.\d{4,5})(?:(v[0-9]+)|)(?!\d))/g;
		let m;
		while ((m = arXiv_RE.exec(text))) {
			let arXiv = m[2] || m[5];
			if (arXiv && !foundIDs.has(arXiv)) {
				identifiers.push({ arXiv: arXiv });
				foundIDs.add(arXiv);
			}
		}
	}

	// Next, try ADS Bibcodes
	if (!identifiers.length) {
		// regex as in the ADS Bibcode translator
		let adsBibcode_RE = /\b(\d{4}\D\S{13}[A-Z.:])\b/g;
		let adsBibcode;
		while ((adsBibcode = adsBibcode_RE.exec(text)) && !foundIDs.has(adsBibcode)) {
			identifiers.push({
				adsBibcode: adsBibcode[1]
			});
			foundIDs.add(adsBibcode);
		}
	}

	// Finally, try PMID
	if (!identifiers.length) {
		// PMID; right now, the longest PMIDs are 8 digits, so it doesn't seem like we'll
		// need to discriminate for a fairly long time
		let PMID_RE = /(^|\s|,|:)(\d{1,9})(?=\s|,|$)/g;
		let pmid;
		while ((pmid = PMID_RE.exec(text)) && !foundIDs.has(pmid)) {
			identifiers.push({
				PMID: pmid[2]
			});
			foundIDs.add(pmid);
		}
	}

	return identifiers;
}

// TODO: This and `searchIdentifier` action should be merged (but we don't want to dispatch idenfitier actions here)
const getItemFromIdentifier = async (identifier, translateUrl) => {
	const url = `${translateUrl}/search`;
	const response = await fetch(url, {
		method: 'POST',
		mode: 'cors',
		headers: { 'Content-Type': 'text/plain', },
		body: identifier
	});
	if (response.ok) {
		const translatorResponse = await response.json();
		return translatorResponse?.[0]
	} else {
		throw new Error('Failed to get item from identifier');
	}
}

export { cleanISBN, cleanDOI, extractIdentifiers, getItemFromIdentifier };
