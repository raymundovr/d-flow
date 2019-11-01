import { StepDefinition } from "./step-definition";
import { Transition } from "./transition";
import { FlowCondition } from "./flow-condition";

export interface FlowDefinition {
    readonly id: any;
    description: string;
    transitions: Array<Transition>;
    steps: Array<StepDefinition>;
    startStep: StepDefinition | null;
    addStep: Function;
    setStartStep: Function;
}

export function addStepToFlow(flow: FlowDefinition, step: StepDefinition) {
    flow.steps.push(step);
    return flow;
}

export function addTransitionToFlow(flow: FlowDefinition, transition: Transition) {    
    flow.transitions.push(transition);
    return flow;
}

export function createTransition(flowDefinition: FlowDefinition,
			  origin: StepDefinition,
			  destination: StepDefinition,
			  condition = null) : Transition {
    return {
	id: `${origin.id}-${destination.id}`,
	flowDefinition,
	origin,
	destination,
	condition
    };
}

export function addStepInFlowAfter(flow: FlowDefinition,
				   step: StepDefinition,
				   after: StepDefinition,
				   condition = null) : FlowDefinition {
    return addTransitionToFlow(
	flow,
	createTransition(flow, after, step, condition)
    );
}

export function addStepInFlowBefore(flow: FlowDefinition,
				    step: StepDefinition,
				    before: StepDefinition,
				    condition = null) : FlowDefinition {
    return addTransitionToFlow(
	flow,
	createTransition(flow, step, before, condition)
    );
}

export function removeTransitionInFlowById(flow: FlowDefinition, id: any) {
    flow.transitions = flow.transitions.filter((t: Transition) => t.id !== id);
    return flow;
}

export function addStepInFlowBetween(flow: FlowDefinition,
				     step: StepDefinition,
				     before: StepDefinition,
				     after: StepDefinition,
				     beforeCondition = null,
				     afterCondition = null) : FlowDefinition {
    let currentTransition = flow.transitions.find(
	(t: Transition) => t.origin.id === before.id && t.destination.id === after.id
    );

    if (currentTransition) {
	flow = removeTransitionInFlowById(flow, currentTransition.id);
    }

    flow = addTransitionToFlow(
	flow,
	createTransition(flow, before, step, beforeCondition)
    );

    flow = addTransitionToFlow(
	flow,
	createTransition(flow, step, after, afterCondition)
    );
    return flow;
}

export function setFlowStartStep(flow: FlowDefinition,
			  step: StepDefinition) {
    flow = addStepToFlow(flow, step);
    flow.startStep = step;
    return flow;
}

export function getStepByIdInFlowOrFail(flow: FlowDefinition, id: any) {
    let step = flow.steps.find((step: StepDefinition) => step.id === id);
    if (!step) {
	throw new Error(`Cannot find step with ID ${id}`);
    }
    return step;
}

export function createFlowDefinition(id: any, description: string): FlowDefinition {
    return {
	id,
	description,
	transitions: [],
	steps: [],
	startStep: null,
        addStep: function(step: StepDefinition) {
	    let flow = addStepToFlow(this, step);
	    return {
		afterStep: function (after: StepDefinition, condition = null) {
		    return addStepInFlowAfter(flow, step,after, condition);
		},
		beforeStep: function (before: StepDefinition, condition = null) {
		    return addStepInFlowBefore(flow, step, before, condition);
		},
		betweenSteps: function(before: StepDefinition, after: StepDefinition,
				       beforeCondition = null, afterCondition = null) {
		    return addStepInFlowBetween(flow, step, before, after,
						beforeCondition, afterCondition);
		},
		afterStepWithId: function(id: any, condition = null) {
		    let after = getStepByIdInFlowOrFail(flow, id);
		    return addStepInFlowAfter(flow, step, after, condition);
		},
		beforeStepWithId: function(id: any, condition = null) {
		    let before = getStepByIdInFlowOrFail(flow, id);
		    return addStepInFlowBefore(flow, step, before, condition);
		},
		betweenStepsWithId(idBefore: any, idAfter: any,
				   beforeCondition = null, afterCondition = null) {
		    let before = getStepByIdInFlowOrFail(flow, idBefore);
		    let after = getStepByIdInFlowOrFail(flow, idAfter);
		    return addStepInFlowBetween(flow, step, before, after,
						beforeCondition, afterCondition);
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
