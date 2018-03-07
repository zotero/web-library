'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { noop } = require('../utils');

const Spinner = require('./ui/spinner');
const Select = require('react-select').default;

class SelectInput extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			value: props.value
		};
	}

	cancel() {
		this.props.onCancel(this.hasChanged);
	}

	commit() {
		this.props.onCommit(this.state.value, this.hasChanged);
	}

	componentWillReceiveProps({ value }) {
		if (value !== this.props.value) {
			this.setState({ value });
		}
	}

	handleChange(value) {
		this.props.onChange(value);
		this.setState({ value }, this.commit.bind(this));
	}

	handleBlur(event) {
		const shouldCancel = this.props.onBlur(event);
		shouldCancel ? this.cancel() : this.commit();
	}

	handleFocus(event) {
		this.props.autoSelect && event.target.select();
		this.props.onFocus(event);
	}

	get hasChanged() {
		return this.state.value !== this.props.value;
	}

	get selectProps() {
		return {
			simpleValue: true,
			openOnFocus: true,
			clearable: false,
			...this.props.selectProps
		};
	}

	renderInput() {
		return <Select
			className={ this.props.className }
			disabled={ this.props.isDisabled }
			onBlur={ this.handleBlur.bind(this) }
			onChange={ this.handleChange.bind(this) }
			onFocus={ this.handleFocus.bind(this) }
			placeholder={ this.props.placeholder }
			readOnly={ this.props.isReadOnly }
			required={ this.props.isRequired }
			tabIndex={ this.props.tabIndex }
			value={ this.state.value }
			autoFocus= { this.props.autoFocus }
			options={ this.props.options }
			{ ...this.selectProps }
		/>;
	}

	renderSpinner() {
		return this.props.isBusy ? <Spinner /> : null;
	}

	render() {
		return (
			<div className="input-group">
				{ this.renderInput() }
				{ this.renderSpinner() }
			</div>
		);
	}

	static defaultProps = {
		onBlur: noop,
		onCancel: noop,
		onChange: noop,
		onCommit: noop,
		onFocus: noop,
		options: [],
		selectProps: {},
		tabIndex: -1,
		value: '',
	};

	static propTypes = {
		autoFocus: PropTypes.bool,
		autoSelect: PropTypes.bool,
		className: PropTypes.string,
		isBusy: PropTypes.bool,
		isDisabled: PropTypes.bool,
		isReadOnly: PropTypes.bool,
		isRequired: PropTypes.bool,
		onBlur: PropTypes.func.isRequired,
		onCancel: PropTypes.func.isRequired,
		onChange: PropTypes.func.isRequired,
		onCommit: PropTypes.func.isRequired,
		onFocus: PropTypes.func.isRequired,
		options: PropTypes.array.isRequired,
		placeholder: PropTypes.string,
		selectProps: PropTypes.object.isRequired,
		tabIndex: PropTypes.number,
		value: PropTypes.string.isRequired,
	};
}

module.exports = SelectInput;