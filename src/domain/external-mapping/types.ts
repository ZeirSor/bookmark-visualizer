export type ExternalProvider = "browser" | "cloud" | "notion";

export type ExternalMappingSyncStatus = "synced" | "pending" | "conflict" | "deleted";

export interface ExternalMapping {
  id: string;
  localRecordId: string;
  provider: ExternalProvider;
  externalId: string;
  externalUrl?: string;
  lastSyncedAt?: string;
  syncStatus: ExternalMappingSyncStatus;
}
