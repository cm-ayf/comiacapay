interface RecordSetCount {
  type: "setCount";
  itemcode: string;
  count: number;
}

interface RecordSetDedication {
  type: "setDedication";
  itemcode: string;
  dedication: boolean;
}

interface Reset {
  type: "reset";
}

export type Action = RecordSetCount | RecordSetDedication | Reset;

export interface RecordState {
  count: number;
  dedication?: boolean;
}

export type State = {
  [itemcode: string]: RecordState;
};

export default function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "setCount": {
      const { itemcode, count } = action;
      if (count > 0) {
        const updated: RecordState = { ...state[itemcode], count };
        return { ...state, [itemcode]: updated };
      } else if (count === 0) {
        const { [itemcode]: _, ...rest } = state;
        return rest;
      } else {
        return state;
      }
    }
    case "setDedication": {
      const { itemcode, dedication } = action;
      const updated: RecordState = { count: 1, ...state[itemcode], dedication };
      return { ...state, [itemcode]: updated };
    }
    case "reset": {
      return {};
    }
  }
}
