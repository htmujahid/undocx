import type { IconProps } from "@phosphor-icons/react";
import {
  IdentificationCardIcon as IdentificationCard,
  ListChecksIcon as ListChecks,
  MicrophoneIcon as Microphone,
  ArrowClockwiseIcon as ArrowClockwise,
  ArrowCounterClockwiseIcon as ArrowCounterClockwise,
  ArrowDownIcon as ArrowDown,
  ArrowLeftIcon as ArrowLeft,
  ArrowLineDownIcon as ArrowLineDown,
  ArrowsInSimpleIcon as ArrowsInSimple,
  ArrowsOutSimpleIcon as ArrowsOutSimple,
  ArrowsClockwiseIcon as ArrowsClockwise,
  ArrowSquareOutIcon as ArrowSquareOut,
  ArrowUpIcon as ArrowUp,
  ArrowUUpLeftIcon as ArrowUUpLeft,
  BookOpenTextIcon as BookOpenText,
  CaretDownIcon as CaretDown,
  CheckIcon as Check,
  ChatCircleTextIcon as ChatCircleText,
  CheckSquareIcon as CheckSquare,
  CircleNotchIcon as CircleNotch,
  CodeIcon as Code,
  ClipboardTextIcon as ClipboardText,
  ColumnsIcon as Columns,
  CopyIcon as Copy,
  DotsSixVerticalIcon as DotsSixVertical,
  DownloadSimpleIcon as DownloadSimple,
  FileDashedIcon as FileDashed,
  FileTextIcon as FileText,
  GoogleLogoIcon as GoogleLogo,
  LinkBreakIcon as LinkBreak,
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
  PlusIcon as Plus,
  QuotesIcon as Quotes,
  SealCheckIcon as SealCheck,
  SidebarSimpleIcon as SidebarSimple,
  SignOutIcon as SignOut,
  SparkleIcon as Sparkle,
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
  TrashIcon as Trash,
  UploadSimpleIcon as UploadSimple,
  UserCircleIcon as UserCircle,
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
export const GoogleIcon = withWeight(GoogleLogo);
export const SignOutIcon = withWeight(SignOut);
export const UserCircleIcon = withWeight(UserCircle);
export const ExternalLinkIcon = withWeight(ArrowSquareOut);
export const UnlinkIcon = withWeight(LinkBreak);
export const PlusIcon = withWeight(Plus);
export const MinusIcon = withWeight(Minus);
export const GripIcon = withWeight(DotsSixVertical);
export const SparkleIcon = withWeight(Sparkle);
export const ClaimsCheckIcon = withWeight(SealCheck);
export const CitationIcon = withWeight(BookOpenText);
export const PageSetupIcon = withWeight(FileDashed);
export const PageBreakIcon = withWeight(ArrowLineDown);
export const ArrowLeftIcon = withWeight(ArrowLeft);
export const DuplicateIcon = withWeight(Copy);
export const ClipboardIcon = withWeight(ClipboardText);
export const TrashIcon = withWeight(Trash);
export const ProfileIcon = withWeight(IdentificationCard);
export const RulesIcon = withWeight(ListChecks);
export const VoiceIcon = withWeight(Microphone);
