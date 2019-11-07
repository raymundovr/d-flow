import { StepDefinition } from "./step-definition";
import { Access } from "./step-access";
import { FieldDefinition } from "./field-definition";

export class DataInputStep extends StepDefinition {
    private _fields: FieldDefinition[];

    constructor(id: any, name: string, access: Array<Access> = [], fields: Array<FieldDefinition> = []) {
        super(id, name, access);
        this._fields = fields;

    }

    get fields(): Array<FieldDefinition> {
        return this._fields;
    }

    addField(field: FieldDefinition): StepDefinition {
        this._fields.push(field);
        return this;
    }

    removeFieldWithId(id: any): StepDefinition {
        this._fields = this._fields.filter((f: FieldDefinition) => f.id !== id);
        return this;
    }

    replaceField(field: FieldDefinition): StepDefinition {
        this.removeFieldWithId(field.id);
        this.addField(field);
        return this;
    }

    getField(id: any): FieldDefinition | null {
        return this._fields.find((f: FieldDefinition) => f.id === id) || null;
    }
}


export function createDataInputStep(id: any, name: string, access?: Access[], fields?: FieldDefinition[]): StepDefinition {
    return new DataInputStep(
        id,
        name,
        access,
        fields
    );
}
