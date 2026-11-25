import type { IconProps } from "@phosphor-icons/react";
import {
  ArrowClockwiseIcon as ArrowClockwise,
  ArrowCounterClockwiseIcon as ArrowCounterClockwise,
  ArrowDownIcon as ArrowDown,
  ArrowsInSimpleIcon as ArrowsInSimple,
  ArrowsOutSimpleIcon as ArrowsOutSimple,
  ArrowsClockwiseIcon as ArrowsClockwise,
  ArrowUpIcon as ArrowUp,
  ArrowUUpLeftIcon as ArrowUUpLeft,
  CaretDownIcon as CaretDown,
  CheckIcon as Check,
  ChatCircleTextIcon as ChatCircleText,
  CheckSquareIcon as CheckSquare,
  CircleNotchIcon as CircleNotch,
  CodeIcon as Code,
  ColumnsIcon as Columns,
  DownloadSimpleIcon as DownloadSimple,
  FileTextIcon as FileText,
  LinkIcon as LinkSimple,
  ListBulletsIcon as ListBullets,
  ListIcon as List,
  ListNumbersIcon as ListNumbers,
  LockIcon as Lock,
  LockOpenIcon as LockOpen,
  MagnifyingGlassIcon as MagnifyingGlass,
  MinusIcon as Minus,
  MonitorIcon as Monitor,
  MoonIcon as Moon,
  NoteIcon as Note,
  ParagraphIcon as Paragraph,
  QuotesIcon as Quotes,
  SidebarSimpleIcon as SidebarSimple,
  SunIcon as Sun,
  TableIcon as Table,
  TextAlignCenterIcon as TextAlignCenter,
  TextAlignJustifyIcon as TextAlignJustify,
  TextAlignLeftIcon as TextAlignLeft,
  TextAlignRightIcon as TextAlignRight,
  TextAaIcon as TextAa,
  TextBIcon as TextB,
  TextHOneIcon as TextHOne,
  TextHThreeIcon as TextHThree,
  TextHTwoIcon as TextHTwo,
  TextItalicIcon as TextItalic,
  TextStrikethroughIcon as TextStrikethrough,
  UploadSimpleIcon as UploadSimple,
  XIcon as X,
} from "@phosphor-icons/react/dist/ssr";
import type { ComponentType } from "react";

function withWeight(Icon: ComponentType<IconProps>) {
  return function ThemedIcon(props: IconProps) {
    return <Icon weight="regular" aria-hidden="true" {...props} />;
  };
}

export const ArrowDownIcon = withWeight(ArrowDown);
export const ArrowUpIcon = withWeight(ArrowUp);
export const CheckIcon = withWeight(Check);
export const ChevronDownIcon = withWeight(CaretDown);
export const DownloadIcon = withWeight(DownloadSimple);
export const FileTextIcon = withWeight(FileText);
export const Link2Icon = withWeight(LinkSimple);
export const LoaderCircleIcon = withWeight(CircleNotch);
export const LockIcon = withWeight(Lock);
export const LockOpenIcon = withWeight(LockOpen);
export const MenuIcon = withWeight(List);
export const RefreshCwIcon = withWeight(ArrowsClockwise);
export const Undo2Icon = withWeight(ArrowUUpLeft);
export const UploadIcon = withWeight(UploadSimple);
export const XIcon = withWeight(X);
export const UndoIcon = withWeight(ArrowCounterClockwise);
export const RedoIcon = withWeight(ArrowClockwise);
export const BoldIcon = withWeight(TextB);
export const ItalicIcon = withWeight(TextItalic);
export const StrikethroughIcon = withWeight(TextStrikethrough);
export const BulletListIcon = withWeight(ListBullets);
export const NumberedListIcon = withWeight(ListNumbers);
export const QuoteIcon = withWeight(Quotes);
export const ColumnsIcon = withWeight(Columns);
export const SidebarIcon = withWeight(SidebarSimple);
export const CodeIcon = withWeight(Code);
export const TaskListIcon = withWeight(CheckSquare);
export const RuleIcon = withWeight(Minus);
export const TableIcon = withWeight(Table);
export const AlignLeftIcon = withWeight(TextAlignLeft);
export const AlignCenterIcon = withWeight(TextAlignCenter);
export const AlignRightIcon = withWeight(TextAlignRight);
export const AlignJustifyIcon = withWeight(TextAlignJustify);
export const FocusIcon = withWeight(ArrowsOutSimple);
export const UnfocusIcon = withWeight(ArrowsInSimple);
export const AssistantIcon = withWeight(ChatCircleText);
export const SearchIcon = withWeight(MagnifyingGlass);
export const NoteIcon = withWeight(Note);
export const ParagraphIcon = withWeight(Paragraph);
export const Heading1Icon = withWeight(TextHOne);
export const Heading2Icon = withWeight(TextHTwo);
export const Heading3Icon = withWeight(TextHThree);
export const SunIcon = withWeight(Sun);
export const MoonIcon = withWeight(Moon);
export const MonitorIcon = withWeight(Monitor);
export const TypeIcon = withWeight(TextAa);
