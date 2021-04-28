import { Trick } from './trick.interface';

export interface MatchedTrick extends Trick {
    captured: string[];
    element: HTMLElement;
}
