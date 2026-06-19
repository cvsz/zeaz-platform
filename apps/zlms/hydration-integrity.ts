import {
  installHydrationMutationGuard,
  snapshotHydrationRoot,
  validateHydrationRoot,
  type HydrationSnapshot
} from './frontend/runtime/hydration-guard';

export type HydrationIntegrityController = Readonly<{
  snapshot: HydrationSnapshot;
  observer: MutationObserver;
  validate: () => Promise<boolean>;
  disconnect: () => void;
}>;

export async function protectHydrationRoot(root: Element): Promise<HydrationIntegrityController> {
  const snapshot = await snapshotHydrationRoot(root);
  const observer = installHydrationMutationGuard(root);

  return {
    snapshot,
    observer,
    validate: () => validateHydrationRoot(root, snapshot),
    disconnect: () => observer.disconnect()
  };
}

export { snapshotHydrationRoot, validateHydrationRoot };
