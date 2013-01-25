/*
OpenID Provider Selector
http://code.google.com/p/openid-ps/

This library (javascript, css and image files) is licenced under the LGPL license.
*/

(function($) {
    $.fn.extend({
        openIdProviderSelector: function(providers, msgs) {
    		var defaultStrings = {
    			IdentifierRequired: "OpenID authentication requires an input form field called 'openid_identifier'."
    		};
    		
    		var defaultProviders = {
					google: {
						name: 'Google',
						url: 'https://www.google.com/accounts/o8/id',
						hasLargeIcon: true
					},
					yahoo: {
						name: 'Yahoo',
						url: 'http://me.yahoo.com/',
						hasLargeIcon: true
					},
					aol: {
						name: 'AOL',
						label: 'Enter your AOL screenname:',
						url: 'http://openid.aol.com/{username}',
						hasLargeIcon: true
					},
					myopenid: {
						name: 'MyOpenID',
						label: 'Enter your MyOpenID username:',
						url: 'http://{username}.myopenid.com/',
						hasLargeIcon: true
					},
					openid: {
				        name: 'OpenID',
				        url: 'http://',
				        hasLargeIcon: true
					},
				    livejournal: {
				        name: 'LiveJournal',
				        label: 'Enter your Livejournal username:',
				        url: 'http://{username}.livejournal.com/',
				        hasLargeIcon: false
					},
				    wordpress: {
				        name: 'Wordpress',
				        label: 'Enter your Wordpress.com username:',
				        url: 'http://{username}.wordpress.com/',
				        hasLargeIcon: false
				    },
				    blogger: {
				        name: 'Blogger',
				        label: 'Enter your Blogger account:',
				        url: 'http://{username}.blogspot.com/',
				        hasLargeIcon: false
				    },
				    verisign: {
				        name: 'Verisign',
				        label: 'Enter your Verisign username:',
				        url: 'http://{username}.pip.verisignlabs.com/',
				        hasLargeIcon: false
				    },
				    claimid: {
				        name: 'ClaimID',
				        label: 'Enter your ClaimID username:',
				        url: 'http://openid.claimid.com/{username}',
				        hasLargeIcon: false
				    },
				    clickpass: {
				        name: 'ClickPass',
				        label: 'Enter your ClickPass username:',
				        url: 'http://clickpass.com/public/{username}',
				        hasLargeIcon: false
				    }
    		};
    		
    		var cookie = {
    			expire: 6 * 30,
    			name: 'openid-ps',
    			path: '/'
    		};
    		var providers = $.extend(true, defaultProviders, providers);
    		var messages = $.extend(defaultStrings, msgs);
    		
    		return this.each(function() {
    			// Element object reference
                var o = $(this);
                var selectedId;
                
                var input = $("#openid_identifier", o);
                if (!input) {
                	return alert(messages.IdentifierRequired);
                }
                var username = $(".selector .username", o);
                
                // Helpers
                var _setCookie = function (value) {
            		var date = new Date();
            		date.setTime(date.getTime() + (cookie.expire * 24 * 60 * 60 * 1000));
            		input.get()[0].ownerDocument.cookie = cookie.name + "=" + value + "; expires=" + date.toGMTString() + "; path=" + cookie.path;
                };
                var _getCookie = function () {
            		var nameEQ = cookie.name + "=";
            		var ca = input.get()[0].ownerDocument.cookie.split(';');
            		for (var i = 0; i < ca.length; i++) {
            			var chr = ca[i];
            			while (chr.charAt(0) == ' ') {
            				chr = chr.substring(1, chr.length);
            			}
            			if (chr.indexOf(nameEQ) == 0) {
            				return chr.substring(nameEQ.length, chr.length);
            			}
            		}
            		return null;
                };                
                var _setOpenIdUrl = function (url, focus) {
                	input.val(url);

            		if (focus) { 
            			input.focus();
            			input.addClass("focused");
            		}
            		else {
            			input.removeClass("focused");
            		}
            	};                
                var _setLoading = function (loading, updateLinks) {
            	    $('body').css('cursor', loading === true ? 'wait' : '');
            	    
            	    $("input[type=text]", username).css('cursor', loading === true ? 'wait' : '');
            	    $('#submit1', o).css('cursor', loading === true ? 'wait' : '');
            	    $('#submit2', o).css('cursor', loading === true ? 'wait' : '');
            	    
            	    input.css('cursor', loading === true ? 'wait' : '');

            	    if (updateLinks === true) {
            	    	$('.providers a', o).css('cursor', loading === true ? 'wait' : '');
            	    }
                };
            	var _showUsernameInput = function () {
            		username.css("display", "");
            			
            		var l = $('p', username);
            		if (l) {
            			l.attr("innerHTML", providers[selectedId].label);
            		}
            			
            		var u = $("input[type=text]", username);
            		if (u) {
            			u.val("");
            			u.focus();
            		}
            	};
            	var _hideUsernameInput = function () {
            		username.css("display", "none");
            	};
            	var _selectProviderBox = function (updateInput) {
            		if (!selectedId) {
            			return;
            		}
            		
            		var e = $((".providers a." + selectedId), o);
            		if (e) {
            			e.addClass("selected");
            		}
 
            		if (updateInput === true && !providers[selectedId].label) {
            			_setOpenIdUrl(providers[selectedId].url, true);
            		}
            	};
            	var _unselectProviderBox = function () {
            		var e = $((".providers a." + selectedId), o);
            		if (e) {
            			e.removeClass("selected");
            		}

            		_setOpenIdUrl("http://");
            	};
                var _getProviderBoxHtml = function (providerId) {
                	if (!providerId) {
                		return null;
                	}
                    return '<a id="' + providerId + '" class="' + providerId + '" title="' + providers[providerId].name + '" href="#"></a>';
                };
                // Event handlers
                var _onSubmit1BtnClicked = function (event) {
                	var cancel = true;
                	var val = $('input[type=text]', username).val();
                	if (val.length > 0) {
	                    var pvd = providers[selectedId];
	                    if (pvd) {
	                    	_setLoading(true, true);
	                        var url = pvd.url.replace('{username}', val);
	                        _setOpenIdUrl(url);
	                        _setCookie(selectedId);
	                        
	                        input.get()[0].form.submit();
	                    }
                	}

                	if (cancel) {
                		event.preventDefault();
                	}
                };
                var _onSubmit2BtnClicked = function (event) {
                	var cancel = true;
                	var url = input.val();
                	if (url.length > 7) {
                        _setLoading(true, true);
                		cancel = false;
                	}

                	if (cancel) {
                		event.preventDefault();
                	}
                };                
            	var _onProviderLinkClicked = function (event) {
                	_unselectProviderBox();

            		var btn = event && event.currentTarget ? $(event.currentTarget) : null;
                	selectedId = btn ? btn.attr("class") : null;
                	if (selectedId) {
                		var provider = providers[selectedId];
                		if (provider) {            				
            				if (provider.label) {
                				_showUsernameInput();
                		   		_selectProviderBox();
                			}
                			else {
                				var url = provider.url;

                		   		_selectProviderBox();
                				_hideUsernameInput();
                				_setOpenIdUrl(url, true);
                				
                				if (url && url.length > 7) {
                					_setLoading(true, true);
                					_setCookie(selectedId);
                					
                					input.get()[0].form.submit();
                				}
                			}
                		}
                	}
                };
                // Init helper
                var _initialize = function() {
    		        var lbdiv = $(".providers .large", o);
    		        var sbdiv = $(".providers .small", o);
    		        
    		        // Build provider links
    		        for (var id in providers) {
    		        	if (providers[id].hasLargeIcon) {
    		        		if (lbdiv) {
    		        			lbdiv.append(_getProviderBoxHtml(id));
    		        		}
    		        	}
    		        	else {
    		        		if (sbdiv) {
    		        			sbdiv.append(_getProviderBoxHtml(id));
    		        		}
    		        	}
    		        }
    		        
			        // Link event handlers
			        var links = $('.providers a', o);
			        for (var i = 0, le = null; i < links.length; i++) {
			        	le = $(links[i]);
			        	if (le) {
			        		le.click(_onProviderLinkClicked);
			        		le.css('cursor', '');
			        	}
			        }
    		        
			        // Button event handlers
			        $("#submit1", o).click(_onSubmit1BtnClicked);
			        $("#submit2", o).click(_onSubmit2BtnClicked);

			        // Cookie read
                    selectedId = _getCookie();
                    // Select provider link
            		_selectProviderBox(true);
                };
                
                // Call init
                _initialize();
    		});
        }
    });
})(jQuery);