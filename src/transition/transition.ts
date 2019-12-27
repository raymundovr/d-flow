import TransitionCondition from './transition-condition';
import Requirements from './transition-requirements';

export default class Transition {
    private _id: string;
    private _origin: string;
    private _destination: string;
    private _condition?: TransitionCondition;
    private _requirements?: Requirements[];

    constructor(
        origin: string,
        destination: string,
        condition?: TransitionCondition,
        requirements?: Requirements[],
    ) {
        this._id = `${origin}-${destination}`;
        this._origin = origin;
        this._destination = destination;
        this._condition = condition;
        this._requirements = requirements;
    }

    get id() {
        return this._id;
    }

    get origin() {
        return this._origin;
    }

    get destination() {
        return this._destination;
    }

    get condition() {
        return this._condition;
    }

    public setCondition(value: TransitionCondition) {
        this._condition = value;
        return this;
    }

    get requirements() {
        return this._requirements;
    }

    public setRequirements(value: Requirements[]) {
        this._requirements = value;
        return this;
    }
}

export function createTransition(
    origin: string,
    destination: string,
    condition?: TransitionCondition,
    requirements?: Requirements[],
): Transition {
    return new Transition(origin, destination, condition, requirements);
}
