import Flow from '../flow';

export abstract class Requirements {
    protected _identifiers: Array<any> = [];

    constructor(stepIdentifiers: Array<any>) {
        this._identifiers = stepIdentifiers;
    }

    abstract isSatisfied(flow: Flow): boolean;
}

export class All extends Requirements {
    isSatisfied(flow: Flow): boolean {
        let visitedIds = flow.visitedStepDefinitionsId;
        return this._identifiers.every((id: any) => visitedIds.includes(id));
    }
}

export class Any extends Requirements {
    isSatisfied(flow: Flow): boolean {
        let visitedIds = flow.visitedStepDefinitionsId;
        return this._identifiers.some((id: any) => visitedIds.includes(id));
    }
}

export function requiresAll(stepIdentifiers: Array<any>): All {
    return new All(stepIdentifiers);
}

export function requiresAny(stepIdentifiers: Array<any>): Any {
    return new Any(stepIdentifiers);
}
