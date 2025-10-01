import TooltipWrapper from '@/components/ui/TooltipWrapper';
import { IconButton } from '@/components/ui/IconButton';

type EditorButtonPropTyp = {
    icon: React.ReactNode,
    tooltip: string,
    command?: () => void,
    isActive?: boolean,
    disabled?: boolean
}

const EditorButton = ({ icon, tooltip, command, isActive, disabled }: EditorButtonPropTyp) => (
    <TooltipWrapper tooltipText={tooltip}>
      <IconButton
        icon={icon}
        size="small"
        onClick={command}
        disabled={disabled}
        className={isActive ? "bg-black" : ""}
      />
    </TooltipWrapper>
  );

  export default EditorButton