(function () {
    'use strict';

    var generateUniqueId = function () {
      var counter = 0;
      return function () {
        return 'heading-'.concat(++counter);
      };
    }();
    var setup = function (editor) {
      editor.ui.registry.addButton('headings-test', {
        text: 'Hx',
        tooltip: 'Adjust heading semantic levels',
        onAction: function () {
          var content = editor.getContent({ format: 'html' });
          var headings = extractHeadings(content);
          var currentIndex = 0;
          var updateDialogContent = function (dialogApi) {
            dialogApi.setData({
              level: headings[currentIndex].level.toString(),
              headingText: headings[currentIndex].text,
              isFirstHeading: currentIndex === 0,
              isLastHeading: currentIndex === headings.length - 1
            });
          };
          var dialogConfig = function (isFirst, isLast) {
            return {
              title: 'Headings',
              size: 'normal',
              body: {
                type: 'panel',
                items: [
                  {
                    type: 'htmlpanel',
                    html: '<p id="heading-text" style="font-family: Courier Sans;">'.concat(headings[currentIndex].text, ' <span style="font-weight: bold;">(Heading ').concat(currentIndex + 1, ' of ').concat(headings.length, ')</span></p>')
                  },
                  {
                    type: 'input',
                    name: 'level',
                    inputMode: 'numeric',
                    label: 'Level',
                    value: headings[currentIndex].level.toString(),
                    min: 1,
                    max: 8,
                    placeholder: 'Enter heading level'
                  }
                ]
              },
              buttons: [
                {
                  type: 'custom',
                  name: 'prev',
                  text: 'Previous',
                  primary: false,
                  disabled: isFirst
                },
                {
                  type: 'custom',
                  name: 'next',
                  text: 'Next',
                  primary: false,
                  disabled: isLast
                },
                {
                  type: 'cancel',
                  text: 'Cancel'
                },
                {
                  type: 'submit',
                  text: 'OK',
                  primary: true
                }
              ],
              initialData: {
                level: headings[currentIndex].level.toString(),
                headingText: headings[currentIndex].text,
                isFirstHeading: isFirst,
                isLastHeading: isLast
              },
              onChange: function () {
              },
              onAction: function (api, details) {
                if (details.name === 'next') {
                  if (currentIndex < headings.length - 1) {
                    currentIndex++;
                    api.redial(dialogConfig(currentIndex === 0, currentIndex === headings.length - 1));
                    updateDialogContent(api);
                  }
                } else if (details.name === 'prev') {
                  if (currentIndex > 0) {
                    currentIndex--;
                    api.redial(dialogConfig(currentIndex === 0, currentIndex === headings.length - 1));
                    updateDialogContent(api);
                  }
                }
              },
              onSubmit: function (api) {
                var data = api.getData();
                headings[currentIndex].level = parseInt(data.level, 10);
                var current_changed_Heading = headings[currentIndex].level;
                var parser = new DOMParser();
                var doc = parser.parseFromString(content, 'text/html');
                var all_heading = doc.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"][aria-level]');
                var headingLevels = Array.from(all_heading).map(function (heading) {
                  return parseInt((heading.tagName.match(/h(\d)/i) || [])[1], 10);
                });
                headingLevels[currentIndex] = current_changed_Heading;
                console.log(headingLevels);
                var h1Count = 0;
                all_heading.forEach(function (heading) {
                  if (heading.tagName.toLowerCase() === 'h1') {
                    h1Count++;
                  }
                });
                if (h1Count === 1 && current_changed_Heading === 1) {
                  display_H1_Message(editor);
                } else if (!headings_inOrder(headingLevels)) {
                  editor.notificationManager.open({
                    text: 'Headings are not in increment order',
                    type: 'error',
                    timeout: 3000
                  });
                } else {
                  applyHeadingLevels(editor, headings);
                }
                api.close();
              }
            };
          };
          var dialogApi = editor.windowManager.open(dialogConfig(currentIndex === 0, currentIndex === headings.length - 1));
          updateDialogContent(dialogApi);
        }
      });
      editor.on('NodeChange', function () {
        var content = editor.getContent({ format: 'html' });
        var parser = new DOMParser();
        var doc = parser.parseFromString(content, 'text/html');
        var headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"][aria-level]');
        var contentChanged = false;
        headings.forEach(function (heading) {
          if (!heading.id) {
            heading.id = generateUniqueId();
            contentChanged = true;
          }
        });
        if (contentChanged) {
          editor.undoManager.transact(function () {
            editor.setContent(doc.body.innerHTML, { format: 'raw' });
            editor.selection.setCursorLocation(doc.body.lastChild, 0);
          });
        }
      });
    };
    var extractHeadings = function (content) {
      var _a;
      var headingRegex = /<(h[1-8])([^>]*id="([^"]+)"[^>]*)>/gi;
      var match;
      var headings = [];
      while ((match = headingRegex.exec(content)) !== null) {
        var tag = match[1];
        var level = parseInt(tag.replace(/\D/g, ''), 10);
        var id = match[3];
        var text = ((_a = match.input.split('>').pop()) === null || _a === void 0 ? void 0 : _a.split('<')[0]) || '';
        headings.push({
          tag: tag,
          level: level,
          text: text,
          id: id
        });
      }
      return headings;
    };
    var applyHeadingLevels = function (editor, headings) {
      var content = editor.getContent({ format: 'html' });
      headings.forEach(function (heading) {
        var newTag = 'h'.concat(heading.level);
        var oldTag = heading.tag;
        var id = heading.id;
        var regex = new RegExp('(<'.concat(oldTag, '[^>]*id="').concat(id, '"[^>]*>)(.*)(</').concat(oldTag, '>)'), 'gi');
        content = content.replace(regex, '<'.concat(newTag, ' id="').concat(id, '">$2</').concat(newTag, '>'));
      });
      editor.setContent(content);
    };
    function display_H1_Message(editor) {
      editor.notificationManager.open({
        text: 'Only one Heading 1 can exist at a time.',
        type: 'error',
        timeout: 3000
      });
    }
    function headings_inOrder(headingLevels) {
      console.log(headingLevels);
      for (var i = 1; i < headingLevels.length; i++) {
        if (headingLevels[i] < headingLevels[i - 1]) {
          return false;
        }
      }
      return true;
    }
    function Plugin () {
      tinymce.PluginManager.add('headings-test', setup);
    }

    Plugin();

})();
