// Doc from https://developer.chrome.com/docs/extensions/mv3/options/
import { castArray } from 'lodash';
import { trickList } from './data/trick-list';

// Doc from https://developer.chrome.com/docs/extensions/mv3/options/
// Saves options to chrome.storage
export function saveOptions(): void {
    const color = (document.getElementById('color') as HTMLInputElement).value;
    const formation = (document.getElementById('formation') as HTMLInputElement).checked;
    chrome.storage.sync.set({
        favoriteColor: color,
        formationActivated: formation,
    }, () => {
        // Update status to let user know options were saved.
        const status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(() => {
            status.textContent = '';
        }, 2000);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
export function restoreOptions(): void {
    chrome.storage.sync.get({
        favoriteColor: 'white',
        formationActivated: 'off',
    }, (items) => {
        (document.getElementById('color') as HTMLInputElement).value = items.favoriteColor;
        document.body.style.backgroundColor = (document.getElementById('color') as HTMLInputElement).value;
        (document.getElementById('formation') as HTMLInputElement).checked = items.formationActivated;
    });
}
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);

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

export function display_categories() {
	let div = document.getElementById('categories');
	let list = document.createElement('ul');
	let tab = get_categories();

	tab.forEach(element => display_element(element));

	function display_element(element) {
		let label = document.createElement('label');
		let input = document.createElement('input');
		input.setAttribute("type","checkbox");
		label.innerHTML = element;
		list.appendChild(label);
		list.appendChild(input);
		list.appendChild(document.createElement('br'));
	}
	div.appendChild(list);
}
display_categories();
