/**
 * This file contains all the client-side functionality
 * Depends on JQuery (currently 1.6.4) 
 */

$(document).ready(setupDocument);

function setupDocument() {
	// H1 is the document title, but it doesn't have a useful name, so we'll skip it for now
	// $("span.h1").addClass("annot-anchor");
	$("span.h2").addClass("annot-anchor");
	$("span.h3").addClass("annot-anchor");
	$("span.h4").addClass("annot-anchor");
	$(".annot-anchor").each(function(i) {
		$(this).attr("id", "annot-" + $(this).find("a").attr("name"));
	});

	$(".annot-anchor").append(
			"<img class='annot-add-icon' src='/static/media/primo-partial/comment_add.png' width='32'/>");
	$(".annot-add-icon").click(createClicked);
}

function wysiwygControls() {
	var controls = {
		bold : {
			visible : true
		},
		italic : {
			visible : true
		},
		strikeThrough : {
			visible : true
		},
		underline : {
			visible : true
		},

		separator00 : {
			visible : true
		},

		justifyLeft : {
			visible : true
		},
		justifyCenter : {
			visible : true
		},
		justifyRight : {
			visible : true
		},
		justifyFull : {
			visible : true
		},

		separator01 : {
			visible : true
		},

		indent : {
			visible : true
		},
		outdent : {
			visible : true
		},

		separator02 : {
			visible : true
		},

		subscript : {
			visible : true
		},
		superscript : {
			visible : true
		},

		separator03 : {
			visible : true
		},

		undo : {
			visible : true
		},
		redo : {
			visible : true
		},

		separator04 : {
			visible : true
		},

		insertOrderedList : {
			visible : true
		},
		insertUnorderedList : {
			visible : true
		},
		insertHorizontalRule : {
			visible : true
		},

/*
		separator07 : {
			visible : true
		},
*/

		cut : {
			visible : true
		},
		copy : {
			visible : true
		},
		paste : {
			visible : true
		},
		insertImage : {
			visible : false
		}
	};
	return controls;
}

function wysiwygOptions(initial_text) {
	options = {	
		controls : wysiwygControls(),
		tableFiller : '',
		initialContent : initial_text,
		rmUnusedControls : true,
		brIE: false
	};
	return options;
}

function createClicked(event) {
	if (!window.rfcpop.is_authenticated) {
		custom_alert('Please login or register to create a comment');
		return;
	}
	var target = $(event.target);
	var parent = target.parent();
	var annotId = parent.attr("id");
	var edit_block = $("<div class='annot-edit-block'>" + 
			"<textarea class='annot-edit' cols='60' rows='5'/>" +
			"<input class='annot-save-button' type='button' value='Save'/>" +
			"<input class='annot-cancel-button' type='button' value='Cancel'/>" +
			"</div>");
	parent.append(edit_block);
	var area = parent.find(".annot-edit");
	area.wysiwyg(wysiwygOptions(''));
	area.wysiwyg('focus');
	$(".annot-save-button").click(saveClicked);
	$(".annot-cancel-button").click(cancelClicked);
}

function saveClicked(event) {
	var button = $(event.target);
	var area = button.parent().find(".annot-edit");
	var annotText = area.wysiwyg("getContent");
	var edit_block = button.parents('.annot-edit-block');
	area.wysiwyg('destroy');
	delete area.wysiwyg;
	var docAnchor = area.parents('.annot-anchor').attr('id');
	if (annotText == '') { // no text
		edit_block.remove();
		return;
	}
	var doc_id = window.rfcpop.doc_id;
	var saveUrl = '/rfcpop/annot/?doc_id=' + doc_id + '&bookmark='
			+ docAnchor;
	// Must send the CSRF token, otherwise it's a 403
	var csrftoken = $.cookie('csrftoken');
	$.ajax({
		url : saveUrl,
		type : 'POST',
		contentType: 'text/html',
		data : annotText,
		beforeSend: function (request) {
                	request.setRequestHeader("X-CSRFToken", csrftoken);
            	},
		success: function(data, testStatus, xhr) {
			var annot_url = xhr.getResponseHeader('Location');
			edit_block.remove();
			renderAnnot(docAnchor, annotText, null, annot_url, '');
		},
		error : function(data, textStatus, errorThrown) {
			custom_alert("Could not save annotation [" + textStatus + '] '
					+ errorThrown);
		}
	});
}

function cancelClicked(event) {
	var button = $(event.target);
	var area = button.parent().find(".annot-edit");
	var edit_block = button.parents('.annot-edit-block');
	area.wysiwyg('destroy');
	delete area.wysiwyg;
	edit_block.remove();
}

$(document).ready(addDocHeader);
$(document).ready(getAnnotations);

function addDocHeader() {
	if (window.rfcpop.is_authenticated) {
		var nickname = window.rfcpop.author_nickname
		$("body").prepend(
		"<div class='annot-top-banner'>" +
		"<a href='/rfcpop/'> <img class='annot-home-button' src='/static/media/primo-partial/home.png' /></a>" +
		"Welcome " +
		"<span class='annot-full-name'>" + nickname + '</span>' +
		"<div class='annot-logout'><a href='/rfcpop/logout/'>Logout</a></div></div>");
	} else {
		$("body").prepend(
		"<div class='annot-top-banner'>" +
		"<a href='/rfcpop/'> <img class='annot-home-button' src='/static/media/primo-partial/home.png' /></a>" +
		"Welcome Guest! Please <a href='/rfcpop/login/'>login or register</a> to create your own comments.</div>");
	}
	$('.annot-top-banner').sticky();
}

function getAnnotations() {
	var doc_id = window.rfcpop.doc_id;
	var listUrl = '/rfcpop/annot/?doc_id=' + doc_id;
	$.getJSON(listUrl, null, handleAnnotationList)
	.error(function(data, textStatus, errorThrown) { custom_alert("Could not list annotation [" + textStatus + '] '
			+ errorThrown); });
}

function handleAnnotationList(data) {
	$(data).each(function () {
		var annot_url = '/rfcpop/annot/'+this.pk;
		renderAnnot(this.bookmark, this.text, this.author, annot_url, this.saved);
	});
}

function staticAnnotText() {
	return "<div class='annot-block'>"+
		"  <div class='annot-header'>"+
		"    <span class='annot-author'></span>"+
		"    <span class='annot-saved'></span>"+
		"  </div>"+
		"  <div class='annot-text'></div>"+
		"  <div class='annot-action-buttons'>"+
		"    <input type='button' class='annot-edit-button' value='Edit'/>"+
		"    <input type='button' class='annot-delete-button' value='Delete'/>"+
		"  </div>"+
		"</div>";
}

function renderAnnot(bookmark, text, author, annot_url, saved_date) {
	var is_authenticated = window.rfcpop.is_authenticated
	var my_author_id = window.rfcpop.author_id
	var my_nickname = window.rfcpop.author_nickname
	var anchor = document.getElementById(bookmark);
	var sanitized_text = html_sanitize(text, urlSanitizer, null);
	var not_my_comment = (!is_authenticated || (author && my_author_id != author.pk));
	var author_display_name;
	if (not_my_comment) {
		author_display_name = author.nickname;
	} else {
		author_display_name = my_nickname;
	}
	// TODO: add icons
	var newDiv = $(staticAnnotText());
	newDiv.find('.annot-text').html(text);
	newDiv.find('.annot-author').html(author_display_name);
	newDiv.find('.annot-saved').html(saved_date);
	$(anchor).append(newDiv);
	var edit_button = newDiv.find('.annot-edit-button');
	var delete_button = newDiv.find('.annot-delete-button');
	
	if (not_my_comment) {
		edit_button.hide();
		delete_button.hide();
	} else {
		edit_button.attr('target', annot_url);
		edit_button.click(editButtonClicked);
		delete_button.attr('target', annot_url);
		delete_button.click(deleteButtonClicked);
	}
}

function deleteButtonClicked(event) {
	var button = $(this);
	var annot_url = button.attr('target');
	var annot_block = button.parents('.annot-block');
	deleteAnnot(annot_url, annot_block);
}

function deleteAnnot(annot_url, annot_block) {
	var csrftoken = $.cookie('csrftoken');
	$.ajax({
		url : annot_url,
		type : 'DELETE',
		beforeSend: function (request) {
                	request.setRequestHeader("X-CSRFToken", csrftoken);
            	},
		success: function(data) {
			// TODO: animate
			if (annot_block)
				annot_block.remove();
		},
		error : function(data, textStatus, errorThrown) {
			custom_alert("Could not delete annotation [" + textStatus + '] '
					+ errorThrown);
		}
	});
}

function urlSanitizer(in_url) {
	try {
		var parsed = $.url(in_url, true);
		var host = parsed.attr('host');
	} catch (e) {
		return null;
	}
	switch (host) {
		case 'www.ietf.org':
		case 'tools.ietf.org':
		case 'datatracker.ietf.org':
		case 'rfcpop.d.porticor.net':
			return in_url;
		default:
			return null;
	}
}

function editButtonClicked(event) {
	var target = $(event.target);
	var current_block = target.parents('.annot-block');
	var parent = current_block.parent();
	var annot_url = target.attr("target");
	var initial_text = target.parents('.annot-block').find('.annot-text').html();
	current_block.remove()
	var edit_block = $("<div class='annot-edit-block'>" + 
			"<textarea class='annot-edit' cols='60' rows='5'/>" +
			"<input class='annot-save-button' type='button' value='Save'/>" +
			"<input class='annot-cancel-button' type='button' value='Cancel'/>" +
			"</div");
	parent.append(edit_block);
	var area = parent.find(".annot-edit");
	area.wysiwyg(wysiwygOptions(initial_text));
	area.wysiwyg('focus');
	$(".annot-save-button").click(editSaveButtonClicked);
	$(".annot-save-button").attr('target', annot_url);
	$(".annot-cancel-button").click(editCancelButtonClicked);
	$(".annot-cancel-button").attr('target', annot_url);
	$(".annot-cancel-button").attr('initial_text', initial_text);
}

function editSaveButtonClicked(event) {
	var button = $(event.target);
	var area = button.parent().find(".annot-edit");
	var edit_block = button.parents('.annot-edit-block');
	var annotText = area.wysiwyg("getContent");
	area.wysiwyg('destroy');
	delete area.wysiwyg;
	var parent = area.parents('.annot-anchor');
	var docAnchor = parent.attr('id');
	if (annotText == '') { // no text
		area.remove();
		deleteAnnot(annotUrl, null);
		return;
	}
	var editUrl = button.attr('target');
	// Must send the CSRF token, otherwise it's a 403
	var csrftoken = $.cookie('csrftoken');
	$.ajax({
		url : editUrl,
		type : 'PUT',
		contentType: 'text/html',
		data : annotText,
		beforeSend: function (request) {
                	request.setRequestHeader("X-CSRFToken", csrftoken);
            	},
		success: function(data, testStatus, xhr) {
			edit_block.remove();
			renderAnnot(docAnchor, annotText, null, editUrl, '');
		},
		error : function(data, textStatus, errorThrown) {
			custom_alert("Could not save annotation [" + textStatus + '] '
					+ errorThrown);
		}
	});
}

function editCancelButtonClicked(event) {
	var button = $(event.target);
	var area = button.parent().find(".annot-edit");
	area.wysiwyg('destroy');
	delete area.wysiwyg;
	var parent = area.parents('.annot-anchor');
	var docAnchor = parent.attr('id');
	var edit_block = button.parents('.annot-edit-block');
	edit_block.remove();
	var annot_url = button.attr('target');
	var initial_text = button.attr('initial_text');
	renderAnnot(docAnchor, initial_text, window.rfcpop.author_id, annot_url, '');
}

function custom_alert(output_msg, title_msg) {
    if (!title_msg)
        title_msg = 'Alert';

    if (!output_msg)
        output_msg = 'No Message to Display.';

    $("<div></div>").html(output_msg).dialog({
        title: title_msg,
        resizable: false,
        modal: true,
        buttons: {
            "OK": function() 
            {
                $(this).dialog("close");
            }
        }
	});
}
