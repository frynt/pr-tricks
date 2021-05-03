import { TrickList } from './data/trick-list';
import { Trick } from './interfaces/trick.interface';
import { ChromeStorageType } from './types/chrome-storage.type';
import { IsArrayTricks } from './utils/is-tricks.utils';
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

    constructor() {
        document.addEventListener('DOMContentLoaded', () => TrickListOptions._init());
        document.getElementById('formation').addEventListener('change', () => TrickListOptions._showFormationMode());
    }

    /**
     * @description Loaded at page start
     */
    private static async _init(): Promise<void> {
        this._getCategories();
        await this._restoreOptions();
        this._displayCategories();

        document.getElementById('save').addEventListener('click', TrickListOptions._saveOptions);
        document.getElementById('subList').addEventListener('click', TrickListOptions._addTricksFromURL);
    }

    /**
     * @description Get each unique categories from trickList array
     */
    private static _getCategories(): void {
        TrickList.map((element: Trick) => {
            if (!this._categories.includes(element.name)) {
                this._categories.push(element.name);
            }
        });
    }

    /**
     * @description Saves options to chrome.storage
     */
    private static _saveOptions(): void {
        const color = (document.getElementById('color') as HTMLInputElement).value;
        const formationCheck = (document.getElementById('formation') as HTMLInputElement).checked;
        const detailsCheck = (document.getElementById('details') as HTMLInputElement).checked;

        this._categories.map((element: string) => {
            const checkbox = (document.getElementById(element) as HTMLInputElement);

            if (checkbox.checked) {
                this._trickPreferences.push(element);
            }
        });

        chrome.storage.sync.set({
            config: {
                favoriteColor: color,
            },
            formation: {
                detailIsActivated: detailsCheck,
                isActivated: formationCheck,
                tricksNameChecked: JSON.stringify(this._trickPreferences),
            },
        } as ChromeStorageType, () => {
            // Update status to let user know options were saved.
            const status = document.getElementById('status');
            status.textContent = 'Options saved.';

            setTimeout(() => {
                status.textContent = '';
            }, 2000);
        });

        this._restoreOptions();
    }

    /**
     * @description Restores select box and checkbox state using the preferences
     *              stored in chrome.storage.
     */
    private static _restoreOptions(): Promise<void> {
        return new Promise((resolve) => {
            chrome.storage.sync.get(
                async (items: ChromeStorageType) => {
                    (document.getElementById('color') as HTMLInputElement).value = items.config.favoriteColor;
                    document.body.style.backgroundColor = (document.getElementById('color') as HTMLInputElement).value;
                    (document.getElementById('formation') as HTMLInputElement).checked = items.formation.isActivated;
                    (document.getElementById('details') as HTMLInputElement).checked = items.formation.detailIsActivated;

                    const tricksNameChecked: string[] = JSON.parse(items.formation.tricksNameChecked);

                    this._categories.forEach((element: string) => {
                        if (tricksNameChecked.includes(element)) {
                            (document.getElementById(element) as HTMLInputElement).checked = true;
                        } else {
                            (document.getElementById(element) as HTMLInputElement).checked = false;
                        }

                        this._showFormationMode();
                    });
                    // Set trick from url
                    if (items.extTricks.tricksFromUrl !== undefined) {
                        const tricksFromURL: Trick[] = JSON.parse(items.extTricks.tricksFromUrl);

                        await this._fusionTricks({
                            isInitFromUrl: false,
                            newTricks: tricksFromURL,
                        });
                    }
                },
            );

            console.log('restore', this._categories);
            resolve();
        });
    }

    /**
     * @description Display label and checkbox foreach categories
     */
    private static _displayCategories(): void {
        console.log('display', this._categories);
        const section = (document.getElementById('categories') as HTMLInputElement);
        while (section.firstChild) {
            section.removeChild(section.firstChild);
        }

        this._categories.forEach((element: string) => {
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
    private static async _addTricksFromURL(): Promise<void> {
        const url = (document.getElementById('url') as HTMLInputElement).value;
        (document.getElementById('url') as HTMLInputElement).value = '';

        const newTricks = await getListFromHttp(url);
        await this._fusionTricks({
            newTricks,
            isInitFromUrl: true,
        });

        this._init();

        this._setDisplayExternalTricks(url);
    }

    /**
     * @description Set url in option page
     */
    private static _setDisplayExternalTricks(url: string): void {
        const section = (document.getElementById('activeLists') as HTMLInputElement);
        const li = document.createElement('li');
        li.innerHTML = url;
        section.appendChild(li);
    }

    /**
     * @description Mix/Add new Tricks from url | file
     */
    private static async _fusionTricks(params: {
        newTricks: Trick[];
        isInitFromUrl: boolean;
    }): Promise<void> {
        if (params.newTricks === null || !IsArrayTricks(params.newTricks)) {
            // eslint-disable-next-line no-alert
            alert('Attention votre listes de tricks est vide ou dans un format non supporté');
        } else {
            const extTricks = [];

            await Promise.all(
                params.newTricks.map(
                    (extTrick: Trick) => {
                        // If trick list from url is not in default trick list
                        if (!TrickList.includes(extTrick)) {
                            // Push in default trick list
                            TrickList.push(extTrick);
                            // Push in url tricks list for set in chrome storage
                            extTricks.push(extTrick);
                            // Add categories
                            this._categories.push(extTrick.name);
                        }
                    },
                ),
            );

            console.log('fusion', this._categories);

            if (params.isInitFromUrl) {
                chrome.storage.sync.set({
                    extTricks: {
                        tricksFromUrl: JSON.stringify(extTricks),
                    },
                } as ChromeStorageType);
            }
        }
    }
}
// eslint-disable-next-line no-new
new TrickListOptions();
