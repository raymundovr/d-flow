import Flow from './flow';
import StepDefinition from './step-definition';

export default class FlowStep {
  private _flow: Flow;
  private _definition: StepDefinition;
  private _flowTag: number;
  private _origin: FlowStep | null;
  public completedAt: Date | null;
  public data: any;

  constructor(flow: Flow, definition: StepDefinition, data: any, origin: FlowStep | null) {
    this._flow = flow;
    this._flowTag = flow.tag;
    this._definition = definition;
    this.completedAt = null;
    this.data = data;
    this._origin = origin;
  }

  get flow(): Flow {
    return this._flow;
  }

  get definition(): StepDefinition {
    return this._definition;
  }

  get flowTag(): number {
    return this._flowTag;
  }

  get origin(): FlowStep | null {
    return this._origin;
  }

  get definitionId(): any {
    return this._definition.id;
  }
}
