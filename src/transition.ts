import { StepDefinition } from "./step-definition";
import { FlowDefinition } from "./flow-definition";
import { FlowCondition } from "./flow-condition";

export interface Transition {
    readonly id: any;
    readonly flowDefinition: FlowDefinition;
    readonly origin: StepDefinition;
    readonly destination: StepDefinition;
    condition: FlowCondition | null;
}
