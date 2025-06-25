import { invoke } from "@tauri-apps/api/core";
import React from "react";
import { Linker } from "../types/Link";
import { Blankslate, Banner } from "@primer/react/experimental";
import { Button, TextInput } from '@primer/react';
import _ from "lodash";

function WeaponBox({
    linker,
    search,
    setLaunchStatus,
}: {
    linker: Linker;
    search: string;
    setLaunchStatus: (status: string) => void;
}) {
    const lowerSearch = search.toLowerCase();

    const filteredCategories = linker.linker.categories
        .map((category) => {
            const categoryMatch = category.toLowerCase().includes(lowerSearch);

            const filteredWeapons = Object.entries(linker.weapons || {})
                .filter(([weapon_name, weapon]) =>
                    weapon.category === category &&
                    (
                        categoryMatch ||
                        weapon_name.toLowerCase().includes(lowerSearch)
                    )
                )
                .sort(([a], [b]) => a.localeCompare(b));

            return {
                category,
                weapons: filteredWeapons,
                showCategory: categoryMatch || filteredWeapons.length > 0,
            };
        })
        .filter((entry) => entry.showCategory);

    return (
        <div className="flex flex-col mb-2">
            {filteredCategories.map(({ category, weapons }) => (
                <div key={category}>
                    <p className="text-lg my-1">{category}</p>
                    <div className="flex flex-wrap justify-start gap-2">
                        {weapons.map(([weapon_name, _]) => (
                            <Button
                                key={weapon_name}
                                onClick={async () => {
                                    setLaunchStatus(`🚀 正在启动 ${weapon_name}...`);
                                    try {
                                        await invoke("invoke_weapon", { weapon_name });
                                        setLaunchStatus(`✅ ${weapon_name} 启动成功`);
                                    } catch (err) {
                                        console.error(err);
                                        setLaunchStatus(`❌ 启动失败 ${weapon_name}: ${String(err)}`);
                                    }
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
    const [search, setSearch] = React.useState<string>("");
    const [status, setStatus] = React.useState<string>("");

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
        };
        init();
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        if (value.trim().length > 0) {
            setStatus(`🔍 正在搜索`);
        } else {
            setStatus("");
        }
    };

    if (!linker || !linker.linker) {
        return <Blankslate>there is no configuration.</Blankslate>;
    }

    return (
        <div className="flex flex-col p-2 gap-1 m-1">
            {requirements.length !== 0 && (
                <Banner
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
                />
            )}
            <div className="flex gap-2 items-center">
                <TextInput
                    className="w-2/3"
                    size="large"
                    placeholder="搜索类别或名称..."
                    value={search}
                    onChange={handleSearchChange}
                />
                <span className="text-sm">{status}</span>
            </div>
            <WeaponBox linker={linker} search={search} setLaunchStatus={setStatus} />
        </div>
    );
}

export default LaunchView;
