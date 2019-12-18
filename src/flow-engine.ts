import Flow from './flow';
import FlowDefinition from './flow-definition';
import FlowStep from './flow-step';
import { FlowStatus } from './flow-status';
import StepDefinition from './step-definition';
import Transition from './transition';
import { Requirements } from './transition-requirements';

function haveVisitedStep(flow: Flow, stepDefinition: StepDefinition): boolean {
  return !!flow.steps.find((s: FlowStep) => s.definition.id === stepDefinition.id);
}

// function isInParallelBranch(transition: Transition) {
//     let transitionsToInspect = transition.flowDefinition.getTransitionsFrom(transition.origin.id).filter((t: Transition) => t.id !== transition.id)
//     return transitionsToInspect.length > 0 ? transitionsToInspect.every((t: Transition) => t.condition === transition.condition) : false;
// }

// function canAdvanceInParallelBranch(transition: Transition, flow: Flow) {
//     let destinationsToInspect = transition.flowDefinition.getTransitionsFrom(transition.origin.id)
//         .filter((t: Transition) => t) //TODO: Remove this and fix Typescript error
//         .map((t: Transition) => t.destination);
//     return destinationsToInspect.every((d: StepDefinition) =>
//         haveVisitedStep(flow, d)
//     );
// }

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
      `Cannot advance Flow ${flow.id}: No transition from current step "${flow.currentStep!.definition.id}" to step "${
        stepDefinition.id
      }" found`,
    );
  }

  if (!isTransitionConditionSatisfied(transitionToSubmitted, data)) {
    throw new Error(
      `Cannot advance Flow ${flow.id}: Transition condition from current step to step ${stepDefinition.id} is not satisfied`,
    );
  }

  if (!areTransitionRequirementsSatisfied(transitionToSubmitted, flow)) {
    throw new Error(
      `Cannot advance Flow ${flow.id}: Transition dependencies for step ${stepDefinition.id} are not satisfied`,
    );
  }

  if (haveVisitedStep(flow, stepDefinition)) {
    flow.updateTag();
  }

  flow.currentStep = new FlowStep(flow, stepDefinition, data, flow.currentStep);
  flow.status = stepDefinition.applyStatusToFlow || flow.status;
  flow.lastTransition = transitionToSubmitted;
  return flow;
}
