define([
  'mapper/support/deferred',
  'extraction_pipeline/connected/missing_handlers_parser'
], function(Deferred, parser) {
  'use strict';

  var handlers = {
    // Reports the missing barcode, nothing more
    report: function() {
      return function(modelName, barcode) {
        return $.Deferred().reject('Barcode "' + barcode + '" not found');
      };
    },

    // Creates an instance of the appropriate labware
    create: function() {
      return function(modelName, barcode) {
        return this.owner.getS2Root().then(function(root) {
          var labwareModel = root[modelName];

          return Deferred.sequentially(function(state) {
            return labwareModel.create({});
          }, function(state, labware) {
            state.labware = labware;
            return labware.labelWith({
              'barcode': { 'type': 'ean13-barcode', 'value': barcode }
            });
          }, function(state) {
            return root.find(state.labware.uuid);
          }, function(state, labware_with_labels) {
            state.labware = labware_with_labels;
          });
        }).then(function(state) {
          return state.labware;
        }, function() {
          return 'Unable to register labware with barcode "' + barcode + '"';
        });
      };
    },

    // Finds an instance of the appropriate labware in the system
    find: function() {
      return function(modelName, barcode) {
        return this.owner.getS2Root().then(function(root) {
          return root[modelName].findByEan13Barcode(barcode);
        }).then(function(labware) {
          return labware;
        }, function() {
          return 'Unable to find labware with barcode "' + barcode + '"';
        });
      };
    },

    // Composite behaviour: find it, if it can't be found create it.
    composite: function(start) {
      var rest  = _.chain(arguments).drop(1);
      return function() {
        var owner = this;
        return rest.reduce(function(previous, next) {
          return previous.then(function(labware) {
            return labware;
          }, function() {
            return next.apply(owner);
          });
        }, start.apply(owner, arguments)).value();
      };
    },

    // If the resource has been pulled from the cache then we can treat that as a
    // failure.  Otherwise we can do a success.
    singular: function(child) {
      return function() {
        var ending = _.drop(arguments, arguments.length-2);
        var pulled = ending[0], filter = ending[1];

        var resource = _.find(pulled, filter);
        return resource ? $.Deferred().reject('Already used') : child.apply(this, arguments);
      };
    }
  };

  return function(input) {
    // Use a simple PEG parser to deal with processing the input, turning it from
    // a simple string into a tree structure describing the calls to make
    // Each node is a pair of the function to call and the arguments to pass; the arguments
    // may in turn be one of these pairs.  Hence we process the arguments first, and walk
    // back up from the leaves applying the calls.
    return walk.apply(handlers, parser.parse(input));

    function walk(fn, args) {
      var context = this;
      return context[fn].apply(context, _.map(args, function(a) { return walk.apply(context, a); }));
    }
  };
});
