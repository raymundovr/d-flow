import Requirements from './transition-requirements';
import Flow from '../flow/flow';

export default class AnyRequirements extends Requirements {
    public isSatisfied(flow: Flow): boolean {
        const visitedIds = flow.visitedStepDefinitionsId;
        return this._identifiers.some((id: any) => visitedIds.includes(id));
    }
}

export function requiresAny(stepIdentifiers: any[]): AnyRequirements {
    return new AnyRequirements(stepIdentifiers);
}
