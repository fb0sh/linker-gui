import { invoke } from "@tauri-apps/api/core";
import React from "react";
import { Linker } from "../types/Link";
import { Blankslate, Banner } from "@primer/react/experimental";
import { Button, TextInput } from '@primer/react'
import _ from "lodash";

function WeaponBox({ linker }: { linker: Linker }) {
    return (
        <div className="flex flex-col mb-2">

            {linker && linker.linker.categories.map((category, _) => (
                <div key={category}>

                    <p className="text-lg my-1">{category}</p>
                    <div className="flex flex-wrap justify-start gap-2">
                        {linker.weapons &&
                            Object.entries(linker.weapons)
                                .filter(([_, weapon]) => weapon.category === category)
                                .sort(([a], [b]) => a.localeCompare(b)) // 按 weapon_name 排序
                                .map(([weapon_name, _]) => (
                                    <Button
                                        key={weapon_name}
                                        onClick={async () => {
                                            await invoke("invoke_weapon", { weapon_name });
                                        }}
                                        className="w-[220px] text-center whitespace-nowrap overflow-hidden"
                                    >
                                        {weapon_name}
                                    </Button>
                                ))}
                    </div>

                </div>
            ))}

        </div>
    );
}


function LaunchView() {
    const [linker, setLinker] = React.useState<Linker | null>(null);
    const [requirements, setRequirements] = React.useState<string[]>([]);

    React.useEffect(() => {
        const init = async () => {
            try {
                const [linker, res]: [Linker, string[]] = await invoke("get_linker");
                setLinker(linker);
                setRequirements(res);
                console.log(linker);
                console.log(res);
            } catch (e) {
                console.error(e);
            }
        }
        init();

    }, [])
    if (linker && linker.linker) {
        return <div className="flex flex-col p-2 gap-1">
            {requirements.length !== 0 && <Banner
                aria-label="Critical"
                title="相关配置缺失"
                description={
                    <div>
                        {requirements.map((line, index) => (
                            <div key={index}>{line}</div>
                        ))}
                    </div>
                }
                variant="critical"
            />}
            <div className="flex">
                <TextInput className="w-2/3" size="large" placeholder="Search ..." />
                <span>123</span>
            </div>
            <WeaponBox linker={linker} />
        </div>
    }
    return <Blankslate>there is no configuration.</Blankslate>;
}


export default LaunchView;