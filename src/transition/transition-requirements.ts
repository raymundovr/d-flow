import Flow from '../flow/flow';

export default abstract class Requirements {
    protected _identifiers: any[] = [];

    constructor(stepIdentifiers: any[]) {
        this._identifiers = stepIdentifiers;
    }

    public abstract isSatisfied(flow: Flow): boolean;
}