
export enum AccessType {
    USER = "U",
    ROLE = "R",
    GROUP = "G"
}

interface Access {
    name: string;
    accessType: AccessType;
    granted: boolean;
}

function createAccess(name: string, accessType: AccessType, granted: boolean): Access {
    return {
        name,
        accessType,
        granted
    };
}

export class StepDefinition {
    private _id: any;
    public name: string;
    private _accessList: Access[] = [];

    constructor(id: any, name: string) {
        this._id = id;
        this.name = name;
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
}


export function createStepDefinition(id: string, name: string): StepDefinition {
    return new StepDefinition(
        id,
        name
    );
}
