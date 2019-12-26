export interface FieldDefinition {
    id: any;
    fieldType: string;
    prompt: string;
    required: boolean;
}

export function createFieldDefinition(id: any, fieldType: string, prompt: string, required = false): FieldDefinition {
    return {
        id,
        fieldType,
        prompt,
        required
    };
}
