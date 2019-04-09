/* eslint-disable react/no-deprecated */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { noop } from '../../utils';


class RadioSet extends React.PureComponent {
	handleChange = ev => {
		if(this.props.value !== ev.target.value) {
			this.props.onChange(ev.target.value);
		}
	}

	render() {
		const { options, value: selectedValue } = this.props;
		return (
			<fieldset className="form-group">
				{ options.map(({ value, label }) => (
					<label key={ value}>
						<span className="label">
							{ label }
						</span>
						<input
							value={ value }
							type="radio"
							checked={ value === selectedValue }
							onChange={ this.handleChange }
						/>
					</label>
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
