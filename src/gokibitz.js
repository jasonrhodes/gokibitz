/*global jQuery:true, console:true*/
/**
Collection = GameTree { GameTree }
GameTree   = "(" Sequence { GameTree } ")"
Sequence   = Node { Node }
Node       = ";" { Property }
Property   = PropIdent PropValue { PropValue }
PropIdent  = UcLetter { UcLetter }
PropValue  = "[" CValueType "]"
CValueType = (ValueType | Compose)
ValueType  = (None | Number | Real | Double | Color | SimpleText |
Text | Point  | Move | Stone)
*/

(function ($) {
	'use strict';

	var parseSGF = function (sgf) {
		var parse;
		var parser;
		var json = {};
		var sequence;
		var node;

		parser = {

			beginSequence: function (sgf) {
				var newSequence;

				if (sequence) {
					newSequence = {
						parent: sequence
					};
					sequence.sequences = sequence.sequences || [];
					sequence.sequences.push(newSequence);
					sequence = newSequence;
				} else {
					sequence = json;
				}

				return parse(sgf.substring(1));
			},

			endSequence: function (sgf) {
				if (sequence.parent) {
					sequence = sequence.parent;
					return parse(sgf.substring(1));
				} else {
					return json;
				}
			},

			node: function (sgf) {
				node = {};
				sequence.nodes = sequence.nodes || [];
				sequence.nodes.push(node);
				return parse(sgf.substring(1));
			},

			property: function (sgf, key) {
				var value;
				var firstPropEnd = sgf.indexOf(']');

				if (firstPropEnd > -1) {
					var property = sgf.substring(0, firstPropEnd + 1);
					var valueBegin = property.indexOf('[');

					if (!key) {
						key = property.substring(0, valueBegin);
					}

					value = property.substring(valueBegin + 1, property.length - 1);

					if (key.length > 2) {
						console.warn(
							'SGF PropIdents should be no longer than two characters:', key
						);
					}

					if ($.isArray(node[key])) {
						node[key].push(value);
					} else {
						node[key] = value;
					}

					// Check for multiple property values
					if (sgf.substring(firstPropEnd + 1, firstPropEnd + 2) === '[') {
						if (!$.isArray(node[key])) {
							node[key] = [node[key]];
						}
						return parser.property(sgf.substring(firstPropEnd + 1), key);
					} else {
						return parse(sgf.substring(firstPropEnd + 1));
					}
				} else {
					throw new Error('Error parsing sgf');
				}
			},

			unrecognized: function (sgf) {
				return parse(sgf.substring(1));
			}
		};

		parse = function (sgf) {
			var initial = sgf.substring(0, 1);
			var type;

			if (!initial) {
				return json;
			} else if (initial === '(') {
				type = 'beginSequence';
			} else if (initial === ')') {
				type = 'endSequence';
			} else if (initial === ';') {
				type = 'node';
			} else if (initial.match(/[A-Z]/)) {
				type = 'property';
			} else {
				type = 'unrecognized';
			}

			return parser[type](sgf);
		};

		return parse(sgf);
	};

	$.ajax({
		url: 'sgf/simple_example.sgf',
		success: function (sgf) {
			var json = parseSGF(sgf);
			console.log('json sgf:', json);
		}
	});

	$.ajax({
		url: 'sgf/example.sgf',
		success: function (sgf) {
			var json = parseSGF(sgf);
			console.log('json sgf:', json);
		}
	});
}(jQuery));
