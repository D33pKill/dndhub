import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permitir imágenes de cualquier fuente (para los data URLs de portraits)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
