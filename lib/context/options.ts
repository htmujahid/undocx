export type Option = { value: string; label: string };

export const audienceLevels: Option[] = [
  { value: "general", label: "General readers, non-technical" },
  { value: "informed", label: "Familiar with the field" },
  { value: "expert", label: "Specialists" },
];

export function isOption(list: readonly Option[], value: string) {
  return list.some((option) => option.value === value);
}
