import Alert, { type AlertColor } from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import {
  type PropsWithChildren,
  type ReactNode,
  createContext,
  use,
  useCallback,
  useReducer,
} from "react";

export interface AlertData {
  severity: AlertColor;
  message: ReactNode;
  persist: boolean;
}

interface AlertState extends AlertData {
  id: string;
}

type Action = AlertData | { delete: string };

function reducer(state: AlertState[], action: Action): AlertState[] {
  if ("delete" in action) {
    return state.filter((alert) => alert.id !== action.delete);
  } else {
    const id = Math.random().toString(36).slice(-8);
    return [...state, { id, ...action }];
  }
}

const DispatchAlertContext = createContext((_: Action) => {});

export function AlertProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, []);
  return (
    <>
      <DispatchAlertContext value={dispatch}>{children}</DispatchAlertContext>
      <Stack>
        {state.map((alert) => (
          <Snackbar
            key={alert.id}
            open
            autoHideDuration={alert.persist ? null : 6000}
            onClose={() => dispatch({ delete: alert.id })}
          >
            <Alert
              severity={alert.severity}
              onClose={() => dispatch({ delete: alert.id })}
            >
              {alert.message}
            </Alert>
          </Snackbar>
        ))}
      </Stack>
    </>
  );
}

export function useAlert(): Record<
  AlertColor,
  (message: ReactNode, persist?: boolean) => void
> {
  const dispatch = use(DispatchAlertContext);
  return {
    success: useCallback(
      (message, persist = false) =>
        dispatch({ severity: "success", message, persist }),
      [dispatch],
    ),
    info: useCallback(
      (message, persist = false) =>
        dispatch({ severity: "info", message, persist }),
      [dispatch],
    ),
    warning: useCallback(
      (message, persist = false) =>
        dispatch({ severity: "warning", message, persist }),
      [dispatch],
    ),
    error: useCallback(
      (message, persist = false) =>
        dispatch({ severity: "error", message, persist }),
      [dispatch],
    ),
  };
}
