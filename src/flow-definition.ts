import StepDefinition from "./step-definition";
import Transition, { createTransition } from "./transition";
import FlowCondition from "./flow-condition";
import { Requirements } from "./transition-requirements";

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

/* Steps */
export function addStepInFlowAfter(flow: FlowDefinition,
    step: StepDefinition,
    after: StepDefinition,
    condition?: FlowCondition): FlowDefinition {
    return flow.addTransition(createTransition(flow, after, step, condition));
}

export function addStepInFlowBefore(flow: FlowDefinition,
    step: StepDefinition,
    before: StepDefinition,
    condition?: FlowCondition): FlowDefinition {
    return flow.addTransition(createTransition(flow, step, before, condition));
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
        flow.removeTransitionById(currentTransition.id);
    }

    flow.addTransition(createTransition(flow, before, step, beforeCondition));

    flow.addTransition(createTransition(flow, step, after, afterCondition));
    return flow;
}

export function getFlowStepById(flow: FlowDefinition, stepId: any): StepDefinition | null {
    return flow.steps.find((s: StepDefinition) => s.id === stepId) || null;
}

export function getStepByIdInFlowOrFail(flow: FlowDefinition, id: any) {
    let step = flow.getStep(id);
    if (!step) {
        throw new Error(`Cannot find step with ID ${id}`);
    }
    return step;
}

interface AddStepInterface {
    afterStep: Function;
    beforeStep: Function;
    betweenSteps: Function;
    afterStepWithId: Function;
    beforeStepWithId: Function;
    betweenStepsWithId: Function;
    done: Function;
}

export default class FlowDefinition {
    private _id: any;
    public description: string;
    private _transitions: Transition[] = [];
    private _steps: StepDefinition[] = [];
    private _startStep: StepDefinition | null = null;

    constructor(id: any, description: string) {
        this._id = id;
        this.description = description;
    }

    get id() {
        return this._id;
    }

    get steps() {
        return this._steps;
    }

    getStep(id: any) {
        return this.steps.find((step: StepDefinition) => step.id === id) || null;
    }

    appendStep(s: StepDefinition) {
        this._steps.push(s);
        return this;
    }

    get startStep() {
        return this._startStep;
    }

    setStartStep(s: StepDefinition) {
        this.appendStep(s);
        this._startStep = s;
        return this;
    }

    get transitions() {
        return this._transitions;
    }

    addTransition(t: Transition) {
        this._transitions.push(t);
        return this;
    }

    removeTransitionById(id: any) {
        this._transitions = this._transitions.filter(
            (t: Transition) => t.id !== id
        );
        return this;
    }

    addStep(step: StepDefinition): AddStepInterface {
        let flow = this.appendStep(step);
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
    }

    getTransition(originId: any, destinationId: any) {
        return getTransitionInFlowByStepIds(this, originId, destinationId);
    }

    getTransitionsFrom(id: any) {
        return getTransitionsInFlowFromStepById(this, id);
    }

    getTransitionsTo(id: any) {
        return getTransitionsInFlowToStepById(this, id);
    }

    createTransition(originId: any, destinationId: any, condition?: FlowCondition, requirements?: Array<Requirements>) {
        let origin = getStepByIdInFlowOrFail(this, originId);
        let destination = getStepByIdInFlowOrFail(this, destinationId);
        return this.addTransition(createTransition(this, origin, destination, condition, requirements));
    }
}

export function createFlowDefinition(id: any, description: string): FlowDefinition {
    return new FlowDefinition(id, description);
}
