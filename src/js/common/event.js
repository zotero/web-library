'use strict';


const isTriggerEvent = ev => ev.type === 'keydown' && (ev.key === 'Enter' || ev.key === ' ');

module.exports = {
	isTriggerEvent
}
