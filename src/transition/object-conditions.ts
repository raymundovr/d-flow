export function equals(field: string, compareTo: any) {
    return {
        satisfies: (data: any): boolean => {
            if (!(field in data)) {
                return false;
            }
            return data[field] === compareTo;
        },
    };
}

export function lt(field: string, compareTo: any) {
    return {
        satisfies: (data: any): boolean => {
            if (!(field in data)) {
                return false;
            }
            return data[field] < compareTo;
        },
    };
}

export function lte(field: string, compareTo: any) {
    return {
        satisfies: (data: any): boolean => {
            if (!(field in data)) {
                return false;
            }
            return data[field] <= compareTo;
        },
    };
}

export function gt(field: string, compareTo: any) {
    return {
        satisfies: (data: any): boolean => {
            if (!(field in data)) {
                return false;
            }
            return data[field] > compareTo;
        },
    };
}

export function gte(field: string, compareTo: any) {
    return {
        satisfies: (data: any): boolean => {
            if (!(field in data)) {
                return false;
            }
            return data[field] >= compareTo;
        },
    };
}
