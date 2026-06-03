import { describe, it, expect } from "vitest";

import { RandomRangeError, validateRandoms, createRandoms, createAbsolute } from "../../src/model/random";

describe("Randoms#validateRandoms", function () {
  it("createRandoms", function () {
    const randoms = createRandoms();
    const result = validateRandoms(randoms);
    const isError = result instanceof RandomRangeError;

    expect(isError).toBe(false);
  });
  it("createAbsolute", function () {
    const randoms = createAbsolute();
    const result = validateRandoms(randoms);
    const isError = result instanceof RandomRangeError;

    expect(isError).toBe(false);
    expect(randoms.times).toBe(1);
    expect(randoms.damage).toBe(1);
    expect(randoms.accuracy).toBe(1);
  });
  it("zero", function () {
    const result = validateRandoms({
      times: 0,
      damage: 0,
      accuracy: 0,
    });
    const isError = result instanceof RandomRangeError;

    expect(isError).toBe(false);
  });

  it("minus times", function () {
    const result = validateRandoms({
      times: -0.1,
      damage: -0.1,
      accuracy: -0.1,
    });
    if (result instanceof RandomRangeError) {
      expect(result.prop).toBe("times");
      expect(result.value).toBe(-0.1);
      expect(result.message).toBe("timesの値は0から1です");
    } else {
      expect.unreachable("result should be error");
    }
  });
  it("minus damage", function () {
    const result = validateRandoms({
      times: 0.1,
      damage: -0.1,
      accuracy: -0.1,
    });
    if (result instanceof RandomRangeError) {
      expect(result.prop).toBe("damage");
      expect(result.value).toBe(-0.1);
      expect(result.message).toBe("damageの値は0から1です");
    } else {
      expect.unreachable("result should be error");
    }
  });
  it("minus accuracy", function () {
    const result = validateRandoms({
      times: 0.1,
      damage: 0.1,
      accuracy: -0.1,
    });
    if (result instanceof RandomRangeError) {
      expect(result.prop).toBe("accuracy");
      expect(result.value).toBe(-0.1);
      expect(result.message).toBe("accuracyの値は0から1です");
    } else {
      expect.unreachable("result should be error");
    }
  });

  it("over times", function () {
    const result = validateRandoms({
      times: 1.1,
      damage: 1.1,
      accuracy: 1.1,
    });
    if (result instanceof RandomRangeError) {
      expect(result.prop).toBe("times");
      expect(result.value).toBe(1.1);
      expect(result.message).toBe("timesの値は0から1です");
    } else {
      expect.unreachable("result should be error");
    }
  });
  it("over damage", function () {
    const result = validateRandoms({
      times: 0.9,
      damage: 1.1,
      accuracy: 1.1,
    });
    if (result instanceof RandomRangeError) {
      expect(result.prop).toBe("damage");
      expect(result.value).toBe(1.1);
      expect(result.message).toBe("damageの値は0から1です");
    } else {
      expect.unreachable("result should be error");
    }
  });
  it("over accuracy", function () {
    const result = validateRandoms({
      times: 0.9,
      damage: 0.9,
      accuracy: 1.1,
    });
    if (result instanceof RandomRangeError) {
      expect(result.prop).toBe("accuracy");
      expect(result.value).toBe(1.1);
      expect(result.message).toBe("accuracyの値は0から1です");
    } else {
      expect.unreachable("result should be error");
    }
  });
});
