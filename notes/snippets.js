
/**
 * Looks like this adds the helpers and events to the template object
 * @param  {[type]} dict)   {                       _extend(this, dict);     }      [description]
 * @param  {[type]} events: function      (dict) {                       var events;                 if (this.hasOwnProperty('_events'))      events = this._events;    else      events = (this._events = []);    _.each(dict, function (handler, spec) {      var clauses = spec.split(/,s+/);            _.each(clauses, function (clause) {        var parts = clause.split(/s+/);        if (parts.length === 0)          return;        var newEvents = parts.shift();        var selector = parts.join(' ' [description]
 * @return {[type]}         [description]
 */
_extend(UI.Component, {
  // We implement the old APIs here, including how data is passed
  // to helpers in `this`.
  helpers: function (dict) {
    _extend(this, dict);
  },
  events: function (dict) {
    var events;
    if (this.hasOwnProperty('_events'))
      events = this._events;
    else
      events = (this._events = []);

    _.each(dict, function (handler, spec) {
      var clauses = spec.split(/,\s+/);
      // iterate over clauses of spec, e.g. ['click .foo', 'click .bar']
      _.each(clauses, function (clause) {
        var parts = clause.split(/\s+/);
        if (parts.length === 0)
          return;

        var newEvents = parts.shift();
        var selector = parts.join(' ');
        events.push({events: newEvents,
                     selector: selector,
                     handler: handler});
      });
    });
  }
});



/**
 * This adds all the templates on to the main object
 * @param  {[type]} index  [description]
 * @param  {[type]} script [description]
 * @return {[type]}        [description]
 */
$("script[type='text/spacebars']").each(function (index, script) {
  var name = script.getAttribute('name');
  var renderFuncCode = Spacebars.compile(script.innerHTML);
  eval("Template.__define__(" + JSON.stringify(name) +
       ", " + renderFuncCode + ");");
});

$(document).ready(function () {
  if (Template.main) {
    UI.insert(UI.render(Template.main), document.body);
  }
});

Deps = Package.deps.Deps;
Blaze = {};
Blaze.Var = function (initVal) {
  if (! (this instanceof Blaze.Var))
    return new Blaze.Var(initVal);
  this._dep = new Deps.Dependency;
  this._value = initVal;
};

Blaze.Var.prototype.get = function () {
  this._dep.depend();
  return this._value;
};

Blaze.Var.prototype.set = function (val) {
  if (this._value === val)
    return val;
  this._dep.changed();
  this._value = val;
};


(function () {

                                                                                                        //
if (Meteor.isClient) {

  // XXX in the future, make the jQuery adapter a separate
  // package and make the choice of back-end library
  // configurable.  Adapters all expose the same DomBackend interface.

  if (! Package.jquery)
    throw new Error("Meteor UI jQuery adapter: jQuery not found.");

  var $jq = Package.jquery.jQuery;

  var DomBackend = {};
  UI.DomBackend = DomBackend;

  ///// Removal detection and interoperability.

  // For an explanation of this technique, see:
  // http://bugs.jquery.com/ticket/12213#comment:23 .
  //
  // In short, an element is considered "removed" when jQuery
  // cleans up its *private* userdata on the element,
  // which we can detect using a custom event with a teardown
  // hook.

  var JQUERY_REMOVAL_WATCHER_EVENT_NAME = 'meteor_ui_removal_watcher';
  var REMOVAL_CALLBACKS_PROPERTY_NAME = '$meteor_ui_removal_callbacks';
  var NOOP = function () {};

  // Causes `elem` (a DOM element) to be detached from its parent, if any.
  // Whether or not `elem` was detached, causes any callbacks registered
  // with `onRemoveElement` on `elem` and its descendants to fire.
  // Not for use on non-element nodes.
  //
  // This method is modeled after the behavior of jQuery's `$(elem).remove()`,
  // which causes teardown on the subtree being removed.
  DomBackend.removeElement = function (elem) {
    $jq(elem).remove();
  };

  // Registers a callback function to be called when the given element or
  // one of its ancestors is removed from the DOM via the backend library.
  // The callback function is called at most once, and it receives the element
  // in question as an argument.
  DomBackend.onRemoveElement = function (elem, func) {
    if (! elem[REMOVAL_CALLBACKS_PROPERTY_NAME]) {
      elem[REMOVAL_CALLBACKS_PROPERTY_NAME] = [];

      // Set up the event, only the first time.
      $jq(elem).on(JQUERY_REMOVAL_WATCHER_EVENT_NAME, NOOP);
    }

    elem[REMOVAL_CALLBACKS_PROPERTY_NAME].push(func);
  };

  $jq.event.special[JQUERY_REMOVAL_WATCHER_EVENT_NAME] = {
    teardown: function() {
      var elem = this;
      var callbacks = elem[REMOVAL_CALLBACKS_PROPERTY_NAME];
      if (callbacks) {
        for (var i = 0; i < callbacks.length; i++)
          callbacks[i](elem);
        elem[REMOVAL_CALLBACKS_PROPERTY_NAME] = null;
      }
    }
  };

  DomBackend.parseHTML = function (html) {
    // Return an array of nodes.
    //
    // jQuery does fancy stuff like creating an appropriate
    // container element and setting innerHTML on it, as well
    // as working around various IE quirks.
    return $jq.parseHTML(html) || [];
  };

  // Must use jQuery semantics for `context`, not
  // querySelectorAll's.  In other words, all the parts
  // of `selector` must be found under `context`.
  DomBackend.findBySelector = function (selector, context) {
    return $jq(selector, context);
  };

  DomBackend.newFragment = function (nodeArray) {
    var frag = document.createDocumentFragment();
    for (var i = 0; i < nodeArray.length; i++)
      frag.appendChild(nodeArray[i]);
    return frag;
  };

  // `selector` is non-null.  `type` is one type (but
  // may be in backend-specific form, e.g. have namespaces).
  // Order fired must be order bound.
  DomBackend.delegateEvents = function (elem, type, selector, handler) {
    $jq(elem).on(type, selector, handler);
  };

  DomBackend.undelegateEvents = function (elem, type, handler) {
    $jq(elem).off(type, handler);
  };

  DomBackend.bindEventCapturer = function (elem, type, selector, handler) {
    var $elem = $jq(elem);

    var wrapper = function (event) {
      event = $jq.event.fix(event);
      event.currentTarget = event.target;

      // Note: It might improve jQuery interop if we called into jQuery
      // here somehow.  Since we don't use jQuery to dispatch the event,
      // we don't fire any of jQuery's event hooks or anything.  However,
      // since jQuery can't bind capturing handlers, it's not clear
      // where we would hook in.  Internal jQuery functions like `dispatch`
      // are too high-level.
      var $target = $jq(event.currentTarget);
      if ($target.is($elem.find(selector)))
        handler.call(elem, event);
    };

    handler._meteorui_wrapper = wrapper;

    type = this.parseEventType(type);
    // add *capturing* event listener
    elem.addEventListener(type, wrapper, true);
  };

  DomBackend.unbindEventCapturer = function (elem, type, handler) {
    type = this.parseEventType(type);
    elem.removeEventListener(type, handler._meteorui_wrapper, true);
  };

  DomBackend.parseEventType = function (type) {
    // strip off namespaces
    var dotLoc = type.indexOf('.');
    if (dotLoc >= 0)
      return type.slice(0, dotLoc);
    return type;
  };

}

}).call(this);



(function () {

                                                                                                        //
// TODO
// - Lazy removal detection
// - UI hooks (expose, test)
// - Quick remove/add (mark "leaving" members; needs UI hooks)
// - Event removal on removal

var DomBackend = UI.DomBackend;

var removeNode = function (n) {
//  if (n.nodeType === 1 &&
//      n.parentNode.$uihooks && n.parentNode.$uihooks.removeElement)
//    n.parentNode.$uihooks.removeElement(n);
//  else
    n.parentNode.removeChild(n);
};

var insertNode = function (n, parent, next) {
//  if (n.nodeType === 1 &&
//      parent.$uihooks && parent.$uihooks.insertElement)
//    parent.$uihooks.insertElement(n, parent, next);
//  else
    // `|| null` because IE throws an error if 'next' is undefined
  parent.insertBefore(n, next || null);
};

var moveNode = function (n, parent, next) {
//  if (n.nodeType === 1 &&
//      parent.$uihooks && parent.$uihooks.moveElement)
//    parent.$uihooks.moveElement(n, parent, next);
//  else
    // `|| null` because IE throws an error if 'next' is undefined
    parent.insertBefore(n, next || null);
};

// A very basic operation like Underscore's `_.extend` that
// copies `src`'s own, enumerable properties onto `tgt` and
// returns `tgt`.
var _extend = function (tgt, src) {
  for (var k in src)
    if (src.hasOwnProperty(k))
      tgt[k] = src[k];
  return tgt;
};

var _contains = function (list, item) {
  if (! list)
    return false;
  for (var i = 0, N = list.length; i < N; i++)
    if (list[i] === item)
      return true;
  return false;
};

var isArray = function (x) {
  return !!((typeof x.length === 'number') &&
            (x.sort || x.splice));
};

// Text nodes consisting of only whitespace
// are "insignificant" nodes.
var isSignificantNode = function (n) {
  return ! (n.nodeType === 3 &&
            (! n.nodeValue ||
             /^\s+$/.test(n.nodeValue)));
};

var checkId = function (id) {
  if (typeof id !== 'string')
    throw new Error("id must be a string");
  if (! id)
    throw new Error("id may not be empty");
};

var textExpandosSupported = (function () {
  var tn = document.createTextNode('');
  try {
    tn.blahblah = true;
    return true;
  } catch (e) {
    // IE 8
    return false;
  }
})();

var createMarkerNode = (
  textExpandosSupported ?
    function () { return document.createTextNode(""); } :
  function () { return document.createComment("IE"); });

var rangeParented = function (range) {
  if (! range.isParented) {
    range.isParented = true;

    if (! range.owner) {
      // top-level (unowned) ranges in an element,
      // keep a pointer to the range on the parent
      // element.  This is really just for IE 9+
      // TextNode GC issues, but we can't do reliable
      // feature detection (i.e. bug detection).
      var parentNode = range.parentNode();
      var rangeDict = (
        parentNode.$_uiranges ||
          (parentNode.$_uiranges = {}));
      rangeDict[range._rangeId] = range;
      range._rangeDict = rangeDict;

      // get jQuery to tell us when this node is removed
      DomBackend.onRemoveElement(parentNode, function () {
        rangeRemoved(range);
      });
    }

    if (range.component && range.component.notifyParented)
      range.component.notifyParented();

    // recurse on member ranges
    var members = range.members;
    for (var k in members) {
      var mem = members[k];
      if (mem instanceof DomRange)
        rangeParented(mem);
    }
  }
};

var rangeRemoved = function (range) {
  if (! range.isRemoved) {
    range.isRemoved = true;

    if (range._rangeDict)
      delete range._rangeDict[range._rangeId];

    // clean up events
    if (range.stopHandles) {
      for (var i = 0; i < range.stopHandles.length; i++)
        range.stopHandles[i].stop();
      range.stopHandles = null;
    }

    // notify component of removal
    if (range.removed)
      range.removed();

    membersRemoved(range);
  }
};

var nodeRemoved = function (node, viaBackend) {
  if (node.nodeType === 1) { // ELEMENT
    var comps = DomRange.getComponents(node);
    for (var i = 0, N = comps.length; i < N; i++)
      rangeRemoved(comps[i]);

    if (! viaBackend)
      DomBackend.removeElement(node);
  }
};

var membersRemoved = function (range) {
  var members = range.members;
  for (var k in members) {
    var mem = members[k];
    if (mem instanceof DomRange)
      rangeRemoved(mem);
    else
      nodeRemoved(mem);
  }
};

var nextGuid = 1;

var DomRange = function () {
  var start = createMarkerNode();
  var end = createMarkerNode();
  var fragment = DomBackend.newFragment([start, end]);
  fragment.$_uiIsOffscreen = true;

  this.start = start;
  this.end = end;
  start.$ui = this;
  end.$ui = this;

  this.members = {};
  this.nextMemberId = 1;
  this.owner = null;
  this._rangeId = nextGuid++;
  this._rangeDict = null;

  this.isParented = false;
  this.isRemoved = false;

  this.stopHandles = null;
};

_extend(DomRange.prototype, {
  getNodes: function () {
    if (! this.parentNode())
      return [];

    this.refresh();

    var afterNode = this.end.nextSibling;
    var nodes = [];
    for (var n = this.start;
         n && n !== afterNode;
         n = n.nextSibling)
      nodes.push(n);
    return nodes;
  },
  removeAll: function () {
    if (! this.parentNode())
      return;

    this.refresh();

    // leave start and end
    var afterNode = this.end;
    var nodes = [];
    for (var n = this.start.nextSibling;
         n && n !== afterNode;
         n = n.nextSibling) {
      // don't remove yet since then we'd lose nextSibling
      nodes.push(n);
    }
    for (var i = 0, N = nodes.length; i < N; i++)
      removeNode(nodes[i]);

    membersRemoved(this);

    this.members = {};
  },
  // (_nextNode is internal)
  add: function (id, newMemberOrArray, beforeId, _nextNode) {
    if (id != null && typeof id !== 'string') {
      if (typeof id !== 'object')
        // a non-object first argument is probably meant
        // as an id, NOT a new member, so complain about it
        // as such.
        throw new Error("id must be a string");
      beforeId = newMemberOrArray;
      newMemberOrArray = id;
      id = null;
    }

    if (! newMemberOrArray || typeof newMemberOrArray !== 'object')
      throw new Error("Expected component, node, or array");

    if (isArray(newMemberOrArray)) {
      if (newMemberOrArray.length === 1) {
        newMemberOrArray = newMemberOrArray[0];
      } else {
        if (id != null)
          throw new Error("Can only add one node or one component if id is given");
        var array = newMemberOrArray;
        // calculate `nextNode` once in case it involves a refresh
        _nextNode = this.getInsertionPoint(beforeId);
        for (var i = 0; i < array.length; i++)
          this.add(null, array[i], beforeId, _nextNode);
        return;
      }
    }

    var parentNode = this.parentNode();
    // Consider ourselves removed (and don't mind) if
    // start marker has no parent.
    if (! parentNode)
      return;
    // because this may call `refresh`, it must be done
    // early, before we add the new member.
    var nextNode = (_nextNode ||
                    this.getInsertionPoint(beforeId));

    var newMember = newMemberOrArray;
    if (id == null) {
      id = this.nextMemberId++;
    } else {
      checkId(id);
      id = ' ' + id;
    }

    var members = this.members;
    if (members.hasOwnProperty(id)) {
      var oldMember = members[id];
      if (oldMember instanceof DomRange) {
        // range, does it still exist?
        var oldRange = oldMember;
        if (oldRange.start.parentNode !== parentNode) {
          delete members[id];
          oldRange.owner = null;
          rangeRemoved(oldRange);
        } else {
          throw new Error("Member already exists: " + id.slice(1));
        }
      } else {
        // node, does it still exist?
        var oldNode = oldMember;
        if (oldNode.parentNode !== parentNode) {
          nodeRemoved(oldNode);
          delete members[id];
        } else {
          throw new Error("Member already exists: " + id.slice(1));
        }
      }
    }

    if (newMember instanceof DomRange) {
      // Range
      var range = newMember;
      range.owner = this;
      var nodes = range.getNodes();

      members[id] = newMember;
      for (var i = 0; i < nodes.length; i++)
        insertNode(nodes[i], parentNode, nextNode);

      if (this.isParented)
        rangeParented(range);
    } else {
      // Node
      if (typeof newMember.nodeType !== 'number')
        throw new Error("Expected Component or Node");
      var node = newMember;
      // can't attach `$ui` to a TextNode in IE 8, so
      // don't bother on any browser.
      if (node.nodeType !== 3)
        node.$ui = this;

      members[id] = newMember;
      insertNode(node, parentNode, nextNode);
    }
  },
  remove: function (id) {
    if (id == null) {
      // remove self
      this.removeAll();
      removeNode(this.start);
      removeNode(this.end);
      this.owner = null;
      rangeRemoved(this);
      return;
    }

    checkId(id);
    id = ' ' + id;
    var members = this.members;
    var member = (members.hasOwnProperty(id) &&
                  members[id]);
    delete members[id];

    // Don't mind double-remove.
    if (! member)
      return;

    var parentNode = this.parentNode();
    // Consider ourselves removed (and don't mind) if
    // start marker has no parent.
    if (! parentNode)
      return;

    if (member instanceof DomRange) {
      // Range
      var range = member;
      range.owner = null;
      // Don't mind if range (specifically its start
      // marker) has been removed already.
      if (range.start.parentNode === parentNode)
        member.remove();
    } else {
      // Node
      var node = member;
      // Don't mind if node has been removed already.
      if (node.parentNode === parentNode)
        removeNode(node);
    }
  },
  moveBefore: function (id, beforeId) {
    var nextNode = this.getInsertionPoint(beforeId);
    checkId(id);
    id = ' ' + id;
    var members = this.members;
    var member =
          (members.hasOwnProperty(id) &&
           members[id]);
    // Don't mind if member doesn't exist.
    if (! member)
      return;

    var parentNode = this.parentNode();
    // Consider ourselves removed (and don't mind) if
    // start marker has no parent.
    if (! parentNode)
      return;

    if (member instanceof DomRange) {
      // Range
      var range = member;
      // Don't mind if range (specifically its start marker)
      // has been removed already.
      if (range.start.parentNode === parentNode) {
        range.refresh();
        var nodes = range.getNodes();
        for (var i = 0; i < nodes.length; i++)
          moveNode(nodes[i], parentNode, nextNode);
      }
    } else {
      // Node
      var node = member;
      moveNode(node, parentNode, nextNode);
    }
  },
  get: function (id) {
    checkId(id);
    id = ' ' + id;
    var members = this.members;
    if (members.hasOwnProperty(id))
      return members[id];
    return null;
  },
  parentNode: function () {
    return this.start.parentNode;
  },
  startNode: function () {
    return this.start;
  },
  endNode: function () {
    return this.end;
  },
  eachMember: function (nodeFunc, rangeFunc) {
    var members = this.members;
    var parentNode = this.parentNode();
    for (var k in members) {
      // mem is a component (hosting a Range) or a Node
      var mem = members[k];
      if (mem instanceof DomRange) {
        // Range
        var range = mem;
        if (range.start.parentNode === parentNode) {
          rangeFunc && rangeFunc(range); // still there
        } else {
          range.owner = null;
          delete members[k]; // gone
          rangeRemoved(range);
        }
      } else {
        // Node
        var node = mem;
        if (node.parentNode === parentNode) {
          nodeFunc && nodeFunc(node); // still there
        } else {
          delete members[k]; // gone
          nodeRemoved(node);
        }
      }
    }
  },

  ///////////// INTERNALS below this point, pretty much

  // The purpose of "refreshing" a DomRange is to
  // take into account any element removals or moves
  // that may have occurred, and to "fix" the start
  // and end markers before the entire range is moved
  // or removed so that they bracket the appropriate
  // content.
  //
  // For example, if a DomRange contains a single element
  // node, and this node is moved using jQuery, refreshing
  // the DomRange will look to the element as ground truth
  // and move the start/end markers around the element.
  // A refreshed DomRange's nodes may surround nodes from
  // sibling DomRanges (including their marker nodes)
  // until the sibling DomRange is refreshed.
  //
  // Specifically, `refresh` moves the `start`
  // and `end` nodes to immediate before the first,
  // and after the last, "significant" node the
  // DomRange contains, where a significant node
  // is any node except a whitespace-only text-node.
  // All member ranges are refreshed first.  Adjacent
  // insignificant member nodes are included between
  // `start` and `end` as well, but it's possible that
  // other insignificant nodes remain as siblings
  // elsewhere.  Nodes with no DomRange owner that are
  // found between this DomRange's nodes are adopted.
  //
  // Performing add/move/remove operations on an "each"
  // shouldn't require refreshing the entire each, just
  // the member in question.  (However, adding to the
  // end may require refreshing the whole "each";
  // see `getInsertionPoint`.  Adding multiple members
  // at once using `add(array)` is faster.
  refresh: function () {

    var parentNode = this.parentNode();
    if (! parentNode)
      return;

    // Using `eachMember`, do several things:
    // - Refresh all member ranges
    // - Count our members
    // - If there's only one, get that one
    // - Make a list of member TextNodes, which we
    //   can't detect with a `$ui` property because
    //   IE 8 doesn't allow user-defined properties
    //   on TextNodes.
    var someNode = null;
    var someRange = null;
    var numMembers = 0;
    var textNodes = null;
    this.eachMember(function (node) {
      someNode = node;
      numMembers++;
      if (node.nodeType === 3) {
        textNodes = (textNodes || []);
        textNodes.push(node);
      }
    }, function (range) {
      range.refresh();
      someRange = range;
      numMembers++;
    });

    var firstNode = null;
    var lastNode = null;

    if (numMembers === 0) {
      // don't scan for members
    } else if (numMembers === 1) {
      if (someNode) {
        firstNode = someNode;
        lastNode = someNode;
      } else if (someRange) {
        firstNode = someRange.start;
        lastNode = someRange.end;
      }
    } else {
      // This loop is O(childNodes.length), even if our members
      // are already consecutive.  This means refreshing just one
      // item in a list is technically order of the total number
      // of siblings, including in other list items.
      //
      // The root cause is we intentionally don't track the
      // DOM order of our members, so finding the first
      // and last in sibling order either involves a scan
      // or a bunch of calls to compareDocumentPosition.
      //
      // Fortunately, the common cases of zero and one members
      // are optimized.  Also, the scan is super-fast because
      // no work is done for unknown nodes.  It could be possible
      // to optimize this code further if it becomes a problem.
      for (var node = parentNode.firstChild;
           node; node = node.nextSibling) {

        var nodeOwner;
        if (node.$ui &&
            (nodeOwner = node.$ui) &&
            ((nodeOwner === this &&
              node !== this.start &&
              node !== this.end &&
              isSignificantNode(node)) ||
             (nodeOwner !== this &&
              nodeOwner.owner === this &&
              nodeOwner.start === node))) {
          // found a member range or node
          // (excluding "insignificant" empty text nodes,
          // which won't be moved by, say, jQuery)
          if (firstNode) {
            // if we've already found a member in our
            // scan, see if there are some easy ownerless
            // nodes to "adopt" by scanning backwards.
            for (var n = firstNode.previousSibling;
                 n && ! n.$ui;
                 n = n.previousSibling) {
              this.members[this.nextMemberId++] = n;
              // can't attach `$ui` to a TextNode in IE 8, so
              // don't bother on any browser.
              if (n.nodeType !== 3)
                n.$ui = this;
            }
          }
          if (node.$ui === this) {
            // Node
            firstNode = (firstNode || node);
            lastNode = node;
          } else {
            // Range
            // skip it and include its nodes in
            // firstNode/lastNode.
            firstNode = (firstNode || node);
            node = node.$ui.end;
            lastNode = node;
          }
        }
      }
    }
    if (firstNode) {
      // some member or significant node was found.
      // expand to include our insigificant member
      // nodes as well.
      for (var n;
           (n = firstNode.previousSibling) &&
           (n.$ui && n.$ui === this ||
            _contains(textNodes, n));)
        firstNode = n;
      for (var n;
           (n = lastNode.nextSibling) &&
           (n.$ui && n.$ui === this ||
            _contains(textNodes, n));)
        lastNode = n;
      // adjust our start/end pointers
      if (firstNode !== this.start)
        insertNode(this.start,
                   parentNode, firstNode);
      if (lastNode !== this.end)
        insertNode(this.end, parentNode,
                 lastNode.nextSibling);
    }
  },
  getInsertionPoint: function (beforeId) {
    var members = this.members;
    var parentNode = this.parentNode();

    if (! beforeId) {
      // Refreshing here is necessary if we want to
      // allow elements to move around arbitrarily.
      // If jQuery is used to reorder elements, it could
      // easily make our `end` pointer meaningless,
      // even though all our members continue to make
      // good reference points as long as they are refreshed.
      //
      // However, a refresh is expensive!  Let's
      // make the developer manually refresh if
      // elements are being re-ordered externally.
      return this.end;
    }

    checkId(beforeId);
    beforeId = ' ' + beforeId;
    var mem = members[beforeId];

    if (mem instanceof DomRange) {
      // Range
      var range = mem;
      if (range.start.parentNode === parentNode) {
        // still there
        range.refresh();
        return range.start;
      } else {
        range.owner = null;
        rangeRemoved(range);
      }
    } else {
      // Node
      var node = mem;
      if (node.parentNode === parentNode)
        return node; // still there
      else
        nodeRemoved(node);
    }

    // not there anymore
    delete members[beforeId];
    // no good position
    return this.end;
  }
});

DomRange.prototype.elements = function (intoArray) {
  intoArray = (intoArray || []);
  this.eachMember(function (node) {
    if (node.nodeType === 1)
      intoArray.push(node);
  }, function (range) {
    range.elements(intoArray);
  });
  return intoArray;
};

// XXX alias the below as `UI.refresh` and `UI.insert`

// In a real-life case where you need a refresh,
// you probably don't have easy
// access to the appropriate DomRange or component,
// just the enclosing element:
//
// ```
// {{#Sortable}}
//   <div>
//     {{#each}}
//       ...
// ```
//
// In this case, Sortable wants to call `refresh`
// on the div, not the each, so it would use this function.
DomRange.refresh = function (element) {
  var comps = DomRange.getComponents(element);

  for (var i = 0, N = comps.length; i < N; i++)
    comps[i].refresh();
};

DomRange.getComponents = function (element) {
  var topLevelComps = [];
  for (var n = element.firstChild;
       n; n = n.nextSibling) {
    if (n.$ui && n === n.$ui.start &&
        ! n.$ui.owner)
      topLevelComps.push(n.$ui);
  }
  return topLevelComps;
};

// `parentNode` must be an ELEMENT, not a fragment
DomRange.insert = function (range, parentNode, nextNode) {
  var nodes = range.getNodes();
  for (var i = 0; i < nodes.length; i++)
    insertNode(nodes[i], parentNode, nextNode);
  rangeParented(range);
};

DomRange.getContainingComponent = function (element) {
  while (element && ! element.$ui)
    element = element.parentNode;

  var range = (element && element.$ui);

  while (range) {
    if (range.component)
      return range.component;
    range = range.owner;
  }
  return null;
};

///// FIND BY SELECTOR

DomRange.prototype.contains = function (compOrNode) {
  if (! compOrNode)
    throw new Error("Expected Component or Node");

  var parentNode = this.parentNode();
  if (! parentNode)
    return false;

  var range;
  if (compOrNode instanceof DomRange) {
    // Component
    range = compOrNode;
    var pn = range.parentNode();
    if (! pn)
      return false;
    // If parentNode is different, it must be a node
    // we contain.
    if (pn !== parentNode)
      return this.contains(pn);
    if (range === this)
      return false; // don't contain self
    // Ok, `range` is a same-parent range to see if we
    // contain.
  } else {
    // Node
    var node = compOrNode;
    if (! elementContains(parentNode, node))
      return false;

    while (node.parentNode !== parentNode)
      node = node.parentNode;

    range = node.$ui;
  }

  // Now see if `range` is truthy and either `this`
  // or an immediate subrange

  while (range && range !== this)
    range = range.owner;

  return range === this;
};

DomRange.prototype.$ = function (selector) {
  var self = this;

  var parentNode = this.parentNode();
  if (! parentNode)
    throw new Error("Can't select in removed DomRange");

  // Strategy: Find all selector matches under parentNode,
  // then filter out the ones that aren't in this DomRange
  // using upwards pointers ($ui, owner, parentNode).  This is
  // asymptotically slow in the presence of O(N) sibling
  // content that is under parentNode but not in our range,
  // so if performance is an issue, the selector should be
  // run on a child element.

  // Since jQuery can't run selectors on a DocumentFragment,
  // we don't expect findBySelector to work.
  if (parentNode.nodeType === 11 /* DocumentFragment */ ||
      parentNode.$_uiIsOffscreen)
    throw new Error("Can't use $ on an offscreen component");

  var results = DomBackend.findBySelector(selector, parentNode);

  // We don't assume `results` has jQuery API; a plain array
  // should do just as well.  However, if we do have a jQuery
  // array, we want to end up with one also, so we use
  // `.filter`.


  // Function that selects only elements that are actually
  // in this DomRange, rather than simply descending from
  // `parentNode`.
  var filterFunc = function (elem) {
    // handle jQuery's arguments to filter, where the node
    // is in `this` and the index is the first argument.
    if (typeof elem === 'number')
      elem = this;

    return self.contains(elem);
  };

  if (! results.filter) {
    // not a jQuery array, and not a browser with
    // Array.prototype.filter (e.g. IE <9)
    var newResults = [];
    for (var i = 0; i < results.length; i++) {
      var x = results[i];
      if (filterFunc(x))
        newResults.push(x);
    }
    results = newResults;
  } else {
    // `results.filter` is either jQuery's or ECMAScript's `filter`
    results = results.filter(filterFunc);
  }

  return results;
};

