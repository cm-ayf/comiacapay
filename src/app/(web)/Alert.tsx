"use client";

import Alert, { type AlertColor } from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import {
  type PropsWithChildren,
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useReducer,
} from "react";

export interface AlertData {
  severity: AlertColor;
  message: ReactNode;
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

const AlertContext = createContext({ dispatch: (_: Action) => {} });

export function AlertProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, []);
  return (
    <>
      <AlertContext.Provider value={{ dispatch }}>
        {children}
      </AlertContext.Provider>
      <Stack>
        {state.map((alert) => (
          <Snackbar
            key={alert.id}
            open
            autoHideDuration={6000}
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

export function useAlert(): Record<AlertColor, (message: ReactNode) => void> {
  const { dispatch } = useContext(AlertContext);
  return {
    success: useCallback(
      (message) => dispatch({ severity: "success", message }),
      [dispatch],
    ),
    info: useCallback(
      (message) => dispatch({ severity: "info", message }),
      [dispatch],
    ),
    warning: useCallback(
      (message) => dispatch({ severity: "warning", message }),
      [dispatch],
    ),
    error: useCallback(
      (message) => dispatch({ severity: "error", message }),
      [dispatch],
    ),
  };
}
