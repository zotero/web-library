/* eslint-disable react/no-deprecated */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { noop, getUniqueId } from '../../utils';


class RadioSet extends React.PureComponent {
	baseId = getUniqueId();

	handleChange = ev => {
		if(this.props.value !== ev.target.value) {
			this.props.onChange(ev.target.value);
		}
	}

	render() {
		const { options, value: selectedValue } = this.props;
		return (
			<fieldset className="form-group radios">
				{ options.map(({ value, label }, index) => (
					<div key={ value} className="radio">
						<input
							id={ this.baseId + '-' + index}
							value={ value }
							type="radio"
							checked={ value === selectedValue }
							onChange={ this.handleChange }
						/>
						<label htmlFor={ this.baseId + '-' + index} key={ value}>
							{ label }
						</label>
					</div>
				))}
			</fieldset>
		)
	}

	static defaultProps = {
		onChange: noop,
		options: [],
	};

	static propTypes = {
		onChange: PropTypes.func.isRequired,
		options: PropTypes.array.isRequired,
		value: PropTypes.string,
	};
}

export default RadioSet;
