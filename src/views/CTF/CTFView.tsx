import { UnderlinePanels } from '@primer/react/experimental'
import ByPassRCE from './ByPassRCE';
function CTFView() {
    return (
        <UnderlinePanels aria-label="Select a tab">

            <UnderlinePanels.Tab>命令执行绕过</UnderlinePanels.Tab>
            <UnderlinePanels.Panel>
                <ByPassRCE />
            </UnderlinePanels.Panel>
        </UnderlinePanels>
    );
}

export default CTFView;