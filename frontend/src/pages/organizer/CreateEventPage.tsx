import { useNavigate } from 'react-router-dom'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { useCreateEvent } from '@/hooks'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/common'
import { useToast } from '@/components/ui/Toast'
import EventForm from '@/components/events/EventForm'
import { createEventSchema, type CreateEventFormValues } from '@/schemas'
import { ROUTES } from '@/constants'
import { fromInputDateTime, getErrorMessage } from '@/utils'

export default function CreateEventPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const createMutation = useCreateEvent()

  const methods = useForm<CreateEventFormValues>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      name: '',
      venue: '',
      status: 'DRAFT',
      ticketTypes: [],
    },
  })

  const { handleSubmit, formState: { isSubmitting } } = methods

  async function onSubmit(values: CreateEventFormValues) {
    try {
      const payload = {
        ...values,
        start: fromInputDateTime(values.start ?? ''),
        end: fromInputDateTime(values.end ?? ''),
        salesStart: fromInputDateTime(values.salesStart ?? ''),
        salesEnd: fromInputDateTime(values.salesEnd ?? ''),
      }
      const created = await createMutation.mutateAsync(payload)
      toast.success('Event created!', `"${created.name}" is now ${created.status.toLowerCase()}.`)
      navigate(ROUTES.ORGANIZER_EVENT_DETAIL(created.id))
    } catch (err) {
      toast.error('Failed to create event', getErrorMessage(err))
    }
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Create Event"
        subtitle="Fill in the details below to publish your event."
        back={{ label: 'My Events', onClick: () => navigate(ROUTES.ORGANIZER_EVENTS) }}
      />

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <EventForm />

          <div className="flex items-center justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(ROUTES.ORGANIZER_EVENTS)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting} className="gap-2">
              <Save className="h-4 w-4" />
              Create Event
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
