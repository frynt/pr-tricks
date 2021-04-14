// Doc from https://developer.chrome.com/docs/extensions/mv3/options/
export { };
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
