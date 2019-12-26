export enum AccessType {
    USER = 'U',
    ROLE = 'R',
    GROUP = 'G',
}

export interface Access {
    name: string;
    accessType: AccessType;
    granted: boolean;
}

export function createAccess(name: string, accessType: AccessType, granted: boolean): Access {
    return {
        name,
        accessType,
        granted,
    };
}
