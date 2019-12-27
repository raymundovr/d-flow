import StepDefinition from './step-definition';
import { FieldDefinition } from './field-definition';
import DataProcessor from './data-processor';
import JsonProcessor from './json-processor';

export default class DataInputStep extends StepDefinition {
    public processor: DataProcessor;
    private _fields: FieldDefinition[];    

    constructor(id: any, name: string, fields: FieldDefinition[] = [], processor: DataProcessor = JsonProcessor) {
        super(id, name);
        this._fields = fields;
        this.processor = processor;
    }

    get fields(): FieldDefinition[] {
        return this._fields;
    }

    public addField(field: FieldDefinition): DataInputStep {
        this._fields.push(field);
        return this;
    }

    public removeFieldWithId(id: any): DataInputStep {
        this._fields = this._fields.filter((f: FieldDefinition) => f.id !== id);
        return this;
    }

    public replaceField(field: FieldDefinition): DataInputStep {
        this.removeFieldWithId(field.id);
        this.addField(field);
        return this;
    }

    public getField(id: any): FieldDefinition | null {
        return this._fields.find((f: FieldDefinition) => f.id === id) || null;
    }

    public process(data: any): any {
        return this.processor.process(this, data);
    }
}

export function createDataInputStep(id: any, name: string, fields?: FieldDefinition[]) {
    return new DataInputStep(id, name, fields);
}
