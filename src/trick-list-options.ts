import { TrickList } from './data/trick-list';
import { Trick } from './interfaces/trick.interface';
import { ChromeStorageType } from './types/chrome-storage.type';
import { IsArrayTricks } from './utils/is-tricks.utils';
import { getListFromHttp } from './utils/request.utils';

// Doc from https://developer.chrome.com/docs/extensions/mv3/options/

/**
 * @class
 * @name TrickListOptions
 * @description TrickListOptions class set trick list options
 */
export class TrickListOptions {
    private static _categories: string[] = [];
    private static _trickPreferences: string[] = [];
    private static _urlList: string[] = [];
    private static _tricksFromUrl: Trick[] = [];

    constructor() {
        document.addEventListener('DOMContentLoaded', () => TrickListOptions._init());
        document.getElementById('formation').addEventListener('change', () => TrickListOptions._showFormationMode());
    }

    /**
     * @description Loaded at page start
     */
    private static async _init(): Promise<void> {
        TrickListOptions._setCategories();
        TrickListOptions._restoreOptions();
        TrickListOptions._displayCategories();

        document.getElementById('save').addEventListener('click', TrickListOptions._saveOptions);
        document.getElementById('url-submit').addEventListener('click', TrickListOptions._addTricksFromURL);
        document.getElementById('reset-storage').addEventListener('click', TrickListOptions._resetTricks);
    }

    /**
     * @description Get each unique categories from trickList array
     */
    private static _setCategories(): void {
        TrickList.map((element: Trick) => {
            if (!TrickListOptions._categories.includes(element.name)) {
                TrickListOptions._categories.push(element.name);
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

        TrickListOptions._categories.map((element: string) => {
            const checkbox = (document.getElementById(element) as HTMLInputElement);

            if (checkbox.checked) {
                TrickListOptions._trickPreferences.push(element);
            }
        });

        chrome.storage.sync.set({
            config: {
                favoriteColor: color,
            },
            formation: {
                detailIsActivated: detailsCheck,
                isActivated: formationCheck,
                tricksNameChecked: JSON.stringify(TrickListOptions._trickPreferences),
            },
            extTricks: {
                tricksFromUrl: JSON.stringify(TrickListOptions._tricksFromUrl),
                urlList: JSON.stringify(TrickListOptions._urlList),
            },
        } as ChromeStorageType, () => {
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
        chrome.storage.sync.get(
            async (items: ChromeStorageType) => {
                (document.getElementById('color') as HTMLInputElement).value = items.config.favoriteColor;
                document.body.style.backgroundColor = (document.getElementById('color') as HTMLInputElement).value;
                (document.getElementById('formation') as HTMLInputElement).checked = items.formation.isActivated;
                (document.getElementById('details') as HTMLInputElement).checked = items.formation.detailIsActivated;

                // Set url's list from api storage
                if (items.extTricks !== undefined && items.extTricks.urlList !== undefined) {
                    TrickListOptions._urlList = JSON.parse(items.extTricks.urlList);

                    TrickListOptions._urlList.forEach((url) => {
                        if (!document.getElementById(url)) {
                            TrickListOptions._addURL(url);
                        }
                    });
                }

                // Set trick from url
                if (items.extTricks !== undefined && items.extTricks.tricksFromUrl !== undefined) {
                    const tricksFromURL: Trick[] = JSON.parse(items.extTricks.tricksFromUrl);

                    await TrickListOptions._fusionTricks(tricksFromURL);
                }

                // Set categories from api storage
                const tricksNameChecked: string[] = JSON.parse(items.formation.tricksNameChecked);

                TrickListOptions._categories.forEach((element: string) => {
                    if (tricksNameChecked.includes(element)) {
                        (document.getElementById(element) as HTMLInputElement).checked = true;
                    } else {
                        (document.getElementById(element) as HTMLInputElement).checked = false;
                    }

                    TrickListOptions._showFormationMode();
                });
            },
        );
    }

    /**
     * @description Display label and checkbox foreach categories
     */
    private static _displayCategories(): void {
        const section = (document.getElementById('categories') as HTMLInputElement);
        while (section.firstChild) {
            section.removeChild(section.firstChild);
        }
        TrickListOptions._categories.forEach((element) => {
            TrickListOptions._addCategories(element);
        });
    }

    private static _addCategories(element: string): void {
        const section = (document.getElementById('categories') as HTMLInputElement);
        const input = document.createElement('input');
        const label = document.createElement('label');

        label.innerHTML = element;
        input.setAttribute('type', 'checkbox');
        input.id = element;

        section.appendChild(input);
        section.appendChild(label);
        section.appendChild(document.createElement('br'));
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
        await TrickListOptions._fusionTricks(newTricks);

        if (!TrickListOptions._urlList.includes(url)) {
            TrickListOptions._urlList.push(url);
        }

        TrickListOptions._setDisplayExternalList(url);
    }

    /**
     * @description Set url in option page
     */
    private static _setDisplayExternalList(url: string): void {
        const section = (document.getElementById('activeLists') as HTMLElement);

        if (section.firstChild) {
            const elementURL = (document.getElementById(url)) as HTMLElement;
            if (!elementURL) {
                TrickListOptions._saveURLtoStorage();
                TrickListOptions._addURL(url);
            } else {
                // eslint-disable-next-line no-alert
                alert("L'url a déjà été ajoutée ");
            }
        } else {
            TrickListOptions._saveURLtoStorage();
            TrickListOptions._addURL(url);
        }
    }

    /**
     * @description Add url on HTML options page
     */
    private static _addURL(url: string): void {
        const section = (document.getElementById('activeLists') as HTMLElement);
        const li = document.createElement('li');
        li.innerHTML = url;
        li.id = url;
        section.appendChild(li);
        TrickListOptions._removeURL(url);
    }

    /**
     * @description Update _urlList with new url in chrome storage
     */
    private static _saveURLtoStorage(): void {
        chrome.storage.sync.set({
            extTricks: {
                urlList: JSON.stringify(TrickListOptions._urlList),
            },
        } as ChromeStorageType);
    }

    /**
     * @description Add a remove button for each url added
     */
    private static _removeURL(url: string): void {
        const li = (document.getElementById(url) as HTMLElement);

        const btn = document.createElement('input');
        btn.setAttribute('type', 'button');
        btn.value = 'X';
        btn.addEventListener('click', () => {
            const indexToRemove = TrickListOptions._urlList.indexOf(url);
            TrickListOptions._urlList.splice(indexToRemove);
            TrickListOptions._saveURLtoStorage();

            li.parentNode.removeChild(li);
            btn.parentNode.removeChild(btn);
        });

        li.appendChild(btn);
    }

    /**
     * @description Add new Tricks from url | file to categories
     */
    private static async _fusionTricks(newTricks: Trick[]): Promise<void> {
        if (newTricks === null || !IsArrayTricks(newTricks)) {
            // eslint-disable-next-line no-alert
            alert('Attention votre liste de tricks est vide ou dans un format non supporté');
        } else {
            const extTricks: Trick[] = [];

            await Promise.all(
                newTricks.map(
                    (extTrick: Trick) => {
                        // If trick list from url is not in default trick list
                        if (!TrickList.includes(extTrick)) {
                            // Push in default trick list
                            TrickList.push(extTrick);
                            // Push in url tricks list for set in chrome storage
                            extTricks.push(extTrick);
                            // Add categories
                            if (!TrickListOptions._categories.includes(extTrick.name)) {
                                TrickListOptions._categories.push(extTrick.name);
                            }
                        }
                    },
                ),
            );

            TrickListOptions._tricksFromUrl = extTricks;
            TrickListOptions._displayCategories();
        }
    }

    /**
     * @description Clear all list of tricks and options preferences
     */
    private static _resetTricks(): void {
        TrickListOptions._categories = [];
        TrickListOptions._trickPreferences = [];
        TrickListOptions._urlList = [];

        TrickList.forEach(() => {
            TrickList.pop();
        });

        chrome.storage.sync.clear();
        TrickListOptions._restoreOptions();
    }
}
// eslint-disable-next-line no-new
new TrickListOptions();
