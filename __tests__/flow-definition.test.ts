import {FlowDefinition, createFlowDefinition } from '../src/flow-definition';
import { StepDefinition, createStepDefinition } from '../src/step-definition';

describe("FlowDefinition", () => {
    test("::createFlowDefinition()", () => {
	expect(
	    createFlowDefinition('test', "Test")
	).toMatchObject({
	    id: 'test',
	    description: 'Test',
	    transitions: {},
	    startStep: null
	});
    });

    test("::setStartStep()", () => {
	let start = createStepDefinition('step', 'Step');
	let flow = createFlowDefinition('test', 'Test').
	    setStartStep(start);
	expect(flow.startStep).toBe(start);
	expect(Object.keys(flow.steps).length).toBe(1);
    });

    test("::addStep().after()", () => {
    	let flow = createFlowDefinition('test', 'test')
    	    .setStartStep(createStepDefinition('start', 'start'))
    	    .addStep(createStepDefinition('a', 'a')).afterStepWithId('start');
	expect(flow.steps.length).toBe(2);
	expect(flow.transitions.length).toBe(1);
	expect(flow.transitions[0].id).toBe('start-a');
    });

    test("::addStep().before()", () => {
	let flow = createFlowDefinition('test', 'test')
	    .setStartStep(createStepDefinition('start', 'start'))
	    .addStep(createStepDefinition('a', 'a')).afterStepWithId('start')	    
	    .addStep(createStepDefinition('b', 'b')).beforeStepWithId('a');
	expect(flow.transitions.length).toBe(2);
	expect(flow.transitions.map((t:any) => t.id)).toEqual(['start-a', 'b-a']);
    });

    test("::addStepBetween()", () => {
	let flow = createFlowDefinition('test', 'test')
	    .setStartStep(createStepDefinition('start', 'start'))
	    .addStep(createStepDefinition('b', 'b')).afterStepWithId('start')	    
	    .addStep(createStepDefinition('a', 'a')).betweenStepsWithId('start', 'b');
	expect(flow.transitions.length).toBe(2);
	expect(flow.transitions.map((t:any) => t.id)).toEqual(['start-a', 'a-b']);
    });
});
