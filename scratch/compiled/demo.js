/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/demo/ts/Demo.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/demo/ts/Demo.ts":
/*!*****************************!*\
  !*** ./src/demo/ts/Demo.ts ***!
  \*****************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _main_ts_Plugin__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../main/ts/Plugin */ "./src/main/ts/Plugin.ts");

Object(_main_ts_Plugin__WEBPACK_IMPORTED_MODULE_0__["default"])();
tinymce.init({
    selector: 'textarea.tinymce',
    plugins: 'code headings-test',
    toolbar: 'headings-test'
});


/***/ }),

/***/ "./src/main/ts/Plugin.ts":
/*!*******************************!*\
  !*** ./src/main/ts/Plugin.ts ***!
  \*******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// Generate a unique ID for each heading
var generateUniqueId = (function () {
    var counter = 0;
    return function () { return "heading-".concat(++counter); };
})();
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
            var dialogConfig = function (isFirst, isLast) { return ({
                title: 'Headings',
                size: 'normal',
                body: {
                    type: 'panel',
                    items: [
                        {
                            type: 'htmlpanel',
                            html: "<p id=\"heading-text\" style=\"font-family: Courier Sans;\">".concat(headings[currentIndex].text, " <span style=\"font-weight: bold;\">(Heading ").concat(currentIndex + 1, " of ").concat(headings.length, ")</span></p>")
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
                    // Handle changes in the input fields if necessary
                },
                onAction: function (api, details) {
                    if (details.name === 'next') {
                        if (currentIndex < headings.length - 1) {
                            currentIndex++;
                            api.redial(dialogConfig(currentIndex === 0, currentIndex === headings.length - 1));
                            updateDialogContent(api);
                        }
                    }
                    else if (details.name === 'prev') {
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
                    var all_heading = getEditorHeadings(editor).all_heading;
                    var headingLevels = Array.from(all_heading).map(function (heading) { return parseInt((heading.tagName.match(/h(\d)/i) || [])[1], 10); });
                    headingLevels[currentIndex] = current_changed_Heading;
                    console.log(headingLevels);
                    var h1Count = 0;
                    all_heading.forEach(function (heading) {
                        if (heading.tagName.toLowerCase() === 'h1') {
                            h1Count++;
                        }
                    });
                    if (current_changed_Heading < 1 || current_changed_Heading > 6) {
                        display_Error_Message(editor, 'Choose a heading tag between 1-6');
                    }
                    else if (h1Count === 1 && current_changed_Heading === 1) {
                        display_Error_Message(editor, 'Only one Heading 1 can exist at a time.');
                    }
                    else if (!headings_inOrder(headingLevels)) {
                        display_Error_Message(editor, 'Headings are not in increment order');
                    }
                    else {
                        applyHeadingLevels(editor, headings);
                    }
                    api.close();
                }
            }); };
            var dialogApi = editor.windowManager.open(dialogConfig(currentIndex === 0, currentIndex === headings.length - 1));
            updateDialogContent(dialogApi);
        }
    });
    // Attach NodeChange event listener with better handling
    editor.on('NodeChange', function () {
        var _a = getEditorHeadings(editor, true), doc = _a.doc, all_heading = _a.all_heading;
        var contentChanged = false;
        all_heading.forEach(function (heading) {
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
// Extract headings and their levels from the content using id
var extractHeadings = function (content) {
    var _a;
    var headingRegex = /<(h[1-8])([^>]*id="([^"]+)"[^>]*)>/gi;
    var match;
    var headings = [];
    while ((match = headingRegex.exec(content)) !== null) {
        var tag = match[1];
        var level = parseInt(tag.replace(/\D/g, ''), 10);
        var id = match[3];
        var text = ((_a = match.input.split('>').pop()) === null || _a === void 0 ? void 0 : _a.split('<')[0]) || ''; // Extract text between tags
        headings.push({ tag: tag, level: level, text: text, id: id });
    }
    return headings;
};
// Apply the updated heading levels to the content using id
var applyHeadingLevels = function (editor, headings) {
    var content = editor.getContent({ format: 'html' });
    headings.forEach(function (heading) {
        var newTag = "h".concat(heading.level);
        var oldTag = heading.tag;
        var id = heading.id;
        var regex = new RegExp("(<".concat(oldTag, "[^>]*id=\"").concat(id, "\"[^>]*>)(.*)(</").concat(oldTag, ">)"), 'gi');
        content = content.replace(regex, "<".concat(newTag, " id=\"").concat(id, "\">$2</").concat(newTag, ">"));
    });
    editor.setContent(content);
};
function display_Error_Message(editor, message) {
    editor.notificationManager.open({
        text: message,
        type: 'error',
        timeout: 3000
    });
}
function headings_inOrder(headingLevels) {
    for (var i = 1; i < headingLevels.length; i++) {
        if (headingLevels[i] < headingLevels[i - 1]) {
            return false;
        }
    }
    return true;
}
function getEditorHeadings(editor, includeDoc) {
    if (includeDoc === void 0) { includeDoc = false; }
    var content = editor.getContent({ format: 'html' });
    var parser = new DOMParser();
    var doc = parser.parseFromString(content, 'text/html');
    var all_heading = doc.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"][aria-level]');
    if (includeDoc) {
        return { doc: doc, all_heading: all_heading };
    }
    else {
        return { all_heading: all_heading };
    }
}
/* harmony default export */ __webpack_exports__["default"] = (function () {
    tinymce.PluginManager.add('headings-test', setup);
});


/***/ })

/******/ });
//# sourceMappingURL=demo.js.map