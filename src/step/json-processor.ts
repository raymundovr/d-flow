import DataInputStep from "./data-input-step";
import { FieldDefinition } from "./field-definition";
import DataProcessor from "./data-processor";

class JsonProcessor implements DataProcessor  {
    safeParse(data: string): {[key: string]: any} | null {
        try {
            return JSON.parse(data);
        } catch {
            return null;
        }
    }

    isNotEmpty(value: any): boolean {
        return value !== undefined && value !== null && value !== "";
    }

    isValid(definition: DataInputStep, data: {[key: string]: any}): boolean {
        let requiredFields = definition.fields.filter((f: FieldDefinition) => f.required);
        let submittedFields = Object.keys(data);
        return requiredFields.every((f: FieldDefinition) => 
            (f.id in submittedFields) && this.isNotEmpty(data[f.id])
        );
    }

    process(definition: DataInputStep, data: string | {[key: string]: any}): {[key: string]: any} {
        let normalized = typeof(data) === 'string' ? this.safeParse(data) : data;        
        if (normalized === null || !this.isValid(definition, normalized)) {
            throw new Error(`Invalid JSON Data step`);
        }
        let definedFields = definition.fields.map((f: FieldDefinition) => f.id);
        
        if (definedFields.length === 0) {
            return normalized;
        }

        let output: {[key: string]: any} = {};
        for (let key of Object.keys(normalized)) {            
            if (definedFields.includes(key)) {                
                output[key] = normalized[key];
            }
        }
        return output;
    }
}

export default new JsonProcessor();