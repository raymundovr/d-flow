export interface FieldDefinition {
    id: any;
    fieldType: string;
    prompt: string;
}

export function createFieldDefinition(id: any, fieldType: string, prompt: string): FieldDefinition {
    return {
        id,
        fieldType,
        prompt,
    };
}
