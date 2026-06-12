declare module "bun:test" {
  type TestCallback = () => unknown | Promise<unknown>;
  type EachCallback<T> = (item: T) => unknown | Promise<unknown>;

  type TestFn = {
    (name: string, callback: TestCallback, timeout?: number): void;
    each<T>(
      cases: readonly T[],
    ): (name: string, callback: EachCallback<T>, timeout?: number) => void;
    skip: TestFn;
  };

  export const afterAll: (callback: TestCallback) => void;
  export const beforeAll: (callback: TestCallback) => void;
  export const describe: TestFn;
  export const expect: <T>(
    actual: T,
    message?: string,
  ) => {
    not: ReturnType<typeof expect>;
    toBe: (expected: unknown, message?: string) => void;
    toBeDefined: () => void;
    toBeNull: () => void;
    toBeGreaterThan: (expected: number, message?: string) => void;
    toContain: (expected: unknown, message?: string) => void;
    toEqual: (expected: unknown, message?: string) => void;
    toHaveProperty: (property: string, message?: string) => void;
    toMatch: (expected: RegExp | string, message?: string) => void;
    toMatchObject: (expected: unknown, message?: string) => void;
  };
  export const test: TestFn;
}
