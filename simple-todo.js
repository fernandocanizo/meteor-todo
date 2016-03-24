"use strict";

/* global Meteor */
/* global Template */
/* global Mongo */
/* global Session */
/* global Accounts */

var Tasks = new Mongo.Collection('tasks');

if (Meteor.isClient) {
	Template.body.helpers({
		tasks: function () {
			if(Session.get('hideCompleted')) {
				return Tasks.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
			} else {
				return Tasks.find({}, {sort: {createdAt: -1}});
			}
		},

		hideCompleted: function () {
			return Session.get('hideCompleted');
		},

		incompleteCount: function () {
			return Tasks.find({checked: {$ne: true}}).count();
		}

	});

	Template.body.events({
		'submit .new-task': function (event) {
			event.preventDefault();
			var text = event.target.text.value;
			Meteor.call('addTask', text);
			event.target.text.value = "";
		},

		'change .hide-completed input': function (event) {
			Session.set('hideCompleted', event.target.checked);
		}
	});

	Template.task.events({
		'click .toggle-checked': function () {
			Meteor.call('toggleChecked', this._id);
		},

		'click .delete': function () {
			Meteor.call('deleteTask', this._id);
		},
	});

	Accounts.ui.config({
		passwordSignupFields: "USERNAME_AND_EMAIL"
	});
}

Meteor.methods({
	addTask: function (text) {
		// ensure user is logged in
		if(! Meteor.userId()) {
			throw new Meteor.Error("Not authorized!");
		}

		Tasks.insert({
			text: text,
			createdAt: new Date(),
			checked: false,
			owner: Meteor.userId(),
			username: Meteor.user().username
		});
	},

	deleteTask: function (taskId) {
		if(! Meteor.userId()) {
			throw new Meteor.Error("Not authorized!");
		}
		Tasks.remove(taskId);
	},

	toggleChecked: function (taskId) {
		if(! Meteor.userId()) {
			throw new Meteor.Error("Not authorized!");
		}
		var task = Tasks.findOne(taskId);
		task.checked = ! task.checked;
		Tasks.update(taskId, task);
	}
});


if (Meteor.isServer) {
	Meteor.startup(function () {
	// code to run on server at startup
	});
}
