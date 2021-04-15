import { trickList } from './data/trick-list';

// Doc from https://developer.chrome.com/docs/extensions/mv3/options/
// Saves options to chrome.storage
let categories: string[] = [];

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

export function saveOptions(): void {
    const color = (document.getElementById('color') as HTMLInputElement).value;
    const formationCheck = (document.getElementById('formation') as HTMLInputElement).checked;
    const detailsCheck = (document.getElementById('details') as HTMLInputElement).checked;
    const tab = [];

    function saveCategories(element): void {
        const checkbox = (document.getElementById(element) as HTMLInputElement);
        if (checkbox.checked) {
            tab.push(element);
        }
    }
    categories.forEach((element) => saveCategories(element));

    chrome.storage.sync.set({
        favoriteColor: color,
        formationActivated: formationCheck,
        formationPreferences: JSON.stringify(tab),
        formationDetails: detailsCheck,
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
        formationDetails: '',
    }, (items) => {
        (document.getElementById('color') as HTMLInputElement).value = items.favoriteColor;
        document.body.style.backgroundColor = (document.getElementById('color') as HTMLInputElement).value;
        (document.getElementById('formation') as HTMLInputElement).checked = items.formationActivated;
        (document.getElementById('details') as HTMLInputElement).checked = items.formationDetails;

        function setPreferences(element): void {
            if (items.formationPreferences.includes(element)) {
                (document.getElementById(element) as HTMLInputElement).checked = true;
            } else {
                (document.getElementById(element) as HTMLInputElement).checked = false;
            }
            showFormationMode();
        }
        categories.forEach((element) => setPreferences(element));
    });
}

// Get each unique categories from trickList array
export function getCategories(): string[] {
    const tab = [];

    function getNames(element): void {
        if (!tab.includes(element.name)) {
            tab.push(element.name);
        }
    }
    trickList.forEach((element) => getNames(element));

    return tab;
}

// Get each descriptions for each trick's name
export function getDescriptions(): string[] {
    const tab = [];

    function getDetails(element): void {
        if (!tab.includes(element.tab)) {
            tab.push(element.tab);
        }
    }
    trickList.forEach((element) => getDetails(element));

    return tab;
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
    categories.forEach((element) => displayElements(element));
}

// Loaded at page start
export function init(): void {
    restoreOptions();
    displayCategories();
}

categories = getCategories();
document.addEventListener('DOMContentLoaded', init);
document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('formation').addEventListener('change', showFormationMode);
