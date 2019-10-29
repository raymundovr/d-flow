import { StepDefinition } from "./step-definition";
import { Transition } from "./transition";
import { FlowCondition } from "./flow-condition";

export interface FlowDefinition {
    readonly id: any;
    description: string;
    transitions: { [key: string]: Transition };
    steps: { [key: string] : StepDefinition };
    startStep: StepDefinition | null;
    addStep: Function;
}

function createTransition(flowDefinition: FlowDefinition,
			  origin: StepDefinition,
			  destination: StepDefinition,
			  condition = null): Transition {
    return {
	flowDefinition,
	origin,
	destination,
	condition
    };
}

function addStepInFlowAfter(flow: FlowDefinition,
			    step: StepDefinition) {
    return function(after: StepDefinition, condition = null) : Transition {
	return createTransition(flow, after, step, condition);
    };
}

function addStepInFlowBefore(flow: FlowDefinition,
			     step: StepDefinition) {
    return function(before: StepDefinition, condition = null) : Transition {
	return createTransition(flow, step, before, condition);	
    };
}


export function createFlowDefinition(id: any, description: string): FlowDefinition {
    return {
	id,
	description,
	transitions: {},
	steps: {},
	startStep: null,
        addStep: function(step: StepDefinition) {
	    return {
		after: addStepInFlowAfter(this, step),
		before: addStepInFlowBefore(this, step)
	    }
	}
    };

}
