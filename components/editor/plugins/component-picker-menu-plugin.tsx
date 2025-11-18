"use client";

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { JSX, useCallback, useMemo, useState } from "react";

import { createPortal } from "react-dom";

import dynamic from "next/dynamic";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useBasicTypeaheadTriggerMatch } from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { TextNode } from "lexical";

import { useEditorModal } from "@/components/editor/editor-hooks/use-modal";
import { Command, CommandGroup, CommandList } from "@/components/ui/command";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

import { ComponentPickerOption } from "./picker/component-picker-option";

const LexicalTypeaheadMenuPlugin = dynamic(
  () =>
    import("@lexical/react/LexicalTypeaheadMenuPlugin").then(
      (mod) => mod.LexicalTypeaheadMenuPlugin<ComponentPickerOption>,
    ),
  { ssr: false },
);

export function ComponentPickerMenuPlugin({
  baseOptions = [],
  dynamicOptionsFn,
}: {
  baseOptions?: Array<ComponentPickerOption>;
  dynamicOptionsFn?: ({
    queryString,
  }: {
    queryString: string;
  }) => Array<ComponentPickerOption>;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [modal, showModal] = useEditorModal();
  const [queryString, setQueryString] = useState<string | null>(null);

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0,
  });

  const options = useMemo(() => {
    if (!queryString) {
      return baseOptions;
    }

    const regex = new RegExp(queryString, "i");

    return [
      ...(dynamicOptionsFn?.({ queryString }) || []),
      ...baseOptions.filter(
        (option) =>
          regex.test(option.title) ||
          option.keywords.some((keyword) => regex.test(keyword)),
      ),
    ];
  }, [queryString, baseOptions, dynamicOptionsFn]);

  const onSelectOption = useCallback(
    (
      selectedOption: ComponentPickerOption,
      nodeToRemove: TextNode | null,
      closeMenu: () => void,
      matchingString: string,
    ) => {
      editor.update(() => {
        nodeToRemove?.remove();
        selectedOption.onSelect(matchingString, editor, showModal);
        closeMenu();
      });
    },
    [editor, showModal],
  );

  return (
    <>
      {modal}
      <LexicalTypeaheadMenuPlugin
        onQueryChange={setQueryString}
        onSelectOption={onSelectOption}
        triggerFn={checkForTriggerMatch}
        options={options}
        menuRenderFn={(
          anchorElementRef,
          { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
        ) => {
          return anchorElementRef.current && options.length
            ? createPortal(
                <div className="bg-popover fixed z-10 w-[280px] rounded-lg border shadow-lg">
                  <Command
                    className="rounded-lg"
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setHighlightedIndex(
                          selectedIndex !== null
                            ? (selectedIndex - 1 + options.length) %
                                options.length
                            : options.length - 1,
                        );
                      } else if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setHighlightedIndex(
                          selectedIndex !== null
                            ? (selectedIndex + 1) % options.length
                            : 0,
                        );
                      }
                    }}
                  >
                    <CommandList className="max-h-[320px] overflow-y-auto">
                      <CommandGroup className="p-1.5">
                        {options.map((option, index) => (
                          <Item
                            key={option.key}
                            size="sm"
                            className={`hover:bg-accent cursor-pointer gap-2 rounded-sm px-2 py-1.5 ${
                              selectedIndex === index
                                ? "bg-accent"
                                : "bg-transparent"
                            }`}
                            onClick={() => {
                              selectOptionAndCleanUp(option);
                            }}
                          >
                            {option.icon && (
                              <ItemMedia
                                variant="icon"
                                className="size-6 [&_svg]:size-3.5"
                              >
                                {option.icon}
                              </ItemMedia>
                            )}
                            <ItemContent className="gap-0">
                              <ItemTitle className="text-xs font-medium">
                                {option.title}
                              </ItemTitle>
                              {option.description && (
                                <ItemDescription className="line-clamp-1 text-xs">
                                  {option.description}
                                </ItemDescription>
                              )}
                            </ItemContent>
                          </Item>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </div>,
                anchorElementRef.current,
              )
            : null;
        }}
      />
    </>
  );
}
