const SelectBlockBadge = ({ text }: { text: string }) => {
  return (
    <div className="flex-1 overflow-x-hidden truncate text-default-font rounded-sm p-[2px] text-[0.5rem] border-solid border-neutral-border bg-neutral-100">
      {text}
    </div>
  );
};

export default SelectBlockBadge;
