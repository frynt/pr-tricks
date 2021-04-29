import { TrickList } from './data/trick-list';
import { getListFromHttp } from './utils/request.utils';

// Doc from https://developer.chrome.com/docs/extensions/mv3/options/

let categories: string[] = [];
const trickPreferences = [];
// const api = 'https://mocki.io/v1/f2cc018a-2692-4c00-9314-a947d38ae3ee';
let extTricks = [];

// Show categories section if the formation mode is activated
export function showFormationMode(): void {
    const section = (document.getElementById('categories') as HTMLInputElement);
    const activated = (document.getElementById('formation') as HTMLInputElement);

    if (activated.checked) {
        section.style.display = 'block';
    } else {
        section.style.display = 'none';
    }
}

export function showAddListSection(): void {
    const section = (document.getElementById('trickList') as HTMLInputElement);
    const activated = (document.getElementById('addList') as HTMLInputElement);

    if (activated.checked) {
        section.style.display = 'block';
    } else {
        section.style.display = 'none';
    }
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
export function restoreOptions(): void {
    chrome.storage.sync.get({
        favoriteColor: '',
        formationActivated: '',
        formationPreferences: [],
        formationDetails: '',
        addListlActivated: '',
    }, (items) => {
        (document.getElementById('color') as HTMLInputElement).value = items.favoriteColor;
        document.body.style.backgroundColor = (document.getElementById('color') as HTMLInputElement).value;
        (document.getElementById('formation') as HTMLInputElement).checked = items.formationActivated;
        (document.getElementById('details') as HTMLInputElement).checked = items.formationDetails;
        (document.getElementById('addList') as HTMLInputElement).checked = items.addListlActivated;

        categories.map((element) => {
            if (items.formationPreferences.includes(element)) {
                (document.getElementById(element) as HTMLInputElement).checked = true;
            } else {
                (document.getElementById(element) as HTMLInputElement).checked = false;
            }
            showFormationMode();
            showAddListSection();
        });
    });
}

// Saves options to chrome.storage
export function saveOptions(): void {
    const color = (document.getElementById('color') as HTMLInputElement).value;
    const formationCheck = (document.getElementById('formation') as HTMLInputElement).checked;
    const detailsCheck = (document.getElementById('details') as HTMLInputElement).checked;
    const addList = (document.getElementById('addList') as HTMLInputElement).checked;

    categories.map((element) => {
        const checkbox = (document.getElementById(element) as HTMLInputElement);
        if (checkbox.checked) {
            trickPreferences.push(element);
        }
    });

    chrome.storage.sync.set({
        favoriteColor: color,
        formationActivated: formationCheck,
        formationPreferences: JSON.stringify(trickPreferences),
        formationDetails: detailsCheck,
        addListlActivated: addList,
    }, () => {
        // Update status to let user know options were saved.
        const status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(() => {
            status.textContent = '';
        }, 2000);
    });
    restoreOptions();
}

// Get each unique categories from trickList array
export function getCategories(): string[] {
    const tab = [];
    TrickList.map((element) => {
        if (!tab.includes(element.name)) {
            tab.push(element.name);
        }
    });
    return tab;
}

// Get each descriptions for each trick's name
export function getDescriptions(): string[] {
    const tab = [];
    TrickList.map((element) => {
        if (!tab.includes(element.details)) {
            tab.push(element.details);
        }
    });
    return tab;
}

// Display label and checkbox foreach categories
export function displayCategories(): void {
    const section = (document.getElementById('categories') as HTMLInputElement);
    categories.map((element) => {
        const label = document.createElement('label');
        const input = document.createElement('input');
        label.innerHTML = element;
        input.setAttribute('type', 'checkbox');
        input.id = element;
        section.appendChild(label);
        section.appendChild(input);
        section.appendChild(document.createElement('br'));
    });
}

export function fusionTricks(): void {
    extTricks.map((element) => {
        if (!categories.includes(element.name)) {
            categories.push(element.name);
        }
    });
}

export function addHtppTricks(): string[] {
    const tab = [];
    const url = (document.getElementById('url') as HTMLInputElement).value;

    if (url === null) {
        console.log('url is empty');
    } else {
        getListFromHttp(url).then((res) => {
            tab.push(res);
        })
            .catch((err) => {
                console.log('error', err);
            });
    }
    return tab;
}

// Loaded at page start
export function init(): void {
    restoreOptions();
    displayCategories();
    document.getElementById('save').addEventListener('click', saveOptions);
    document.getElementById('subList').addEventListener('click', addHtppTricks);
}

categories = getCategories();
extTricks = addHtppTricks();
document.addEventListener('DOMContentLoaded', init);
document.getElementById('formation').addEventListener('change', showFormationMode);
document.getElementById('addList').addEventListener('change', showAddListSection);
