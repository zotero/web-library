'use strict';

module.exports = {
	...(require('./collections')),
	...(require('./groups')),
	...(require('./init')),
	...(require('./items-export')),
	...(require('./items-read')),
	...(require('./items-write')),
	...(require('./library')),
	...(require('./meta')),
	...(require('./preferences')),
	...(require('./styles')),
	...(require('./tags')),
	...(require('./triggers')),
}
