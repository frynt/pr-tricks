import { uniqBy } from 'lodash';
import { trickList } from './data/trick-list';
import { MatchedTrick } from './entities/matchedTrick';
import { Trick } from './entities/trick';

const trickAddedClass = 'trick-added';

setInterval(async () => {
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
            formationActivated: '',
            formationPreferences: [],
            formationDetails: '',
        }, (items) => {
            // userPreferences = items.formationPreferences;
            function userPreferences(trick): void {
                if (items.formationActivated) {
                    if (items.formationPreferences.includes(trick.name)) {
                        formationTrickList.push(trick);
                    }
                }

                else {
                    formationTrickList.push(trick);
                }
            }

            for (const trick of trickList) {
                userPreferences(trick);
            }

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
                element.insertAdjacentHTML('beforeend', `<div style="display: inline-block;border-radius: 6px;font-size:15px; border: 1px solid black;background-color:#0366d6;padding: 1px 1px 1px 1px; vertical-align: middle;">${htmlTricks}</div>`);
            }
        });
    }
}, 500);
