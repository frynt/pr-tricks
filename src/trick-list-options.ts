/* eslint-disable no-plusplus */
/* eslint-disable no-new */
/* eslint-disable no-alert */
import { TrickList } from './data/trick-list';
import { Trick } from './interfaces/trick.interface';
import { ChromeStorageType } from './types/chrome-storage.type';
import { ExternalTricks } from './types/external-tricks.type';
import { urlTricks } from './types/url-tricks.type';
import { getListFromHttp } from './utils/request.utils';

// Doc from https://developer.chrome.com/docs/extensions/mv3/options/

/**
 * @class
 * @name TrickListOptions
 * @description TrickListOptions class set trick list options
 */
export class TrickListOptions {
    private static _defaultTrickList: string[] = [];
    private static _defaultTrickNames: string[] = [];
    private static _extTrickNames: string[] = [];
    private static _urlList: urlTricks = { name: [], url: [] };
    private static _externalTricks: ExternalTricks = {};

    constructor() {
        document.addEventListener('DOMContentLoaded', () => TrickListOptions._init());
    }

    /**
     * @description Loaded at page start
     */
    private static _init(): void {
        TrickListOptions._setCategories();
        TrickListOptions._restoreExternalTricks();
        TrickListOptions._displayCategories();
        TrickListOptions._restoreOptions();

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
            if (!TrickListOptions._defaultTrickList.includes(element.name)) {
                TrickListOptions._defaultTrickList.push(element.name);
            }
        });
    }

    /**
     * @description Saves options to chrome.storage
     */
    private static async _saveOptions(): Promise<void> {
        const color = (document.getElementById('color') as HTMLInputElement).value;
        const formationCheck = (document.getElementById('formation') as HTMLInputElement).checked;
        const detailsCheck = (document.getElementById('details') as HTMLInputElement).checked;

        TrickListOptions._defaultTrickList.map((element: string) => {
            const elementSection = `Default TrickList_${element}`;
            const checkbox1 = (document.getElementById(elementSection) as HTMLInputElement);

            if (checkbox1.checked) {
                TrickListOptions._defaultTrickNames.push(elementSection);
            }
        });

        if (TrickListOptions._externalTricks !== undefined) {
            await Promise.all(
                Object.keys(TrickListOptions._externalTricks).map((project: string): void => {
                    Object.keys(TrickListOptions._externalTricks[project]).forEach((name: string): void => {
                        const trick = (TrickListOptions._externalTricks)[project][name].name;

                        const trickID = `${project}_${trick}`;
                        const checkbox2 = (document.getElementById(trickID) as HTMLInputElement);
                        if (checkbox2.checked) {
                            TrickListOptions._extTrickNames.push(trickID);
                        }
                    });
                }),
            );
        }

        const items = {
            config: {
                favoriteColor: color,
            },
            formation: {
                detailIsActivated: detailsCheck,
                isActivated: formationCheck,
                tricksNameChecked: JSON.stringify(TrickListOptions._defaultTrickNames),
            },
            extTricks: {
                tricksFromUrl: JSON.stringify(TrickListOptions._externalTricks),
                tricksNameChecked: JSON.stringify(TrickListOptions._extTrickNames),
                urlList: JSON.stringify(TrickListOptions._urlList),
            } };

        chrome.storage.sync.set(items as ChromeStorageType, () => {
            // Update status to let user know options were saved.
            const status = document.getElementById('status');
            status.textContent = 'Options saved.';

            setTimeout(() => {
                status.textContent = '';
            }, 2000);
        });
    }

    /**
     * @description Restores select box and checkbox state using the preferences
     *              stored in chrome.storage.
     */
    private static _restoreOptions(): void {
        // Get api preferences from chrome storage and restore user options
        chrome.storage.sync.get(
            async (items: ChromeStorageType) => {
                (document.getElementById('color') as HTMLInputElement).value = items.config.favoriteColor;
                document.body.style.backgroundColor = (document.getElementById('color') as HTMLInputElement).value;
                (document.getElementById('formation') as HTMLInputElement).checked = items.formation.isActivated;
                (document.getElementById('details') as HTMLInputElement).checked = items.formation.detailIsActivated;

                // Set default tricks from api storage
                if (items.formation.tricksNameChecked.length !== 0) {
                    const tricksNameChecked: string[] = JSON.parse(items.formation.tricksNameChecked);

                    TrickListOptions._defaultTrickList.forEach((element: string) => {
                        const elementSection = `Default TrickList_${element}`;
                        if (tricksNameChecked.includes(elementSection)) {
                            (document.getElementById(elementSection) as HTMLInputElement).checked = true;
                        } else {
                            (document.getElementById(elementSection) as HTMLInputElement).checked = false;
                        }
                    });
                }

                // Set external tricks from api storage
                if (items.extTricks.tricksNameChecked !== undefined) {
                    if (items.extTricks.tricksNameChecked.length !== 0) {
                        const tricksNameChecked: string[] = JSON.parse(items.extTricks.tricksNameChecked);

                        tricksNameChecked.forEach((element: string) => {
                            (document.getElementById(element) as HTMLInputElement).checked = true;
                        });
                        TrickListOptions._extTrickNames = tricksNameChecked;
                    }
                }

                TrickListOptions._showFormationMode();
            },
        );
    }

    private static _restoreExternalTricks(): void {
        chrome.storage.sync.get(async (items: ChromeStorageType) => {
            // Set trick from url
            if (items.extTricks !== undefined && items.extTricks.tricksFromUrl !== undefined) {
                const externalTricks: ExternalTricks = JSON.parse(items.extTricks.tricksFromUrl);

                await Promise.all(
                    Object.keys(externalTricks).map(async (name: string) => {
                        if (!document.getElementById(name)) {
                            await TrickListOptions._fusionTricks(externalTricks[name], name);
                        }
                    }),
                );
            }

            // Set url's list from api storage
            if (items.extTricks !== undefined && items.extTricks.urlList !== undefined) {
                TrickListOptions._urlList = JSON.parse(items.extTricks.urlList);

                for (let i = 0; i < TrickListOptions._urlList.name.length; i++) {
                    const name = TrickListOptions._urlList.name[i];
                    const url = TrickListOptions._urlList.url[i];

                    if (!document.getElementById(`${name}_${url}`)) {
                        TrickListOptions._addNewTrickInDomList(name, url);
                    }
                }
            }
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

        const defaultSection = document.createElement('section');
        const defaultTitle = document.createElement('h3');
        defaultTitle.innerText = 'Default TrickList';

        defaultSection.appendChild(defaultTitle);
        section.appendChild(defaultSection);

        TrickListOptions._defaultTrickList.forEach((element) => {
            TrickListOptions._addCategories(element, defaultSection);
        });

        if (TrickListOptions._externalTricks !== undefined) {
            Object.keys(TrickListOptions._externalTricks).map((name: string) => {
                const project = name;
                const tricks = TrickListOptions._externalTricks[name];

                section.childNodes.forEach((element) => {
                    if (element.textContent === project) {
                        window.alert('La trickList a déjà été ajouté');
                    } else {
                        TrickListOptions._displayExtCategories(project, tricks);
                    }
                });
            });
        }
    }

    /**
     * @description Display external categories from other tricks
     */
    private static _displayExtCategories(project: string, tricks: Trick[]): void {
        const categories = (document.getElementById('categories') as HTMLElement);
        const newSection = document.createElement('section');
        const h3 = document.createElement('h3');
        newSection.id = project;
        h3.innerText = project;
        h3.id = project;
        categories.appendChild(newSection);
        newSection.appendChild(h3);
        newSection.style.paddingLeft = '10%';

        tricks.forEach((element) => {
            TrickListOptions._addCategories(element.name, newSection);
        });
    }

    /**
     * @description Add HTML input and label foreach valide trick categories
     */
    private static _addCategories(element: string, section: HTMLElement): void {
        const input = document.createElement('input');
        const label = document.createElement('label');

        label.innerHTML = element;
        input.setAttribute('type', 'checkbox');
        input.id = `${section.firstChild.textContent}_${element}`;
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
            section.style.display = 'flex';
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
        TrickListOptions._saveOptions();
        TrickListOptions._restoreOptions();

        if (!TrickListOptions._urlList.url.includes(urlElement.value)) {
            TrickListOptions._urlList.url.push(urlElement.value);
        }
        if (!TrickListOptions._urlList.name.includes(nameElement.value)) {
            TrickListOptions._urlList.name.push(nameElement.value);
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
            const elementURL = (document.getElementById(`${name}_${url}`)) as HTMLElement;
            if (!elementURL) {
                TrickListOptions._addNewTrickInDomList(name, url);
            } else {
                alert("L'url a déjà été ajoutée ");
            }
        } else {
            TrickListOptions._addNewTrickInDomList(name, url);
        }
    }

    /**
     * @description Add url on HTML options pagec
     */
    private static _addNewTrickInDomList(name: string, url: string): void {
        const activeList = (document.getElementById('activeLists') as HTMLElement);
        const sectionID = (document.getElementById(name) as HTMLElement).id;

        const input = document.createElement('input');
        const label = document.createElement('label');

        label.innerHTML = name;
        label.id = `${name}_${url}`;
        input.setAttribute('type', 'checkbox');
        input.id = `${name}-${url}`;
        activeList.appendChild(input);
        activeList.appendChild(label);

        TrickListOptions._urlList.name.push(name);
        TrickListOptions._urlList.url.push(url);
        TrickListOptions._removeURL(name, url, sectionID);
    }

    /**
     * @description Add a remove button for each url added
     */
    private static _removeURL(name: string, url: string, sectionID: string): void {
        const section = (document.getElementById('activeLists') as HTMLElement);
        const input = (document.getElementById(`${name}_${url}`) as HTMLElement);
        const label = (document.getElementById(`${name}-${url}`) as HTMLElement);
        const btn = (document.createElement('input'));

        btn.setAttribute('type', 'button');
        btn.value = 'X';
        btn.addEventListener('click', () => {
            TrickListOptions._urlList.name.splice(TrickListOptions._urlList.name.indexOf(name));
            TrickListOptions._urlList.url.splice(TrickListOptions._urlList.url.indexOf(url));
            TrickListOptions._removeTrickList(sectionID);

            input.parentNode.removeChild(input);
            label.parentNode.removeChild(label);
            btn.parentNode.removeChild(btn);
        });

        section.appendChild(btn);
        section.appendChild(document.createElement('br'));
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
                    }
                },
            ),
        );

        TrickListOptions._externalTricks[name] = extTricks;

        await TrickListOptions._displayCategories();
    }

    /**
     * @description Clear all list of tricks and options preferences
     */
    private static _resetTricks(): void {
        chrome.storage.sync.clear();

        TrickListOptions._defaultTrickNames = [];
        TrickListOptions._extTrickNames = [];
        TrickListOptions._urlList = { name: [], url: [] };
        TrickListOptions._externalTricks = {};

        while (TrickList.length > 8) {
            TrickList.pop();
        }

        const defaultColor = '#B9C1DF';

        chrome.storage.sync.set({
            config: {
                favoriteColor: defaultColor,
            },
            formation: {
                isActivated: false,
                tricksNameChecked: JSON.stringify(TrickListOptions._defaultTrickNames),
                detailIsActivated: false,
            },
            extTricks: {
                tricksFromUrl: JSON.stringify(TrickListOptions._externalTricks),
                tricksNameChecked: JSON.stringify(TrickListOptions._extTrickNames),
                urlList: JSON.stringify(TrickListOptions._urlList),
            },
        } as ChromeStorageType);

        TrickListOptions._init();
    }

    private static _removeTrickList(section: string): void {
        TrickListOptions._externalTricks[section].forEach((trick) => {
            const project = `${section}_${trick.name}`;
            if (TrickListOptions._extTrickNames.includes(project)) {
                TrickListOptions._extTrickNames.splice(TrickListOptions._extTrickNames.indexOf(project), 1);
            }
        });

        delete TrickListOptions._externalTricks[section];

        (document.getElementById(section) as HTMLElement).parentNode.removeChild(document.getElementById(section));

        TrickListOptions._saveOptions();
    }
}

new TrickListOptions();
