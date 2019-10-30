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
    setStartStep: Function;
}

function addStepToFlow(flow: FlowDefinition, step: StepDefinition) {
    flow.steps[step.id] = step;
    return flow;
}

function addTransitionToFlow(flow: FlowDefinition, transition: Transition) {
    let id = `${transition.origin.id}-${transition.destination.id}`;
    flow.transitions[id] = transition;
    return flow;
}

function createTransition(flowDefinition: FlowDefinition,
			  origin: StepDefinition,
			  destination: StepDefinition,
			  condition = null) : Transition {
    return {
	flowDefinition,
	origin,
	destination,
	condition
    };
}

function addStepInFlowAfter(flow: FlowDefinition,
			    step: StepDefinition) {
    return function(after: StepDefinition, condition = null) : FlowDefinition {	
	return addTransitionToFlow(
	    flow,
	    createTransition(flow, after, step, condition)
	);
    };
}

function addStepInFlowBefore(flow: FlowDefinition,
			     step: StepDefinition) {
    return function(before: StepDefinition, condition = null) : FlowDefinition {
	return addTransitionToFlow(
	    flow,
	    createTransition(flow, step, before, condition)
	);	
    };
}

function setFlowStartStep(flow: FlowDefinition,
			  step: StepDefinition) {
    flow = addStepToFlow(flow, step);
    flow.startStep = step;
    return flow;
}

function getStepByIdInFlowOrFail(flow: FlowDefinition, id: any) {
    let step = flow.steps[id];
    if (!step) {
	throw new Error(`Cannot find step with ID ${id}`);
    }
    return step;
}

export function createFlowDefinition(id: any, description: string): FlowDefinition {
    return {
	id,
	description,
	transitions: {},
	steps: {},
	startStep: null,
        addStep: function(step: StepDefinition) {
	    let flow = addStepToFlow(this, step);
	    return {
		afterStep: function (after: StepDefinition, condition = null) {
		    return addStepInFlowAfter(flow, step)(after, condition);
		},
		beforeStep: function (before: StepDefinition, condition = null) {
		    return addStepInFlowBefore(flow, step)(before, condition);
		},
		afterStepWithId: function(id: any, condition = null) {
		    let after = getStepByIdInFlowOrFail(flow, id);
		    return addStepInFlowAfter(flow, step)(after, condition);
		},
		beforeStepWithId: function(id: any, condition = null) {
		    let before = getStepByIdInFlowOrFail(flow, id);
		    return addStepInFlowBefore(flow, step)(before, condition);
		},
		done: function() {
		    return flow;
		}
	    };
	},
	setStartStep: function (step: StepDefinition) {
	    return setFlowStartStep(this, step);
	}
    };

}
