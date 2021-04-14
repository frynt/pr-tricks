import { sync } from 'glob';
import { castArray } from 'lodash';
import { createDecorator } from 'vue-class-component';
import { trickList } from './data/trick-list';

// Doc from https://developer.chrome.com/docs/extensions/mv3/options/
let tab = get_categories();

// Saves options to chrome.storage
export function save_options() {
	let color = (document.getElementById('color') as HTMLInputElement).value;
	let formation = (document.getElementById('formation') as HTMLInputElement).checked;
	let categories = [];

	tab.forEach(element => save_categories(element));
	function save_categories(element) {
		let checkbox = (document.getElementById(element) as HTMLInputElement);
		if (checkbox.checked) {
			categories.push(element);
		}
	}

	chrome.storage.sync.set({
		favoriteColor: color,
		formationActivated: formation,
		formationPreferences: JSON.stringify(categories)
	}, function () {
		// Update status to let user know options were saved.
		let status = document.getElementById('status');
		status.textContent = 'Options saved.';
		setTimeout(function () {
			status.textContent = '';
		}, 2000);
	});
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
export function restore_options() {
	chrome.storage.sync.get({
		favoriteColor: '',
		formationActivated: '',
		formationPreferences: []
	}, function (items) {
		(document.getElementById('color') as HTMLInputElement).value = items.favoriteColor;
		document.body.style.backgroundColor = (document.getElementById('color') as HTMLInputElement).value;
		(document.getElementById('formation') as HTMLInputElement).checked = items.formationActivated;
		showFormationMode();

		tab.forEach(element => set_preferences(element));
		function set_preferences(element) {
			if (items.formationPreferences.includes(element)) {
				(document.getElementById(element) as HTMLInputElement).checked = true;
			}
			else {
				(document.getElementById(element) as HTMLInputElement).checked = false;
			}
		}
	});
}

//Loaded at page start
export function init() {
	restore_options();
	display_categories();
}

document.addEventListener('DOMContentLoaded', init);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('formation').addEventListener('change',showFormationMode);

// Get each unique categories from trickList array
export function get_categories() {
	let categories = [];
	trickList.forEach(element => filter(element));

	function filter(element) {
		if (!categories.includes(element.name)) {
			categories.push(element.name);
		}
	}
	return categories;
}

// Display label and checkbox foreach categories
export function display_categories() {
	let section = (document.getElementById('categories') as HTMLInputElement);
	tab.forEach(element => display_elements(element));

	function display_elements(element) {
		let label = document.createElement('label');
		let input = document.createElement('input');
		label.innerHTML = element;
		input.setAttribute("type", "checkbox");
		input.id = element;
		section.appendChild(label);
		section.appendChild(input);
		section.appendChild(document.createElement('br'));
	}
}

// Show categories section if the formation mode is activated
export function showFormationMode() {
	let section = (document.getElementById('categories') as HTMLInputElement);
	let activated = (document.getElementById('formation') as HTMLInputElement);

	if (activated.checked) {
		section.style.visibility = 'visible';
	}
	else {
		section.style.visibility = 'hidden';
	}
}