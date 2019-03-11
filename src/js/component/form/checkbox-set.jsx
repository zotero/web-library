/* eslint-disable react/no-deprecated */
'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { noop } = require('../../utils');


class CheckboxSet extends React.PureComponent {
	handleChange = ev => {
		if(this.props.value !== ev.target.value) {
			this.props.onChange(ev.target.value);
		}
	}

	render() {
		const { options, value: selectedValue } = this.props;
		return (
			<div className="checkbox-set">
				{ options.map(({ value, label }) => (
					<label key={ value}>
						<span className="label">
							{ label }
						</span>
						<input
							value={ value }
							type="checkbox"
							checked={ value === selectedValue }
							onChange={ this.handleChange }
						/>
					</label>
				))}
			</div>
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

module.exports = CheckboxSet;
