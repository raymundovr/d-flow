import { StepDefinition } from "./step-definition";

export class FlowDefinition {
    public id: any;
    public description: string;
    private _steps: { [key: string]: any } = {};

    constructor(id: any, description: string) {
	this.id = id;
	this.description = description;
	this._steps = {};
    }

    addStep(step: StepDefinition) {
	this._steps[step.id] = step;
    }

    removeStepById(stepId: string) {
	delete this._steps[stepId];
    }

    get steps(): object {
	return this._steps;
    }
}
