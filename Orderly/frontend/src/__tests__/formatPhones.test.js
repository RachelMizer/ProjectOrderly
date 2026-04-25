import { formatPhone } from "../utils/formatPhone";

describe("formatPhone", () => {

test("returns em dash for null", () => {
expect(
formatPhone(null)
).toBe("—");
});

test("returns em dash for empty string", () => {
expect(
formatPhone("")
).toBe("—");
});

test("formats 10 digit phone number", () => {
expect(
formatPhone("9195551200")
).toBe("919-555-1200");
});

test("formats already punctuated 10 digit number", () => {
expect(
formatPhone("(919) 555-1200")
).toBe("919-555-1200");
});

test("formats 11 digit number with country code", () => {
expect(
formatPhone("19195551200")
).toBe("919-555-1200");
});

test("formats 11 digit punctuated country code number", () => {
expect(
formatPhone("+1 (919) 555-1200")
).toBe("919-555-1200");
});

test("returns original value for malformed short number", () => {
expect(
formatPhone("55512")
).toBe("55512");
});

test("returns original value for malformed long non-us number", () => {
expect(
formatPhone("441234567890")
).toBe("441234567890");
});

});