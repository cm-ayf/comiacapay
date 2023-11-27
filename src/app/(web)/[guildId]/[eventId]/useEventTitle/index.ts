import { useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import type { Params } from "../params";
import GetEventTitle from "./GetEventTitle.graphql";

export default function useEventTitle() {
  const params = useParams<Params>();
  const { data } = useQuery(GetEventTitle, { variables: params });
  return data && `${data.event.guild.name} / ${data.event.name}`;
}
