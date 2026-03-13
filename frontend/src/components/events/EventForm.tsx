import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import {
  eventFormResolver,
  type EventFormValues,
  getEmptyEventFormValues,
} from '@/lib/event-form';
import { cn } from '@/lib/utils';

interface EventFormProps {
  mode: 'create' | 'edit';
  initialValues?: Partial<EventFormValues>;
  isSaving?: boolean;
  onCancel: () => void;
  onSubmit: SubmitHandler<EventFormValues>;
}

function EventForm({
  mode,
  initialValues,
  isSaving = false,
  onCancel,
  onSubmit,
}: EventFormProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: eventFormResolver,
    mode: 'onBlur',
    defaultValues: {
      ...getEmptyEventFormValues(),
      ...initialValues,
    },
  });

  useEffect(() => {
    reset({
      ...getEmptyEventFormValues(),
      ...initialValues,
    });
  }, [initialValues, reset]);

  const isDisabled = isSubmitting || isSaving;
  const title = mode === 'create' ? 'Create Event' : 'Edit Event';
  const description =
    mode === 'create'
      ? 'Fill in the details for your new event.'
      : 'Update your event details and save changes.';
  const submitLabel = mode === 'create' ? 'Create Event' : 'Save Changes';
  const submitLoadingLabel = mode === 'create' ? 'Creating...' : 'Saving...';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={Boolean(errors.title)}>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input
                id="title"
                placeholder="NestJS Workshop"
                aria-invalid={Boolean(errors.title)}
                {...register('title')}
              />
              <FieldError errors={[errors.title]} />
            </Field>

            <Field data-invalid={Boolean(errors.description)}>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                placeholder="Tell participants what this event is about..."
                aria-invalid={Boolean(errors.description)}
                {...register('description')}
              />
              <FieldError errors={[errors.description]} />
            </Field>

            <div className="flex gap-3">
              <Field className="flex-1" data-invalid={Boolean(errors.date)}>
                <FieldLabel>Date</FieldLabel>
                <Controller
                  control={control}
                  name="date"
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !field.value && 'text-muted-foreground',
                          )}
                        >
                          <CalendarIcon className="size-4" />
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ?? undefined}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                <FieldError errors={[errors.date]} />
              </Field>

              <Field className="flex-1" data-invalid={Boolean(errors.time)}>
                <FieldLabel htmlFor="time">Time</FieldLabel>
                <Input
                  id="time"
                  type="time"
                  aria-invalid={Boolean(errors.time)}
                  {...register('time')}
                />
                <FieldError errors={[errors.time]} />
              </Field>
            </div>

            <Field data-invalid={Boolean(errors.location)}>
              <FieldLabel htmlFor="location">Location</FieldLabel>
              <Input
                id="location"
                placeholder="Kyiv, Ukraine"
                aria-invalid={Boolean(errors.location)}
                {...register('location')}
              />
              <FieldError errors={[errors.location]} />
            </Field>

            <Field data-invalid={Boolean(errors.capacity)}>
              <FieldLabel htmlFor="capacity">
                Capacity
                <span className="text-muted-foreground ml-1 font-normal">
                  (optional)
                </span>
              </FieldLabel>
              <Input
                id="capacity"
                type="number"
                min={1}
                placeholder="50"
                aria-invalid={Boolean(errors.capacity)}
                {...register('capacity')}
              />
              <FieldDescription>
                Leave empty for unlimited participants.
              </FieldDescription>
              <FieldError errors={[errors.capacity]} />
            </Field>

            <FieldSet>
              <FieldLegend variant="label">Visibility</FieldLegend>
              <Controller
                control={control}
                name="visibility"
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <Field orientation="horizontal">
                      <RadioGroupItem id="public" value="public" />
                      <FieldLabel htmlFor="public">
                        <div className="flex gap-1">
                          <span>Public</span>
                          <span className="text-muted-foreground text-sm font-light">
                            - Anyone can see and join this event
                          </span>
                        </div>
                      </FieldLabel>
                    </Field>
                    <Field orientation="horizontal">
                      <RadioGroupItem id="private" value="private" />
                      <FieldLabel htmlFor="private">
                        <div className="flex gap-1">
                          <span>Private</span>
                          <span className="text-muted-foreground text-sm font-light">
                            - Only invited people can see this event
                          </span>
                        </div>
                      </FieldLabel>
                    </Field>
                  </RadioGroup>
                )}
              />
              <FieldError errors={[errors.visibility]} />
            </FieldSet>

            <Field>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isDisabled}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isDisabled} className="flex-1">
                  {isDisabled ? submitLoadingLabel : submitLabel}
                </Button>
              </div>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

export default EventForm;
