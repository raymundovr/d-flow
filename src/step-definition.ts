export interface StepDefinition {
    readonly id: string;
    name: string;
}

export function createStepDefinition(id: string, name: string) : StepDefinition {
    return {
	id,
	name
    };
}
