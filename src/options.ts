import { trickList } from './data/trick-list';

// Doc from https://developer.chrome.com/docs/extensions/mv3/options/
// Saves options to chrome.storage
let tab: string[] = [];

export function saveOptions(): void {
    const color = (document.getElementById('color') as HTMLInputElement).value;
    const formation = (document.getElementById('formation') as HTMLInputElement).checked;
    const categories = [];

    function saveCategories(element): void {
        const checkbox = (document.getElementById(element) as HTMLInputElement);
        if (checkbox.checked) {
            categories.push(element);
        }
    }
    tab.forEach((element) => saveCategories(element));

    chrome.storage.sync.set({
        favoriteColor: color,
        formationActivated: formation,
        formationPreferences: JSON.stringify(categories),
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
        favoriteColor: '',
        formationActivated: '',
        formationPreferences: [],
    }, (items) => {
        (document.getElementById('color') as HTMLInputElement).value = items.favoriteColor;
        document.body.style.backgroundColor = (document.getElementById('color') as HTMLInputElement).value;
        (document.getElementById('formation') as HTMLInputElement).checked = items.formationActivated;

        function setPreferences(element): void {
            if (items.formationPreferences.includes(element)) {
                (document.getElementById(element) as HTMLInputElement).checked = true;
            } else {
                (document.getElementById(element) as HTMLInputElement).checked = false;
            }
        }
        tab.forEach((element) => setPreferences(element));
    });
}

// Get each unique categories from trickList array
export function getCategories(): string[] {
    const categories = [];

    function filter(element): void {
        if (!categories.includes(element.name)) {
            categories.push(element.name);
        }
    }
    trickList.forEach((element) => filter(element));

    return categories;
}

// Display label and checkbox foreach categories
export function displayCategories(): void {
    const section = (document.getElementById('categories') as HTMLInputElement);

    function displayElements(element): void {
        const label = document.createElement('label');
        const input = document.createElement('input');
        label.innerHTML = element;
        input.setAttribute('type', 'checkbox');
        input.id = element;
        section.appendChild(label);
        section.appendChild(input);
        section.appendChild(document.createElement('br'));
    }
    tab.forEach((element) => displayElements(element));
}

// Show categories section if the formation mode is activated
export function showFormationMode(): void {
    const section = (document.getElementById('categories') as HTMLInputElement);
    const activated = (document.getElementById('formation') as HTMLInputElement);

    if (activated.checked) {
        section.style.visibility = 'visible';
    } else {
        section.style.visibility = 'hidden';
    }
}

// Loaded at page start
export function init(): void {
    restoreOptions();
    displayCategories();
    showFormationMode();
}

tab = getCategories();
document.addEventListener('DOMContentLoaded', init);
document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('formation').addEventListener('change', showFormationMode);
