import { TrickList } from './data/trick-list';
import { Trick } from './interfaces/trick.interface';
import { getListFromHttp } from './utils/request.utils';

// Doc from https://developer.chrome.com/docs/extensions/mv3/options/

/**
 * @class
 * @name TrickListOptions
 * @description This class set trick list options
 */
export class TrickListOptions {
    private static _categories: string[] = [];
    private static _trickPreferences: string[] = [];
    private static _extTricks: Trick[] = [];

    constructor() {
        document.addEventListener('DOMContentLoaded', () => TrickListOptions._init());
        document.getElementById('formation').addEventListener('change', () => TrickListOptions._showFormationMode());
    }

    /**
     * @description Get each unique categories from trickList array
     */
    private static _getCategories(): void {
        TrickList.map((element: Trick) => {
            if (!TrickListOptions._categories.includes(element.name)) {
                TrickListOptions._categories.push(element.name);
            }
        });
    }

    /**
     * @description Loaded at page start
     */
    private static _init(): void {
        TrickListOptions._getCategories();
        TrickListOptions._displayCategories();
        TrickListOptions._restoreOptions();
        document.getElementById('save').addEventListener('click', TrickListOptions._saveOptions);
        document.getElementById('subList').addEventListener('click', TrickListOptions._addHtppTricks);
    }

    /**
     * @description Saves options to chrome.storage
     */
    private static _saveOptions(): void {
        const color = (document.getElementById('color') as HTMLInputElement).value;
        const formationCheck = (document.getElementById('formation') as HTMLInputElement).checked;
        const detailsCheck = (document.getElementById('details') as HTMLInputElement).checked;

        TrickListOptions._categories.map((element: string) => {
            const checkbox = (document.getElementById(element) as HTMLInputElement);

            if (checkbox.checked) {
                TrickListOptions._trickPreferences.push(element);
            }
        });

        chrome.storage.sync.set({
            favoriteColor: color,
            formationActivated: formationCheck,
            formationPreferences: JSON.stringify(TrickListOptions._trickPreferences),
            formationDetails: detailsCheck,
        }, () => {
            // Update status to let user know options were saved.
            const status = document.getElementById('status');
            status.textContent = 'Options saved.';

            setTimeout(() => {
                status.textContent = '';
            }, 2000);
        });

        TrickListOptions._restoreOptions();
    }

    /**
     * @description Restores select box and checkbox state using the preferences
     *              stored in chrome.storage.
     */
    private static _restoreOptions(): void {
        chrome.storage.sync.get({
            favoriteColor: '',
            formationActivated: '',
            formationPreferences: [],
            formationDetails: '',
        }, (items: Record<string, any>) => {
            (document.getElementById('color') as HTMLInputElement).value = items.favoriteColor;
            document.body.style.backgroundColor = (document.getElementById('color') as HTMLInputElement).value;
            (document.getElementById('formation') as HTMLInputElement).checked = items.formationActivated;
            (document.getElementById('details') as HTMLInputElement).checked = items.formationDetails;

            TrickListOptions._categories.map((element: string) => {
                if (items.formationPreferences.includes(element)) {
                    (document.getElementById(element) as HTMLInputElement).checked = true;
                } else {
                    (document.getElementById(element) as HTMLInputElement).checked = false;
                }
                TrickListOptions._showFormationMode();
            });
        });
    }

    /**
     * @description Display label and checkbox foreach categories
     */
    private static _displayCategories(): void {
        const section = (document.getElementById('categories') as HTMLInputElement);
        while (section.firstChild) {
            section.removeChild(section.firstChild);
        }

        TrickListOptions._categories.map((element: string) => {
            const input = document.createElement('input');
            const label = document.createElement('label');

            label.innerHTML = element;
            input.setAttribute('type', 'checkbox');
            input.id = element;

            section.appendChild(input);
            section.appendChild(label);
            section.appendChild(document.createElement('br'));
        });
    }

    /**
     * @description Show categories section if the formation mode is activated
     */
    private static _showFormationMode(): void {
        const section = (document.getElementById('categories') as HTMLInputElement);
        const activated = (document.getElementById('formation') as HTMLInputElement);

        if (activated.checked) {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    }

    /**
     * @description Get new trickList from XMLHtppRequest (see request.utils)
     */
    private static async _addHtppTricks(): Promise<void> {
        const url = (document.getElementById('url') as HTMLInputElement).value;
        (document.getElementById('url') as HTMLInputElement).value = '';

        TrickListOptions._extTricks = await getListFromHttp(url);
        TrickListOptions._fusionTricks();

        const section = (document.getElementById('activeLists') as HTMLInputElement);
        const li = document.createElement('li');
        li.innerHTML = url;
        section.appendChild(li);
    }

    /**
     * @description Mix/Add new Tricks from url api
     */
    private static _fusionTricks(): void {
        if (TrickListOptions._extTricks === null) {
            // eslint-disable-next-line no-alert
            alert('_fusionTricks error: _extTricks is null');
        } else {
            TrickListOptions._extTricks.map((element) => {
                if (!TrickList.includes(element)) {
                    TrickList.push(element);
                }
            });

            TrickList.map((elem) => {
                if (!TrickListOptions._categories.includes(elem.name)) {
                    TrickListOptions._categories.push(elem.name);
                }
            });
            TrickListOptions._init();
        }
    }
}
// eslint-disable-next-line no-new
new TrickListOptions();
