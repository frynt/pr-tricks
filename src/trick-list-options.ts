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
    private static _extTricks: Record<string, any>[] = [];

    constructor() {
        TrickListOptions._categories = TrickListOptions._getCategories();
        TrickListOptions._extTricks = TrickListOptions._addHtppTricks();

        document.addEventListener('DOMContentLoaded', () => TrickListOptions._init());
        document.getElementById('formation').addEventListener('change', () => TrickListOptions._showFormationMode());
    }

    /**
     * @description Get each unique categories from trickList array
     */
    private static _getCategories(): string[] {
        const tab: string[] = [];

        TrickList.map((element: Trick) => {
            if (!tab.includes(element.name)) {
                tab.push(element.name);
            }
        });

        return tab;
    }

    /**
     * @description Loaded at page start
     */
    private static _init(): void {
        TrickListOptions._restoreOptions();
        TrickListOptions._displayCategories();
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

        TrickListOptions._categories.map((element: string) => {
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

    private static _fusionTricks(): void {
        TrickListOptions._extTricks.map((element) => {
            if (!TrickListOptions._categories.includes(element.name)) {
                TrickListOptions._categories.push(element.name);
            }
        });
    }

    private static _addHtppTricks(): Record<string, any>[] {
        const tab = [];
        const url = (document.getElementById('url') as HTMLInputElement).value;

        if (url === null) {
            console.log('url is empty');
        } else {
            getListFromHttp(url).then((res: Record<string, any>) => {
                tab.push(res);
            })
                .catch((err) => {
                    console.log('error', err);
                });
        }
        return tab;
    }
}

// eslint-disable-next-line no-new
new TrickListOptions();
