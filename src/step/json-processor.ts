import DataInputStep from './data-input-step';
import { FieldDefinition } from './field-definition';
import DataProcessor from './data-processor';

class JsonProcessor implements DataProcessor {
    public process(definition: DataInputStep, data: string | { [key: string]: any }): { [key: string]: any } {
        const normalized = typeof data === 'string' ? this.safeParse(data) : data;
        if (normalized === null || !this.isValid(definition, normalized)) {
            throw new Error(`Invalid JSON Data step`);
        }
        const definedFields = definition.fields.map((f: FieldDefinition) => f.id);

        if (definedFields.length === 0) {
            return normalized;
        }

        const output: { [key: string]: any } = {};
        for (const key of Object.keys(normalized)) {
            if (definedFields.includes(key)) {
                output[key] = normalized[key];
            }
        }
        return output;
    }

    private safeParse(data: string): { [key: string]: any } | null {
        try {
            return JSON.parse(data);
        } catch {
            return null;
        }
    }

    private isNotEmpty(value: any): boolean {
        return value !== undefined && value !== null && value !== '';
    }

    private isValid(definition: DataInputStep, data: { [key: string]: any }): boolean {
        const requiredFields = definition.fields.filter((f: FieldDefinition) => f.required);
        const submittedFields = Object.keys(data);
        return requiredFields.every((f: FieldDefinition) => f.id in submittedFields && this.isNotEmpty(data[f.id]));
    }    
}

export default new JsonProcessor();
