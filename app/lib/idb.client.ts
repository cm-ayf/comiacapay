import { type IDBPDatabase, type DBSchema, openDB } from "idb";
import type { InferOutput } from "valibot";
import type { ClientReceipt, CreateReceipt } from "./schema";
import { Snowflake } from "./snowflake";

// fetcher.submit(receipts) requires implicit index signature for string
export type IDBReceipt = InferOutput<typeof CreateReceipt> & {
  eventId: string;
  pushed: boolean;
  deleted?: boolean;
};

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

export async function getReceipts(eventId: string): Promise<IDBReceipt[]> {
  const db = await init();
  const receipts = await db.getAllFromIndex("Receipt", "eventId", eventId);
  return receipts
    .filter((receipt) => !receipt.deleted)
    .toSorted((a, b) => {
      const aSnowflake = Snowflake.parse(a.id);
      const bSnowflake = Snowflake.parse(b.id);
      if (aSnowflake && bSnowflake)
        return bSnowflake.timestamp - aSnowflake.timestamp;
      else return 0;
    });
}

export async function addReceipt(
  eventId: string,
  receipt: InferOutput<typeof CreateReceipt>,
) {
  const db = await init();
  await db.add("Receipt", { ...receipt, eventId, pushed: false });
}

export async function setReceiptsPushed(receipts: ClientReceipt[]) {
  const db = await init();
  const tx = db.transaction("Receipt", "readwrite");
  const store = tx.objectStore("Receipt");
  for (const receipt of receipts) {
    await store.put({ ...receipt, pushed: true });
  }
  await tx.done;
}

export async function setReceiptsDeleted(ids: string[]) {
  const db = await init();
  const tx = db.transaction("Receipt", "readwrite");
  const store = tx.objectStore("Receipt");
  for (const id of ids) {
    const receipt = await store.get(id);
    if (receipt) await store.put({ ...receipt, deleted: true });
  }
  await tx.done;
}
