"use client";

import { useQuery } from "@apollo/client";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import { useReducer } from "react";
import Bottom from "./Bottom";
import RegisterItemPanel from "./RegisterItemPanel";
import reducer from "./reducer";
import Layout from "@/components/Layout";
import { DBStateProvider } from "@/hooks/DBState";

export const dynamic = "force-static";

export default function Register({
  params: { eventcode },
}: {
  params: { eventcode: string };
}) {
  const { data } = useQuery(GetEventDetailsQuery, { variables: { eventcode } });
  const [state, dispatch] = useReducer(reducer, {});
  const title = event ? event.name : eventcode;

  return (
    <DBStateProvider>
      <Layout
        scopes={["read", "register"]}
        title={title}
        back={`/${eventcode}`}
        docs="register"
        bottom={
          event && <Bottom event={event} state={state} dispatch={dispatch} />
        }
      >
        {event ? (
          <Grid container spacing={2}>
            {event.items.map((item) => (
              <Grid item xs={12} md={6} xl={4} key={item.code}>
                <RegisterItemPanel
                  item={item}
                  record={state[item.code]}
                  dispatch={dispatch}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <CircularProgress />
        )}
      </Layout>
    </DBStateProvider>
  );
}
