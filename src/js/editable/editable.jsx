'use strict';

import React from 'react';
import InjectableComponentsEnhance from '../enhancers/injectable-components-enhancer';

class Editable extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			processing: false,
			editing: false,
			value: props.value
		};
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			value: nextProps.value
		});
	}

	save(newValue) {
		this.cancelPending();
		this.setState({
			processing: true
		}, () => {
			let promise = this.props.onSave(newValue);
			promise.then(processedValue => {
				this.setState({
					value: processedValue,
					editing: false,
					processing: false
				});
			});
			promise.catch(() => {
				this.setState({
					value: this.props.value,
					editing: true,
					processing: false
				});
			});
		});
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

	blurHandler() {
		this.pending = setTimeout(() => { 
			this.save(this.input.value);
		}, 100);
	}

	render() {
		let Spinner = this.props.components['Spinner'];
		if(this.state.processing) {
			return <Spinner />;
		}
		else if(this.state.editing) {
			return <form className="editable editable-field editable-editing"
				onSubmit={ev => { this.submitHandler(ev); }}>
				<input
					ref={ ref => this.input = ref }
					disabled={ this.state.processing ? 'disabled' : null }
					value={ this.state.value }
					placeholder={ this.props.placeholder }
					onChange={ ev => this.changeHandler(ev) }
					onKeyUp={ ev => this.keyboardHandler(ev) }
					onBlur={ ev => this.blurHandler(ev) } />
			</form>;
		} else {
			return <span 
				className="editable editable-field"
				onClick={ ev => this.editHandler(ev) }>
					{ this.state.value || this.props.emptytext }
				</span>;
		}
	}
}


Editable.propTypes = {
	value: React.PropTypes.string,
	placeholder: React.PropTypes.string,
	emptytext: React.PropTypes.string,
	onSave: React.PropTypes.func,
	onChange: React.PropTypes.func,
	editOnClick: React.PropTypes.bool
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