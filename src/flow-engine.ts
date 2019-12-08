import Flow from './flow';
import FlowDefinition from './flow-definition';
import FlowStep from './flow-step';
import { FlowStatus } from './flow-status';
import StepDefinition from './step-definition';
import Transition from './transition';

function haveVisitedStep(flow: Flow, stepDefinition: StepDefinition): boolean {
    return !!flow.steps.find((s: FlowStep) => s.definition.id === stepDefinition.id);
}

function isInParallelBranch(transition: Transition) {
    let transitionsToInspect = transition.flowDefinition.getTransitionsFrom(transition.origin.id).filter((t: Transition) => t.id !== transition.id)
    return transitionsToInspect.length > 0 ? transitionsToInspect.every((t: Transition) => t.condition === transition.condition) : false;
}

function canAdvanceInParallelBranch(transition: Transition, flow: Flow) {
    let destinationsToInspect = transition.flowDefinition.getTransitionsFrom(transition.origin.id)
        .filter((t: Transition) => t) //Fix this Typescript error
        .map((t: Transition) => t.destination);
    return destinationsToInspect.every((d: StepDefinition) =>
        haveVisitedStep(flow, d)
    );
}

export function create(definition: FlowDefinition): Flow {
    //TODO: Replace id generation
    let id = definition.id.toString() + (new Date()).toTimeString();
    return new Flow(id, definition);
}

export function start(flow: Flow, data: any): Flow {
    if (!flow.definition.startStep) {
        throw new Error(`Cannot start flow ${flow.id}: Start step not defined`);
    }
    flow.currentStep = new FlowStep(
        flow, flow.definition.startStep, data, null
    );
    flow.currentStep.completedAt = new Date();
    flow.status = FlowStatus.Active;
    return flow;
}

export function submit(flow: Flow, data: any, stepDefinition: StepDefinition): Flow {
    if (flow.status === FlowStatus.Created) {
        if (stepDefinition.id !== flow.definition!.startStep!.id) {
            throw new Error(`Invalid submission for Flow ${flow.id}: incorrect start step`);
        }
        return start(flow, {});
    }

    if (flow.status !== FlowStatus.Active || !flow.currentStep) {
        throw new Error(`Cannot advance Flow ${flow.id}: Advance can only be applied to Active Flows`);
    }

    let transition = flow.definition.getTransition(flow.currentStep.definition.id, stepDefinition.id);

    if (flow.currentStep && flow.currentStep.origin) {
        //Evaluate parallelism
        let prevTransition = flow.definition.getTransition(
            flow.currentStep.origin.definition.id, flow.currentStep.definition.id);
        if (prevTransition === null) {
            throw new Error("Cannot determine transition to evaluate parallelism");
        }
        if (isInParallelBranch(prevTransition)) {
            transition = flow.definition.getTransition(flow.currentStep.origin.definition.id, stepDefinition.id);
            if (!transition && !canAdvanceInParallelBranch(prevTransition, flow)) {
                throw new Error(`Cannot advance Flow ${flow.id}: Flow is in parallel branch and cannot yet advance`);
            }
        }
    }

    if (!transition) {
        throw new Error(`Cannot advance Flow ${flow.id}: No transition from current step "${flow.currentStep.definition.id}" to step "${stepDefinition.id}" found`);
    }

    if (transition.condition && !transition.condition.satisfies(data)) {
        throw new Error(`Cannot advance Flow ${flow.id}: Transition condition from current step to step ${stepDefinition.id} is not satisfied`);
    }

    if (haveVisitedStep(flow, stepDefinition)) {
        flow.updateTag();
    }

    flow.currentStep = new FlowStep(
        flow, stepDefinition, data, flow.currentStep
    );
    flow.status = stepDefinition.flowStatus || flow.status;
    flow.lastTransition = transition;
    return flow;
}
