import { MakerZIP } from "@electron-forge/maker-zip";
import { AutoUnpackNativesPlugin } from "@electron-forge/plugin-auto-unpack-natives";
import { WebpackPlugin } from "@electron-forge/plugin-webpack";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";

export default async () => {
  const { mainConfig } = await import("./webpack.main.config.ts");
  const { rendererConfig } = await import("./webpack.renderer.config.ts");

  return {
    packagerConfig: {
      icon: "./assets/icon.icns",
      name: "Kettle Panels",
      asar: true,
    },
    rebuildConfig: {},
    makers: [new MakerZIP({}, ["darwin"])],
    plugins: [
      new AutoUnpackNativesPlugin({}),
      new WebpackPlugin({
        mainConfig,
        renderer: {
          config: rendererConfig,
          entryPoints: [
            {
              html: "./src/index.html",
              js: "./src/renderer.ts",
              name: "main_window",
              preload: {
                js: "./src/preload.ts",
              },
            },
          ],
        },
      }),
      // Fuses are used to enable/disable various Electron functionality
      // at package time, before code signing the application
      new FusesPlugin({
        version: FuseVersion.V1,
        [FuseV1Options.RunAsNode]: false,
        [FuseV1Options.EnableCookieEncryption]: true,
        [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
        [FuseV1Options.EnableNodeCliInspectArguments]: false,
        [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
        [FuseV1Options.OnlyLoadAppFromAsar]: true,
      }),
    ],
  };
};
