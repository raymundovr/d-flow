import Flow from './flow';
import FlowDefinition from './flow-definition';
import FlowStep from './flow-step';
import { FlowStatus } from './flow-status';
import StepDefinition from './step/step-definition';
import Transition from './transition/transition';
import { Requirements } from './transition/transition-requirements';

function haveVisitedStep(flow: Flow, stepDefinition: StepDefinition): boolean {
    return !!flow.steps.find((s: FlowStep) => s.definition.id === stepDefinition.id);
}

export function create(definition: FlowDefinition): Flow {
    //TODO: Replace id generation
    let id = definition.id.toString() + new Date().toTimeString();
    return new Flow(id, definition);
}

export function start(flow: Flow, data: any): Flow {
    if (!flow.definition.startStep) {
        throw new Error(`Cannot start flow ${flow.id}: Start step not defined`);
    }

    flow.currentStep = new FlowStep(flow, flow.definition.startStep, data, null);
    flow.currentStep.completedAt = new Date();
    flow.status = FlowStatus.Active;
    return flow;
}

function flowIsActive(flow: Flow) {
    return flow.hasStatus(FlowStatus.Active) && flow.currentStep;
}

function submittedStepIsStart(stepId: any, flowDefinition: FlowDefinition) {
    return stepId === flowDefinition.startStep!.id;
}

function isTransitionConditionSatisfied(transition: Transition, data: any) {
    if (transition.condition) {
        return transition.condition.satisfies(data);
    }

    return true;
}

function areTransitionRequirementsSatisfied(transition: Transition, flow: Flow) {
    if (transition.requirements) {
        return transition.requirements.every((r: Requirements) => r.isSatisfied(flow));
    }
    return true;
}

export function submit(flow: Flow, data: any, stepDefinition: StepDefinition): Flow {
    if (flow.hasStatus(FlowStatus.Created)) {
        if (!submittedStepIsStart(stepDefinition.id, flow.definition)) {
            throw new Error(`Invalid submission for Flow ${flow.id}: incorrect start step`);
        }
        return start(flow, data);
    }

    if (!flowIsActive(flow)) {
        throw new Error(`Cannot advance Flow ${flow.id}: Advance can only be applied to Active Flows`);
    }

    let transitionToSubmitted = flow.getTransitionToStepWithId(stepDefinition.id);

    if (!transitionToSubmitted) {
        throw new Error(
            `Cannot advance Flow ${flow.id}: No transition found from any visited step into step "${stepDefinition.id}"`,
        );
    }

    let lastStepFromOrigin = flow.getLastSubmittedStepWithDefinitionId(transitionToSubmitted.origin);
    if (!lastStepFromOrigin) {
        throw new Error(
            `Cannot advance Flow ${flow.id}: Cannot find last submitted step with step definition ${transitionToSubmitted.origin}`,
        );
    }

    if (!isTransitionConditionSatisfied(transitionToSubmitted, lastStepFromOrigin.data)) {
        throw new Error(
            `Cannot advance Flow ${flow.id}: Transition condition to step ${stepDefinition.id} is not satisfied`,
        );
    }

    if (!areTransitionRequirementsSatisfied(transitionToSubmitted, flow)) {
        throw new Error(
            `Cannot advance Flow ${flow.id}: Transition dependencies for step ${stepDefinition.id} are not satisfied`,
        );
    }

    if (haveVisitedStep(flow, stepDefinition)) {
        flow.increaseCycleCount();
    }

    flow.currentStep = new FlowStep(flow, stepDefinition, data, lastStepFromOrigin);
    flow.lastTransition = transitionToSubmitted;
    return flow;
}
