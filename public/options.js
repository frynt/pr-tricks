
// Default doc from https://developer.chrome.com/docs/extensions/mv3/options/

// Saves options to chrome.storage
function save_options() {
	let color = document.getElementById('color').value;
	chrome.storage.sync.set({
		favoriteColor: color,
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
function restore_options() {
	// Use default value color = 'red'
	chrome.storage.sync.get({
		favoriteColor: 'red',
	}, function (items) {
		document.getElementById('color').value = items.favoriteColor;
		document.body.style.backgroundColor = document.getElementById('color').value;
	});
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);

