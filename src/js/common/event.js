'use strict';

const isTriggerEvent = ev => ev && (ev.type === 'click' ||
	ev.type === 'keydown' && (ev.key === 'Enter' || ev.key === ' '));

module.exports = {
	isTriggerEvent
}
