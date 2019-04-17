/* eslint-disable react/no-deprecated */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { noop } from '../../utils';
import AutoResizer from './auto-resizer';
import Spinner from '../ui/spinner';

class Input extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			value: props.value
		};
	}

	cancel(event = null) {
		this.props.onCancel(this.hasChanged, event);
		this.hasBeenCancelled = true;
		this.input.blur();
	}

	commit(event = null) {
		this.props.onCommit(this.state.value, this.hasChanged, event);
		this.hasBeenCommitted = true;
	}

	focus() {
		if(this.input != null) {
			this.input.focus();
			this.props.selectOnFocus && this.input.select();
		}
	}

	componentWillReceiveProps({ value }) {
		if (value !== this.props.value) {
			this.setState({ value });
		}
	}

	handleChange({ target }) {
		this.setState({ value: target.value });
		this.props.onChange(target.value);
	}

	handleBlur(event) {
		const shouldCancel = this.props.onBlur(event);
		if (this.hasBeenCancelled || this.hasBeenCommitted) { return; }
		shouldCancel ? this.cancel(event) : this.commit(event);
	}

	handleFocus(event) {
		this.props.selectOnFocus && event.target.select();
		this.props.onFocus(event);
	}

	handleKeyDown(event) {
		switch (event.key) {
			case 'Escape':
				this.cancel(event);
			break;
			case 'Enter':
				this.commit(event);
			break;
		default:
			return;
		}
	}

	get value() {
		return this.state.value;
	}

	get hasChanged() {
		return this.state.value !== this.props.value;
	}

	renderInput() {
		this.hasBeenCancelled = false;
		this.hasBeenCommitted = false;
		const extraProps = Object.keys(this.props).reduce((aggr, key) => {
			if(key.match(/^(aria-|data-).*/)) {
				aggr[key] = this.props[key];
			}
			return aggr;
		}, {});
		const input = <input
			autoFocus={ this.props.autoFocus }
			className={ this.props.className }
			disabled={ this.props.isDisabled }
			form={ this.props.form }
			id={ this.props.id }
			inputMode={ this.props.inputMode }
			max={ this.props.max }
			maxLength={ this.props.maxLength }
			min={ this.props.min }
			minLength={ this.props.minLength }
			name={ this.props.name }
			onBlur={ this.handleBlur.bind(this) }
			onChange={ this.handleChange.bind(this) }
			onFocus={ this.handleFocus.bind(this) }
			onKeyDown={ this.handleKeyDown.bind(this) }
			placeholder={ this.props.placeholder }
			readOnly={ this.props.isReadOnly }
			ref={ input => this.input = input }
			required={ this.props.isRequired }
			spellCheck={ this.props.spellCheck }
			step={ this.props.step }
			tabIndex={ this.props.tabIndex }
			type={ this.props.type }
			value={ this.state.value }
			{ ...extraProps }
		/>;
		return this.props.resize ?
			<AutoResizer
				content={ this.state.value }
				vertical={ this.props.resize === 'vertical' }
			>
				{ input }
			</AutoResizer> :
			input;
	}

	renderSpinner() {
		return this.props.isBusy ? <Spinner /> : null;
	}

	render() {
		const className = cx({
			'input-group': true,
			'input': true,
			'busy': this.props.isBusy
		}, this.props.inputGroupClassName);
		return (
			<div className={ className }>
				{ this.renderInput() }
				{ this.renderSpinner() }
			</div>
		);
	}

	static defaultProps = {
		className: 'form-control',
		onBlur: noop,
		onCancel: noop,
		onChange: noop,
		onCommit: noop,
		onFocus: noop,
		tabIndex: -1,
		type: 'text',
		value: '',
	};

	static propTypes = {
		autoFocus: PropTypes.bool,
		className: PropTypes.string,
		form: PropTypes.string,
		id: PropTypes.string,
		inputGroupClassName: PropTypes.string,
		inputMode: PropTypes.string,
		isBusy: PropTypes.bool,
		isDisabled: PropTypes.bool,
		isReadOnly: PropTypes.bool,
		isRequired: PropTypes.bool,
		max: PropTypes.number,
		maxLength: PropTypes.number,
		min: PropTypes.number,
		minLength: PropTypes.number,
		name: PropTypes.string,
		onBlur: PropTypes.func.isRequired,
		onCancel: PropTypes.func.isRequired,
		onChange: PropTypes.func.isRequired,
		onCommit: PropTypes.func.isRequired,
		onFocus: PropTypes.func.isRequired,
		placeholder: PropTypes.string,
		resize: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
		selectOnFocus: PropTypes.bool,
		spellCheck: PropTypes.bool,
		step: PropTypes.number,
		tabIndex: PropTypes.number,
		type: PropTypes.string.isRequired,
		value: PropTypes.string.isRequired,
	};
}

export default Input;
