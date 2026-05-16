import { useEffect, useState } from "react";

export type Config = {
  api_endpoint: string;
};

export default function useConfig() {
  const [config, setConfig] = useState<Config | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      const response = await fetch("/next-api/configs");
      const data = await response.json();
      setConfig(data);
    }

    fetchConfig();
  }, []);

  return config;
}