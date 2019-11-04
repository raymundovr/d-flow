import { Access, AccessType, createAccess } from "./step-access";
import { FieldDefinition } from "./field-definition";

export class StepDefinition {
    private _id: any;
    public name: string;
    private _accessList: Access[];
    private _fields: FieldDefinition[];

    constructor(id: any, name: string, fields: Array<FieldDefinition> = [], access: Array<Access> = []) {
        this._id = id;
        this.name = name;
        this._fields = fields;
        this._accessList = access;
    }

    get id() {
        return this._id;
    }

    get accessList() {
        return this._accessList;
    }

    filterAccessInStep(name: String, accessType: AccessType): Array<Access> {
        return this._accessList.filter(
            (a: Access) => a.name === name && a.accessType === accessType
        );
    }

    findAccessInList(name: string, accessType: AccessType): Access | null {
        return this._accessList.find(
            (a: Access) => a.name === name && a.accessType === accessType
        ) || null;
    }

    grantAccessTo(name: string, accessType: AccessType): StepDefinition {
        let access = createAccess(name, accessType, true);
        this._accessList = this.filterAccessInStep(name, accessType);
        this._accessList.push(access);
        return this;
    }

    denyAccessTo(name: string, accessType: AccessType): StepDefinition {
        let access = createAccess(name, accessType, false);
        this._accessList = this.filterAccessInStep(name, accessType);
        this._accessList.push(access);
        return this;
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


export function createStepDefinition(id: string, name: string): StepDefinition {
    return new StepDefinition(
        id,
        name
    );
}
