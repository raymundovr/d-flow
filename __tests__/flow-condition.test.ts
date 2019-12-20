import { equals } from '../src/object-conditions';

describe("Flow conditions tests", () => {
    it("::equals", () => {
        expect(equals('a', 10).satisfies({ a: 10 })).toBe(true);
    });
});
