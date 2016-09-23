'use strict';

var log = require('libzotero/lib/Log').Logger('zotero-web-library:recentItems');

var React = require('react');

var CreateGroup = React.createClass({
	componentWillMount: function() {
	},
	getDefaultProps: function() {
	},
	getInitialState: function() {
		return {
			name: '',
			type: 'PublicOpen',
			checkingName:false,
			nameValid:null
		};
	},
	changeType: function(evt) {
		this.setState({type:evt.target.value});
		this.changeName();
	},
	changeName: function(evt) {
		if(evt){
			this.setState({name:evt.target.value, nameValid:null});
		}

		clearTimeout(this.state.timer);
		let timeout = setTimeout(() => {
			var groupType = J('input[name=group_type]:checked').val();
			// update slug preview text
			if(groupType == 'Private'){
				J('#slugpreview').text('Group URL: ' +Zotero.config.baseZoteroWebsiteUrl + '/' + 'groups/<number>');
			}
			else{
				J('#slugpreview').text('Group URL: ' +Zotero.config.baseZoteroWebsiteUrl + '/' + 'groups/' +
				Zotero.utils.slugify(J('input#name').val()) );
			}
			
			if(groupType != 'Private'){
				// Poll the server with the input value
				J.getJSON(`${Zotero.config.baseWebsiteUrl}/groups/checkname`, {'input':this.state.name}, (data)=>{
					if(data.valid){
						this.setState({nameValid:true});
					} else {
						this.setState({nameValid:false});
					}
				});
			}
		}, 300);
		this.setState({timer:timeout});
	},
	render: function() {
		let slugPreview = '';
		if(this.state.type == 'Private') {
			slugPreview = `Group URL: ${Zotero.config.baseZoteroWebsiteUrl}/groups/<number>`;
		} else {
			let slug = Zotero.utils.slugify(this.state.name);
			slugPreview = `Group URL: ${Zotero.config.baseZoteroWebsiteUrl}/groups/${slug}`;
		}
		let slugStyle = {};
		if(this.state.type != 'Private'){
			if(this.state.nameValid === true){
				slugStyle.color = 'green';
			} else if(this.state.nameValid === false){
				slugStyle.color = 'red';
			}
		}

		let sessionKey = Zotero.utils.readCookie(Zotero.config.sessionCookieName);
		return (
			<div>
				<h1>Create a New Group</h1>
				<form enctype="application/x-www-form-urlencoded" accept-charset="utf-8" method="post" className="zform" action="">
					<div className="row">
						<div className="col-md-6">
							<div className="form-group">
								<label for="name" className="required">Group Name</label>
								<input className="form-control" type="text" name="name" id="name" size="60" value={this.state.name} onChange={this.changeName} />
								<label id='slugpreview' style={slugStyle}>{slugPreview}</label>
							</div>
						</div>
					</div>
					<div className="row">
						<div className="form-group">
							<legend>Group Type</legend>
							<div id="public-open" className="group-select">
								<h2>Public, Open Membership</h2>
								<p>Anyone can view your group online and join the group instantly.</p>
								<label for="group_type-PublicOpen">
									<input type="radio" name="group_type" id="group_type-PublicOpen" onChange={this.changeType} value="PublicOpen" checked={this.state.type=='PublicOpen'} />
									Choose a Public, Open Membership
								</label>
							</div>
							<div id="public-closed" className="group-select">
								<h2>Public, Closed Membership</h2>
								<p>Anyone can view your group online, but members must apply or be invited.</p>
								<label for="group_type-PublicClosed">
									<input type="radio" name="group_type" id="group_type-PublicClosed" onChange={this.changeType} value="PublicClosed" checked={this.state.type=='PublicClosed'} />
									Choose Public, Closed Membership
								</label>
							</div>
							<div id="private" className="group-select">
								<h2>Private Membership</h2>
								<p>Only members can view your group online and must be invited to join.</p>
								<label for="group_type-Private">
									<input type="radio" name="group_type" id="group_type-Private" onChange={this.changeType} value="Private" checked={this.state.type=='Private'} />
									Choose Private Membership
								</label>
							</div>
						</div>
					</div>
					<div className="row">
						<button name="submit" id="submit" type="submit" className="btn btn-primary">Create Group</button>
					</div>
					<input type='hidden' name='session' value={sessionKey} />
				</form>
			</div>    
		);
	}
});

module.exports = CreateGroup;
