/* eslint-disable no-continue */
/* eslint-disable no-new */

import { uniqBy } from 'lodash';
import { TrickList } from './data/trick-list';
import { MatchedTrick } from './interfaces/matched-trick.interface';
import { Trick } from './interfaces/trick.interface';
import { ChromeStorageType } from './types/chrome-storage.type';
import { ExternalTricks } from './types/external-tricks.type';
import { urlTricks } from './types/url-tricks.type';

const trickAddedClass = 'trick-added';

export class GithubReviewScripts {
    constructor() {
        this._initTrickOnWindowsLoad();
        this._listenScrollEvent();
    }

    private _initTrickOnWindowsLoad(): void {
        window.addEventListener('load', async () => {
            await this._loopOverDOMElements();
        });
    }

    /**
     * @description Listen scroll event for set trick list in DOM
     */
    private _listenScrollEvent(): void {
        window.addEventListener('scroll', async () => {
            await this._loopOverDOMElements();
        });
    }

    /**
     * @description loop over DOM elements, add the class on the elements and ended by set TrickList
     */
    private async _loopOverDOMElements(): Promise<void> {
        // FOR GITHUB
        const elementsGithub = document.querySelectorAll(`td.blob-code.blob-code-addition .blob-code-inner.blob-code-marker:not(.${trickAddedClass})`);
        // FOR BITBUCKET
        const elementsBitbucket = document.querySelectorAll(`.type-add .code-diff:not(.${trickAddedClass})`);
        // FOR GITLAB
        const elementsGitlab = document.querySelectorAll(`.line_content.new .line:not(.${trickAddedClass})`);

        const elements = [];
        elementsGithub.forEach((element) => {
            elements.push(element);
        });
        elementsBitbucket.forEach((element) => {
            elements.push(element);
        });
        elementsGitlab.forEach((element) => {
            elements.push(element);
        });
        for await (const element of elements) {
            if (!(element instanceof HTMLElement)) {
                continue;
            }
            element.classList.add(trickAddedClass);
            this._setTrickListInDOM(element);
        }
    }

    /**
     * @description Get chrome API infos, set formation preferences and math witch trick patern on git's page
     */
    private _setTrickListInDOM(
        element: HTMLElement,
    ): void {
        const matchedTricks: MatchedTrick[] = [];
        const trickList: Trick[] = [];
        chrome.storage.sync.get(async (items: ChromeStorageType) => {
            await this._setExternalTrickList(items, trickList);
            await this._setFormationTrickList(items, trickList);
            trickList.forEach((trick) => {
                const match = new RegExp(trick.pattern, 'gi').exec(element.innerText);
                if (match) {
                    const captured = match.slice(1, match.length);
                    matchedTricks.push({
                        ...trick,
                        captured,
                        element,
                    });
                }
            });

            this._setTricksHighlight(matchedTricks, items, element);
        });
    }

    /**
     * @description Set external trick list if exist
     */
    private _setExternalTrickList(items: ChromeStorageType, trickList: Trick[]): void {
        if (items.extTricks !== undefined) {
            const externalTrickList: ExternalTricks = JSON.parse(items.extTricks.tricksFromUrl);
            const urlList: urlTricks = JSON.parse(items.extTricks.urlList);

            for (const key in externalTrickList) {
                if (externalTrickList.hasOwnProperty(key)) {
                    const values = externalTrickList[key];
                    const index = urlList.name.indexOf(key);
                    const projectIsActivated = urlList.isActivated[index];
                    const tab: Trick[] = values;
                    tab.forEach((trick) => {
                        if (projectIsActivated) {
                            if (items.extTricks.tricksNameChecked.includes(trick.name)) {
                                trickList.push(trick);
                            }
                        }
                    });
                }
            }
        }
    }

    /**
     * @description Set formation trick list if is activated
     */
    private async _setFormationTrickList(items: ChromeStorageType, trickList: Trick[]): Promise<void> {
        if (items.formation !== undefined) {
            await Promise.all(
                TrickList.map((trick) => {
                    if (items.formation.tricksNameChecked.includes(trick.name)) {
                        trickList.push(trick);
                    }
                }),
            );
        }
    }

    /**
     * @description Set HTML design foreach matchedTricks
     */
    private _setTricksHighlight(
        matchedTricks: MatchedTrick[],
        items: ChromeStorageType,
        element: HTMLElement,
    ): void {
        if (matchedTricks.length > 0) {
            const matchTricksUnique = uniqBy(matchedTricks, 'name');
            let htmlTricks = '';

            matchTricksUnique.forEach((trick, index) => {
                let trickCaptured = trick.captured.join('');

                if (trickCaptured.length > 0) {
                    trickCaptured = ` ${trickCaptured}`;
                }

                htmlTricks += `<span title="${trick.details}" style="color:${trick.color}">${trick.emoji}${trickCaptured}</span>`;

                if (index + 1 < matchTricksUnique.length) {
                    htmlTricks += ' - ';
                }
            });

            const backColor = items.config.favoriteColor;
            element.insertAdjacentHTML('beforeend', `<div style="display: inline-block;border-radius: 6px;font-size:15px; border: 1px solid black;background-color:${backColor};padding: 1px 1px 1px 1px; vertical-align: middle;">${htmlTricks}</div>`);
        }
    }
}

new GithubReviewScripts();
