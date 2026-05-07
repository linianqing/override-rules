import { parseBool, parseNumber } from "./utils";
import type { FeatureFlags, ScriptArgs } from "./types";

const FEATURE_FLAG_DEFAULTS = {
    loadBalance: false,
    landing: false,
    ipv6Enabled: false,
    fullConfig: false,
    keepAliveEnabled: false,
    fakeIPEnabled: true,
    quicEnabled: false,
    regexFilter: false,
} as const;

type FlagSpec = Record<string, keyof Omit<FeatureFlags, "countryThreshold">>;

/**
 * 解析传入的脚本参数，并将其转换为内部使用的功能开关（feature flags）。
 * @param args - 从外部脚本环境（如 Substore）传入的原始参数对象
 * @returns 经过解析和类型转换后的功能开关集合 `FeatureFlags`
 */
export function buildFeatureFlags(args: ScriptArgs): FeatureFlags {
    const spec: FlagSpec = {
        loadbalance: "loadBalance",
        landing: "landing",
        ipv6: "ipv6Enabled",
        full: "fullConfig",
        keepalive: "keepAliveEnabled",
        fakeip: "fakeIPEnabled",
        quic: "quicEnabled",
        regex: "regexFilter",
    };

    const flags: FeatureFlags = {
        ...FEATURE_FLAG_DEFAULTS,
        countryThreshold: 0,
    };

    for (const [sourceKey, targetKey] of Object.entries(spec)) {
        const rawValue = args[sourceKey];
        if (rawValue === null || typeof rawValue === "undefined") {
            flags[targetKey] = FEATURE_FLAG_DEFAULTS[targetKey];
        } else {
            flags[targetKey] = parseBool(rawValue);
        }
    }

    flags.countryThreshold = parseNumber(args.threshold, 0);
    return flags;
}
