import React, { useCallback, useId, memo } from 'react';
import PropTypes from 'prop-types';
import { noop } from 'web-common/utils';

const RadioSet = props => {
	const { options = [], value, onChange = noop } = props;
	const baseId = useId();

	const handleChange = useCallback(ev => {
		if(ev.target.value !== value) {
			onChange(ev.target.value);
		}
	}, [onChange, value]);

	return (
		<fieldset className="form-group radios">
			{ options.map(({ value: optValue, label: optLabel }, index) => (
				<div key={ optValue } className="radio">
					<input
						id={ baseId + '-' + index}
						value={ optValue }
						type="radio"
						checked={ optValue === value }
						onChange={ handleChange }
					/>
					<label htmlFor={ baseId + '-' + index}>
						{ optLabel }
					</label>
				</div>
			))}
		</fieldset>
	);
}

RadioSet.propTypes = {
	onChange: PropTypes.func.isRequired,
	options: PropTypes.array.isRequired,
	value: PropTypes.string,
};

export default memo(RadioSet);
