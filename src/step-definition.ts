import { Access, AccessType, createAccess } from "./step-access";
import { FlowStatus } from "./flow-status";

export default abstract class StepDefinition {
    protected _id: any;
    protected _accessList: Access[] = [];
    public name: string;
    public applyStatusToFlow: FlowStatus;

    constructor(id: any, name: string, status: FlowStatus = FlowStatus.Active) {
        this._id = id;
        this.name = name;
        this.applyStatusToFlow = status;
    }

    get id(): any {
        return this._id;
    }

    get accessList(): Access[] {
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
}
