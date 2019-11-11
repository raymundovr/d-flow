import StepDefinition from "./step-definition";
import FlowDefinition from "./flow-definition";
import FlowCondition from "./flow-condition";

export interface Transition {
    readonly id: any;
    readonly flowDefinition: FlowDefinition;
    readonly origin: StepDefinition;
    readonly destination: StepDefinition;
    condition?: FlowCondition;
}

export function createTransition(flowDefinition: FlowDefinition,
    origin: StepDefinition,
    destination: StepDefinition,
    condition?: FlowCondition): Transition {
    return {
        id: `${origin.id}-${destination.id}`,
        flowDefinition,
        origin,
        destination,
        condition
    };
}
