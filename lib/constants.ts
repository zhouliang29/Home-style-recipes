/** 厨师选项列表 — 全项目通用，新增厨师在此添加即可 */
export const CHEF_OPTIONS = ["周良", "张幸"] as const;

/** 厨师类型 */
export type Chef = (typeof CHEF_OPTIONS)[number];
