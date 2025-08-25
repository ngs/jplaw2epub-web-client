import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";
import { colors } from "../src/constants";
import type { Plugin } from "vite";

interface FaviconSize {
  size: number;
  filename: string;
}

const faviconSizes: FaviconSize[] = [
  { size: 16, filename: "favicon-16x16.png" },
  { size: 32, filename: "favicon-32x32.png" },
  { size: 48, filename: "favicon-48x48.png" },
  { size: 180, filename: "apple-touch-icon.png" },
  { size: 192, filename: "android-chrome-192x192.png" },
  { size: 512, filename: "android-chrome-512x512.png" },
];

export function faviconGenerator(): Plugin {
  let outDir: string;
  let isProduction = false;

  return {
    name: "favicon-generator",
    configResolved(config) {
      outDir = config.build.outDir;
      isProduction = config.mode === "production";
    },
    async writeBundle() {
      if (!isProduction) return;

      const svgPath = path.resolve(__dirname, "../src/favicon.svg");
      const svgBuffer = await fs.readFile(svgPath);

      // Generate PNG favicons of different sizes
      await Promise.all(
        faviconSizes.map(async ({ size, filename }) => {
          const outputPath = path.join(outDir, filename);
          await sharp(svgBuffer).resize(size, size).png().toFile(outputPath);
          // eslint-disable-next-line no-console
          console.log(`Generated ${filename} (${size}x${size})`);
        }),
      );

      // Copy original SVG as favicon.svg
      const svgOutputPath = path.join(outDir, "favicon.svg");
      await fs.copyFile(svgPath, svgOutputPath);
      // eslint-disable-next-line no-console
      console.log("Copied favicon.svg");

      // Generate ICO file (contains 16x16, 32x32, 48x48)
      const icoPath = path.join(outDir, "favicon.ico");
      const ico16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();
      const ico32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
      const ico48 = await sharp(svgBuffer).resize(48, 48).png().toBuffer();

      // Create ICO file (simplified ICO format)
      const icoBuffer = createIcoFile([
        { size: 16, buffer: ico16 },
        { size: 32, buffer: ico32 },
        { size: 48, buffer: ico48 },
      ]);
      await fs.writeFile(icoPath, icoBuffer);
      // eslint-disable-next-line no-console
      console.log("Generated favicon.ico");

      // Generate site.webmanifest
      const manifest = {
        name: "法令検索・EPUB ダウンロード",
        short_name: "法令 EPUB",
        description:
          "日本の法令をキーワードや法令名、法令番号で検索し、EPUB形式でダウンロードできる無料サービス。憲法、法律、政令、省令など各種法令の全文検索が可能。電子書籍リーダーでオフラインでも法令を閲覧できます。",
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
        theme_color: colors.primary.main,
        background_color: "#ffffff",
        scope: "/",
        start_url: "/",
        display: "standalone",
      };
      const manifestPath = path.join(outDir, "manifest.json");
      await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
      // eslint-disable-next-line no-console
      console.log("Generated manifest.json");
    },
  };
}

function createIcoFile(images: { size: number; buffer: Buffer }[]): Buffer {
  // ICO header
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type (1 = ICO)
  header.writeUInt16LE(images.length, 4); // Number of images

  // Directory entries
  const directorySize = 16 * images.length;
  const directory = Buffer.alloc(directorySize);
  let offset = 6 + directorySize;

  images.forEach((img, index) => {
    const entryOffset = index * 16;
    directory.writeUInt8(img.size === 256 ? 0 : img.size, entryOffset); // Width
    directory.writeUInt8(img.size === 256 ? 0 : img.size, entryOffset + 1); // Height
    directory.writeUInt8(0, entryOffset + 2); // Color palette
    directory.writeUInt8(0, entryOffset + 3); // Reserved
    directory.writeUInt16LE(1, entryOffset + 4); // Color planes
    directory.writeUInt16LE(32, entryOffset + 6); // Bits per pixel
    directory.writeUInt32LE(img.buffer.length, entryOffset + 8); // Size
    directory.writeUInt32LE(offset, entryOffset + 12); // Offset
    offset += img.buffer.length;
  });

  // Combine all parts
  return Buffer.concat([header, directory, ...images.map((img) => img.buffer)]);
}
