/* eslint-disable react/no-deprecated */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { noop } from '../../utils';
import AutoResizer from './auto-resizer';
import Spinner from '../ui/spinner';

class TextAreaInput extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			value: props.value
		};
	}

	cancel(event = null) {
		this.props.onCancel(this.hasChanged, event);
	}

	commit(event = null) {
		this.props.onCommit(this.state.value, this.hasChanged, event);
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
		shouldCancel ? this.cancel(event) : this.commit(event);
	}

	handleFocus(event) {
		this.props.selectOnFocus && event.target.select();
		this.props.onFocus(event);
	}

	handleKeyDown(event) {
		const { isSingleLine } = this.props;
		switch (event.key) {
			case 'Escape':
				this.cancel(event);
			break;
			case 'Enter':
				if(event.shiftKey || isSingleLine) {
					event.preventDefault();
					this.commit(event);
				}
			break;
		default:
			return;
		}
	}

	get hasChanged() {
		return this.state.value !== this.props.value;
	}

	renderInput() {
		const extraProps = Object.keys(this.props).reduce((aggr, key) => {
			if(key.match(/^(aria-|data-).*/)) {
				aggr[key] = this.props[key];
			}
			return aggr;
		}, {});
		const input = <textarea
			autoComplete={ this.props.autoComplete }
			autoFocus={ this.props.autoFocus }
			className={ this.props.className }
			cols={ this.props.cols }
			disabled={ this.props.isDisabled }
			form={ this.props.form }
			id={ this.props.id }
			maxLength={ this.props.maxLength }
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
			rows={ this.props.rows }
			spellCheck={ this.props.spellCheck }
			tabIndex={ this.props.tabIndex }
			value={ this.state.value }
			wrap={ this.props.wrap }
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
			'textarea': true,
			'busy': this.props.isBusy
		}, this.props.inputGroupClassName);
		return (
			<div className={ cx(className) }>
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
		value: '',
	};

	static propTypes = {
		autoComplete: PropTypes.bool,
		autoFocus: PropTypes.bool,
		className: PropTypes.string,
		cols: PropTypes.number,
		form: PropTypes.string,
		id: PropTypes.string,
		inputGroupClassName: PropTypes.string,
		isBusy: PropTypes.bool,
		isDisabled: PropTypes.bool,
		isReadOnly: PropTypes.bool,
		isRequired: PropTypes.bool,
		isSingleLine: PropTypes.bool,
		maxLength: PropTypes.number,
		minLength: PropTypes.number,
		name: PropTypes.string,
		onBlur: PropTypes.func.isRequired,
		onCancel: PropTypes.func.isRequired,
		onChange: PropTypes.func.isRequired,
		onCommit: PropTypes.func.isRequired,
		onFocus: PropTypes.func.isRequired,
		placeholder: PropTypes.string,
		resize: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
		rows: PropTypes.number,
		selectOnFocus: PropTypes.bool,
		spellCheck: PropTypes.bool,
		tabIndex: PropTypes.number,
		value: PropTypes.string.isRequired,
		wrap: PropTypes.bool,
	};
}

export default TextAreaInput;
