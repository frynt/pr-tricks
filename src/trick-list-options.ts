/* eslint-disable no-new */
/* eslint-disable no-alert */
import { TrickList } from './data/trick-list';
import { Trick } from './interfaces/trick.interface';
import { ChromeStorageType } from './types/chrome-storage.type';
import { ExternalTricks } from './types/external-tricks.type';
import { getListFromHttp } from './utils/request.utils';

// Doc from https://developer.chrome.com/docs/extensions/mv3/options/

/**
 * @class
 * @name TrickListOptions
 * @description TrickListOptions class set trick list options
 */
export class TrickListOptions {
    private static _defaultTrickNames: string[] = [];
    private static _trickPreferences: string[] = [];
    private static _urlList: string[] = [];
    private static _urlNames: string[] = [];
    private static _externalTricks: ExternalTricks = {};

    constructor() {
        document.addEventListener('DOMContentLoaded', () => TrickListOptions._init());
    }

    /**
     * @description Loaded at page start
     */
    private static _init(): void {
        TrickListOptions._setCategories();
        TrickListOptions._restoreOptions();
        TrickListOptions._displayCategories();

        document.getElementById('formation').addEventListener('change', () => TrickListOptions._showFormationMode());
        document.getElementById('save').addEventListener('click', TrickListOptions._saveOptions);
        document.getElementById('url-submit').addEventListener('click', TrickListOptions._addTricksFromURL);
        document.getElementById('reset-storage').addEventListener('click', TrickListOptions._resetTricks);
    }

    /**
     * @description Get each unique categories from trickList array
     */
    private static _setCategories(): void {
        TrickList.map((element: Trick) => {
            if (!TrickListOptions._defaultTrickNames.includes(element.name)) {
                TrickListOptions._defaultTrickNames.push(element.name);
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

        TrickListOptions._defaultTrickNames.map((element: string) => {
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
                tricksFromUrl: JSON.stringify(TrickListOptions._externalTricks),
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
                if (items.extTricks !== undefined && items.extTricks.urlList !== undefined && items.extTricks.urlNames !== undefined) {
                    TrickListOptions._urlList = JSON.parse(items.extTricks.urlList);
                    TrickListOptions._urlNames = JSON.parse(items.extTricks.urlNames);

                    TrickListOptions._urlNames.forEach((name) => {
                        if (!document.getElementById(name)) {
                            const url = TrickListOptions._urlList[name];
                            TrickListOptions._addNewTrickInDomList(name, url);
                        }
                    });
                }

                // Set trick from url
                if (items.extTricks !== undefined && items.extTricks.tricksFromUrl !== undefined) {
                    const externalTricks: ExternalTricks = JSON.parse(items.extTricks.tricksFromUrl);

                    await Promise.all(
                        Object.keys(externalTricks).map(async (name: string) => {
                            await TrickListOptions._fusionTricks(externalTricks[name], name);
                        }),
                    );
                }

                // Set categories from api storage
                if (items.formation.tricksNameChecked.length !== 0) {
                    const tricksNameChecked: string[] = JSON.parse(items.formation.tricksNameChecked);

                    TrickListOptions._defaultTrickNames.forEach((element: string) => {
                        if (tricksNameChecked.includes(element)) {
                            (document.getElementById(element) as HTMLInputElement).checked = true;
                        } else {
                            (document.getElementById(element) as HTMLInputElement).checked = false;
                        }

                        TrickListOptions._showFormationMode();
                    });
                }
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

        const defaultSection = document.createElement('section');
        const defaultTitle = document.createElement('h3');
        defaultTitle.innerText = 'Default TrickList';
        defaultSection.appendChild(defaultTitle);
        section.appendChild(defaultSection);

        TrickListOptions._defaultTrickNames.forEach((element) => {
            TrickListOptions._addCategories(element, defaultSection);
        });

        TrickListOptions._displayExtCategories();
    }

    /**
     * @description Display external categories from other tricks
     */
    private static _displayExtCategories(): void {
    }

    /**
     * @description Add HTML input and label foreach valide trick categories
     */
    private static _addCategories(element: string, section: HTMLElement): void {
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
        const urlElement = (document.getElementById('url') as HTMLInputElement);
        const nameElement = (document.getElementById('name-url') as HTMLInputElement);

        const newTricks = await getListFromHttp(urlElement.value);
        await TrickListOptions._fusionTricks(newTricks, nameElement.value);

        if (!TrickListOptions._urlList.includes(urlElement.value)) {
            TrickListOptions._urlList.push(urlElement.value);
        }
        if (!TrickListOptions._urlNames.includes(urlElement.value)) {
            TrickListOptions._urlNames.push(nameElement.value);
        }

        TrickListOptions._setDisplayExternalList(nameElement.value, urlElement.value);

        urlElement.value = null;
        nameElement.value = null;
    }

    /**
     * @description Set url in option page
     */
    private static _setDisplayExternalList(name: string, url: string): void {
        const section = (document.getElementById('activeLists') as HTMLElement);

        if (section.firstChild) {
            const elementURL = (document.getElementById(name)) as HTMLElement;
            if (!elementURL) {
                TrickListOptions._saveURLtoStorage();
                TrickListOptions._addNewTrickInDomList(name, url);
            } else {
                alert("L'url a déjà été ajoutée ");
            }
        } else {
            TrickListOptions._saveURLtoStorage();
            TrickListOptions._addNewTrickInDomList(name, url);
        }
    }

    /**
     * @description Add url on HTML options page
     */
    private static _addNewTrickInDomList(name: string, url: string): void {
        const section = (document.getElementById('activeLists') as HTMLElement);
        const li = document.createElement('li');
        li.innerHTML = name;
        li.id = name;
        section.appendChild(li);
        TrickListOptions._urlList.push(url);
        TrickListOptions._removeURL(name, url);
    }

    /**
     * @description Update _urlList with new url in chrome storage
     */
    private static _saveURLtoStorage(): void {
        chrome.storage.sync.set({
            extTricks: {
                urlList: JSON.stringify(TrickListOptions._urlList),
                urlNames: JSON.stringify(TrickListOptions._urlNames),
            },
        } as ChromeStorageType);
    }

    /**
     * @description Add a remove button for each url added
     */
    private static _removeURL(name: string, url: string): void {
        const li = (document.getElementById(name) as HTMLElement);

        const btn = document.createElement('input');
        btn.setAttribute('type', 'button');
        btn.value = 'X';
        btn.addEventListener('click', () => {
            const nameIndex = TrickListOptions._urlNames.indexOf(name);
            const urlIndex = TrickListOptions._urlList.indexOf(url);
            TrickListOptions._urlNames.splice(nameIndex);
            TrickListOptions._urlList.splice(urlIndex);
            TrickListOptions._saveURLtoStorage();

            li.parentNode.removeChild(li);
            btn.parentNode.removeChild(btn);
        });

        li.appendChild(btn);
    }

    /**
     * @description Add new Tricks from url | file to categories
     */
    private static async _fusionTricks(newTricks: Trick[], name: string): Promise<void> {
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
                        if (!TrickListOptions._defaultTrickNames.includes(extTrick.name)) {
                            TrickListOptions._defaultTrickNames.push(extTrick.name);
                        }
                    }
                },
            ),
        );

        TrickListOptions._externalTricks[name] = extTricks;

        TrickListOptions._displayCategories();
    }

    /**
     * @description Clear all list of tricks and options preferences
     */
    private static _resetTricks(): void {
        chrome.storage.sync.clear();

        TrickListOptions._trickPreferences = [];
        TrickListOptions._urlList = [];
        TrickListOptions._externalTricks = {};

        TrickList.forEach(() => {
            TrickList.pop();
        });

        const defaultColor = '#FF0000';

        chrome.storage.sync.set({
            config: {
                favoriteColor: defaultColor,
            },
            formation: {
                isActivated: false,
                tricksNameChecked: JSON.stringify(TrickListOptions._trickPreferences),
                detailIsActivated: false,
            },
            extTricks: {
                tricksFromUrl: JSON.stringify(TrickListOptions._externalTricks),
                urlList: JSON.stringify(TrickListOptions._urlList),
            },
        } as ChromeStorageType);

        TrickListOptions._init();
    }
}

new TrickListOptions();
