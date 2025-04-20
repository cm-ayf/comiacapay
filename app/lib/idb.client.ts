import { type IDBPDatabase, type DBSchema, openDB } from "idb";
import type { ClientReceipt, CreateReceiptOutput } from "./schema";

export interface IDBReceipt extends CreateReceiptOutput {
  eventId: string;
  pushed: boolean;
  deleted?: boolean;
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
  // eslint-disable-next-line no-var
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
    .sort((a, b) => a.id.localeCompare(b.id));
}

export async function addReceipt(
  eventId: string,
  receipt: CreateReceiptOutput,
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
