/* eslint-disable no-loop-func */
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
    private static _externalTricks: ExternalTricks = {};
    private static _urlList: urlTricks = { name: [], url: [], isActivated: [] };

    constructor() {
        document.addEventListener('DOMContentLoaded', () => TrickListOptions._init());
    }

    /**
     * @description Loaded at page start
     */
    private static _init(): void {
        TrickListOptions._firstInit();
        TrickListOptions._setCategories();
        TrickListOptions._displayCategories();
        TrickListOptions._restoreExternalTricks();
        TrickListOptions._restoreOptions();

        document.getElementById('formation').addEventListener('change', () => {
            TrickListOptions._showFormationMode();
            TrickListOptions._saveOptions();
        });
        document.getElementById('color').addEventListener('input', async () => {
            await TrickListOptions._saveOptions();
            TrickListOptions._restoreOptions();
        });
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

        TrickListOptions._defaultTrickList.forEach((element: string) => {
            const elementSection = `Default TrickList_${element}`;
            const checkbox1 = (document.getElementById(elementSection) as HTMLInputElement);

            if (checkbox1.checked) {
                TrickListOptions._defaultTrickNames.push(elementSection);
            }
        });

        if (TrickListOptions._externalTricks !== undefined) {
            await Promise.all(
                Object.keys(TrickListOptions._externalTricks).map(async (project: string): Promise<void> => {
                    await Promise.all(
                        Object.keys(TrickListOptions._externalTricks[project]).map((name: string): void => {
                            const trick = (TrickListOptions._externalTricks)[project][name].name;
                            const trickID = `${project}_${trick}`;
                            const checkbox2 = (document.getElementById(trickID) as HTMLInputElement);
                            if (checkbox2.checked) {
                                if (!TrickListOptions._extTrickNames.includes(trickID)) {
                                    TrickListOptions._extTrickNames.push(trickID);
                                }
                            }
                        }),
                    );
                }),
            );
        }

        if (TrickListOptions._urlList !== undefined) {
            await Promise.all(
                TrickListOptions._urlList.url.map((url: string) => {
                    const checkState = (document.getElementById(url) as HTMLInputElement).checked;
                    const index = TrickListOptions._urlList.url.indexOf(url);
                    TrickListOptions._urlList.isActivated[index] = checkState;
                }),
            );
        }

        const items = {
            config: {
                favoriteColor: color,
            },
            formation: {
                isActivated: formationCheck,
                tricksNameChecked: JSON.stringify(TrickListOptions._defaultTrickNames),
            },
            extTricks: {
                tricksFromUrl: JSON.stringify(TrickListOptions._externalTricks),
                tricksNameChecked: JSON.stringify(TrickListOptions._extTrickNames),
                urlList: JSON.stringify(TrickListOptions._urlList),
            } };

        chrome.storage.sync.set(items as ChromeStorageType);
    }

    /**
     * @description Restores select box and checkbox state using the preferences
     *              stored in chrome.storage.
     */
    private static _restoreOptions(): void {
        // Get api preferences from chrome storage and restore user options
        chrome.storage.sync.get(
            async (items: ChromeStorageType) => {
                if (items.config) {
                    document.body.style.backgroundColor = items.config.favoriteColor;
                    (document.getElementById('color') as HTMLInputElement).value = items.config.favoriteColor;
                }
                if (items.formation) {
                    (document.getElementById('formation') as HTMLInputElement).checked = items.formation.isActivated;
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
                }

                // Set external tricks from api storage
                if (items.extTricks && items.extTricks.tricksNameChecked !== undefined && items.extTricks.tricksNameChecked.length !== 0) {
                    const tricksNameChecked: string[] = JSON.parse(items.extTricks.tricksNameChecked);

                    tricksNameChecked.forEach((element: string) => {
                        (document.getElementById(element) as HTMLInputElement).checked = true;
                    });
                }

                TrickListOptions._showFormationMode();
            },
        );
    }

    /**
     * @description Restore options for imported urls and trickList
     */
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

                TrickListOptions._urlList.name.forEach((_elem, i) => {
                    const name = TrickListOptions._urlList.name[i];
                    const url = TrickListOptions._urlList.url[i];
                    const isActivated = TrickListOptions._urlList.isActivated[i];

                    if (!document.getElementById(url)) {
                        TrickListOptions._addNewTrickInDomList(name, url, isActivated);
                        TrickListOptions._showProjectSection(name, url);
                    } else {
                        window.alert('L\'url a déjà été ajouté');
                    }
                });
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
        input.addEventListener('change', () => TrickListOptions._saveOptions());
        section.appendChild(input);
        section.appendChild(label);
        section.appendChild(document.createElement('br'));
    }

    /**
     * @description Show default categories section if the formation mode is activated
     */
    private static _showFormationMode(): void {
        const section = (document.getElementById('categories') as HTMLElement);
        const activated = (document.getElementById('formation') as HTMLInputElement);

        if (activated.checked) {
            section.style.display = 'flex';
        } else {
            section.style.display = 'none';
        }
    }

    /**
     * @description Show specific section if the project is activated or not
     */
    private static _showProjectSection(name: string, url: string): void {
        const section = (document.getElementById(name) as HTMLElement);
        const index = TrickListOptions._urlList.url.indexOf(url);
        const projectIsActivated = TrickListOptions._urlList.isActivated[index];

        if (projectIsActivated) {
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

        if (!document.getElementById(urlElement.value)) {
            if (!document.getElementById(nameElement.value)) {
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
            } else {
                window.alert('Le nom choisit a déjà été utilisé');
            }
        } else {
            window.alert('La trickList a déjà été ajouté');
        }

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
                TrickListOptions._addNewTrickInDomList(name, url, true);
            } else {
                alert('La trickList a dékà été importé !');
            }
        } else {
            TrickListOptions._addNewTrickInDomList(name, url, true);
        }
    }

    /**
     * @description Add url on HTML options pagec
     */
    private static _addNewTrickInDomList(name: string, url: string, isActivated: boolean): void {
        const activeList = (document.getElementById('activeLists') as HTMLElement);
        const sectionID = (document.getElementById(name) as HTMLElement).id;

        const input = document.createElement('input');
        const label = document.createElement('label');

        label.innerHTML = name;
        label.id = `${name}_${url}`;
        input.setAttribute('type', 'checkbox');
        input.id = url;
        input.checked = isActivated;
        input.addEventListener('change', async () => {
            await TrickListOptions._saveOptions();
            TrickListOptions._showProjectSection(name, url);
        });
        activeList.appendChild(input);
        activeList.appendChild(label);

        TrickListOptions._removeURL({ name, url, sectionID, isActivated });
    }

    /**
     * @description Add a remove button for each url added
     */
    private static _removeURL(params: {
            name: string;
            url: string;
            sectionID: string;
            isActivated: boolean;
        }): void {
        const section = (document.getElementById('activeLists') as HTMLElement);
        const input = (document.getElementById(params.url) as HTMLElement);
        const label = (document.getElementById(`${params.name}_${params.url}`) as HTMLElement);
        const btn = (document.createElement('input'));

        btn.setAttribute('type', 'button');
        btn.value = 'X';
        btn.addEventListener('click', () => {
            TrickListOptions._urlList.name.splice(TrickListOptions._urlList.name.indexOf(params.name), 1);
            TrickListOptions._urlList.url.splice(TrickListOptions._urlList.url.indexOf(params.url), 1);
            TrickListOptions._urlList.isActivated.splice(TrickListOptions._urlList.isActivated.indexOf(params.isActivated), 1);

            TrickListOptions._removeTrickList(params.sectionID);

            input.remove();
            label.remove();
            btn.remove();
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

        await TrickListOptions._displayExtCategories(name, extTricks);
    }

    /**
     * @description Clear all list of tricks and options preferences
     */
    private static _resetTricks(): void {
        chrome.storage.sync.clear();

        TrickListOptions._defaultTrickNames = [];
        TrickListOptions._extTrickNames = [];
        TrickListOptions._urlList = { name: [], url: [], isActivated: [] };
        TrickListOptions._externalTricks = {};

        TrickList.length = 8;

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

    /**
     * @description On click button, delete import project and all related data
     */
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

    /**
     * @description Initialize chrome api for the first launch of the extension
     */
    private static _firstInit(): void {
        chrome.storage.sync.get((items: ChromeStorageType) => {
            if (Object.keys(items).length === 0) {
                TrickListOptions._resetTricks();
            }
        });
    }
}

new TrickListOptions();
