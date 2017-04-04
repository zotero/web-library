'use strict';

import React from 'react';
import Select from 'react-select';
import InjectableComponentsEnhance from '../enhancers/injectable-components-enhancer';

class Editable extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			editing: false,
			value: props.value
		};
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			value: nextProps.value
		});
	}

	async save(newValue) {
		this.cancelPending();
		let promise = this.props.onSave(newValue);
		if(promise && 'then' in promise) {
			this.setState({
				processing: true
			}, () => {
				promise.then(processedValue => {
					this.setState({
						value: processedValue,
						editing: false,
						processing: false
					});
				}).catch(() => {
					this.setState({
						value: this.props.value,
						editing: true,
						processing: false
					});
				});
			});
		}
	}

	edit() {
		this.setState({
			editing: true 
		}, () => {
			this.input.focus();
		});
	}

	cancel() {
		this.cancelPending();
		this.setState({
			editing: false
		});
	}

	cancelPending() {
		clearTimeout(this.pending);
	}

	editHandler(ev) {
		ev && ev.preventDefault();
		if(this.props.editOnClick) {
			this.edit();
		}
	}

	cancelHandler(ev) {
		ev && ev.preventDefault();
		return this.cancel();
	}

	submitHandler(ev) {
		ev && ev.preventDefault();
		return this.save(this.input.value);
	}

	keyboardHandler(ev) {
		if(ev.keyCode == 27) {
			this.cancelPending();
			ev.preventDefault();
			this.cancel();
		}
	}

	changeHandler(ev) {
		ev && ev.preventDefault();
		this.setState({
			value: this.input.value
		}, this.props.onChange);
	}

	selectChangeHandler(newValue) {
		this.setState({
			value: newValue
		}, this.props.onChange);
	}

	blurHandler() {
		this.pending = setTimeout(() => { 
			this.save(this.input.value || this.input.props.value);
		}, 100);
	}

	render() {
		let Spinner = this.props.components['Spinner'];
		if(this.state.processing || this.props.processing) {
			return <Spinner />;
		} else if(this.state.editing) {
			if(this.props.options && this.props.options.length) {
				return (
					<form
						className="editable editable-select editable-editing"
						onSubmit={ev => { this.submitHandler(ev); }}>
						<Select
							simpleValue
							clearable = { false }						
							ref={ ref => this.input = ref }
							value={ this.state.value }
							options={ this.props.options }
							onChange={ this.selectChangeHandler.bind(this) }
							onBlur={ ev => this.blurHandler(ev) } />
					</form>
				);
			} else {
				return (
					<form
						className="editable editable-field editable-editing"
						onSubmit={ev => { this.submitHandler(ev); }}>
						<input
							ref={ ref => this.input = ref }
							// disabled={ this.state.processing ? 'disabled' : null }
							value={ this.state.value }
							placeholder={ this.props.placeholder }
							onChange={ ev => this.changeHandler(ev) }
							onKeyUp={ ev => this.keyboardHandler(ev) }
							onBlur={ ev => this.blurHandler(ev) } />
					</form>
				);
			}
		} else {
			return <span 
				className="editable editable-field"
				onClick={ ev => this.editHandler(ev) }>
					{ (React.Children.count && this.props.children) || this.state.value || this.props.emptytext }
				</span>;
		}
	}
}


Editable.propTypes = {
	value: React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.number
	]),
	processing: React.PropTypes.bool,
	placeholder: React.PropTypes.string,
	emptytext: React.PropTypes.string,
	onSave: React.PropTypes.func,
	onChange: React.PropTypes.func,
	editOnClick: React.PropTypes.bool,
	options: React.PropTypes.array,
	children: React.PropTypes.node
};

Editable.defaultProps  = {
	value: '',
	placeholder: '',
	emptytext: '',
	onSave: v => Promise.resolve(v),
	onChange: () => {},
	editOnClick: true
};

export default InjectableComponentsEnhance(Editable);