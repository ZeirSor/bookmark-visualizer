import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

type ExtensionManifest = {
  action?: {
    default_title?: string;
    default_icon?: Record<string, string>;
    default_popup?: string;
  };
  background?: {
    service_worker?: string;
    type?: string;
  };
  chrome_url_overrides?: {
    newtab?: string;
  };
  icons?: Record<string, string>;
  optional_host_permissions?: string[];
  permissions?: string[];
  commands?: Record<
    string,
    {
      suggested_key?: string | Record<string, string>;
      description?: string;
    }
  >;
};

const root = resolve(fileURLToPath(new URL("../../..", import.meta.url)));
const manifestPath = resolve(root, "public/manifest.json");

function readManifest(): ExtensionManifest {
  return JSON.parse(readFileSync(manifestPath, "utf8")) as ExtensionManifest;
}

describe("extension manifest", () => {
  it("does not override the browser new tab page", () => {
    const manifest = readManifest();

    expect(manifest.chrome_url_overrides).toBeUndefined();
  });

  it("configures a toolbar action that opens through the service worker", () => {
    const manifest = readManifest();

    expect(manifest.action?.default_title).toBe("Open Bookmark Visualizer");
    expect(manifest.action?.default_popup).toBeUndefined();
    expect(manifest.background).toEqual({
      service_worker: "service-worker.js",
      type: "module"
    });
    expect(existsSync(resolve(root, "src/service-worker.ts"))).toBe(true);
  });

  it("declares only expected permissions", () => {
    const manifest = readManifest();

    expect(manifest.permissions).toEqual([
      "bookmarks",
      "storage",
      "activeTab",
      "scripting",
      "tabs"
    ]);
    expect(manifest.optional_host_permissions).toEqual(["http://*/*", "https://*/*"]);
  });

  it("declares the quick-save keyboard command", () => {
    const manifest = readManifest();

    expect(manifest.commands?.["open-quick-save"]).toEqual({
      suggested_key: {
        default: "Ctrl+Shift+S",
        mac: "Command+Shift+S"
      },
      description: "Save the current page to Bookmark Visualizer"
    });
  });

  it("uses existing PNG assets for manifest and toolbar icons", () => {
    const manifest = readManifest();
    const expectedIcons = {
      "16": "icons/icon-16.png",
      "32": "icons/icon-32.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    };

    expect(manifest.icons).toEqual(expectedIcons);
    expect(manifest.action?.default_icon).toEqual(expectedIcons);

    for (const iconPath of Object.values(expectedIcons)) {
      expect(iconPath.endsWith(".png")).toBe(true);
      expect(existsSync(resolve(root, "public", iconPath))).toBe(true);
    }
  });
});
