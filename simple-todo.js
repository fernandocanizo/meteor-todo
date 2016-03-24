"use strict";

/* global Meteor */
/* global Template */
/* global Mongo */
/* global Session */
/* global Accounts */

var Tasks = new Mongo.Collection('tasks');

if (Meteor.isClient) {
	Meteor.subscribe('tasks');

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

	Template.task.helpers({
		isOwner: function () {
			return this.owner === Meteor.userId();
		}
	});

	Template.task.events({
		'click .toggle-checked': function () {
			Meteor.call('toggleChecked', this._id);
		},

		'click .delete': function () {
			Meteor.call('deleteTask', this._id);
		},

		'click .toggle-private': function () {
			Meteor.call('togglePrivacy', this._id);
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
			private: false,
			owner: Meteor.userId(),
			username: Meteor.user().username
		});
	},

	deleteTask: function (taskId) {
		var task = Tasks.findOne(taskId);
		if(task.owner !== Meteor.userId()) {
			throw new Meteor.Error("Not authorized!");
		}
		Tasks.remove(taskId);
	},

	toggleChecked: function (taskId) {
		var task = Tasks.findOne(taskId);
		if(task.private && task.owner !== Meteor.userId()) {
			throw new Meteor.Error("Not authorized!");
		}
		task.checked = ! task.checked;
		Tasks.update(taskId, task);
	},

	togglePrivacy: function (taskId) {
		var task = Tasks.findOne(taskId);
		if(task.owner !== Meteor.userId()) {
			throw new Meteor.Error("Not authorized!");
		}
		task.private = ! task.private;
		Tasks.update(taskId, task);
	}
});


if (Meteor.isServer) {
	Meteor.publish('tasks', function () {
		return Tasks.find({
			$or: [
				{private: {$ne: true}},
				{owner: this.userId},
			]
		});
	});
}
