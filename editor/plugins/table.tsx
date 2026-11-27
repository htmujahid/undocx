"use client";

import { EditorStateExtension } from "@lexical/extension";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useExtensionDependency } from "@lexical/react/useExtensionComponent";
import { useSignalValue } from "@lexical/react/useExtensionSignalValue";
import {
  $computeTableMap,
  $deleteTableColumnAtSelection,
  $deleteTableRowAtSelection,
  $getTableCellNodeFromLexicalNode,
  $getTableNodeFromLexicalNodeOrThrow,
  $getTableRowIndexFromTableCellNode,
  $insertTableColumnAtSelection,
  $insertTableRowAtSelection,
  $isTableSelection,
  $setTableColumnIsHeader,
  $setTableRowIsHeader,
  INSERT_TABLE_COMMAND,
  TableCellHeaderStates,
  type TableCellNode,
} from "@lexical/table";
import { $getSelection, $isRangeSelection, type LexicalNode } from "lexical";
import { useState, type FormEvent } from "react";
import { Button } from "~@/components/ui/button";
import { Field, FieldLabel } from "~@/components/ui/field";
import { CheckIcon, MinusIcon, PlusIcon, TableIcon } from "~@/components/ui/icons";
import { Menu, MenuContent, MenuGroup, MenuGroupLabel, MenuItem, MenuSeparator, MenuTrigger } from "~@/components/ui/menu";
import { NumberInput, NumberInputControl, NumberInputDecrement, NumberInputGroup, NumberInputIncrement } from "~@/components/ui/number-input";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "~@/components/ui/popover";
import { ToolbarButton } from "~@/components/ui/toolbar";
import { Tooltip, TooltipContent, TooltipTrigger } from "~@/components/ui/tooltip";
import { cn } from "~@/lib/utils";

export type TableState = { inTable: false } | { inTable: true; rowHeader: boolean; columnHeader: boolean; striping: boolean };

function $getSelectionCell(): TableCellNode | null {
  const selection = $getSelection();
  const node: LexicalNode | null = $isRangeSelection(selection) || $isTableSelection(selection) ? selection.anchor.getNode() : null;
  return node ? $getTableCellNodeFromLexicalNode(node) : null;
}

export function $getTableState(): TableState {
  const cell = $getSelectionCell();
  if (!cell) return { inTable: false };
  return {
    inTable: true,
    rowHeader: cell.hasHeaderState(TableCellHeaderStates.ROW),
    columnHeader: cell.hasHeaderState(TableCellHeaderStates.COLUMN),
    striping: $getTableNodeFromLexicalNodeOrThrow(cell).getRowStriping(),
  };
}

export function useTableState() {
  const editorState = useSignalValue(useExtensionDependency(EditorStateExtension).output);
  return editorState.read(() => $getTableState());
}

type TableAction = "row-above" | "row-below" | "delete-row" | "column-left" | "column-right" | "delete-column" | "row-header" | "column-header" | "striping" | "delete-table";

function $runTableAction(action: TableAction) {
  const cell = $getSelectionCell();
  if (!cell) return;
  switch (action) {
    case "row-above":
      return void $insertTableRowAtSelection(false);
    case "row-below":
      return void $insertTableRowAtSelection(true);
    case "delete-row":
      return $deleteTableRowAtSelection();
    case "column-left":
      return void $insertTableColumnAtSelection(false);
    case "column-right":
      return void $insertTableColumnAtSelection(true);
    case "delete-column":
      return $deleteTableColumnAtSelection();
    case "row-header": {
      const table = $getTableNodeFromLexicalNodeOrThrow(cell);
      return $setTableRowIsHeader(table, $getTableRowIndexFromTableCellNode(cell), !cell.hasHeaderState(TableCellHeaderStates.ROW));
    }
    case "column-header": {
      const table = $getTableNodeFromLexicalNodeOrThrow(cell);
      const [, cellMap] = $computeTableMap(table, cell, cell);
      return $setTableColumnIsHeader(table, cellMap.startColumn, !cell.hasHeaderState(TableCellHeaderStates.COLUMN));
    }
    case "striping": {
      const table = $getTableNodeFromLexicalNodeOrThrow(cell);
      return void table.setRowStriping(!table.getRowStriping());
    }
    case "delete-table": {
      const table = $getTableNodeFromLexicalNodeOrThrow(cell);
      table.selectPrevious();
      return table.remove();
    }
  }
}

const triggerClass = "inline-flex h-8 min-w-8 items-center justify-center gap-1.5 rounded-md px-2 text-sm text-foreground outline-none hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring data-open:bg-primary/10 [&_svg]:size-4";

function Check({ on }: { on: boolean }) {
  return <CheckIcon className={cn("size-3.5 text-primary", on ? "visible" : "invisible")} />;
}

export function TableControl() {
  const [editor] = useLexicalComposerContext();
  const state = useTableState();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<number | null>(3);
  const [columns, setColumns] = useState<number | null>(3);

  function insert(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    editor.dispatchCommand(INSERT_TABLE_COMMAND, { rows: String(rows ?? 3), columns: String(columns ?? 3), includeHeaders: { rows: true, columns: false } });
    setOpen(false);
  }

  if (state.inTable) {
    return (
      <Menu onAction={(value) => editor.update(() => $runTableAction(value as TableAction))}>
        <Tooltip>
          <TooltipTrigger render={<MenuTrigger aria-label="Table" className={triggerClass} />}>
            <TableIcon />
          </TooltipTrigger>
          <TooltipContent>Table</TooltipContent>
        </Tooltip>
        <MenuContent align="start" className="min-w-52">
          <MenuGroup>
            <MenuGroupLabel>Rows</MenuGroupLabel>
            <MenuItem value="row-above">Insert row above</MenuItem>
            <MenuItem value="row-below">Insert row below</MenuItem>
            <MenuItem value="delete-row">Delete row</MenuItem>
          </MenuGroup>
          <MenuSeparator />
          <MenuGroup>
            <MenuGroupLabel>Columns</MenuGroupLabel>
            <MenuItem value="column-left">Insert column left</MenuItem>
            <MenuItem value="column-right">Insert column right</MenuItem>
            <MenuItem value="delete-column">Delete column</MenuItem>
          </MenuGroup>
          <MenuSeparator />
          <MenuGroup>
            <MenuGroupLabel>Style</MenuGroupLabel>
            <MenuItem value="row-header" closeOnSelect={false} trailing={<Check on={state.rowHeader} />}>
              Row header
            </MenuItem>
            <MenuItem value="column-header" closeOnSelect={false} trailing={<Check on={state.columnHeader} />}>
              Column header
            </MenuItem>
            <MenuItem value="striping" closeOnSelect={false} trailing={<Check on={state.striping} />}>
              Row striping
            </MenuItem>
          </MenuGroup>
          <MenuSeparator />
          <MenuItem value="delete-table" destructive>
            Delete table
          </MenuItem>
        </MenuContent>
      </Menu>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger render={<PopoverTrigger render={<ToolbarButton aria-label="Insert table" />} />}>
          <TableIcon />
        </TooltipTrigger>
        <TooltipContent>Insert table</TooltipContent>
      </Tooltip>
      <PopoverContent align="start" className="w-64" initialFocus="input">
        <form onSubmit={insert} className="grid gap-3">
          <PopoverTitle>Insert table</PopoverTitle>
          <div className="grid grid-cols-2 gap-2">
            <Field name="rows">
              <FieldLabel>Rows</FieldLabel>
              <NumberInput value={rows} onValueChange={setRows} min={1} max={50} step={1} required>
                <NumberInputGroup>
                  <NumberInputDecrement aria-label="Fewer rows">
                    <MinusIcon />
                  </NumberInputDecrement>
                  <NumberInputControl />
                  <NumberInputIncrement aria-label="More rows">
                    <PlusIcon />
                  </NumberInputIncrement>
                </NumberInputGroup>
              </NumberInput>
            </Field>
            <Field name="columns">
              <FieldLabel>Columns</FieldLabel>
              <NumberInput value={columns} onValueChange={setColumns} min={1} max={12} step={1} required>
                <NumberInputGroup>
                  <NumberInputDecrement aria-label="Fewer columns">
                    <MinusIcon />
                  </NumberInputDecrement>
                  <NumberInputControl />
                  <NumberInputIncrement aria-label="More columns">
                    <PlusIcon />
                  </NumberInputIncrement>
                </NumberInputGroup>
              </NumberInput>
            </Field>
          </div>
          <Button type="submit" size="sm" variant="primary" className="justify-self-end">
            Insert
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
