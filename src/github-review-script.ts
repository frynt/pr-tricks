import { uniqBy } from 'lodash';
import { TrickList } from './data/trick-list';
import { MatchedTrick } from './interfaces/matched-trick.interface';
import { Trick } from './interfaces/trick.interface';

const trickAddedClass = 'trick-added';

export class GithubReviewScripts {
    constructor() {
        this._listenScrollEvent();
    }

    private _listenScrollEvent(): void {
        window.addEventListener('scroll', async () => {
            const elements = document.querySelectorAll(`td.blob-code.blob-code-addition .blob-code-inner.blob-code-marker:not(.${trickAddedClass})`);
            for await (const element of elements) {
                if (!(element instanceof HTMLElement)) {
                    // eslint-disable-next-line no-continue
                    continue;
                }
                element.classList.add(trickAddedClass);
                const matchedTricks: MatchedTrick[] = [];

                // Filter for formationMode from options
                const formationTrickList: Trick[] = [];
                chrome.storage.sync.get({
                    favoriteColor: '',
                    formationActivated: '',
                    formationPreferences: [],
                    formationDetails: '',
                }, (items) => {
                    TrickList.map((trick) => {
                        if (items.formationActivated) {
                            if (items.formationPreferences.includes(trick.name)) {
                                formationTrickList.push(trick);
                            }
                        } else {
                            formationTrickList.push(trick);
                        }
                    });

                    // formationTrickList n'est pas bien lu par le systeme de match de tricks par rapport a trickList qui fonctionne bien
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

                    if (matchedTricks.length > 0) {
                        const matchTricksUnique = uniqBy(matchedTricks, 'name');
                        let htmlTricks = '';
                        matchTricksUnique.forEach((trick, index) => {
                            let trickCaptured = trick.captured.join('');
                            if (trickCaptured.length > 0) {
                                trickCaptured = ` ${trickCaptured}`;
                            }
                            let trickDetails = '';
                            if (items.formationDetails) {
                                trickDetails = trick.details;
                            }
                            htmlTricks += `<span title="${trickDetails}" style="color:${trick.color}">${trick.emoji}${trickCaptured}</span>`;
                            if (index + 1 < matchTricksUnique.length) {
                                htmlTricks += ' - ';
                            }
                        });
                        const backColor = items.favoriteColor;
                        element.insertAdjacentHTML('beforeend', `<div style="display: inline-block;border-radius: 6px;font-size:15px; border: 1px solid black;background-color:${backColor};padding: 1px 1px 1px 1px; vertical-align: middle;">${htmlTricks}</div>`);
                    }
                });
            }
        });
    }
}

// eslint-disable-next-line no-new
new GithubReviewScripts();
