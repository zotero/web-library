/* eslint-disable react/no-deprecated */
'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');
const { noop } = require('../../utils');

const Spinner = require('../ui/spinner');
const Select = require('react-select').default;

class SelectInput extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			value: props.value
		};
	}

	cancel(event = null) {
		this.props.onCancel(this.hasChanged, event);
	}

	commit(event = null, value = null, force = false) {
		this.props.onCommit(value || this.state.value, force ? true : this.hasChanged, event);
	}

	focus() {
		if(this.input != null) {
			this.input.focus();
		}
	}

	componentWillReceiveProps({ value }) {
		if (value !== this.props.value) {
			this.setState({ value });
		}
	}

	handleChange(value) {
		value = value !== null || (value === null && this.props.clearable) ?
			value : this.props.value;
		this.setState({ value });

		if(this.props.onChange(value) || this.forceCommitOnNextChange) {
			this.commit(null, value, value !== this.props.value);
		}
		this.forceCommitOnNextChange = false;
	}

	handleBlur(event) {
		this.props.onBlur(event);
		this.cancel();
		if(this.props.autoBlur) {
			this.forceCommitOnNextChange = true;
		}
	}

	handleFocus(event) {
		this.props.onFocus(event);
	}

	handleKeyDown(event) {
		switch (event.key) {
			case 'Escape':
				this.cancel(event);
			break;
		default:
			return;
		}
	}

	get hasChanged() {
		return this.state.value !== this.props.value;
	}

	get defaultSelectProps() {
		return {
			simpleValue: true,
			clearable: false,
		};
	}

	get className() {
		return {
			'input-group': true,
			'busy': this.props.isBusy
		};
	}

	renderInput() {
		return <Select
			{ ...this.defaultSelectProps }
			{ ...this.props }
			autoFocus= { this.props.autoFocus }
			className={ cx('form-control', this.props.className) }
			disabled={ this.props.isDisabled }
			id={ this.props.id }
			onBlur={ this.handleBlur.bind(this) }
			onChange={ this.handleChange.bind(this) }
			onFocus={ this.handleFocus.bind(this) }
			onInputKeyDown={ this.handleKeyDown.bind(this) }
			options={ this.props.options }
			placeholder={ this.props.placeholder }
			readOnly={ this.props.isReadOnly }
			ref={ input => this.input = input }
			required={ this.props.isRequired }
			tabIndex={ this.props.tabIndex }
			value={ this.state.value }
		/>;
	}

	renderSpinner() {
		return this.props.isBusy ? <Spinner /> : null;
	}

	render() {
		return (
			<div className={ cx(this.className) }>
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
		className: PropTypes.string,
		id: PropTypes.string,
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
