'use strict';

var log = require('../../Log.js').Logger('zotero-web-library:uploadDialog');

var React = require('react');

var LoadingSpinner = require('./LoadingSpinner.js');
var BootstrapModalWrapper = require('./BootstrapModalWrapper.js');

var UploadAttachmentDialog = React.createClass({
	componentWillMount: function() {
		var reactInstance = this;
		var library = this.props.library;
		library.listen('uploadAttachment', function(){
			log.debug('got uploadAttachment event; opening upload dialog');
			reactInstance.setState({itemKey: Zotero.state.getUrlVar('itemKey')});
			reactInstance.openDialog();
		}, {});
	},
	getInitialState: function() {
		return {
			title: '',
			fileInfo: null,
			filename: '',
			filesize: 0,
			contentType: null,
			percentLoaded: 0,
			uploading: false,
		};
	},
	upload: function() {
		log.debug('uploadFunction', 3);
		var reactInstance = this;
		var library = this.props.library;

		//callback for when everything in the upload form is filled
		//grab file blob
		//grab file data given by user
		//create or modify attachment item
		//Item.uploadExistingFile or uploadChildAttachment
		
		var fileInfo = this.state.fileInfo;
		var specifiedTitle = this.state.title;
		
		var progressCallback = function(e){
			log.debug('fullUpload.upload.onprogress', 3);
			var percentLoaded = Math.round((e.loaded / e.total) * 100);
			reactInstance.setState({percentLoaded: percentLoaded});
		};
		
		this.setState({uploading:true});
		
		//upload new copy of file if we're modifying an attachment
		//create child and upload file if we're modifying a top level item
		var itemKey = Zotero.state.getUrlVar('itemKey');
		var item = library.items.getItem(itemKey);
		var uploadPromise;
		
		if(!item.get('parentItem')){
			log.debug('no parentItem', 3);
			//get template item
			var childItem = new Zotero.Item();
			childItem.associateWithLibrary(library);
			uploadPromise = childItem.initEmpty('attachment', 'imported_file')
			.then(function(childItem){
				log.debug('templateItemDeferred callback', 3);
				childItem.set('title', specifiedTitle);
				
				return item.uploadChildAttachment(childItem, fileInfo, progressCallback);
			});
		}
		else if(item.get('itemType') == 'attachment' && item.get('linkMode') == 'imported_file') {
			log.debug('imported_file attachment', 3);
			uploadPromise = item.uploadFile(fileInfo, progressCallback);
		}
		
		uploadPromise.then(function(){
			log.debug('uploadSuccess', 3);
			library.trigger('uploadSuccessful');
			reactInstance.closeDialog();
		}).catch(reactInstance.failureHandler)
		.then(function(){
			reactInstance.closeDialog();
		});
	},
	handleUploadFailure: function(failure) {
		log.debug('Upload failed', 3);
		log.debug(failure, 3);
		Zotero.ui.jsNotificationMessage('There was a problem uploading your file.', 'error');
		switch(failure.code){
			case 400:
				Zotero.ui.jsNotificationMessage('Bad Input. 400', 'error');
				break;
			case 403:
				Zotero.ui.jsNotificationMessage('You do not have permission to edit files', 'error');
				break;
			case 409:
				Zotero.ui.jsNotificationMessage('The library is currently locked. Please try again in a few minutes.', 'error');
				break;
			case 412:
				Zotero.ui.jsNotificationMessage('File conflict. Remote file has changed', 'error');
				break;
			case 413:
				Zotero.ui.jsNotificationMessage('Requested upload would exceed storage quota.', 'error');
				break;
			case 428:
				Zotero.ui.jsNotificationMessage('Precondition required error', 'error');
				break;
			case 429:
				Zotero.ui.jsNotificationMessage('Too many uploads pending. Please try again in a few minutes', 'error');
				break;
			default:
				Zotero.ui.jsNotificationMessage('Unknown error uploading file. ' + failure.code, 'error');
		}
	},
	handleFiles: function(files) {
		log.debug('attachmentUpload handleFiles', 3);
		var reactInstance = this;
		
		if(typeof files == 'undefined' || files.length === 0){
			return false;
		}
		var file = files[0];
		
		Zotero.file.getFileInfo(file)
		.then(function(fileInfo){
			log.debug(fileInfo);
			reactInstance.setState({
				fileInfo: fileInfo,
				filename: fileInfo.filename,
				filesize: fileInfo.filesize,
				contentType: fileInfo.contentType
			});
		});
		return;
	},
	handleDrop: function(evt){
		log.debug('fileuploaddroptarget drop callback', 3);
		evt.stopPropagation();
		evt.preventDefault();
		//clear file input so drag/drop and input don't show conflicting information
		var e = evt.originalEvent;
		var dt = e.dataTransfer;
		var files = dt.files;
		this.handleFiles(files);
	},
	handleFileInputChange: function(evt){
		log.debug('fileuploaddroptarget callback 1', 3);
		evt.stopPropagation();
		evt.preventDefault();
		var files = J(this.refs.fileInput).get(0).files;
		this.handleFiles(files);
	},
	handleTitleChange: function(evt) {
		this.setState({title:evt.target.value});
	},
	openDialog: function() {
		this.refs.modal.open();
	},
	closeDialog: function(evt) {
		this.refs.modal.close();
	},
	render: function() {
		var library = this.props.library;
		
		return (
			<BootstrapModalWrapper ref="modal">
				<div id="upload-attachment-dialog" className="upload-attachment-dialog" role="dialog" title="Upload Attachment" data-keyboard="true">
					<div  className="modal-dialog">
						<div className="modal-content">
							<div className="modal-header">
								<button type="button" className="close" data-dismiss="modal" aria-hidden="true">&times;</button>
								<h3 className="modal-title">Upload Attachment</h3>
							</div>
							<div className="upload-attachment-div modal-body" data-role="content">
								<form className="attachmentuploadForm zform">
								<h3>Select a file for upload or drag and drop below</h3>
								<span className="btn btn-primary btn-file">
									Choose File<input onChange={this.handleFileInputChange} ref="fileInput" type="file" id="fileuploadinput" className="fileuploadinput" multiple />
								</span>
								<div onDrop={this.handleDrop} id="fileuploaddroptarget" className="fileuploaddroptarget">
									<h3>Drop your file here</h3>
									<h3 id="droppedfilename" className="droppedfilename"></h3>
									<LoadingSpinner loading={this.state.uploading} />
								</div>
								<div id="attachmentuploadfileinfo" className="attachmentuploadfileinfo">
									<table className="table table-striped">
										<tbody>
										<tr>
											<th>Title</th>
											<td><input onChange={this.handleTitleChange} id="upload-file-title-input" className="upload-file-title-input form-control" type="text" /></td>
										</tr>
										<tr>
											<th>Size</th>
											<td className="uploadfilesize">{this.state.filesize}</td>
										</tr>
										<tr>
											<th>Type</th>
											<td className="uploadfiletype">{this.state.contentType}</td>
										</tr>
										<tr>
											<th>Upload</th>
											<td className="uploadprogress"><meter min="0" max="100" id="uploadprogressmeter" value={this.state.percentLoaded}></meter></td>
										</tr>
										</tbody>
									</table>
								</div>
								</form>

							</div>
							<div className="modal-footer">
								<button type="button" className="btn btn-default" data-dismiss="modal" aria-hidden="true">Close</button>
								<button onClick={this.upload} type="button" className="btn btn-primary uploadButton">Upload</button>
							</div>
						</div>
					</div>
				</div>
			</BootstrapModalWrapper>
		);
	}
});

module.exports = UploadAttachmentDialog;
