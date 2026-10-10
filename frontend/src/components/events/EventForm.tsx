import { useFieldArray, useFormContext } from 'react-hook-form'
import { PlusCircle, Trash2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select, FormField, Divider } from '@/components/ui/index'
import type { CreateEventFormValues } from '@/schemas'

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft — not visible to public' },
  { value: 'PUBLISHED', label: 'Published — visible & purchasable' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'COMPLETED', label: 'Completed' },
]

export default function EventForm() {
  const {
    register,
    formState: { errors },
    control,
  } = useFormContext<CreateEventFormValues>()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ticketTypes',
  })

  function addTicketType() {
    append({ name: '', price: 0, description: '', totalAvailable: undefined })
  }

  return (
    <div className="flex flex-col gap-8">
      {/* ── Event Details ── */}
      <section className="card p-6 flex flex-col gap-5">
        <h3 className="font-semibold text-[var(--text-primary)]">Event Details</h3>

        <FormField label="Event Name" htmlFor="name" required error={errors.name?.message}>
          <Input
            id="name"
            placeholder="e.g. Summer Music Festival 2025"
            {...register('name')}
            error={errors.name?.message}
          />
        </FormField>

        <FormField label="Venue" htmlFor="venue" required error={errors.venue?.message}>
          <Input
            id="venue"
            placeholder="e.g. Madison Square Garden, New York"
            {...register('venue')}
            error={errors.venue?.message}
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Start Date & Time" htmlFor="start" error={errors.start?.message}>
            <Input
              id="start"
              type="datetime-local"
              {...register('start')}
              error={errors.start?.message}
            />
          </FormField>

          <FormField label="End Date & Time" htmlFor="end" error={errors.end?.message}>
            <Input
              id="end"
              type="datetime-local"
              {...register('end')}
              error={errors.end?.message}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Sales Start" htmlFor="salesStart" error={errors.salesStart?.message}>
            <Input
              id="salesStart"
              type="datetime-local"
              {...register('salesStart')}
              error={errors.salesStart?.message}
            />
          </FormField>

          <FormField label="Sales End" htmlFor="salesEnd" error={errors.salesEnd?.message}>
            <Input
              id="salesEnd"
              type="datetime-local"
              {...register('salesEnd')}
              error={errors.salesEnd?.message}
            />
          </FormField>
        </div>

        <FormField label="Status" htmlFor="status" required error={errors.status?.message}>
          <Select
            id="status"
            options={STATUS_OPTIONS}
            placeholder="Select status…"
            {...register('status')}
            error={errors.status?.message}
          />
        </FormField>
      </section>

      {/* ── Ticket Types ── */}
      <section className="card p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[var(--text-primary)]">Ticket Types</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Add at least one ticket type. Removing a type on edit will delete it.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addTicketType}
            className="gap-1.5 shrink-0"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Add type
          </Button>
        </div>

        {errors.ticketTypes?.root?.message && (
          <p className="text-sm text-[var(--danger)]">{errors.ticketTypes.root.message}</p>
        )}
        {typeof errors.ticketTypes?.message === 'string' && (
          <p className="text-sm text-[var(--danger)]">{errors.ticketTypes.message}</p>
        )}

        {fields.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-8 rounded-xl border-2 border-dashed cursor-pointer hover:border-[var(--accent)] transition-colors"
            style={{ borderColor: 'var(--border)' }}
            onClick={addTicketType}
          >
            <PlusCircle className="h-8 w-8 text-[var(--text-muted)] mb-2" />
            <p className="text-sm text-[var(--text-muted)]">Click to add a ticket type</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="card-surface p-4 flex flex-col gap-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-[var(--text-muted)]" />
                    <span className="text-sm font-medium text-[var(--text-secondary)]">
                      Ticket type {index + 1}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="text-[var(--danger)] hover:bg-[rgba(239,68,68,0.1)]"
                    title="Remove ticket type"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <Divider />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="Name"
                    htmlFor={`ticketTypes.${index}.name`}
                    required
                    error={errors.ticketTypes?.[index]?.name?.message}
                  >
                    <Input
                      id={`ticketTypes.${index}.name`}
                      placeholder="e.g. General Admission, VIP"
                      {...register(`ticketTypes.${index}.name`)}
                      error={errors.ticketTypes?.[index]?.name?.message}
                    />
                  </FormField>

                  <FormField
                    label="Price (USD)"
                    htmlFor={`ticketTypes.${index}.price`}
                    required
                    error={errors.ticketTypes?.[index]?.price?.message}
                  >
                    <Input
                      id={`ticketTypes.${index}.price`}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      {...register(`ticketTypes.${index}.price`, { valueAsNumber: true })}
                      error={errors.ticketTypes?.[index]?.price?.message}
                    />
                  </FormField>
                </div>

                <FormField
                  label="Total Available"
                  htmlFor={`ticketTypes.${index}.totalAvailable`}
                  hint="Leave blank for unlimited"
                  error={errors.ticketTypes?.[index]?.totalAvailable?.message}
                >
                  <Input
                    id={`ticketTypes.${index}.totalAvailable`}
                    type="number"
                    min="1"
                    step="1"
                    placeholder="e.g. 500"
                    {...register(`ticketTypes.${index}.totalAvailable`, {
                      setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
                    })}
                    error={errors.ticketTypes?.[index]?.totalAvailable?.message}
                  />
                </FormField>

                <FormField
                  label="Description"
                  htmlFor={`ticketTypes.${index}.description`}
                  error={errors.ticketTypes?.[index]?.description?.message}
                >
                  <Textarea
                    id={`ticketTypes.${index}.description`}
                    placeholder="What's included with this ticket?"
                    {...register(`ticketTypes.${index}.description`)}
                  />
                </FormField>
              </div>
            ))}

            <button
              type="button"
              onClick={addTicketType}
              className="flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed text-sm text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
              style={{ borderColor: 'var(--border)' }}
            >
              <PlusCircle className="h-4 w-4" />
              Add another ticket type
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
