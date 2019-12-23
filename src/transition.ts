import StepDefinition from './step-definition';
import FlowDefinition from './flow-definition';
import FlowCondition from './flow-condition';
import { Requirements } from './transition-requirements';

export default interface Transition {
    readonly id: string;
    readonly flowDefinition: FlowDefinition;
    readonly origin: string;
    readonly destination: string;
    condition?: FlowCondition;
    requirements?: Array<Requirements>;
}

export function createTransition(
    flowDefinition: FlowDefinition,
    origin: string,
    destination: string,
    condition?: FlowCondition,
    requirements?: Array<Requirements>,
): Transition {
    return {
        id: `${origin.toString()}-${destination.toString()}`,
        flowDefinition,
        origin,
        destination,
        condition,
        requirements,
    };
}
