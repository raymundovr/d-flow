import StepDefinition from './step-definition';
import Transition, { createTransition } from './transition';
import FlowCondition from './flow-condition';
import { Requirements } from './transition-requirements';
import { FlowStatus } from './flow-status';

interface AddStepInterface {
    afterStep: Function;
    beforeStep: Function;
    betweenSteps: Function;
    done: Function;
}

interface AddTransitionInterface {
    withCondition: Function;
    withRequirements: Function;
    done: Function;
}

export default class FlowDefinition {
    private _id: any;
    public description: string;
    private _transitions: Transition[] = [];
    private _steps: StepDefinition[] = [];
    private _startStep: StepDefinition | null = null;
    private _statusToApplyOnStepCompletion: { [key: string]: FlowStatus } = {};

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

    get startStep() {
        return this._startStep;
    }

    setStartStep(s: StepDefinition) {
        this.addStep(s);
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

    createTransition(originId: any, destinationId: any, condition?: FlowCondition, requirements?: Array<Requirements>) {        
        return this.addTransition(
            createTransition(this, originId.toString(), destinationId.toString(), condition, requirements)
        );
    }

    removeTransitionById(id: any) {
        this._transitions = this._transitions.filter((t: Transition) => t.id !== id);
        return this;
    }

    addStep(step: StepDefinition): AddStepInterface {
        this._steps.push(step);
        let self = this;
        return {
            done: function() {
                return self;
            },
            afterStep: function(previousStepId: any, condition?: FlowCondition, requirements?: Array<Requirements>) {
                return self.createTransition(previousStepId, step.id, condition, requirements);
            },
            beforeStep: function(nextStepId: any, condition?: FlowCondition, requirements?: Array<Requirements>) {
                return self.createTransition(step.id, nextStepId, condition, requirements);
            },
            betweenSteps: function(previousStepId: any, nextStepId: any) {
                let currentTransition = self.getTransition(previousStepId, nextStepId);
                if (currentTransition) {
                    self.removeTransitionById(currentTransition.id);
                }
                return self.createTransition(previousStepId, step.id)
                .createTransition(step.id, nextStepId);
            }
        }
    }

    getTransition(originId: any, destinationId: any) {
        return this.transitions.find((t: Transition) => t.origin === originId && t.destination === destinationId) || null;
    }

    getTransitionsFrom(id: any) {
        return this.transitions.filter((t: Transition) => t.origin === id);
    }

    getTransitionsTo(id: any) {
        return this.transitions.filter((t: Transition) => t.destination === id);
    }

    getDestinationsFrom(id: any) {
        let transitions = this.getTransitionsFrom(id);
        if (!transitions.length) {
            return [];
        }
        return (transitions as Array<Transition>).map((t: Transition) => t.destination);
    }

    setStatusOnCompletedStep(stepId: any, status: FlowStatus) {
        this._statusToApplyOnStepCompletion[stepId.toString()] = status;
        return this;
    }

    getStatusOnCompletedStep(stepId:any): FlowStatus | undefined {
        return stepId.toString() in this._statusToApplyOnStepCompletion ? 
            this._statusToApplyOnStepCompletion[stepId.toString()] : undefined;
    }
}

export function createFlowDefinition(id: any, description: string) {    
    return new FlowDefinition(id, description)
}
