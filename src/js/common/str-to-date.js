/** strToDate from https://github.com/zotero/utilities/blob/master/date.js
 * But without dependencies that would substantially add to the bundle size.
*/

import { mapObject } from '../common/immutable';
import dateFormatsJSON from '../../../data/date-formats.json';
import memoize from 'memoize-one';

const compileRegexes = memoize((locale) => {
	let english = locale.startsWith('en');

	// If no exact match, try first two characters ('de')
	if (!dateFormatsJSON[locale]) {
		locale = locale.substring(0, 2);
	}
	// Try first two characters repeated ('de-DE')
	if (!dateFormatsJSON[locale]) {
		locale = locale + "-" + locale.toUpperCase();
	}
	// Look for another locale with same first two characters
	if (!dateFormatsJSON[locale]) {
		let sameLang = Object.keys(dateFormatsJSON).filter(l => l.startsWith(locale.substring(0, 2)));
		if (sameLang.length) {
			locale = sameLang[0];
		}
	}
	// If all else fails, use English
	if (!dateFormatsJSON[locale]) {
		locale = 'en-US';
		english = true;
	}
	const months = dateFormatsJSON[locale];
	const monthsWithEnglish = english ? months
		: mapObject(months, (key, value) => [key, value.concat(dateFormatsJSON['en-US'][key])]);

	let regexMonths = monthsWithEnglish.short.map(m => m.toLowerCase()).concat(monthsWithEnglish.long.map(m => m.toLowerCase()));
	const slashRe = /^(.*?)\b([0-9]{1,4})(?:([-/.\u5e74])([0-9]{1,2}))?(?:([-/.\u6708])([0-9]{1,4}))?((?:\b|[^0-9]).*?)$/
	const yearRe = /^(.*?)\b((?:circa |around |about |c\.? ?)?[0-9]{1,4}(?: ?B\.? ?C\.?(?: ?E\.?)?| ?C\.? ?E\.?| ?A\.? ?D\.?)|[0-9]{3,4})\b(.*?)$/i;
	const monthRe = new RegExp("(.*)(?:^|[^\\p{L}])(" + regexMonths.join("|") + ")[^ ]*(?: (.*)$|$)", "iu");
	const daySuffixes = ""; // @TODO: localised like Zotero.getString("date.daySuffixes").replace(/, ?/g, "|")
	const dayRe = new RegExp("\\b([0-9]{1,2})(?:" + daySuffixes + ")?\\b(.*)", "i");

	return { months, monthsWithEnglish, slashRe, yearRe, monthRe, dayRe };
});

/**
 * Removes leading and trailing whitespace from a string
 * @type String
 */
function trim(/**String*/ s) {
	s = s.replace(/^\s+/, "");
	return s.replace(/\s+$/, "");
}

/**
 * Cleans whitespace off a string and replaces multiple spaces with one
 * @type String
 */
function trimInternal(/**String*/ s) {
	s = s.replace(/[\xA0\r\n\s]+/g, " ");
	return trim(s);
}

/**
 * Pads a number or other string with a given string on the left
 *
 * @param {String} string String to pad
 * @param {String} pad String to use as padding
 * @length {Integer} length Length of new padded string
 * @type String
 */
function lpad(string, pad, length) {
	string = string ? string + '' : '';
	while (string.length < length) {
		string = pad + string;
	}
	return string;
}

function _insertDateOrderPart(dateOrder, part, partOrder) {
	if (!dateOrder) {
		return part;
	}
	if (partOrder.before === true) {
		return part + dateOrder;
	}
	if (partOrder.after === true) {
		return dateOrder + part;
	}
	if (partOrder.before) {
		let pos = dateOrder.indexOf(partOrder.before);
		if (pos == -1) {
			return dateOrder;
		}
		return dateOrder.replace(new RegExp("(" + partOrder.before + ")"), part + '$1');
	}
	if (partOrder.after) {
		let pos = dateOrder.indexOf(partOrder.after);
		if (pos == -1) {
			return dateOrder + part;
		}
		return dateOrder.replace(new RegExp("(" + partOrder.after + ")"), '$1' + part);
	}
	return dateOrder + part;
}


/*
* converts a string to an object containing:
*    day: integer form of the day
*    month: integer form of the month (indexed from 0, not 1)
*    year: 4 digit year (or, year + BC/AD/etc.)
*    part: anything that does not fall under any of the above categories
*          (e.g., "Summer," etc.)
*
* Note: the returned object is *not* a JS Date object
*/
function strToDate(string, { locale } = {}) {
	var date = {
		order: ''
	};

	const { monthsWithEnglish, slashRe, yearRe, monthRe, dayRe } = compileRegexes(locale ?? window?.navigator?.language ?? 'en-US');

	if (typeof string == 'string' || typeof string == 'number') {
		string = trimInternal(string.toString());
	}

	// skip empty things
	if (!string) {
		return date;
	}

	var parts = [];

	// first, directly inspect the string
	var m = slashRe.exec(string);
	if (m &&
		((!m[5] || !m[3]) || m[3] == m[5] || (m[3] == "\u5e74" && m[5] == "\u6708")) &&	// require sane separators
		((m[2] && m[4] && m[6]) || (!m[1] && !m[7]))) {						// require that either all parts are found,
		// or else this is the entire date field
		// figure out date based on parts
		if (m[2].length == 3 || m[2].length == 4 || m[3] == "\u5e74") {
			// ISO 8601 style date (big endian)
			date.year = m[2];
			date.month = m[4];
			date.day = m[6];
			date.order += m[2] ? 'y' : '';
			date.order += m[4] ? 'm' : '';
			date.order += m[6] ? 'd' : '';
		} else if (m[2] && !m[4] && m[6]) {
			date.month = m[2];
			date.year = m[6];
			date.order += m[2] ? 'm' : '';
			date.order += m[6] ? 'y' : '';
		} else {
			// local style date (middle or little endian)
			var country = (typeof Zotero !== 'undefined' ? Zotero.locale : (globalThis?.navigator?.language || 'en-US')).substr(3); // eslint-disable-line no-undef
			if (country == "US" ||	// The United States
				country == "FM" ||	// The Federated States of Micronesia
				country == "PW" ||	// Palau
				country == "PH") {	// The Philippines
				date.month = m[2];
				date.day = m[4];
				date.order += m[2] ? 'm' : '';
				date.order += m[4] ? 'd' : '';
			} else {
				date.month = m[4];
				date.day = m[2];
				date.order += m[2] ? 'd' : '';
				date.order += m[4] ? 'm' : '';
			}
			date.year = m[6];
			if (m[6] !== undefined) {
				date.order += 'y';
			}
		}

		var longYear = date.year && date.year.toString().length > 2;
		if (date.year) date.year = parseInt(date.year, 10);
		if (date.day) date.day = parseInt(date.day, 10);
		if (date.month) {
			date.month = parseInt(date.month, 10);

			if (date.month > 12) {
				// swap day and month
				var tmp = date.day;
				date.day = date.month
				date.month = tmp;
				date.order = date.order.replace('m', 'D')
					.replace('d', 'M')
					.replace('D', 'd')
					.replace('M', 'm');
			}
		}

		if ((!date.month || date.month <= 12) && (!date.day || date.day <= 31)) {
			// Parse pre-100 years with leading zeroes (001, 0001, 012, 0012, 0123, but not 08)
			if (date.year && date.year < 100 && !longYear) {
				var today = new Date();
				var year = today.getFullYear();
				var twoDigitYear = year % 100;
				var century = year - twoDigitYear;

				if (date.year <= twoDigitYear) {
					// assume this date is from our century
					date.year = century + date.year;
				} else {
					// assume this date is from the previous century
					date.year = century - 100 + date.year;
				}
			}

			if (date.month) date.month--;		// subtract one for JS style
			else delete date.month;

			//Zotero.debug("DATE: retrieved with algorithms: "+JSON.stringify(date));

			parts.push(
				{ part: m[1], before: true },
				{ part: m[7] }
			);
		} else {
			// give up; we failed the sanity check
			process.env.NODE_ENV === 'development' && console.log("strToDate: algorithms failed sanity check");
			date = { order: '' };
			parts.push({ part: string });
		}
	} else {
		//debug("DATE: could not apply algorithms");
		parts.push({ part: string });
	}

	// couldn't find something with the algorithms; use regexp
	// YEAR
	if (!date.year) {
		for (var i in parts) {
			m = yearRe.exec(parts[i].part);
			if (m) {
				date.year = m[2];
				date.order = _insertDateOrderPart(date.order, 'y', parts[i]);
				parts.splice(
					i, 1,
					{ part: m[1], before: true },
					{ part: m[3] }
				);
				//debug("DATE: got year (" + date.year + ", " + JSON.stringify(parts) + ")");
				break;
			}
		}
	}

	// MONTH
	if (date.month === undefined) {
		// compile month regular expression
		let months = monthsWithEnglish;
		months = months.short.map(m => m.toLowerCase())
			.concat(months.long.map(m => m.toLowerCase()));
		for (let i in parts) {
			m = monthRe.exec(parts[i].part);
			if (m) {
				// Modulo 12 in case we have multiple languages
				date.month = months.indexOf(m[2].toLowerCase()) % 12;
				date.order = _insertDateOrderPart(date.order, 'm', parts[i]);
				parts.splice(
					i, 1,
					{ part: m[1], before: "m" },
					{ part: m[3], after: "m" }
				);
				//debug("DATE: got month (" + date.month + ", " + JSON.stringify(parts) + ")");
				break;
			}
		}
	}

	// DAY
	if (!date.day) {
		for (let i in parts) {
			m = dayRe.exec(parts[i].part);
			if (m) {
				var day = parseInt(m[1], 10);
				// Sanity check
				if (day <= 31) {
					date.day = day;
					date.order = _insertDateOrderPart(date.order, 'd', parts[i]);
					let part;
					if (m.index > 0) {
						part = parts[i].part.substr(0, m.index);
						if (m[2]) {
							part += " " + m[2];
						}
					} else {
						part = m[2];
					}
					parts.splice(i, 1, { part });
					//debug("DATE: got day (" + date.day + ", " + JSON.stringify(parts) + ")");
					break;
				}
			}
		}
	}

	// Concatenate date parts
	date.part = '';
	for (let i in parts) {
		date.part += parts[i].part + ' ';
	}

	// clean up date part
	if (date.part) {
		date.part = date.part.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, "");
	}

	if (date.part === "" || date.part == undefined) {
		delete date.part;
	}

	//make sure year is always a string
	if (date.year || date.year === 0) date.year += '';

	return date;
}

/**
 * Attempts to convert string date (e.g. 04/10/2021) into ISO 8601 string
 * Uses strToDate, which parses according to browser's locale
 */
function strToISO(str) {
	const date = strToDate(str);

	if (date.year) {
		var dateString = lpad(date.year, "0", 4);
		if (parseInt(date.month) == date.month) {
			dateString += "-" + lpad(date.month + 1, "0", 2);
			if (date.day) {
				dateString += "-" + lpad(date.day, "0", 2);
			}
		}
		return dateString;
	}
	return false;
}

export { strToDate, strToISO };
