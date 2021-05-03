import { Trick } from '../interfaces/trick.interface';

/**
 * @description Test if params is trick
 */
export function IsTrick(trick: unknown): boolean {
    return (trick as Trick).details !== undefined
        && (trick as Trick).color !== undefined
        && (trick as Trick).emoji !== undefined
        && (trick as Trick).name !== undefined
        && (trick as Trick).pattern !== undefined;
}

/**
 * @description Test if params is trick[]
 */
export function IsArrayTricks(tricks: unknown[]): boolean {
    let valToReturn = false;

    tricks.forEach((trick: unknown) => {
        valToReturn = (trick as Trick).details !== undefined
            && (trick as Trick).color !== undefined
            && (trick as Trick).emoji !== undefined
            && (trick as Trick).name !== undefined
            && (trick as Trick).pattern !== undefined;
    });

    return valToReturn;
}
