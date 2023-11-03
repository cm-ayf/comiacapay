interface Reset {
  type: "reset";
}

interface Set extends Partial<RecordState> {
  type: "set";
  itemId: string;
}

export type Action = Set | Reset;

export interface RecordState {
  count: number;
  dedication?: boolean;
  internal?: boolean;
}

export type State = {
  [itemcode: string]: RecordState;
};

export default function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "set": {
      const { type: _, itemId, ...rest } = action;
      if (rest.count === 0) {
        const { [itemId]: _, ...rest } = state;
        return rest;
      } else {
        const updated: RecordState = { count: 1, ...state[itemId], ...rest };
        return { ...state, [itemId]: updated };
      }
    }
    case "reset": {
      return {};
    }
  }
}
