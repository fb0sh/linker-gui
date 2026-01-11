use anyhow::{Context, Result};
use dirs_next::config_dir;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use tokio::process::{Child, Command};
use which::which;

const CREATE_NO_WINDOW: u32 = 0x08000000;
pub fn linker_config_path() -> Result<PathBuf> {
    let path = config_dir()
        .context("无法获取配置目录 (config_dir)")?
        .join("linker")
        .join("linker.toml");
    Ok(path)
}
fn ensure_config_file(path: &std::path::Path) -> Result<()> {
    // 1. 创建父目录（如果不存在）
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)
            .with_context(|| format!("无法创建配置目录: {}", parent.display()))?;
    }

    // 2. 创建文件（如果不存在）
    if !path.exists() {
        std::fs::write(path, "")
            .with_context(|| format!("无法创建配置文件: {}", path.display()))?;
    }

    Ok(())
}
#[derive(Debug, Deserialize, Serialize)]
pub struct Linker {
    #[serde(rename = "linker")]
    linker_meta: LinkerMeta,
    langs: HashMap<String, Lang>,
    references: HashMap<String, Reference>,
    weapons: HashMap<String, Weapon>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct LinkerMeta {
    version: String,
    name: String,
    root: String,
    categories: Vec<String>,
    #[serde(rename = "references_categories")]
    references_categories: Vec<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Lang {
    home: String,
    bin: String,
    #[serde(default)]
    opts: Vec<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Reference {
    category: String,
    link: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Weapon {
    home: String,
    lang: String,
    #[serde(default)]
    lang_opt: Vec<String>,
    file: String,
    #[serde(default)]
    opts: Vec<String>,
    category: String,
    #[serde(default)]
    src: String,
}

impl Linker {
    pub async fn parse() -> Result<(Linker, Vec<String>)> {
        let config_path = linker_config_path()?;
        ensure_config_file(&config_path)?;
        let content =
            std::fs::read_to_string(config_path).context("无法读取配置文件: linker.toml")?;
        let linker: Linker = toml::from_str(&content).context("无法解析配置文件: linker.toml")?;

        let mut requirements = vec![];
        // self check
        for (lang_name, lang) in &linker.langs {
            let target_path = if lang.home.is_empty() {
                // 查系统 PATH 里的可执行文件
                which(&lang.bin)
                    .map(|p| p.into())
                    .unwrap_or_else(|_| PathBuf::from(&lang.bin))
            } else {
                // 检查本地具体路径
                PathBuf::from(&linker.linker_meta.root)
                    .join(&lang.home)
                    .join(&lang.bin)
            };

            if !target_path.exists() {
                requirements.push(format!(
                    "[lang] {} : 路径不存在 {:?}",
                    lang_name, target_path
                ));
            }
        }

        for (weapon_name, weapon) in &linker.weapons {
            let target_path = PathBuf::from(&linker.linker_meta.root)
                .join(&weapon.home)
                .join(&weapon.file);

            if !target_path.exists() {
                requirements.push(format!(
                    "[weapon] {} : 路径不存在 {:?}",
                    weapon_name, target_path
                ));
            }
        }

        Ok((linker, requirements))
    }

    // 刷新配置
    pub async fn refresh(&mut self) -> Result<()> {
        *self = Linker::parse().await?.0;
        Ok(())
    }

    pub async fn invoke_weapon(&self, weapon_name: String) -> Result<Child> {
        let weapon = self
            .weapons
            .get(&weapon_name)
            .context(format!("[weapon] {} 未设置", &weapon_name))?;

        let lang = self
            .langs
            .get(&weapon.lang)
            .context(format!("[lang] {} 未设置", &weapon.lang))?;

        let program = if lang.home.is_empty() {
            lang.bin.clone()
        } else {
            PathBuf::from(&self.linker_meta.root)
                .join(&lang.home)
                .join(&lang.bin)
                .to_string_lossy()
                .into_owned()
        };

        let target_home = PathBuf::from(&self.linker_meta.root).join(&weapon.home);

        let target_file = &target_home.join(&weapon.file);
        let mut c = Command::new(&program);
        c.args(&lang.opts) // 全局语言选项
            .args(&weapon.lang_opt) // 语言选项
            .arg(target_file)
            .args(&weapon.opts)
            .current_dir(target_home);

        // Windows 平台才设置 CREATE_NO_WINDOW
        #[cfg(windows)]
        {
            use std::os::windows::process::CommandExt; // 扩展 trait
            c.creation_flags(CREATE_NO_WINDOW); // CREATE_NO_WINDOW
        }

        let c = c
            .spawn()
            .context(format!("[weapon] {} 无法启动", &weapon_name))?;
        Ok(c)
    }

    pub async fn launch_reference(&self, reference_name: String) -> Result<Child> {
        let reference = self
            .references
            .get(&reference_name)
            .context(format!("[reference] {} 未设置", &reference_name))?;

        let system = self.langs.get("system").context("lang.system 未设置")?;

        let mut c = Command::new(&system.bin);
        c.args(&system.opts).arg(&reference.link);

        // Windows 平台才设置 CREATE_NO_WINDOW
        #[cfg(windows)]
        {
            use std::os::windows::process::CommandExt; // 扩展 trait
            c.creation_flags(CREATE_NO_WINDOW); // CREATE_NO_WINDOW
        }

        let c = c
            .spawn()
            .context(format!("[reference] {} 无法打开", &reference_name))?;
        Ok(c)
    }
}

#[tokio::test]
async fn test_parse() {
    let (linker, requirements) = Linker::parse().await.unwrap();
    println!("{:?}", linker);
    println!("{:?}", requirements);
    linker.invoke_weapon("菜刀".into()).await.unwrap();
}
