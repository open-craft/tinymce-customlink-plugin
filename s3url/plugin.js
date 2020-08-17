tinymce.PluginManager.add('s3url', function(editor) {
  function isOnlyTextSelected(anchorElm) {
    var html = editor.selection.getContent();
    // Partial html and not a fully selected anchor element
		if (/</.test(html) && (!/^<a [^>]+>[^<]+<\/a>$/.test(html) || html.indexOf('href=') == -1)) {
			return false;
		}

  	if (anchorElm) {
  		var nodes = anchorElm.childNodes, i;

  		if (nodes.length === 0) {
  			return false;
  		}

  		for (i = nodes.length - 1; i >= 0; i--) {
  			if (nodes[i].nodeType != 3) {
  				return false;
  			}
  		}
  	}

  	return true;
  }

  function isS3URL(href) {
    var s3regex = /(https:\/\/)?(s3-|s3\.)?(.*)\.amazonaws\.com(.*)/;
    if (s3regex.test(href)) {
      return true
    } else {
      return false
    }
  }

  var openDialog = function () {
    selectedElm = editor.selection.getNode();
    anchorElm = editor.dom.getParent(selectedElm, 'a[href]');
    onlyText = isOnlyTextSelected();
    return editor.windowManager.open({
      title: 'S3 Link',
      data: {
        text: initialText = anchorElm ? (anchorElm.innerText || anchorElm.textContent) : editor.selection.getContent({format: 'text'}),
        href: anchorElm ? editor.dom.getAttrib(anchorElm, 'href') : '',
        target: anchorElm ? editor.dom.getAttrib(anchorElm, 'target') : (editor.settings.default_link_target || null),
        title: anchorElm ? editor.dom.getAttrib(anchorElm, 'title') : ''
      },
      body: [
        {
          name: 'href',
					type: 'filepicker',
					filetype: 'file',
					size: 40,
					autofocus: true,
					label: 'Url'
        },
        {
  				name: 'text',
  				type: 'textbox',
  				size: 40,
  				label: 'Text to display',
  				onchange: function() {
  					data.text = this.value();
          }
        },
        {
          type: 'listbox',
          name: 'linktype',
          label: 'Link Type',
          values: [
            {text: 'Download', value: 'download'},
            {text: 'Offer', value: 'offer'}
          ]
        },
        {
          type: 'listbox',
          name: 'filetype',
          label: 'File Type',
          values: [
            {text: 'Document/PDF', value: 'pdf'},
            {text: 'Video', value: 'video'},
            {text: 'Audesk design files', value: 'design'}
          ]
        },
        {
          type: 'listbox',
          name: 'orientation',
          label: 'Display Orientation',
          values: [
            {text: 'Vertical', value: 'vertical'},
            {text: 'Horizontal', value: 'horizontal'}
          ]
        },
        {
          type: 'listbox',
          name: 'class',
          label: 'Visual style',
          values: [
            {text: 'Primary', value: 'btn-primary'},
            {text: 'Normal', value: 'btn'},
            {text: 'Secondary', value: 'btn-secondary'}
          ]
        }
      ],
      onsubmit: function(e) {
        function insertLink() {
          var linkAttrs = {
          	href: e.data.href,
          	target: e.data.target ? e.data.target : null,
          	rel: e.data.rel ? e.data.rel : null,
          	"class": e.data.class ? e.data.class : null,
            title: e.data.title ? e.data.title : null,
            "data-wat-linkname": e.data.text,
            "data-wat-link": true,
            "pagefile-type": e.data.filetype,
            "orientation": e.data.orientation
          };

          var filehref = e.data.href.split('/');
          var filename = filehref[filehref.length - 1].split('.')[0];
          if (e.data.linktype == 'download') {
            linkAttrs['download'] = filename;
          }

          if (!isS3URL(e.data.href)) {
            editor.execCommand('unlink');
            return;
          }

          if (anchorElm) {
          	editor.focus();

          	if (onlyText && e.data.text != initialText) {
          		if ("innerText" in anchorElm) {
          			anchorElm.innerText = e.data.text;
          		} else {
          			anchorElm.textContent = e.data.text;
          		}
          	}

          	editor.dom.setAttribs(anchorElm, linkAttrs);
          
          	editor.selection.select(anchorElm);
          	editor.undoManager.add();
          } else {
          	if (onlyText) {
          		editor.insertContent(editor.dom.createHTML('a', linkAttrs, editor.dom.encode(e.data.text)));
          	} else {
          		editor.execCommand('mceInsertLink', false, linkAttrs);
          	}
          }
        }
        insertLink()
      }
    });
  };

  // Add a button that opens a window
  editor.addButton('s3url', {
    icon: false,
    text: 'S3 Link',
    stateSelector: "a[href]",
    onclick: openDialog
  });

  // Adds a menu item, which can then be included in any menu via the menu/menubar configuration
  editor.addMenuItem('s3url', {
    icon: false,
    text: 'S3 Link',
    stateSelector: "a[href]",
    onclick: openDialog
  });

});
