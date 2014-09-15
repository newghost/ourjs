/*
 *
 * Copyright (c) 2010 C. F., Wong (<a href="http://cloudgen.w0ng.hk">Cloudgen Examplet Store</a>)
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 */
(function ($, len, createRange, duplicate) {
	$.fn.caret = function (options, opt2) {
		var   start
			, end
			, textarea		= this[0]
			, $textarea		= $(textarea)
			, isDefective 	= !!document.selection;

		if (typeof options === "object" && typeof options.start === "number" && typeof options.end === "number") {
			start = options.start;
			end = options.end;
		} else if (typeof options === "number" && typeof opt2 === "number") {
			start = options;
			end = opt2;
		} else if (typeof options === "string") {
			if ((start = textarea.value.indexOf(options)) > -1) {
				end = start + options[len];
			}
			else {
				start = null;
			}
		} else if (options && options.constructor && options.constructor == RegExp) {
			var re = options.exec(textarea.value);
			if (re != null) {
				start = re.index;
				end = start + re[0][len];
			}
		}
		else if(typeof options == "number") {
			start = options;
			end = options;
		}

		if (typeof start != "undefined") {
			if (isDefective) {
				var selRange = this[0].createTextRange();
				selRange.collapse(true);
				selRange.moveStart('character', start);
				selRange.moveEnd('character', end - start);
				selRange.select();
			} else {
				this[0].selectionStart = start;
				this[0].selectionEnd = end;
			}
			this[0].focus();
			return this
		} else {
			var startPos, endPos;

			if (isDefective) {
				var selection = document.selection;
				if (this[0].tagName.toLowerCase() != "textarea") {
					var val = this.val(),
						range = selection[createRange]()[duplicate]();

					range.moveEnd("character", val[len]);

					startPos = (range.text == "" ? val[len] : val.lastIndexOf(range.text));

					range = selection[createRange]()[duplicate]();
					range.moveStart("character", -val[len]);

					endPos = range.text[len];
				} else {
					var range = selection[createRange](),
						stored_range = range[duplicate]();

					stored_range.moveToElementText(this[0]);
					stored_range.setEndPoint('EndToEnd', range);

					startPos = stored_range.text[len] - range.text[len];
					endPos = startPos + range.text[len];
				}
			} else {
				startPos = textarea.selectionStart;
				endPos = textarea.selectionEnd;
			}

			var selectedText = textarea.value.substring(startPos, endPos);

			return {
				start: startPos,
				end: endPos,
				text: selectedText,
				replace: function (st, positionAtEnd) {
					textarea.value = textarea.value.substring(0, startPos) + st + textarea.value.substring(endPos)

					if(!!positionAtEnd) {
						$textarea.focus().caret(startPos+st.length);
					}
					else {
						$textarea.focus().caret(startPos, startPos+st.length);
					}
					return textarea.value;
				},
				replaceInSelection: function(f, r) {
					var newText = selectedText.replace(f, r);
					textarea.value = textarea.value.substring(0, startPos) + newText + textarea.value.substring(endPos);

					$textarea.focus().caret(startPos, newText.length);
					return textarea.value;
				},
				wrap: function(before, after) {
					after = after ? after : before;
					textarea.value = textarea.value.substring(0, startPos) + before + selectedText + after + textarea.value.substring(endPos)

					$textarea.focus().caret(startPos+before.length, endPos+before.length);
					return textarea.value;
				},
				prependToLeadingLine: function (txt) {
					var pos = textarea.value.substring(0, startPos).lastIndexOf("\n");
					textarea.value = textarea.value.substring(0, pos+1) + txt + textarea.value.substr(pos+1);

					$textarea.focus().caret(startPos+txt.length, endPos + txt.length);
					return textarea.value;
				},
				prependToEveryLine: function (txt, notIncludingFirstLine) {
					var pos = textarea.value[startPos] == "\n" ? startPos : textarea.value.substring(startPos, endPos).indexOf("\n") + startPos
						, pos2 = pos != startPos ? textarea.value.substring(0, startPos).lastIndexOf("\n") : -1
						, newValue = ((startPos == 0 ? txt : "")
							+ textarea.value.substring(0, pos2+1)
							+ (!notIncludingFirstLine ? txt : "")
							+ textarea.value.substring(pos2+1, pos+1)
							+ txt
							+ textarea.value.substring(pos+1, endPos).replace(/\n/g, "\n"+txt)
							+ textarea.value.substr(endPos))
						, diff = newValue.length - textarea.value.length;

					textarea.value = newValue;
					$textarea.focus().caret(diff);
					return textarea.value;
				}
			}
		}
	}
})(jQuery, "length", "createRange", "duplicate");