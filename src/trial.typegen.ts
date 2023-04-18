
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          
        };
        missingImplementations: {
          actions: never;
          delays: never;
          guards: never;
          services: never;
        };
        eventsCausingActions: {
          "editRoll": "EDIT_ROLL";
"rollDice": "ROLL";
"spendResources": "ROLL";
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          "isRollValid": "ROLL";
        };
        eventsCausingServices: {
          
        };
        matchesStates: "rolled" | "setup";
        tags: never;
      }
  