import { UnderlinePanels } from '@primer/react/experimental';
import LaunchView from "./views/LaunchView";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from 'react';

function App() {
  const [configPath, setConfigPath] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    invoke<string>("get_config_path").then((path) => {
      setConfigPath(path);
      console.log(path);
    });
  }, []); // ✅ 空数组，保证只调用一次

  const handleCopy = async () => {
    try {
      // Tauri + 浏览器环境都可以用 navigator.clipboard
      await navigator.clipboard.writeText(configPath);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("复制失败", err);
    }
  };

  return (
    <div className="p-1">
      <div className="ml-1 text-sm font-light italic text-gray-600 flex items-center gap-1">
        <span>Configure Files Path:</span>
        <span
          className="hover:underline cursor-pointer select-none"
          onClick={handleCopy}
          title="点击复制"
        >
          {configPath}
        </span>
        {copied && <span className="text-green-500">✓</span>}
      </div>

      <UnderlinePanels aria-label="Select a tab" className="mt-3">
        <UnderlinePanels.Tab>启动</UnderlinePanels.Tab>
        <UnderlinePanels.Tab>资料</UnderlinePanels.Tab>

        <UnderlinePanels.Panel>
          <LaunchView />
        </UnderlinePanels.Panel>
        <UnderlinePanels.Panel>Panel 2</UnderlinePanels.Panel>
      </UnderlinePanels>
    </div>
  );
}

export default App;
