import test from "node:test";
import assert from "node:assert/strict";
import { FlowBitz } from "../src/library/loader.js";

// A stand-in for a component module. Real ones have the same shape.
const fakeComponent = () => {
  const component = {
    instances: new Map(),
    initAllCalls: 0,
    initAll() {
      this.initAllCalls += 1;
    },
    initElement(el) {
      this.instances.set(el, true);
    },
  };
  return component;
};

const fakeLoader = (component) => {
  const loader = async () => {
    loader.calls += 1;
    return { default: component };
  };
  loader.calls = 0;
  return loader;
};

test("an element added after its component loaded is initialised", async () => {
  const component = fakeComponent();
  const fb = new FlowBitz({ fake: fakeLoader(component) });
  await fb.load("fake");

  const el = { isConnected: true };
  await fb.initAddedElements(new Map([["fake", new Set([el])]]));

  assert.ok(component.instances.has(el));
  assert.equal(component.initAllCalls, 1, "initAll runs once, at load");
});

test("an element the component already holds is not initialised again", async () => {
  const component = fakeComponent();
  let calls = 0;
  component.initElement = () => {
    calls += 1;
  };
  const el = { isConnected: true };
  component.instances.set(el, true);
  const fb = new FlowBitz({ fake: fakeLoader(component) });

  await fb.initAddedElements(new Map([["fake", new Set([el])]]));

  assert.equal(calls, 0);
});

test("an element that has left the page is skipped", async () => {
  const component = fakeComponent();
  const fb = new FlowBitz({ fake: fakeLoader(component) });
  const el = { isConnected: false };

  await fb.initAddedElements(new Map([["fake", new Set([el])]]));

  assert.equal(component.instances.has(el), false);
});

test("a component without initElement falls back to initAll", async () => {
  const component = fakeComponent();
  delete component.initElement;
  const fb = new FlowBitz({ fake: fakeLoader(component) });
  await fb.load("fake");

  await fb.initAddedElements(new Map([["fake", new Set([{ isConnected: true }])]]));

  assert.equal(component.initAllCalls, 2);
});

test("two loads of the same component at once share one import", async () => {
  const component = fakeComponent();
  const loader = fakeLoader(component);
  const fb = new FlowBitz({ fake: loader });

  const [a, b] = await Promise.all([fb.load("fake"), fb.load("fake")]);

  assert.equal(a, component);
  assert.equal(b, component);
  assert.equal(loader.calls, 1);
});

test("an unknown component resolves to null", async () => {
  const fb = new FlowBitz({});
  const original = console.warn;
  console.warn = () => {};
  try {
    assert.equal(await fb.load("nope"), null);
  } finally {
    console.warn = original;
  }
});
