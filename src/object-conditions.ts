export function equals(field: string, compareTo: any) {
  return {
    satisfies: function(data: any): boolean {
      if (!(field in data)) {
        return false;
      }
      return data[field] === compareTo;
    },
  };
}
