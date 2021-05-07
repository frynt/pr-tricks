import { uniqBy } from 'lodash';
import { TrickList } from './data/trick-list';
import { MatchedTrick } from './interfaces/matched-trick.interface';
import { Trick } from './interfaces/trick.interface';
import { ChromeStorageType } from './types/chrome-storage.type';

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
        const elements = document.querySelectorAll(`td.blob-code.blob-code-addition .blob-code-inner.blob-code-marker:not(.${trickAddedClass})`);

        for await (const element of elements) {
            if (!(element instanceof HTMLElement)) {
                // eslint-disable-next-line no-continue
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
        const formationTrickList: Trick[] = [];

        chrome.storage.sync.get((items: ChromeStorageType) => {
            TrickList.forEach((trick) => {
                if (items.formation.isActivated && items.formation.tricksNameChecked.includes(trick.name)) {
                    formationTrickList.push(trick);
                } else {
                    formationTrickList.push(trick);
                }
            });
            console.log(formationTrickList);

            formationTrickList.forEach((trick) => {
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
     * @description Set HTML design foreach matchedTricks
     */
    private _setTricksHighlight(
        matchedTricks: MatchedTrick[],
        items: Record < string, any >,
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

                let trickDetails = '';

                if (items.formation.detailIsActivated) {
                    trickDetails = trick.details;
                }

                htmlTricks += `<span title="${trickDetails}" style="color:${trick.color}">${trick.emoji}${trickCaptured}</span>`;

                if (index + 1 < matchTricksUnique.length) {
                    htmlTricks += ' - ';
                }
            });

            const backColor = items.config.favoriteColor;

            element.insertAdjacentHTML('beforeend', `<div style="display: inline-block;border-radius: 6px;font-size:15px; border: 1px solid black;background-color:${backColor};padding: 1px 1px 1px 1px; vertical-align: middle;">${htmlTricks}</div>`);
        }
    }
}

// eslint-disable-next-line no-new
new GithubReviewScripts();
