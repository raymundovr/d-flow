import { StepDefinition } from "./step-definition";
import { Transition, createTransition } from "./transition";
import { FlowCondition } from "./flow-condition";

export interface FlowDefinition {
    readonly id: any;
    description: string;
    transitions: Array<Transition>;
    steps: Array<StepDefinition>;
    startStep: StepDefinition | null;
    getStep: Function;
    addStep: Function;
    setStartStep: Function;
    getTransition: Function;
    getTransitionsFrom: Function;
    getTransitionsTo: Function;
    createTransition: Function;
}

/* Transitions */
export function getTransitionInFlowByStepIds(flow: FlowDefinition, originId: any, destinationId: any): Transition | null {
    return flow.transitions.find(
        (t: Transition) => t.origin.id === originId && t.destination.id === destinationId) || null;
}

export function getTransitionsInFlowFromStepById(flow: FlowDefinition, id: any): Array<Transition> | [] {
    return flow.transitions.filter(
        (t: Transition) => t.origin.id === id
    );
}

export function getTransitionsInFlowToStepById(flow: FlowDefinition, id: any): Array<Transition> | [] {
    return flow.transitions.filter(
        (t: Transition) => t.destination.id === id
    );
}

export function addTransitionToFlow(flow: FlowDefinition, transition: Transition) {
    flow.transitions.push(transition);
    return flow;
}

export function removeTransitionInFlowById(flow: FlowDefinition, id: any) {
    flow.transitions = flow.transitions.filter((t: Transition) => t.id !== id);
    return flow;
}

/* Steps */
export function addStepToFlow(flow: FlowDefinition, step: StepDefinition) {
    flow.steps.push(step);
    return flow;
}

export function addStepInFlowAfter(flow: FlowDefinition,
    step: StepDefinition,
    after: StepDefinition,
    condition?: FlowCondition): FlowDefinition {
    return addTransitionToFlow(
        flow,
        createTransition(flow, after, step, condition)
    );
}

export function addStepInFlowBefore(flow: FlowDefinition,
    step: StepDefinition,
    before: StepDefinition,
    condition?: FlowCondition): FlowDefinition {
    return addTransitionToFlow(
        flow,
        createTransition(flow, step, before, condition)
    );
}

export function addStepInFlowBetween(flow: FlowDefinition,
    step: StepDefinition,
    before: StepDefinition,
    after: StepDefinition,
    beforeCondition?: FlowCondition,
    afterCondition?: FlowCondition): FlowDefinition {
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

export function getFlowStepById(flow: FlowDefinition, stepId: any): StepDefinition | null {
    return flow.steps.find((s: StepDefinition) => s.id === stepId) || null;
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
        getStep: function(id: any) {
            return getFlowStepById(this, id);
        },
        addStep: function(step: StepDefinition) {
            let flow = addStepToFlow(this, step);
            return {
                afterStep: function(after: StepDefinition, condition?: FlowCondition) {
                    return addStepInFlowAfter(flow, step, after, condition);
                },
                beforeStep: function(before: StepDefinition, condition?: FlowCondition) {
                    return addStepInFlowBefore(flow, step, before, condition);
                },
                betweenSteps: function(before: StepDefinition, after: StepDefinition,
                    beforeCondition?: FlowCondition, afterCondition?: FlowCondition) {
                    return addStepInFlowBetween(flow, step, before, after,
                        beforeCondition, afterCondition);
                },
                afterStepWithId: function(id: any, condition?: FlowCondition) {
                    let after = getStepByIdInFlowOrFail(flow, id);
                    return addStepInFlowAfter(flow, step, after, condition);
                },
                beforeStepWithId: function(id: any, condition?: FlowCondition) {
                    let before = getStepByIdInFlowOrFail(flow, id);
                    return addStepInFlowBefore(flow, step, before, condition);
                },
                betweenStepsWithId(idBefore: any, idAfter: any,
                    beforeCondition?: FlowCondition, afterCondition?: FlowCondition) {
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
        setStartStep: function(step: StepDefinition) {
            return setFlowStartStep(this, step);
        },
        getTransition: function(originId: any, destinationId: any) {
            return getTransitionInFlowByStepIds(this, originId, destinationId);
        },
        getTransitionsFrom: function(id: any) {
            return getTransitionsInFlowFromStepById(this, id);
        },
        getTransitionsTo: function(id: any) {
            return getTransitionsInFlowToStepById(this, id);
        },
        createTransition: function(originId: any, destinationId: any, condition?: FlowCondition) {
            let origin = getStepByIdInFlowOrFail(this, originId);
            let destination = getStepByIdInFlowOrFail(this, destinationId);
            return addTransitionToFlow(
                this,
                createTransition(this, origin, destination, condition)
            );
        }
    };

}
