import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group';

interface AssistantMessageInputProps {
  value: string;
  maxLength: number;
  isBusy: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export function AssistantMessageInput({
  value,
  maxLength,
  isBusy,
  onChange,
  onSubmit,
}: AssistantMessageInputProps) {
  return (
    <Field>
      <FieldLabel htmlFor="assistant-message-input">Message</FieldLabel>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <InputGroup>
          <InputGroupTextarea
            id="assistant-message-input"
            placeholder="What events am I attending this week?"
            value={value}
            onChange={(event) => onChange(event.currentTarget.value)}
            maxLength={maxLength}
            disabled={isBusy}
          />
          <InputGroupAddon align="block-end">
            <InputGroupText>
              {value.length}/{maxLength}
            </InputGroupText>
            <InputGroupButton
              type="submit"
              variant="default"
              size="sm"
              className="ml-auto"
              disabled={isBusy || value.trim().length === 0}
            >
              {isBusy ? 'Streaming...' : 'Send'}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>
      <FieldDescription>
        Ask about upcoming events, participants, locations, and tag-based public
        events.
      </FieldDescription>
    </Field>
  );
}
