import Requirements from './transition-requirements';
import Flow from "../flow/flow";

export default class AllRequirements extends Requirements {
    public isSatisfied(flow: Flow): boolean {
        const visitedIds = flow.visitedStepDefinitionsId;
        return this._identifiers.every((id: any) => visitedIds.includes(id));
    }
}

export function requiresAll(stepIdentifiers: any[]): AllRequirements {
    return new AllRequirements(stepIdentifiers);
}