import {FlowDefinition, createFlowDefinition } from '../src/flow-definition';

describe("FlowDefinition", () => {
    test("::createFlowDefinition", () => {
	expect(
	    createFlowDefinition('test', "Test")
	).toMatchObject({
	    id: 'test',
	    description: 'Test',
	    transitions: {},
	    startStep: null
	});
    });
});
