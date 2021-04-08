
import { uniqBy } from 'lodash';
import { trickList } from './data/trick-list';
import { MatchedTrick } from './entities/matchedTrick';

const trickAddedClass = 'trick-added';

setInterval(() => {
	const elements = document.querySelectorAll(`td.blob-code.blob-code-addition .blob-code-inner.blob-code-marker:not(.${trickAddedClass})`);
	for (const element of elements) {
		if (!(element instanceof HTMLElement)) {
			continue;
		}
		element.classList.add(trickAddedClass);
		let matchedTricks: MatchedTrick[] = [];
		trickList.forEach(trick => {
			const match = new RegExp(trick.pattern, 'gi').exec(element.innerText); 
			if (match) { 
				const captured = match.slice(1, match.length);
				matchedTricks.push({
					...trick,
					captured,
					element
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
				htmlTricks += `<span title="${trick.name}" style="color:${trick.color}">${trick.emoji}${trickCaptured}</span>`;
				if (index + 1 < matchTricksUnique.length) {
					htmlTricks += ' - '
				}
			});
			element.insertAdjacentHTML('beforeend',`<div style="display: inline-block;border-radius: 6px;font-size:15px; border: 1px solid black;background-color:#0366d6;padding: 1px 1px 1px 1px; vertical-align: middle;">${htmlTricks}</div>`);
		}
	}
}, 500)
