"use client";

import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import { use, useCallback, useState } from "react";
import type { CreateReceipt } from "@/generated/schema";

interface DBReceipt extends CreateReceipt {
  eventId: string;
  pushed?: boolean;
}

interface DB extends DBSchema {
  Receipt: {
    key: string;
    value: DBReceipt;
    indexes: {
      eventId: string;
    };
  };
}

export type IDB = IDBPDatabase<DB>;

type Migration = (db: IDBPDatabase<DB>) => void;

const migrations: Migration[] = [
  (db) => {
    const receipts = db.createObjectStore("Receipt", {
      keyPath: "id",
      autoIncrement: false,
    });
    receipts.createIndex("eventId", "eventId");
  },
];

function upgrade(db: IDB, oldVersion: number, newVersion: number | null) {
  if (newVersion) {
    migrations
      .slice(oldVersion, newVersion)
      .forEach((migration) => migration(db));
  }
}

const db = openDB<DB>("comiacapay", migrations.length, { upgrade });

function useDB() {
  return use(db);
}

const cache = new Map<string, Promise<DBReceipt[]>>();

function fetchReceipts(db: IDBPDatabase<DB>, eventId: string) {
  const existing = cache.get(eventId);
  if (existing) return existing;

  const fetching = db.getAllFromIndex("Receipt", "eventId", eventId);
  cache.set(eventId, fetching);
  return fetching;
}

export function useReceipts({ eventId }: { eventId: string }) {
  const db = useDB();
  return use(fetchReceipts(db, eventId));
}

type MutationTuple<Args extends unknown[]> = [
  (...args: Args) => Promise<void>,
  { loading: boolean },
];

export function useCreateReceipt({
  eventId,
}: {
  eventId: string;
}): MutationTuple<[receipt: CreateReceipt]> {
  const db = useDB();
  const [loading, setLoading] = useState(false);
  const trigger = useCallback(
    async (receipt: CreateReceipt) => {
      setLoading(true);
      await db.add("Receipt", { eventId, ...receipt });
      setLoading(false);
      cache.delete(eventId);
    },
    [db, eventId],
  );
  return [trigger, { loading }];
}

export function useSetReceiptsPushed({
  eventId,
}: {
  eventId: string;
}): MutationTuple<[ids: string[]]> {
  const db = useDB();
  const [loading, setLoading] = useState(false);
  const trigger = useCallback(
    async (ids: string[]) => {
      setLoading(true);
      const store = db
        .transaction("Receipt", "readwrite")
        .objectStore("Receipt");
      await Promise.all(
        ids.map(async (id) => {
          const receipt = await store.get(id);
          if (receipt) await store.put({ ...receipt, pushed: true });
        }),
      );
      setLoading(false);
      cache.delete(eventId);
    },
    [db, eventId],
  );
  return [trigger, { loading }];
}

export function useDeleteReceipts({
  eventId,
}: {
  eventId: string;
}): MutationTuple<[ids: string[]]> {
  const db = useDB();
  const [loading, setLoading] = useState(false);
  const trigger = useCallback(
    async (ids: string[]) => {
      setLoading(true);
      const store = db
        .transaction("Receipt", "readwrite")
        .objectStore("Receipt");
      await Promise.all(ids.map((id) => store.delete(id)));
      setLoading(false);
      cache.delete(eventId);
    },
    [db, eventId],
  );
  return [trigger, { loading }];
}
