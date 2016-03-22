"use strict";

/* global Meteor */
/* global Template */

if (Meteor.isClient) {
	Template.body.helpers({
		tasks: [
			{text: 'task 1'},
			{text: 'task 2'},
			{text: 'task 3'}
		]
	});
}

if (Meteor.isServer) {
	Meteor.startup(function () {
	// code to run on server at startup
	});
}
