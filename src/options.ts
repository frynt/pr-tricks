
// Doc from https://developer.chrome.com/docs/extensions/mv3/options/
export { }
// Saves options to chrome.storage
export function save_options() {
	let color = (<HTMLInputElement>document.getElementById('color')).value;
	let formation = (<HTMLInputElement>document.getElementById('formation')).checked;
	chrome.storage.sync.set({
		favoriteColor: color,
		formationActivated: formation,
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
		favoriteColor: 'white',
		formationActivated: 'off',
	}, function (items) {
		(<HTMLInputElement>document.getElementById('color')).value = items.favoriteColor;
		document.body.style.backgroundColor = (<HTMLInputElement>document.getElementById('color')).value;
		(<HTMLInputElement>document.getElementById('formation')).checked = items.formationActivated;
	});
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);