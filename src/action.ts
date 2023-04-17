import { EventObject, createMachine } from "xstate";

interface ActionMachineContext {
  source: unknown;
  target: unknown | null;
}
type ActionMachineEvents = EventObject & {};

const actionMachine = createMachine({
  id: "action",
  tsTypes: {} as import("./action.typegen").Typegen0,
  predictableActionArguments: true,
  schema: {
    context: {} as ActionMachineContext,
    events: {} as ActionMachineEvents,
  },
});

export default actionMachine;

// turn machine
// - machine created (for each tick or each actor per tick?)
// - what actions can be made?
//    - non-rolled (move, delay, pass)
//        do we need to handle this at all or is it outside of combat state?
//    - rolled (attack)
//      - with target
//      - multitarget?? 
//      - without target
// - resolve actions
// - finish turn, propagate any changes to combat machine
//
// Questions: when are resources spent? End of turn?
// Usually you can only make one attack per turn, but 
// exceptions exist - how to handle?