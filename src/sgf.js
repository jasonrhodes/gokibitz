/*jshint browser:true*/
/*global define:true*/

define(['jquery'], function ($) {
	'use strict';

	return {
		/**
		 * Convert SGF files to JSON
		 * @param {string} sgf A valid SGF file.
		 * @see http://www.red-bean.com/sgf/sgf4.html
		 * @return {object} The SGF file represented as a JS object
		 */
		decode: function (sgf) {

			var parse;
			var parser;
			var json = {};
			var sequence;
			var node;

			parser = {

				beginSequence: function (sgf) {
					if (!sequence) {
						sequence = json;
					}

					var newSequence = {
						parent: sequence
					};

					sequence.sequences = sequence.sequences || [];
					sequence.sequences.push(newSequence);
					sequence = newSequence;

					return parse(sgf.substring(1));
				},

				endSequence: function (sgf) {
					if (sequence.parent) {
						sequence = sequence.parent;
					} else {
						sequence = null;
					}
					return parse(sgf.substring(1));
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
							if (window.console) {
								window.console.warn(
									'SGF PropIdents should be no longer than two characters:', key
								);
							}
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
		},

		/**
		 * Convert JS game records to SGF format
		 * @param {object} game A JS game record
		 * @see http://www.red-bean.com/sgf/sgf4.html
		 * @return {string} The game in SGF format
		 */
		encode: function () {
			// TODO: Write this function
		}
	};
});
