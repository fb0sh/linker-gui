
import { UnderlinePanels } from '@primer/react/experimental'
import LaunchView from "./views/LaunchView";



function App() {

  return (
    <UnderlinePanels aria-label="Select a tab">

      <UnderlinePanels.Tab>启动</UnderlinePanels.Tab>
      <UnderlinePanels.Tab>资料</UnderlinePanels.Tab>

      <UnderlinePanels.Panel>
        <LaunchView />
      </UnderlinePanels.Panel>
      <UnderlinePanels.Panel>Panel 2</UnderlinePanels.Panel>
    </UnderlinePanels>
  );
}

export default App;
