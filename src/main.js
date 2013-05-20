/*jshint devel:true*/
/*global require:true*/

require.config({
	baseUrl: './src',
	paths: {
		'jquery': '../components/jquery/jquery'
	}
});

require(['jquery', 'sgf'], function ($, sgf) {
	'use strict';

	$.ajax({
		url: 'sgf/simple_example.sgf',
		success: function (file) {
			console.log('Simple example:', sgf.decode(file));
		}
	});

	$.ajax({
		url: 'sgf/example.sgf',
		success: function (file) {
			console.log('Official example:', sgf.decode(file));
		}
	});
});

