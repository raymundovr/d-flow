import DataInputStep from '../src/step/data-input-step';
import JsonProcessor from '../src/step/json-processor';
import {createFieldDefinition} from '../src/step/field-definition';

describe("JSON Data Processor", () => {
    it("Should correctly include all the defined fields in the output on object data", () => {
        let step = new DataInputStep("test", "test", JsonProcessor)
            .addField(createFieldDefinition('number', 'numeric', 'number'))
            .addField(createFieldDefinition('text', 'string', 'text'));
        let output = step.process({
            number: 1,
            text: "abc"
        });
        expect(output).toEqual({
            number: 1,
            text: "abc"
        });
    });
    it("Should correctly include all the defined fields in the output on string data", () => {
        let step = new DataInputStep("test", "test", JsonProcessor)
            .addField(createFieldDefinition('number', 'numeric', 'number'))
            .addField(createFieldDefinition('text', 'string', 'text'));
        let output = step.process(JSON.stringify({
            number: 1,
            text: "abc"
        }));
        expect(output).toEqual({
            number: 1,
            text: "abc"
        });
    });
    it("Should fail when required fields are not present", () => {
        let step = new DataInputStep("test", "test", JsonProcessor)
            .addField(createFieldDefinition('number', 'numeric', 'number', true))
            .addField(createFieldDefinition('text', 'string', 'text'));
        expect(() => step.process({ text: "abc" })).toThrow();
    });
    it("Should fail when data is not valid", () => {
        let step = new DataInputStep("test", "test", JsonProcessor)
            .addField(createFieldDefinition('number', 'numeric', 'number'))
            .addField(createFieldDefinition('text', 'string', 'text'));
        expect(() => step.process("abc")).toThrow();
        expect(() => step.process(undefined)).toThrow();        
    });
});
