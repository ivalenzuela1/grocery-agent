import { ManualExportAdapter } from "./manualExport";
import { AmazonFreshBrowserAdapter } from "./amazonFreshBrowser";
import type { OrderAdapter } from "./types";

export * from "./types";
export { buildManualExport, amazonFreshSearchUrl } from "./manualExport";

/**
 * The active ordering adapter. Defaults to manual export (v1). The browser
 * adapter is wired here but gated behind an env flag so it can never
 * accidentally become the default before it's real.
 */
export function getActiveAdapter(): OrderAdapter {
  if (process.env.ORDER_ADAPTER === "amazon-fresh-browser") {
    return new AmazonFreshBrowserAdapter();
  }
  return new ManualExportAdapter();
}
