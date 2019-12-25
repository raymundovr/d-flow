import StepDefinition from './step-definition';
import Transition, { createTransition } from './transition';
import FlowCondition from './flow-condition';
import { Requirements } from './transition-requirements';

/* Transitions */
export function getTransitionInFlowByStepIds(
    flow: FlowDefinition,
    originId: any,
    destinationId: any,
): Transition | null {
    return (
        flow.transitions.find((t: Transition) => t.origin === originId && t.destination === destinationId) || null
    );
}

export function getTransitionsInFlowFromStepById(flow: FlowDefinition, id: any): Array<Transition> | [] {
    return flow.transitions.filter((t: Transition) => t.origin === id);
}

export function getTransitionsInFlowToStepById(flow: FlowDefinition, id: any): Array<Transition> | [] {
    return flow.transitions.filter((t: Transition) => t.destination === id);
}

/* Steps */
export function addStepInFlowAfter(
    flow: FlowDefinition,
    stepId: string,
    afterId: string,
    condition?: FlowCondition,
): FlowDefinition {
    return flow.addTransition(createTransition(flow, afterId, stepId, condition));
}

export function addStepInFlowBefore(
    flow: FlowDefinition,
    stepId: string,
    beforeId: string,
    condition?: FlowCondition,
): FlowDefinition {
    return flow.addTransition(createTransition(flow, stepId, beforeId, condition));
}

export function addStepInFlowBetween(
    flow: FlowDefinition,
    stepId: string,
    beforeId: string,
    afterId: string,
    beforeCondition?: FlowCondition,
    afterCondition?: FlowCondition,
): FlowDefinition {
    let currentTransition = flow.transitions.find(
        (t: Transition) => t.origin === beforeId && t.destination === afterId,
    );

    if (currentTransition) {
        flow.removeTransitionById(currentTransition.id);
    }

    flow.addTransition(createTransition(flow, beforeId, stepId, beforeCondition));

    flow.addTransition(createTransition(flow, stepId, afterId, afterCondition));
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
        this._transitions = this._transitions.filter((t: Transition) => t.id !== id);
        return this;
    }

    addStep(step: StepDefinition): AddStepInterface {
        let flow = this.appendStep(step);
        return {
            afterStep: function(id: any, condition?: FlowCondition) {
                if (!!!flow.getStep(id)) {
                    throw new Error(`Cannot find step with id ${id}`)
                }

                return addStepInFlowAfter(flow, step.id.toString(), id.toString(), condition);
            },
            beforeStep: function(id: any, condition?: FlowCondition) {
                if (!!!flow.getStep(id)) {
                    throw new Error(`Cannot find step with id ${id}`)
                }
                return addStepInFlowBefore(flow, step.id.toString(), id.toString(), condition);
            },
            betweenSteps(
                idBefore: any,
                idAfter: any,
                beforeCondition?: FlowCondition,
                afterCondition?: FlowCondition,
            ) {
                if (!!!flow.getStep(idBefore)) {
                    throw new Error(`Cannot find step with id ${idBefore}`)
                }
                if (!!!flow.getStep(idAfter)) {
                    throw new Error(`Cannot find step with id ${idAfter}`)
                }

                return addStepInFlowBetween(flow, step.id.toString(), idBefore.toString(), idAfter.toString(), beforeCondition, afterCondition);
            },
            done: function() {
                return flow;
            },
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
        return this.addTransition(createTransition(this, origin.id, destination.id, condition, requirements));
    }

    getDestinationsFrom(id: any) {
        let transitions = this.getTransitionsFrom(id);
        if (!transitions.length) {
            return [];
        }
        return (transitions as Array<Transition>).map((t: Transition) => t.destination);
    }
}

export function createFlowDefinition(id: any, description: string): FlowDefinition {
    return new FlowDefinition(id, description);
}
