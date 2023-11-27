"use client";

import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import { useParams } from "next/navigation";
import { use, useCallback, useState, useEffect } from "react";
import type { Params } from "../params";
import RefetchController, { RefetchEvent } from "./RefetchController";
import type { CreateReceipt } from "@/generated/schema";

interface IDBReceipt extends CreateReceipt {
  eventId: string;
  pushed: boolean;
}

interface DB extends DBSchema {
  Receipt: {
    key: string;
    value: IDBReceipt;
    indexes: {
      eventId: string;
    };
  };
}

export type IDB = IDBPDatabase<DB>;

type Migration = (idb: IDB) => void;

const migrations: Migration[] = [
  (db) => {
    const receipts = db.createObjectStore("Receipt", {
      keyPath: "id",
      autoIncrement: false,
    });
    receipts.createIndex("eventId", "eventId");
  },
];

function upgrade(idb: IDB, oldVersion: number, newVersion: number | null) {
  if (newVersion) {
    migrations
      .slice(oldVersion, newVersion)
      .forEach((migration) => migration(idb));
  }
}

declare global {
  var idb: Promise<IDB>;
}

function init() {
  return (window.idb ??= openDB<DB>("comiacapay", 1, { upgrade }));
}

const cache = new Map<string, Promise<IDBReceipt[]>>();

function fetchReceipts(idb: IDB, eventId: string) {
  const existing = cache.get(eventId);
  if (existing) return existing;

  const fetching = idb.getAllFromIndex("Receipt", "eventId", eventId);
  cache.set(eventId, fetching);
  return fetching;
}

const controller = new RefetchController();
controller.addEventListener("refetch", (e) => cache.delete(e.eventId));

export function useReceipts() {
  const { eventId } = useParams<Params>();
  const idb = use(init());

  const [loading, setLoading] = useState(true);
  const [receipts, setReceipts] = useState<IDBReceipt[]>();
  const [error, setError] = useState<Error>();

  const fetch = useCallback(() => {
    setLoading(true);
    fetchReceipts(idb, eventId)
      .then(setReceipts)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [idb, eventId]);

  useEffect(fetch, [fetch]);

  useEffect(() => {
    const refetch = (e: RefetchEvent) => {
      if (e.eventId === eventId) fetch();
    };
    controller.addEventListener("refetch", refetch);
    return () => controller.removeEventListener("refetch", refetch);
  }, [fetch, eventId]);

  return { loading, receipts, error };
}

type MutationTuple<Args extends unknown[]> = [
  (...args: Args) => Promise<void>,
  { loading: boolean },
];

export function useCreateReceipt(): MutationTuple<[receipt: CreateReceipt]> {
  const { eventId } = useParams<Params>();
  const idb = use(init());
  const [loading, setLoading] = useState(false);
  const trigger = useCallback(
    async (receipt: CreateReceipt) => {
      setLoading(true);
      await idb.add("Receipt", { eventId, ...receipt, pushed: false });
      setLoading(false);
      controller.dispatchEvent(new RefetchEvent(eventId));
    },
    [idb, eventId],
  );
  return [trigger, { loading }];
}

export function useSetReceiptsPushed({
  eventId,
}: {
  eventId: string;
}): MutationTuple<[ids: string[]]> {
  const idb = use(init());
  const [loading, setLoading] = useState(false);
  const trigger = useCallback(
    async (ids: string[]) => {
      setLoading(true);
      const store = idb
        .transaction("Receipt", "readwrite")
        .objectStore("Receipt");
      await Promise.all(
        ids.map(async (id) => {
          const receipt = await store.get(id);
          if (receipt) await store.put({ ...receipt, pushed: true });
        }),
      );
      setLoading(false);
      controller.dispatchEvent(new RefetchEvent(eventId));
    },
    [idb, eventId],
  );
  return [trigger, { loading }];
}
