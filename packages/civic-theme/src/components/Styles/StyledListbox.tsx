import tw from "twin.macro";

const baseButtonStyle =
  "relative cursor-default border-[1px] border-secondary border rounded-lg bg-background py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary sm:text-sm";
const baseOptionsStyle =
  "absolute mt-1 max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm";

export const StyledListbox = tw.div`
  [.listbox-content]:(relative mt-1 z-[50])
  [.listbox-content-right]:(relative z-[50])
  [.listbox-button]:(${baseButtonStyle} w-full)
  [.listbox-button-fit-min]:(${baseButtonStyle} w-min)
  [.listbox-button-title]:(block truncate)
  [.listbox-button-icon-container]:(pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2)
  [.listbox-button-icon]:(text-secondary h-5 w-5)
  [.listbox-options]:(${baseOptionsStyle} w-full )
  [.listbox-options-fit-min]:(${baseOptionsStyle} w-min)
  [.listbox-option]:(relative cursor-default select-none py-2 pl-10 pr-4 font-medium text-secondary hover:bg-secondary hover:bg-opacity-10)
  [.listbox-option-title]:(block truncate font-normal flex w-full)
  [.listbox-option-title-selected]:(block truncate font-extrabold flex w-full)
  [.listbox-option-title-type]:(ml-2 w-full pt-[2px] text-right text-xs font-normal text-primary)
  [.listbox-option-selected-icon-container]:(text-secondary absolute inset-y-0 left-0 flex items-center pl-3)
  [.listbox-option-selected-icon]:(h-5 w-5)
`;
