import { useEffect, useRef, useState } from 'react';

// keep track of `value`. When unmounting call `callback` with the most recent value of `value`.
const usePrepForUnmount = (callback, values) => {
	const ref = useRef();

	if(!Array.isArray(values)) {
		values = [values];
	}

	useEffect(() => {
		ref.current = values;
	});

	useEffect(() => () => callback(ref.current), []); // eslint-disable-line react-hooks/exhaustive-deps
}

// Coerce value to boolean and keep track of it.
// When it goes false -> true, outputs true immediately
// When it goes true -> false, remains true for delay ms
// Used to avoid flickers etc.
const useBufferGate = (newValue, delay = 250) => {
	newValue = !!newValue;

	const [bufValue, setBufValue] = useState(newValue);
	const nextValue = useRef(newValue);
	const timeout = useRef(null);

	if(newValue === bufValue || newValue === nextValue.current) {
		return bufValue;
	}

	if(timeout.current) {
		clearTimeout(timeout.current);
	}
	nextValue.current = newValue;

	if(newValue) {
		// newValue is truthy, set instantly
		setBufValue(newValue);
	} else {
		// newValue is falsy, set with delay
		timeout.current = setTimeout(() => setBufValue(newValue), delay);
	}

	return bufValue;
}

export { useBufferGate, usePrepForUnmount };
