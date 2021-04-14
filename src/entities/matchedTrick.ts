import { Trick } from './trick';

export class MatchedTrick extends Trick {
    captured: string[];
    element: HTMLElement;
}
