import StepDefinition from './step-definition';
import FlowDefinition from './flow-definition';
import FlowCondition from './flow-condition';
import { Requirements } from './transition-requirements';

export default interface Transition {
  readonly id: any;
  readonly flowDefinition: FlowDefinition;
  readonly origin: StepDefinition;
  readonly destination: StepDefinition;
  condition?: FlowCondition;
  requirements?: Array<Requirements>;
}

export function createTransition(
  flowDefinition: FlowDefinition,
  origin: StepDefinition,
  destination: StepDefinition,
  condition?: FlowCondition,
  requirements?: Array<Requirements>,
): Transition {
  return {
    id: `${origin.id}-${destination.id}`,
    flowDefinition,
    origin,
    destination,
    condition,
    requirements,
  };
}
