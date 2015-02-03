
var Drupal = Drupal || { 'settings': {}, 'behaviors': {}, 'locale': {} };

// Allow other JavaScript libraries to use $.
//jQuery.noConflict();

(function ($) {

/**
 * Override jQuery.fn.init to guard against XSS attacks.
 *
 * See http://bugs.jquery.com/ticket/9521
 */
var jquery_init = $.fn.init;
$.fn.init = function (selector, context, rootjQuery) {
  // If the string contains a "#" before a "<", treat it as invalid HTML.
  if (selector && typeof selector === 'string') {
    var hash_position = selector.indexOf('#');
    if (hash_position >= 0) {
      var bracket_position = selector.indexOf('<');
      if (bracket_position > hash_position) {
        throw 'Syntax error, unrecognized expression: ' + selector;
      }
    }
  }
  return jquery_init.call(this, selector, context, rootjQuery);
};
$.fn.init.prototype = jquery_init.prototype;

/**
 * Attach all registered behaviors to a page element.
 *
 * Behaviors are event-triggered actions that attach to page elements, enhancing
 * default non-JavaScript UIs. Behaviors are registered in the Drupal.behaviors
 * object using the method 'attach' and optionally also 'detach' as follows:
 * @code
 *    Drupal.behaviors.behaviorName = {
 *      attach: function (context, settings) {
 *        ...
 *      },
 *      detach: function (context, settings, trigger) {
 *        ...
 *      }
 *    };
 * @endcode
 *
 * Drupal.attachBehaviors is added below to the jQuery ready event and so
 * runs on initial page load. Developers implementing AHAH/Ajax in their
 * solutions should also call this function after new page content has been
 * loaded, feeding in an element to be processed, in order to attach all
 * behaviors to the new content.
 *
 * Behaviors should use
 * @code
 *   $(selector).once('behavior-name', function () {
 *     ...
 *   });
 * @endcode
 * to ensure the behavior is attached only once to a given element. (Doing so
 * enables the reprocessing of given elements, which may be needed on occasion
 * despite the ability to limit behavior attachment to a particular element.)
 *
 * @param context
 *   An element to attach behaviors to. If none is given, the document element
 *   is used.
 * @param settings
 *   An object containing settings for the current context. If none given, the
 *   global Drupal.settings object is used.
 */
Drupal.attachBehaviors = function (context, settings) {
  context = context || document;
  settings = settings || Drupal.settings;
  // Execute all of them.
  $.each(Drupal.behaviors, function () {
    if ($.isFunction(this.attach)) {
      this.attach(context, settings);
    }
  });
};

/**
 * Detach registered behaviors from a page element.
 *
 * Developers implementing AHAH/Ajax in their solutions should call this
 * function before page content is about to be removed, feeding in an element
 * to be processed, in order to allow special behaviors to detach from the
 * content.
 *
 * Such implementations should look for the class name that was added in their
 * corresponding Drupal.behaviors.behaviorName.attach implementation, i.e.
 * behaviorName-processed, to ensure the behavior is detached only from
 * previously processed elements.
 *
 * @param context
 *   An element to detach behaviors from. If none is given, the document element
 *   is used.
 * @param settings
 *   An object containing settings for the current context. If none given, the
 *   global Drupal.settings object is used.
 * @param trigger
 *   A string containing what's causing the behaviors to be detached. The
 *   possible triggers are:
 *   - unload: (default) The context element is being removed from the DOM.
 *   - move: The element is about to be moved within the DOM (for example,
 *     during a tabledrag row swap). After the move is completed,
 *     Drupal.attachBehaviors() is called, so that the behavior can undo
 *     whatever it did in response to the move. Many behaviors won't need to
 *     do anything simply in response to the element being moved, but because
 *     IFRAME elements reload their "src" when being moved within the DOM,
 *     behaviors bound to IFRAME elements (like WYSIWYG editors) may need to
 *     take some action.
 *   - serialize: When an Ajax form is submitted, this is called with the
 *     form as the context. This provides every behavior within the form an
 *     opportunity to ensure that the field elements have correct content
 *     in them before the form is serialized. The canonical use-case is so
 *     that WYSIWYG editors can update the hidden textarea to which they are
 *     bound.
 *
 * @see Drupal.attachBehaviors
 */
Drupal.detachBehaviors = function (context, settings, trigger) {
  context = context || document;
  settings = settings || Drupal.settings;
  trigger = trigger || 'unload';
  // Execute all of them.
  $.each(Drupal.behaviors, function () {
    if ($.isFunction(this.detach)) {
      this.detach(context, settings, trigger);
    }
  });
};

/**
 * Encode special characters in a plain-text string for display as HTML.
 *
 * @ingroup sanitization
 */
Drupal.checkPlain = function (str) {
  var character, regex,
      replace = { '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' };
  str = String(str);
  for (character in replace) {
    if (replace.hasOwnProperty(character)) {
      regex = new RegExp(character, 'g');
      str = str.replace(regex, replace[character]);
    }
  }
  return str;
};

/**
 * Replace placeholders with sanitized values in a string.
 *
 * @param str
 *   A string with placeholders.
 * @param args
 *   An object of replacements pairs to make. Incidences of any key in this
 *   array are replaced with the corresponding value. Based on the first
 *   character of the key, the value is escaped and/or themed:
 *    - !variable: inserted as is
 *    - @variable: escape plain text to HTML (Drupal.checkPlain)
 *    - %variable: escape text and theme as a placeholder for user-submitted
 *      content (checkPlain + Drupal.theme('placeholder'))
 *
 * @see Drupal.t()
 * @ingroup sanitization
 */
Drupal.formatString = function(str, args) {
  // Transform arguments before inserting them.
  for (var key in args) {
    switch (key.charAt(0)) {
      // Escaped only.
      case '@':
        args[key] = Drupal.checkPlain(args[key]);
      break;
      // Pass-through.
      case '!':
        break;
      // Escaped and placeholder.
      case '%':
      default:
        args[key] = Drupal.theme('placeholder', args[key]);
        break;
    }
    str = str.replace(key, args[key]);
  }
  return str;
};

/**
 * Translate strings to the page language or a given language.
 *
 * See the documentation of the server-side t() function for further details.
 *
 * @param str
 *   A string containing the English string to translate.
 * @param args
 *   An object of replacements pairs to make after translation. Incidences
 *   of any key in this array are replaced with the corresponding value.
 *   See Drupal.formatString().
 *
 * @param options
 *   - 'context' (defaults to the empty context): The context the source string
 *     belongs to.
 *
 * @return
 *   The translated string.
 */
Drupal.t = function (str, args, options) {
  options = options || {};
  options.context = options.context || '';

  // Fetch the localized version of the string.
  if (Drupal.locale.strings && Drupal.locale.strings[options.context] && Drupal.locale.strings[options.context][str]) {
    str = Drupal.locale.strings[options.context][str];
  }

  if (args) {
    str = Drupal.formatString(str, args);
  }
  return str;
};

/**
 * Format a string containing a count of items.
 *
 * This function ensures that the string is pluralized correctly. Since Drupal.t() is
 * called by this function, make sure not to pass already-localized strings to it.
 *
 * See the documentation of the server-side format_plural() function for further details.
 *
 * @param count
 *   The item count to display.
 * @param singular
 *   The string for the singular case. Please make sure it is clear this is
 *   singular, to ease translation (e.g. use "1 new comment" instead of "1 new").
 *   Do not use @count in the singular string.
 * @param plural
 *   The string for the plural case. Please make sure it is clear this is plural,
 *   to ease translation. Use @count in place of the item count, as in "@count
 *   new comments".
 * @param args
 *   An object of replacements pairs to make after translation. Incidences
 *   of any key in this array are replaced with the corresponding value.
 *   See Drupal.formatString().
 *   Note that you do not need to include @count in this array.
 *   This replacement is done automatically for the plural case.
 * @param options
 *   The options to pass to the Drupal.t() function.
 * @return
 *   A translated string.
 */
Drupal.formatPlural = function (count, singular, plural, args, options) {
  var args = args || {};
  args['@count'] = count;
  // Determine the index of the plural form.
  var index = Drupal.locale.pluralFormula ? Drupal.locale.pluralFormula(args['@count']) : ((args['@count'] == 1) ? 0 : 1);

  if (index == 0) {
    return Drupal.t(singular, args, options);
  }
  else if (index == 1) {
    return Drupal.t(plural, args, options);
  }
  else {
    args['@count[' + index + ']'] = args['@count'];
    delete args['@count'];
    return Drupal.t(plural.replace('@count', '@count[' + index + ']'), args, options);
  }
};

/**
 * Generate the themed representation of a Drupal object.
 *
 * All requests for themed output must go through this function. It examines
 * the request and routes it to the appropriate theme function. If the current
 * theme does not provide an override function, the generic theme function is
 * called.
 *
 * For example, to retrieve the HTML for text that should be emphasized and
 * displayed as a placeholder inside a sentence, call
 * Drupal.theme('placeholder', text).
 *
 * @param func
 *   The name of the theme function to call.
 * @param ...
 *   Additional arguments to pass along to the theme function.
 * @return
 *   Any data the theme function returns. This could be a plain HTML string,
 *   but also a complex object.
 */
Drupal.theme = function (func) {
  var args = Array.prototype.slice.apply(arguments, [1]);

  return (Drupal.theme[func] || Drupal.theme.prototype[func]).apply(this, args);
};

/**
 * Freeze the current body height (as minimum height). Used to prevent
 * unnecessary upwards scrolling when doing DOM manipulations.
 */
Drupal.freezeHeight = function () {
  Drupal.unfreezeHeight();
  $('<div id="freeze-height"></div>').css({
    position: 'absolute',
    top: '0px',
    left: '0px',
    width: '1px',
    height: $('body').css('height')
  }).appendTo('body');
};

/**
 * Unfreeze the body height.
 */
Drupal.unfreezeHeight = function () {
  $('#freeze-height').remove();
};

/**
 * Encodes a Drupal path for use in a URL.
 *
 * For aesthetic reasons slashes are not escaped.
 */
Drupal.encodePath = function (item, uri) {
  uri = uri || location.href;
  return encodeURIComponent(item).replace(/%2F/g, '/');
};

/**
 * Get the text selection in a textarea.
 */
Drupal.getSelection = function (element) {
  if (typeof element.selectionStart != 'number' && document.selection) {
    // The current selection.
    var range1 = document.selection.createRange();
    var range2 = range1.duplicate();
    // Select all text.
    range2.moveToElementText(element);
    // Now move 'dummy' end point to end point of original range.
    range2.setEndPoint('EndToEnd', range1);
    // Now we can calculate start and end points.
    var start = range2.text.length - range1.text.length;
    var end = start + range1.text.length;
    return { 'start': start, 'end': end };
  }
  return { 'start': element.selectionStart, 'end': element.selectionEnd };
};

/**
 * Build an error message from an Ajax response.
 */
Drupal.ajaxError = function (xmlhttp, uri) {
  var statusCode, statusText, pathText, responseText, readyStateText, message;
  if (xmlhttp.status) {
    statusCode = "\n" + Drupal.t("An AJAX HTTP error occurred.") +  "\n" + Drupal.t("HTTP Result Code: !status", {'!status': xmlhttp.status});
  }
  else {
    statusCode = "\n" + Drupal.t("An AJAX HTTP request terminated abnormally.");
  }
  statusCode += "\n" + Drupal.t("Debugging information follows.");
  pathText = "\n" + Drupal.t("Path: !uri", {'!uri': uri} );
  statusText = '';
  // In some cases, when statusCode == 0, xmlhttp.statusText may not be defined.
  // Unfortunately, testing for it with typeof, etc, doesn't seem to catch that
  // and the test causes an exception. So we need to catch the exception here.
  try {
    statusText = "\n" + Drupal.t("StatusText: !statusText", {'!statusText': $.trim(xmlhttp.statusText)});
  }
  catch (e) {}

  responseText = '';
  // Again, we don't have a way to know for sure whether accessing
  // xmlhttp.responseText is going to throw an exception. So we'll catch it.
  try {
    responseText = "\n" + Drupal.t("ResponseText: !responseText", {'!responseText': $.trim(xmlhttp.responseText) } );
  } catch (e) {}

  // Make the responseText more readable by stripping HTML tags and newlines.
  responseText = responseText.replace(/<("[^"]*"|'[^']*'|[^'">])*>/gi,"");
  responseText = responseText.replace(/[\n]+\s+/g,"\n");

  // We don't need readyState except for status == 0.
  readyStateText = xmlhttp.status == 0 ? ("\n" + Drupal.t("ReadyState: !readyState", {'!readyState': xmlhttp.readyState})) : "";

  message = statusCode + pathText + statusText + responseText + readyStateText;
  return message;
};

// Class indicating that JS is enabled; used for styling purpose.
$('html').addClass('js');

// 'js enabled' cookie.
document.cookie = 'has_js=1; path=/';

/**
 * Additions to jQuery.support.
 */
$(function () {
  /**
   * Boolean indicating whether or not position:fixed is supported.
   */
  if (jQuery.support.positionFixed === undefined) {
    var el = $('<div style="position:fixed; top:10px" />').appendTo(document.body);
    jQuery.support.positionFixed = el[0].offsetTop === 10;
    el.remove();
  }
});

//Attach all behaviors.
$(function () {
  Drupal.attachBehaviors(document, Drupal.settings);
});

/**
 * The default themes.
 */
Drupal.theme.prototype = {

  /**
   * Formats text for emphasized display in a placeholder inside a sentence.
   *
   * @param str
   *   The text to format (plain-text).
   * @return
   *   The formatted text (html).
   */
  placeholder: function (str) {
    return '<em class="placeholder">' + Drupal.checkPlain(str) + '</em>';
  }
};

// Content type form
Drupal.behaviors.og_content_type = function() {
// Disable the group limit textarea if the content type is not a standard group post
$('input[name="og_content_type_usage"]').click(function(){
if (!$('#edit-og-content-type-usage-group-post-standard').attr('checked') && !$('#edit-og-content-type-usage-group-post-wiki').attr('checked')) {
$('#edit-og-max-groups').attr('disabled','disabled');
} else {
$('#edit-og-max-groups').removeAttr('disabled');
}
});
// Initial check to see if content type is standard group post
if (!$('#edit-og-content-type-usage-group-post-standard').attr('checked') && !$('#edit-og-content-type-usage-group-post-wiki').attr('checked')) {
$('#edit-og-max-groups').attr('disabled','disabled');
};
}
Drupal.verticalTabs = Drupal.verticalTabs || {};
Drupal.verticalTabs.og_nodeapi = function() {
var values = [];
$('.vertical-tabs-og_nodeapi #edit-og-groups :selected')
.each(function (i, selected) {
values[i] = $(selected).text();
});
return Drupal.checkPlain(values.join(', '));
}
Drupal.verticalTabs.og = function() {
var type = $('.vertical-tabs-og input[type=radio]:checked').val();
switch (type) {
case 'group':
return Drupal.t('Group node');
break;
case 'omitted':
return Drupal.t('May not be posted into a group.');
break;
case 'group_post_standard':
return Drupal.t('Standard group post');
break;
case 'group_post_wiki':
return Drupal.t('Wiki group post');
break;
}
}
; 
})(jQuery);

/**
* Hovertip - easy and elegant tooltips
*
* By Dave Cohen <http://dave-cohen.com>
* With ideas and and javascript code borrowed from many folks.
* (See URLS in the comments)
*
* Licensed under GPL.
* Requires jQuery.js. <http://jquery.com>,
* which may be distributed under a different licence.
*
* $Date$
* $Rev: $
*
* This plugin helps you create tooltips. It supports:
*
* hovertips - these appear under the mouse when mouse is over the target
* element.
*
* clicktips - these appear in the document when the target element is
* clicked.
*
* You may define behaviors for additional types of tooltips.
*
* There are a variety of ways to add tooltips. Each of the following is
* supported:
*
* <p>blah blah blah
* <span>important term</span>
* <span class="hovertip">text that appears.</span>
* blah blah blah</p>
*
* or,
*
* <p>blah blah blah
* <span hovertip="termdefinition">important term</span>
* blah blah blah</p>
* <div id="termdefinition" class="hovertip"><h1>term definition</h1><p>the term means...</p></div>
*
* or,
*
* <p>blah blah blah
* <span id="term">important term</span>
* blah blah blah</p>
* <div target="term" class="hovertip"><h1>term definition</h1><p>the term means...</p></div>
*
*
* Hooks are available to customize both the behavior of activated tooltips,
* and the syntax used to mark them up.
*
*/
//// mouse events ////
/**
* To make hovertips appear correctly we need the exact mouse position.
* These functions make that possible.
*/
// use globals to track mouse position
var hovertipMouseX;
var hovertipMouseY;
function hovertipMouseUpdate(e) {
var mouse = hovertipMouseXY(e);
hovertipMouseX = mouse[0];
hovertipMouseY = mouse[1];
};
// http://www.howtocreate.co.uk/tutorials/javascript/eventinfo
function hovertipMouseXY(e) {
if( !e ) {
if( window.event ) {
//Internet Explorer
e = window.event;
} else {
//total failure, we have no way of referencing the event
return;
}
}
if( typeof( e.pageX ) == 'number' ) {
//most browsers
var xcoord = e.pageX;
var ycoord = e.pageY;
} else if( typeof( e.clientX ) == 'number' ) {
//Internet Explorer and older browsers
//other browsers provide this, but follow the pageX/Y branch
var xcoord = e.clientX;
var ycoord = e.clientY;
var badOldBrowser = ( window.navigator.userAgent.indexOf( 'Opera' ) + 1 ) ||
( window.ScriptEngine && ScriptEngine().indexOf( 'InScript' ) + 1 ) ||
( navigator.vendor == 'KDE' );
if( !badOldBrowser ) {
if( document.body && ( document.body.scrollLeft || document.body.scrollTop ) ) {
//IE 4, 5 & 6 (in non-standards compliant mode)
xcoord += document.body.scrollLeft;
ycoord += document.body.scrollTop;
} else if( document.documentElement && ( document.documentElement.scrollLeft || document.documentElement.scrollTop ) ) {
//IE 6 (in standards compliant mode)
xcoord += document.documentElement.scrollLeft;
ycoord += document.documentElement.scrollTop;
}
}
} else {
//total failure, we have no way of obtaining the mouse coordinates
return;
}
return [xcoord, ycoord];
};
//// target selectors ////
/**
* These selectors find the targets for a given tooltip element.
* Several methods are supported.
*
* You may write your own selector functions to customize.
*/
/**
* For this model:
* <span hovertip="ht1">target term</span>...
* <div class="hovertip" id="ht1">tooltip text</div>
*/
targetSelectById = function(el, config) {
var id;
var selector;
if (id = el.getAttribute('id')) {
selector = '*[@'+config.attribute+'=\''+id+'\']';
return $(selector);
}
};
/**
* For this model:
* <span id="ht1">target term</span>...
* <div class="hovertip" target="ht1">tooltip text</div>
*/
targetSelectByTargetAttribute = function(el, config) {
target_list = el.getAttribute('target');
if (target_list) {
// use for attribute to specify targets
target_ids = target_list.split(' ');
var selector = '#' + target_ids.join(',#');
return $(selector);
}
};
/**
* For this model:
* <span>target term</span><span class="hovertip">tooltip text</span>
*/
targetSelectByPrevious = function(el, config) {
sibling = el.previousSibling;
// If the previous sibling is not an element, keep looking
while (sibling && sibling.nodeType != 1)
sibling = sibling.previousSibling;
return $(sibling);
};
/**
* Make all siblings targets. Experimental.
*/
targetSelectBySiblings = function(el, config) {
return $(el).siblings();
};
//// prepare tip elements ////
/**
* The tooltip element needs special preparation. You may define your own
* prepare functions to customize the behavior.
*/
// adds a close link to clicktips
clicktipPrepareWithCloseLink = function(o, config) {
return o.append("<a class='clicktip_close'><span>close</span></a>")
.find('a.clicktip_close').click(function(e) {
o.hide();
return false;
}).end();
};
// ensure that hovertips do not disappear when the mouse is over them.
// also position the hovertip as an absolutely positioned child of body.
hovertipPrepare = function(o, config) {
return o.hover(function() {
hovertipHideCancel(this);
}, function() {
hovertipHideLater(this);
}).css('position', 'absolute').each(hovertipPosition);
};
// do not modify tooltips when preparing
hovertipPrepareNoOp = function(o, config) {
return o;
};
//// manipulate tip elements /////
/**
* A variety of functions to modify tooltip elements
*/
// move tooltips to body, so they are not descended from other absolutely
// positioned elements.
hovertipPosition = function(i) {
document.body.appendChild(this);
};
hovertipIsVisible = function(el) {
return (jQuery.css(el, 'display') != 'none');
};
// show the tooltip under the mouse.
// Introduce a delay, so tip appears only if cursor rests on target for more than an instant.
hovertipShowUnderMouse = function(el) {
hovertipHideCancel(el);
if (!hovertipIsVisible(el)) {
el.ht.showing = // keep reference to timer
window.setTimeout(function() {
el.ht.tip.css({
'position':'absolute',
'z-index': '99',
'top': hovertipMouseY + 'px',
'left': hovertipMouseX + 'px'})
.show();
}, el.ht.config.showDelay);
}
};
// do not hide
hovertipHideCancel = function(el) {
if (el.ht.hiding) {
window.clearTimeout(el.ht.hiding);
el.ht.hiding = null;
}
};
// Hide a tooltip, but only after a delay.
// The delay allow the tip to remain when user moves mouse from target to tooltip
hovertipHideLater = function(el) {
if (el.ht.showing) {
window.clearTimeout(el.ht.showing);
el.ht.showing = null;
}
if (el.ht.hiding) {
window.clearTimeout(el.ht.hiding);
el.ht.hiding = null;
}
el.ht.hiding =
window.setTimeout(function() {
if (el.ht.hiding) {
// fadeOut, slideUp do not work on Konqueror
el.ht.tip.hide();
}
}, el.ht.config.hideDelay);
};
//// prepare target elements ////
/**
* As we prepared the tooltip elements, the targets also need preparation.
*
* You may define your own custom behavior.
*/
// when clicked on target, toggle visibilty of tooltip
clicktipTargetPrepare = function(o, el, config) {
return o.addClass(config.attribute + '_target')
.click(function() {
el.ht.tip.toggle();
return false;
});
};
// when hover over target, make tooltip appear
hovertipTargetPrepare = function(o, el, config) {
return o.addClass(config.attribute + '_target')
.hover(function() {
// show tip when mouse over target
hovertipShowUnderMouse(el);
},
function() {
// hide the tip
// add a delay so user can move mouse from the target to the tip
hovertipHideLater(el);
});
};
/**
* hovertipActivate() is our jQuery plugin function. It turns on hovertip or
* clicktip behavior for a set of elements.
*
* @param config
* controls aspects of tooltip behavior. Be sure to define
* 'attribute', 'showDelay' and 'hideDelay'.
*
* @param targetSelect
* function finds the targets of a given tooltip element.
*
* @param tipPrepare
* function alters the tooltip to display and behave properly
*
* @param targetPrepare
* function alters the target to display and behave properly.
*/
jQuery.fn.hovertipActivate = function(config, targetSelect, tipPrepare, targetPrepare) {
//alert('activating ' + this.size());
// unhide so jquery show/hide will work.
return this.css('display', 'block')
.hide() // don't show it until click
.each(function() {
if (!this.ht)
this.ht = new Object();
this.ht.config = config;
// find our targets
var targets = targetSelect(this, config);
if (targets && targets.size()) {
if (!this.ht.targets)
this.ht.targets = targetPrepare(targets, this, config);
else
this.ht.targets.add(targetPrepare(targets, this, config));
// listen to mouse move events so we know exatly where to place hovetips
targets.mousemove(hovertipMouseUpdate);
// prepare the tooltip element
// is it bad form to call $(this) here?
if (!this.ht.tip)
this.ht.tip = tipPrepare($(this), config);
}
})
;
};
/**
* Here's an example ready function which shows how to enable tooltips.
*
* You can make this considerably shorter by choosing only the markup style(s)
* you will use.
*
* You may also remove the code that wraps hovertips to produce drop-shadow FX
*
* Invoke this function or one like it from your $(document).ready().
*
* Here, we break the action up into several timout callbacks, to avoid
* locking up browsers.
*/
function hovertipInit() {
// specify the attribute name we use for our clicktips
var clicktipConfig = {'attribute':'clicktip'};
/**
* To enable this style of markup (id on tooltip):
* <span clicktip="foo">target</span>...
* <div id="foo" class="clicktip">blah blah</div>
*/
window.setTimeout(function() {
$('.clicktip').hovertipActivate(clicktipConfig,
targetSelectById,
clicktipPrepareWithCloseLink,
clicktipTargetPrepare);
}, 0);
/**
* To enable this style of markup (id on target):
* <span id="foo">target</span>...
* <div target="foo" class="clicktip">blah blah</div>
*/
window.setTimeout(function() {
$('.clicktip').hovertipActivate(clicktipConfig,
targetSelectByTargetAttribute,
clicktipPrepareWithCloseLink,
clicktipTargetPrepare);
}, 0);
// specify our configuration for hovertips, including delay times (millisec)
var hovertipConfig = {'attribute':'hovertip',
'showDelay': 300,
'hideDelay': 700};
// use <div class='hovertip'>blah blah</div>
var hovertipSelect = 'div.hovertip';
// OPTIONAL: here we wrap each hovertip to apply special effect. (i.e. drop shadow):
$(hovertipSelect).css('display', 'block').addClass('hovertip_wrap3').
wrap("<div class='hovertip_wrap0'><div class='hovertip_wrap1'><div class='hovertip_wrap2'>" +
"</div></div></div>").each(function() {
// fix class and attributes for newly wrapped elements
var tooltip = this.parentNode.parentNode.parentNode;
if (this.getAttribute('target'))
tooltip.setAttribute('target', this.getAttribute('target'));
if (this.getAttribute('id')) {
var id = this.getAttribute('id');
this.removeAttribute('id');
tooltip.setAttribute('id', id);
}
});
hovertipSelect = 'div.hovertip_wrap0';
// end optional FX section
if (1) { // enable some of the following methods, but not all
/**
* To enable this style of markup (id on tooltip):
* <span hovertip="foo">target</span>...
* <div id="foo" class="hovertip">blah blah</div>
*/
window.setTimeout(function() {
$(hovertipSelect).hovertipActivate(hovertipConfig,
targetSelectById,
hovertipPrepare,
hovertipTargetPrepare);
}, 0);
/**
* To enable this style of markup (id on target):
* <span id="foo">target</span>...
* <div target="foo" class="hovertip">blah blah</div>
*/
window.setTimeout(function() {
$(hovertipSelect).hovertipActivate(hovertipConfig,
targetSelectByTargetAttribute,
hovertipPrepare,
hovertipTargetPrepare);
}, 0);
} else {
/**
* To enable this style of markup (id on target):
* <span>target</span>...
* <div class="hovertip">blah blah</div>
*
* Note that your should enable either this method, or preceeding (target
* attribute) method. Not both, as the div with class=hovertip will be
* associated with more than one target.
*/
window.setTimeout(function() {
$(hovertipSelect).hovertipActivate(hovertipConfig,
targetSelectByPrevious,
hovertipPrepare,
hovertipTargetPrepare);
}, 0);
}
hovertipSpanInit();
};

/**
* This simplified alternative to hovertipInit supports markup like this:
*
* <span>this is the text that always appears</span><span class=hovertip>this is the text that appears on mouse hover.</span>
*/
function hovertipSpanInit() {
// specify our configuration for hovertips, including delay times (millisec)
var hovertipConfig = {'attribute':'hovertip',
'showDelay': 300,
'hideDelay': 700};
var hovertipSpanSelect = 'span.hovertip';
// activate hovertips with wrappers for FX (drop shadow):
$(hovertipSpanSelect).css('display', 'block').addClass('hovertip_wrap3').
wrap("<span class='hovertip_wrap0'><span class='hovertip_wrap1'><span class='hovertip_wrap2'>" +
"</span></span></span>").each(function() {
// fix class and attributes for newly wrapped elements
var tooltip = this.parentNode.parentNode.parentNode;
if (this.getAttribute('target'))
tooltip.setAttribute('target', this.getAttribute('target'));
if (this.getAttribute('id')) {
var id = this.getAttribute('id');
this.removeAttribute('id');
tooltip.setAttribute('id', id);
}
});
hovertipSpanSelect = 'span.hovertip_wrap0';
window.setTimeout(function() {
$(hovertipSpanSelect)
.hovertipActivate(hovertipConfig,
targetSelectByPrevious,
hovertipPrepare,
hovertipTargetPrepare);
}, 0);
};

/**
* This simplified alternative to hovertipInit supports markup like this:
*
* this is the text that always appears<span class=hoverinfo>this is the text that appears on mouse hover.</span>
*
* In this case the text that always appeared will be followed by an icon inicating more information is available.
*/
function hoverinfoDivInit() {
// specify our configuration for hovertips, including delay times (millisec)
var hovertipConfig = {'attribute':'hovertip',
'showDelay': 300,
'hideDelay': 700};
var select = '.hoverinfo';
// activate hovertips with wrappers for FX (drop shadow):
$(select).css('display', 'block').addClass('hovertip_wrap3').
wrap("<div class='hovertip_wrap0'><div class='hovertip_wrap1'><div class='hovertip_wrap2'>" +
"</div></div></div>");
hovertipSpanSelect = 'div.hovertip_wrap0';
window.setTimeout(function() {
$(hovertipSpanSelect)
.before('<span class=hoverinfo_target><span></span></span>')
.hovertipActivate(hovertipConfig,
targetSelectByPrevious,
hovertipPrepare,
hovertipTargetPrepare);
}, 0);
};
