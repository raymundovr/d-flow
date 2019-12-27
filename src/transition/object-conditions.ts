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
